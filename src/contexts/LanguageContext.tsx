import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { translations } from '@/data/translations';

export type Language = 'en' | 'th' | 'zh' | 'ru' | 'de' | 'ar' | 'id' | 'ko' | 'ja' | 'vi' | 'hi' | 'fr' | 'es';

// Canonical order: en, th, zh, ja, ko, ru, ar, de, fr, es, id, hi, vi
export const VALID_LANGUAGES: Language[] = ['en', 'th', 'zh', 'ja', 'ko', 'ru', 'ar', 'de', 'fr', 'es', 'id', 'hi', 'vi'];
const STORAGE_KEY = 'ibb-language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const isValidLanguage = (lang: string | null | undefined): lang is Language => {
  return lang != null && VALID_LANGUAGES.includes(lang as Language);
};

export const getStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValidLanguage(stored) ? stored : 'en';
  } catch {
    return 'en';
  }
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLang?: Language;
}

export const LanguageProvider = ({ children, initialLang }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(initialLang || getStoredLanguage());

  // Sync when initialLang changes (URL navigation between languages)
  useEffect(() => {
    if (initialLang && initialLang !== language) {
      setLanguageState(initialLang);
      localStorage.setItem(STORAGE_KEY, initialLang);
    }
  }, [initialLang]);

  // Set RTL direction for Arabic
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key;
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
