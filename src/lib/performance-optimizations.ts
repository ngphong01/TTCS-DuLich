/**
 * Performance Optimization Utilities
 * Tối ưu hóa hiệu suất cho ứng dụng Next.js
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce hook để tránh quá nhiều function calls
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Throttle hook để giới hạn số lần function được gọi
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Memoized click handler để tránh re-render
 */
export function useOptimizedClickHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
  deps: React.DependencyList = []
): T {
  return useCallback(handler, deps);
}

/**
 * Intersection Observer hook để lazy load
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return observerRef.current;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = Date.now() - startTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered ${renderCountRef.current} times in ${renderTime}ms`);
    }
  });

  return {
    renderCount: renderCountRef.current,
    resetTimer: () => {
      startTimeRef.current = Date.now();
      renderCountRef.current = 0;
    }
  };
}

/**
 * Optimized event listener cleanup
 */
export function useEventCleanup() {
  const listenersRef = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>>([]);

  const addEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler });
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all event listeners
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current = [];
    };
  }, []);

  return { addEventListener };
}

/**
 * CSS Performance Optimizations
 */
export const CSS_PERFORMANCE_OPTIMIZATIONS = {
  // Hardware acceleration cho animations
  hardwareAcceleration: {
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  },
  
  // Tối ưu hóa transitions
  optimizedTransition: {
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
    willChange: 'transform, opacity',
  },
  
  // Reduced motion support
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      animation: 'none',
    }
  }
};

/**
 * Bundle optimization utilities
 */
export const BUNDLE_OPTIMIZATIONS = {
  // Code splitting utilities (simplified)
  enableCodeSplitting: true,
  
  // Lazy loading components (simplified)
  enableLazyLoading: true
};

/**
 * Memory optimization
 */
export function useMemoryOptimization() {
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctionsRef.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);

  return { addCleanup };
}

/**
 * Click performance optimization
 */
export function optimizeClickHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
  options: {
    debounce?: number;
    throttle?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
): T {
  const { debounce = 0, throttle = 0, preventDefault = false, stopPropagation = false } = options;

  let optimizedHandler = handler;

  if (debounce > 0) {
    optimizedHandler = useDebounce(optimizedHandler, debounce) as T;
  }

  if (throttle > 0) {
    optimizedHandler = useThrottle(optimizedHandler, throttle) as T;
  }

  return useCallback(
    ((...args: Parameters<T>) => {
      const event = args[0] as Event;
      
      if (preventDefault) {
        event.preventDefault();
      }
      
      if (stopPropagation) {
        event.stopPropagation();
      }
      
      optimizedHandler(...args);
    }) as T,
    [optimizedHandler, preventDefault, stopPropagation]
  );
}

/**
 * Performance metrics
 */
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  startTiming(key: string): void {
    const startTime = performance.now();
    this.metrics.set(key, [startTime]);
  }

  endTiming(key: string): number {
    const endTime = performance.now();
    const startTimes = this.metrics.get(key);
    
    if (startTimes && startTimes.length > 0) {
      const duration = endTime - startTimes[0];
      console.log(`⏱️ ${key}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    
    return 0;
  }

  getAverageTime(key: string): number {
    const times = this.metrics.get(key);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();
