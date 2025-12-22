import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.explore': { vi: 'Khám phá', en: 'Explore' },
  'nav.services': { vi: 'Dịch vụ', en: 'Services' },
  'nav.promotions': { vi: 'Ưu đãi', en: 'Promotions' },
  'nav.support': { vi: 'Hỗ trợ', en: 'Support' },
  'nav.bookings': { vi: 'Đặt chỗ', en: 'Bookings' },
  
  // Common
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.delete': { vi: 'Xóa', en: 'Delete' },
  'common.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'common.view': { vi: 'Xem', en: 'View' },
  'common.search': { vi: 'Tìm kiếm', en: 'Search' },
  'common.filter': { vi: 'Lọc', en: 'Filter' },
  'common.close': { vi: 'Đóng', en: 'Close' },
  
  // Settings
  'settings.title': { vi: 'Cài đặt', en: 'Settings' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.interface': { vi: 'Giao diện', en: 'Interface' },
  'settings.emailNotifications': { vi: 'Thông báo email', en: 'Email Notifications' },
  'settings.light': { vi: 'Sáng', en: 'Light' },
  'settings.dark': { vi: 'Tối', en: 'Dark' },
  'settings.auto': { vi: 'Tự động', en: 'Auto' },
  
  // Add more translations as needed
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage - check both keys for compatibility
    const saved = localStorage.getItem('travelgo:language') || localStorage.getItem('language');
    return (saved === 'vi' || saved === 'en') ? saved : 'vi';
  });

  useEffect(() => {
    // Save to both localStorage keys for compatibility
    localStorage.setItem('travelgo:language', language);
    localStorage.setItem('language', language);
    // Update document language attribute
    document.documentElement.lang = language;
    // Trigger custom event for other contexts to sync
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }, [language]);

  // Listen for language changes from other contexts
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail !== language) {
        setLanguageState(event.detail);
      }
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.vi;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

