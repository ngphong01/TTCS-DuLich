/**
 * Web Vitals Provider Component
 * Initializes Web Vitals monitoring in the app
 */

'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

interface WebVitalsProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

export default function WebVitalsProvider({ 
  children, 
  debug = false 
}: WebVitalsProviderProps) {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    initWebVitals();
    
    if (debug) {
      console.log('🔍 Web Vitals monitoring initialized');
    }
  }, [debug]);

  return <>{children}</>;
}

/**
 * Hook to get Web Vitals metrics
 */
export function useWebVitals() {
  useEffect(() => {
    // This would be used to get current metrics
    // Implementation depends on your needs
  }, []);
}
