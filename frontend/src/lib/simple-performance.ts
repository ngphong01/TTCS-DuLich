import { useCallback, useRef, useEffect, useState } from 'react';

// Simple performance stub
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

export function useOptimizedClickHandler(
  handler: (...args: any[]) => void,
  deps: any[] = []
) {
  return useCallback(handler, deps);
}

export function useEventCleanup() {
  return {
    addEventListener: (element: any, event: string, handler: any) => {
      // Stub
    }
  };
}

export function usePerformanceMonitor(name?: string) {
  return {
    renderCount: 0
  };
}

