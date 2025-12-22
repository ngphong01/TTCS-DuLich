import { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './config'; // Import initialized i18n instance

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * I18n Provider Component
 * Wraps the app and handles language initialization
 */
export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    const updateLang = () => {
      document.documentElement.lang = i18n.language;
      
      // Update document direction for RTL languages (if needed)
      const rtlLanguages = ['ar', 'he', 'fa'];
      document.documentElement.dir = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
    };

    updateLang();
    
    // Listen for language changes
    i18n.on('languageChanged', updateLang);
    
    return () => {
      i18n.off('languageChanged', updateLang);
    };
  }, []);

  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      {children}
    </Suspense>
  );
}

