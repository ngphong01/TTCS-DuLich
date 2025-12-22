import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup is handled by browser
    };
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !window.gtag) return;

    // Track page views
    window.gtag('config', measurementId, {
      page_path: location.pathname + location.search,
    });

    // Track custom events for remarketing
    const pathname = location.pathname;
    
    if (pathname.includes('/tours/')) {
      window.gtag('event', 'view_item', {
        items: [{
          item_id: pathname.split('/').pop(),
          item_name: document.title,
          item_category: 'Tour',
        }],
      });
    } else if (pathname.includes('/destinations/')) {
      window.gtag('event', 'view_item', {
        items: [{
          item_id: pathname.split('/').pop(),
          item_name: document.title,
          item_category: 'Destination',
        }],
      });
    } else if (pathname === '/checkout') {
      window.gtag('event', 'begin_checkout');
    } else if (pathname.includes('/account/bookings')) {
      window.gtag('event', 'view_item_list', {
        item_list_name: 'My Bookings',
      });
    }
  }, [location, measurementId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

