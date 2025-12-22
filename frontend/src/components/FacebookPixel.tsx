import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface FacebookPixelProps {
  pixelId?: string;
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const location = useLocation();

  useEffect(() => {
    if (!pixelId) return;

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.body.contains(noscript)) {
        document.body.removeChild(noscript);
      }
    };
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId || !window.fbq) return;

    // Track page views
    window.fbq('track', 'PageView');
    
    // Track custom events for remarketing
    const pathname = location.pathname;
    
    if (pathname.includes('/tours/')) {
      window.fbq('track', 'ViewContent', {
        content_type: 'tour',
        content_ids: [pathname.split('/').pop()],
      });
    } else if (pathname.includes('/destinations/')) {
      window.fbq('track', 'ViewContent', {
        content_type: 'destination',
        content_ids: [pathname.split('/').pop()],
      });
    } else if (pathname === '/checkout') {
      window.fbq('track', 'InitiateCheckout');
    } else if (pathname.includes('/account/bookings')) {
      window.fbq('track', 'ViewContent', {
        content_type: 'booking',
      });
    }
  }, [location, pixelId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

