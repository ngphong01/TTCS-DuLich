import { useEffect } from 'react';

interface TawkToProps {
  propertyId?: string;
  widgetId?: string;
}

export default function TawkTo({ propertyId, widgetId }: TawkToProps) {
  useEffect(() => {
    if (!propertyId || !widgetId) return;

    // Tawk.to script
    const script = document.createElement('script');
    script.innerHTML = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [propertyId, widgetId]);

  return null;
}

