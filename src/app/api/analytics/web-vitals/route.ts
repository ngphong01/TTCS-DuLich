/**
 * Web Vitals Analytics API
 * Collects and stores Core Web Vitals data
 */

import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsData {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsData = await request.json();
    
    // Validate required fields
    if (!data.name || !data.value || !data.id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the metric (in production, you'd store this in a database)
    console.log('📊 Web Vital received:', {
      name: data.name,
      value: data.value,
      rating: getRating(data.name, data.value),
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString()
    });

    // In production, you would:
    // 1. Store in database
    // 2. Send to analytics service
    // 3. Alert if metrics are poor
    
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Web Vital recorded',
      rating: getRating(data.name, data.value)
    });

  } catch (error) {
    console.error('Web Vitals API error:', error);
    return NextResponse.json(
      { error: 'Failed to process Web Vital' },
      { status: 500 }
    );
  }
}

/**
 * Get performance rating for a metric
 */
function getRating(name: string, value: number): string {
  const thresholds = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FID: { good: 100, needsImprovement: 300 },
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Vitals Analytics API',
    endpoints: {
      POST: 'Send Web Vitals data',
      GET: 'Get API information'
    },
    metrics: [
      'CLS - Cumulative Layout Shift',
      'FID - First Input Delay', 
      'FCP - First Contentful Paint',
      'LCP - Largest Contentful Paint',
      'TTFB - Time to First Byte'
    ]
  });
}
