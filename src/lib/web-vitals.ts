/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals for production monitoring
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

interface WebVitalsConfig {
  debug?: boolean;
  reportAllChanges?: boolean;
  onReport?: (metric: WebVitalsMetric) => void;
}

class WebVitalsMonitor {
  private config: WebVitalsConfig;
  private metrics: Map<string, WebVitalsMetric> = new Map();

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      debug: false,
      reportAllChanges: false,
      ...config
    };
  }

  /**
   * Initialize Web Vitals monitoring
   */
  public init(): void {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCLS();
    this.trackFID();
    this.trackFCP();
    this.trackLCP();
    this.trackTTFB();

    // Log initialization
    if (this.config.debug) {
      console.log('🔍 Web Vitals monitoring initialized');
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  private trackCLS(): void {
    getCLS((metric) => {
      this.handleMetric('CLS', metric);
    }, this.config.reportAllChanges);
  }

  /**
   * Track First Input Delay (FID)
   */
  private trackFID(): void {
    getFID((metric) => {
      this.handleMetric('FID', metric);
    }, this.config.reportAllChanges);
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  private trackFCP(): void {
    getFCP((metric) => {
      this.handleMetric('FCP', metric);
    }, this.config.reportAllChanges);
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP(): void {
    getLCP((metric) => {
      this.handleMetric('LCP', metric);
    }, this.config.reportAllChanges);
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  private trackTTFB(): void {
    getTTFB((metric) => {
      this.handleMetric('TTFB', metric);
    }, this.config.reportAllChanges);
  }

  /**
   * Handle metric data
   */
  private handleMetric(name: string, metric: PerformanceEntry): void {
    const metricData: WebVitalsMetric = {
      name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType
    };

    // Store metric
    this.metrics.set(name, metricData);

    // Log metric
    if (this.config.debug) {
      console.log(`📊 ${name}:`, {
        value: metric.value,
        delta: metric.delta,
        rating: this.getRating(name, metric.value)
      });
    }

    // Report metric
    if (this.config.onReport) {
      this.config.onReport(metricData);
    }

    // Send to analytics (if in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metricData);
    }
  }

  /**
   * Get performance rating for metric
   */
  private getRating(name: string, value: number): string {
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

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: WebVitalsMetric): void {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(metric);
  }

  /**
   * Send to custom analytics endpoint
   */
  private sendToCustomAnalytics(metric: WebVitalsMetric): void {
    if (typeof window === 'undefined') return;

    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...metric,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    }).catch(error => {
      if (this.config.debug) {
        console.warn('Failed to send Web Vitals to analytics:', error);
      }
    });
  }

  /**
   * Get all collected metrics
   */
  public getMetrics(): Map<string, WebVitalsMetric> {
    return this.metrics;
  }

  /**
   * Get specific metric
   */
  public getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    score: number;
    metrics: Record<string, { value: number; rating: string }>;
  } {
    const metrics: Record<string, { value: number; rating: string }> = {};
    let totalScore = 0;
    let metricCount = 0;

    for (const [name, metric] of this.metrics) {
      const rating = this.getRating(name, metric.value);
      metrics[name] = { value: metric.value, rating };

      // Calculate score (good = 3, needs-improvement = 2, poor = 1)
      const score = rating === 'good' ? 3 : rating === 'needs-improvement' ? 2 : 1;
      totalScore += score;
      metricCount++;
    }

    return {
      score: metricCount > 0 ? Math.round((totalScore / metricCount) * 100 / 3) : 0,
      metrics
    };
  }
}

// Create global instance
const webVitalsMonitor = new WebVitalsMonitor({
  debug: process.env.NODE_ENV === 'development',
  reportAllChanges: true,
  onReport: (metric) => {
    // Custom reporting logic
    console.log(`📊 Web Vital ${metric.name}: ${metric.value}ms`);
  }
});

// Export functions
export const initWebVitals = () => webVitalsMonitor.init();
export const getWebVitalsMetrics = () => webVitalsMonitor.getMetrics();
export const getWebVitalsSummary = () => webVitalsMonitor.getPerformanceSummary();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebVitals);
  } else {
    initWebVitals();
  }
}

export default webVitalsMonitor;
