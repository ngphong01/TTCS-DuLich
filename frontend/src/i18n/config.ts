import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages (BCP-47 / ISO 639)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: 'Chinese (Traditional)', nativeLabel: '繁體中文', flag: '🇹🇼' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย', flag: '🇹🇭' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

// Language detection order (priority):
// 1. URL parameter (?lang=vi)
// 2. User setting (localStorage: travelgo:language)
// 3. Cookie
// 4. Browser language (navigator.language)
// 5. Fallback to 'en'
i18n
  .use(Backend) // Load translations from /public/locales/{lng}/{ns}.json
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    // Default language
    lng: 'en',
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    
    // Namespaces (translation files)
    ns: ['common', 'header', 'footer', 'tour', 'hotel', 'restaurant', 'booking', 'auth', 'admin'],
    defaultNS: 'common',
    
    // Load all namespaces
    load: 'languageOnly', // Only load 'en', not 'en-US'
    
    // Detection options
    detection: {
      // Order of detection - thêm 'path' để detect từ URL path
      order: ['path', 'querystring', 'localStorage', 'cookie', 'navigator'],
      
      // Keys to lookup
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'travelgo:language',
      lookupCookie: 'travelgo:language',
      
      // 🔥 CRITICAL: Custom path detector - detect language từ URL path (ví dụ: /fr/destinations)
      lookupFromPathIndex: 0, // Language ở vị trí đầu tiên trong path
      lookupFromSubdomainIndex: 0,
      
      // Cache user language
      caches: ['localStorage', 'cookie'],
      
      // Cookie options
      cookieMinutes: 60 * 24 * 365, // 1 year
      cookieOptions: { path: '/', sameSite: 'strict' },
    },
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // React options
    react: {
      useSuspense: false, // Disable suspense for better UX
    },
    
    // Debug (only in development)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;

