import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { ChevronDownIcon, CheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function LanguageSwitcher() {
  const { t, language, changeLanguage, currentLanguage, supportedLanguages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = async (langCode: string) => {
    try {
      await changeLanguage(langCode as any);
      setIsOpen(false);
    } catch (error) {
      console.error('Error changing language:', error);
      // Keep dropdown open if error occurs
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={t('common:selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeAltIcon className="h-5 w-5" />
        <span className="hidden sm:inline font-medium">{currentLanguage.nativeLabel}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[9999]">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{t('common:selectLanguage')}</h3>
          </div>

          {/* Language List */}
          <div className="max-h-96 overflow-y-auto">
            <div className="py-2">
              {supportedLanguages.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange(lang.code);
                    }}
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-gray-900">{lang.nativeLabel}</span>
                        <span className="text-xs text-gray-500">{lang.label}</span>
                      </div>
                    </div>
                    {isActive && <CheckIcon className="h-5 w-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              {t('common:moreLanguagesComingSoon', 'More languages coming soon')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
