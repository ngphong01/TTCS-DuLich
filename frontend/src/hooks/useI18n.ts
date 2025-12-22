import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/config';

/**
 * Custom hook for i18n with type safety
 */
export function useI18n() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const changeLanguage = async (lang: SupportedLanguage) => {
    try {
      // 🔥 CRITICAL: Lưu ngay vào localStorage TRƯỚC khi đổi ngôn ngữ
      // Để interceptor có thể đọc được ngay lập tức
      localStorage.setItem('travelgo:language', lang);
      localStorage.setItem('language', lang);
      
      // 🔥 CRITICAL: Await changeLanguage để đảm bảo translation files được load xong
      await i18n.changeLanguage(lang);
      
      // 🔥 FIX: Xử lý URL đúng cách - remove language prefix từ path
      const currentPath = window.location.pathname;
      
      // Remove old language prefix if exists in path (ví dụ: /vi/destinations -> /destinations)
      const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code).join('|');
      let pathWithoutLang = currentPath.replace(new RegExp(`^/(${supportedCodes})(/|$)`), '/') || '/';
      if (pathWithoutLang === '/vi' || pathWithoutLang === '/en' || pathWithoutLang === '/fr' || pathWithoutLang === '/ja' || pathWithoutLang === '/ko' || pathWithoutLang === '/zh-CN' || pathWithoutLang === '/zh-TW' || pathWithoutLang === '/de' || pathWithoutLang === '/es' || pathWithoutLang === '/th') {
        pathWithoutLang = '/';
      }
      
      // 🔥 CRITICAL: Update URL với language prefix trong path (ví dụ: /en/destinations)
      // Để URL hiển thị đúng language đã chọn
      const newPath = pathWithoutLang === '/' ? `/${lang}` : `/${lang}${pathWithoutLang}`;
      
      // 🔥 CRITICAL: Trigger language change event TRƯỚC khi navigate
      // Để sync với LanguageContext và API interceptor
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
      
      // Use React Router navigate để update URL và trigger re-render
      navigate(newPath + window.location.search, { replace: true });
      
      // 🔥 CRITICAL: Invalidate tất cả queries để refetch data với lang mới
      queryClient.invalidateQueries();
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      console.log(`✅ Language changed to: ${lang}`);
    } catch (error) {
      console.error('❌ Error changing language:', error);
    }
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return {
    t,
    i18n,
    language: i18n.language as SupportedLanguage,
    changeLanguage,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

