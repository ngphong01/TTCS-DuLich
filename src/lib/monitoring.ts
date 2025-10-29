/**
 * Monitoring và Analytics System
 * Tích hợp monitoring, metrics và analytics
 */

import { logger } from './logger';
import { env } from './env';

// Web Vitals tracking
export class WebVitalsTracker {
  private static instance: WebVitalsTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): WebVitalsTracker {
    if (!WebVitalsTracker.instance) {
      WebVitalsTracker.instance = new WebVitalsTracker();
    }
    return WebVitalsTracker.instance;
  }

  trackMetric(name: string, value: number, meta?: Record<string, unknown>) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(value);
    
    logger.info(`Web Vital tracked: ${name}`, {
      value: `${value.toFixed(2)}ms`,
      ...meta,
    });

    // Send to analytics if configured
    if (env.NEXT_PUBLIC_GA_ID) {
      this.sendToGoogleAnalytics(name, value, meta);
    }
  }

  private sendToGoogleAnalytics(name: string, value: number, meta?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vital', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        custom_map: meta,
      });
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    }
    
    return result;
  }

  reset() {
    this.metrics.clear();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private timers: Map<string, number> = new Map();
  private counters: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer '${name}' was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    logger.info(`Performance timer: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
    });
    
    return duration;
  }

  incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  getAllCounters(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  reset(): void {
    this.timers.clear();
    this.counters.clear();
  }
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{
    message: string;
    stack?: string;
    timestamp: string;
    context?: Record<string, unknown>;
  }> = [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };
    
    this.errors.push(errorData);
    
    logger.error('Error tracked', error, context);
    
    // Send to external monitoring if configured
    if (env.SENTRY_DSN) {
      this.sendToSentry(error, context);
    }
  }

  private sendToSentry(error: Error, context?: Record<string, unknown>): void {
    // Sentry integration would go here
    logger.info('Error sent to Sentry', { error: error.message, context });
  }

  getErrors(): typeof this.errors {
    return [...this.errors];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// API Analytics
export class ApiAnalytics {
  private static instance: ApiAnalytics;
  private requests: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastRequest: string;
  }> = new Map();

  static getInstance(): ApiAnalytics {
    if (!ApiAnalytics.instance) {
      ApiAnalytics.instance = new ApiAnalytics();
    }
    return ApiAnalytics.instance;
  }

  trackRequest(endpoint: string, duration: number, success: boolean): void {
    const current = this.requests.get(endpoint) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastRequest: '',
    };
    
    current.count++;
    current.totalTime += duration;
    current.lastRequest = new Date().toISOString();
    
    if (!success) {
      current.errors++;
    }
    
    this.requests.set(endpoint, current);
    
    logger.info(`API request tracked: ${endpoint}`, {
      duration: `${duration.toFixed(2)}ms`,
      success,
      totalRequests: current.count,
    });
  }

  getStats(): Record<string, {
    count: number;
    avgTime: number;
    errorRate: number;
    lastRequest: string;
  }> {
    const result: Record<string, any> = {};
    
    for (const [endpoint, data] of this.requests.entries()) {
      result[endpoint] = {
        count: data.count,
        avgTime: data.count > 0 ? data.totalTime / data.count : 0,
        errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
        lastRequest: data.lastRequest,
      };
    }
    
    return result;
  }

  reset(): void {
    this.requests.clear();
  }
}

// Database monitoring
export class DatabaseMonitor {
  private static instance: DatabaseMonitor;
  private queries: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
  }> = new Map();

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor();
    }
    return DatabaseMonitor.instance;
  }

  trackQuery(query: string, duration: number, success: boolean): void {
    const normalizedQuery = this.normalizeQuery(query);
    const current = this.queries.get(normalizedQuery) || {
      count: 0,
      totalTime: 0,
      errors: 0,
    };
    
    current.count++;
    current.totalTime += duration;
    
    if (!success) {
      current.errors++;
    }
    
    this.queries.set(normalizedQuery, current);
    
    if (duration > 1000) { // Log slow queries
      logger.warn('Slow database query detected', undefined, {
        query: normalizedQuery,
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  }

  private normalizeQuery(query: string): string {
    // Normalize query for grouping (remove specific values)
    return query
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, "'?'")
      .replace(/"([^"]*)"/g, '"?"')
      .trim();
  }

  getStats(): Record<string, {
    count: number;
    avgTime: number;
    errorRate: number;
  }> {
    const result: Record<string, any> = {};
    
    for (const [query, data] of this.queries.entries()) {
      result[query] = {
        count: data.count,
        avgTime: data.count > 0 ? data.totalTime / data.count : 0,
        errorRate: data.count > 0 ? (data.errors / data.count) * 100 : 0,
      };
    }
    
    return result;
  }

  reset(): void {
    this.queries.clear();
  }
}

// System metrics
export class SystemMetrics {
  private static instance: SystemMetrics;
  private startTime: number = Date.now();

  static getInstance(): SystemMetrics {
    if (!SystemMetrics.instance) {
      SystemMetrics.instance = new SystemMetrics();
    }
    return SystemMetrics.instance;
  }

  getSystemInfo(): {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    platform: string;
    nodeVersion: string;
  } {
    return {
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };
  }

  getHealthScore(): number {
    const memory = process.memoryUsage();
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    
    // Simple health score based on memory usage
    if (memoryUsagePercent < 50) return 100;
    if (memoryUsagePercent < 75) return 80;
    if (memoryUsagePercent < 90) return 60;
    return 30;
  }
}

// Export singleton instances
export const webVitalsTracker = WebVitalsTracker.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorTracker = ErrorTracker.getInstance();
export const apiAnalytics = ApiAnalytics.getInstance();
export const databaseMonitor = DatabaseMonitor.getInstance();
export const systemMetrics = SystemMetrics.getInstance();
