"use client";
import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<unknown> }>;
  fallback?: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * LazyComponent - Tối ưu hóa lazy loading với performance improvements
 */
export default function LazyComponent({ 
  component, 
  fallback = <DefaultFallback />, 
  delay = 0,
  className = ''
}: LazyComponentProps) {
  const LazyComponent = lazy(component);

  return (
    <div className={className}>
      <Suspense fallback={delay > 0 ? <DelayedFallback delay={delay} fallback={fallback} /> : fallback}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

/**
 * DelayedFallback - Hiển thị fallback sau một khoảng thời gian delay
 */
function DelayedFallback({ delay, fallback }: { delay: number; fallback: React.ReactNode }) {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showFallback ? <>{fallback}</> : null;
}

/**
 * DefaultFallback - Fallback component mặc định với skeleton loading
 */
function DefaultFallback() {
  return (
    <div className="optimized-skeleton animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

/**
 * LazyImage - Lazy loading image với intersection observer
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Intersection Observer để lazy load
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    onError?.();
  }, [onError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {!isLoaded && (
        <div className="absolute inset-0 optimized-skeleton animate-pulse" />
      )}
    </div>
  );
}

/**
 * LazyRoute - Lazy loading cho routes
 */
interface LazyRouteProps {
  path: string;
  component: () => Promise<{ default: ComponentType<unknown> }>;
  fallback?: React.ReactNode;
}

export function LazyRoute({ component, fallback }: LazyRouteProps) {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

/**
 * Performance optimized lazy loading hook
 */
export function useLazyLoading<T>(
  importFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await importFn();
        
        if (isMounted) {
          setComponent(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFn]);

  return { component, loading, error };
}

/**
 * Preload component - Preload components trước khi cần
 */
export function usePreload<T>(
  importFn: () => Promise<T>,
  condition: boolean = true
) {
  React.useEffect(() => {
    if (condition) {
      importFn().catch(console.error);
    }
  }, [importFn, condition]);
}

/**
 * Lazy loading với retry mechanism
 */
export function useLazyWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries: number = 3
) {
  const [component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const loadComponent = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await importFn();
      setComponent(result);
      setRetryCount(0);
    } catch (err) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(loadComponent, 1000 * retryCount); // Exponential backoff
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [importFn, retryCount, maxRetries]);

  React.useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return { component, loading, error, retry: loadComponent };
}
