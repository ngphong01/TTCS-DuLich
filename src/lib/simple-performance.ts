/**
 * Simple Performance Optimizations
 * Lightweight performance utilities without dynamic imports
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Debounce hook
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

/**
 * Throttle hook
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(callback: T, delay: number): T {
  const lastCallRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
}

/**
 * Performance monitor - lightweight version
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  
  // Only run in development and minimize overhead
  useEffect(() => {
    renderCountRef.current += 1;
    
    // Only log excessive renders, not timing
    if (process.env.NODE_ENV === 'development' && renderCountRef.current > 50) {
      console.warn(`⚠️ ${componentName} has rendered ${renderCountRef.current} times`);
    }
  });
  
  return {
    renderCount: renderCountRef.current,
    resetTimer: () => {
      renderCountRef.current = 0;
    }
  };
}

/**
 * Event cleanup
 */
export function useEventCleanup() {
  const listenersRef = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>>([]);
  
  const addEventListener = useCallback((element: EventTarget, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
    listenersRef.current.push({ element, event, handler });
  }, []);
  
  const removeEventListener = useCallback((element: EventTarget, event: string, handler: EventListener) => {
    element.removeEventListener(event, handler);
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  }, []);
  
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current = [];
    };
  }, []);
  
  return { addEventListener, removeEventListener };
}

/**
 * Memory optimization
 */
export function useMemoryOptimization() {
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  
  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);
  
  useEffect(() => {
    return () => {
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, []);
  
  return { addCleanup };
}

/**
 * Optimized click handler
 */
export function useOptimizedClickHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
  deps: React.DependencyList = []
): T {
  return useCallback(handler, deps) as T;
}

/**
 * CSS Performance Optimizations
 */
export const CSS_PERFORMANCE = {
  // Hardware acceleration
  hardwareAcceleration: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    willChange: 'transform'
  },
  
  // Optimized transitions
  fastTransitions: {
    transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
    willChange: 'transform, opacity'
  },
  
  // Reduced motion
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      animation: 'none'
    }
  }
};

/**
 * Bundle optimization flags
 */
export const BUNDLE_OPTIMIZATIONS = {
  enableCodeSplitting: true,
  enableLazyLoading: true,
  enableTreeShaking: true,
  enableMinification: true
};

/**
 * Performance metrics
 */
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }
  
  startTiming(key: string): void {
    this.metrics.set(key, performance.now());
  }
  
  endTiming(key: string): number {
    const startTime = this.metrics.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(key);
      return duration;
    }
    return 0;
  }
  
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();
