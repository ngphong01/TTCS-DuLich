import { NextRequest, NextResponse } from 'next/server';
import { 
  webVitalsTracker, 
  performanceMonitor, 
  errorTracker, 
  apiAnalytics, 
  databaseMonitor, 
  systemMetrics 
} from '@/lib/monitoring';
import { logger } from '@/lib/logger';

// Analytics endpoint
export async function POST(request: NextRequest) {
  const timer = performanceMonitor.startTimer('analytics-post');
  
  try {
    const data = await request.json();
    
    if (data.type === 'web-vital') {
      webVitalsTracker.trackMetric(data.name, data.value, data.meta);
    } else if (data.type === 'error') {
      errorTracker.trackError(new Error(data.message), data.context);
    } else if (data.type === 'custom') {
      logger.info('Custom analytics event', data.meta);
    }
    
    const duration = performanceMonitor.endTimer('analytics-post');
    apiAnalytics.trackRequest('POST /api/analytics', duration, true);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    const duration = performanceMonitor.endTimer('analytics-post');
    apiAnalytics.trackRequest('POST /api/analytics', duration, false);
    
    errorTracker.trackError(error instanceof Error ? error : new Error('Unknown error'));
    
    return NextResponse.json(
      { error: 'Failed to process analytics data' },
      { status: 500 }
    );
  }
}

// Get analytics data
export async function GET(request: NextRequest) {
  const timer = performanceMonitor.startTimer('analytics-get');
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    let data: any = {};
    
    if (type === 'all' || type === 'web-vitals') {
      data.webVitals = webVitalsTracker.getMetrics();
    }
    
    if (type === 'all' || type === 'performance') {
      data.performance = {
        counters: performanceMonitor.getAllCounters(),
        system: systemMetrics.getSystemInfo(),
        healthScore: systemMetrics.getHealthScore(),
      };
    }
    
    if (type === 'all' || type === 'errors') {
      data.errors = {
        count: errorTracker.getErrorCount(),
        recent: errorTracker.getErrors().slice(-10), // Last 10 errors
      };
    }
    
    if (type === 'all' || type === 'api') {
      data.api = apiAnalytics.getStats();
    }
    
    if (type === 'all' || type === 'database') {
      data.database = databaseMonitor.getStats();
    }
    
    const duration = performanceMonitor.endTimer('analytics-get');
    apiAnalytics.trackRequest('GET /api/analytics', duration, true);
    
    return NextResponse.json(data);
    
  } catch (error) {
    const duration = performanceMonitor.endTimer('analytics-get');
    apiAnalytics.trackRequest('GET /api/analytics', duration, false);
    
    errorTracker.trackError(error instanceof Error ? error : new Error('Unknown error'));
    
    return NextResponse.json(
      { error: 'Failed to get analytics data' },
      { status: 500 }
    );
  }
}
