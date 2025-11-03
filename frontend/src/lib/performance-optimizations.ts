import { useCallback, useRef, useEffect, useState } from 'react';

// Performance optimizations stub
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
}

export function useOptimizedClickHandler(
  handler: (...args: any[]) => void,
  deps: any[] = []
) {
  return useCallback(handler, deps);
}

export function optimizeClickHandler(
  handler: (...args: any[]) => void,
  options?: { debounce?: number; throttle?: number; preventDefault?: boolean; stopPropagation?: boolean }
) {
  return handler;
}

export function useEventCleanup() {
  return {
    addEventListener: (element: any, event: string, handler: any) => {
      // Stub
    }
  };
}

export function usePerformanceMonitor(name?: string) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  return {
    renderCount: renderCountRef.current
  };
}

// Overload for functions
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fnRef = useRef(fn);
  
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

