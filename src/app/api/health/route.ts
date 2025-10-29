import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/mysql';
import { getSecureConfig } from '@/lib/env';
import { logger, createTimer } from '@/lib/logger';

// Health check endpoint
export async function GET() {
  const timer = createTimer('health-check');
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbHealthy = await testConnection();
    
    // Get system information
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const config = getSecureConfig();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Determine overall health
    const isHealthy = dbHealthy;
    const status = isHealthy ? 'healthy' : 'unhealthy';
    
    const healthData = {
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      uptime: `${Math.floor(uptime)}s`,
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        features: {
          oauth: config.hasOAuth ? 'enabled' : 'disabled',
          stripe: config.hasStripe ? 'enabled' : 'disabled',
          email: config.hasEmail ? 'enabled' : 'disabled',
          redis: config.hasRedis ? 'enabled' : 'disabled',
          monitoring: config.hasMonitoring ? 'enabled' : 'disabled',
        }
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };
    
    timer.end({ status, responseTime });
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : undefined, {
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        database: 'unknown',
        api: 'unhealthy',
      }
    }, { status: 503 });
  }
}

// Detailed health check (for monitoring systems)
export async function POST() {
  const timer = createTimer('detailed-health-check');
  
  try {
    // Basic health check
    const basicHealth = await GET();
    const basicData = await basicHealth.json();
    
    // Additional checks
    const additionalChecks = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
      freeMemory: `${Math.round(require('os').freemem() / 1024 / 1024)}MB`,
      totalMemory: `${Math.round(require('os').totalmem() / 1024 / 1024)}MB`,
    };
    
    timer.end({ detailed: true });
    
    return NextResponse.json({
      ...basicData,
      detailed: additionalChecks,
    }, {
      status: basicData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    
  } catch (error) {
    logger.error('Detailed health check failed', error instanceof Error ? error : undefined);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
    }, { status: 503 });
  }
}
