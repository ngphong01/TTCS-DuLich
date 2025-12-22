import { useEffect } from 'react';

interface ZaloOAProps {
  oaId?: string;
}

export default function ZaloOA({ oaId }: ZaloOAProps) {
  useEffect(() => {
    if (!oaId) return;

    // Load Zalo OA script
    const script = document.createElement('script');
    script.src = 'https://sp.zalo.me/plugins/sdk.js';
    script.async = true;
    script.onload = () => {
      // Initialize Zalo OA widget
      if ((window as any).zalo) {
        (window as any).zalo.init({
          oaid: oaId,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [oaId]);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    zalo: {
      init: (config: { oaid: string }) => void;
    };
  }
}

