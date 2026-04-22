/**
 * Level 2 — Silent Language System
 * External store pattern (no React context/provider needed)
 * 
 * Flow:
 * 1. L1 renders with English defaults (getSnapshot returns null translations)
 * 2. After paint, bootstrap() is called via useEffect
 * 3. Dynamic import() loads translations chunk
 * 4. Detects language from localStorage → browser preference → 'en'
 * 5. If non-English: sets translations → subscribers re-render seamlessly
 * 6. If English: translations stays null → no re-render needed
 */

import type { Language } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'ibb-language';
const VALID_LANGS: Language[] = ['en', 'th', 'zh', 'ja', 'ko', 'ru', 'ar', 'de', 'fr', 'es', 'id', 'hi', 'vi'];

const LANG_LABELS: Record<Language, string> = {
  en: 'English', th: 'ไทย', zh: '中文', ja: '日本語', ko: '한국어',
  ru: 'Русский', ar: 'العربية', de: 'Deutsch', fr: 'Français',
  es: 'Español', id: 'Bahasa', hi: 'हिन्दी', vi: 'Tiếng Việt',
};

export const ALL_LANGUAGES = VALID_LANGS.map(code => ({ code, label: LANG_LABELS[code] }));

interface Level2State {
  language: Language;
  translations: Record<string, any> | null;
  allTranslations: Record<string, any> | null;
  ready: boolean;
}

let state: Level2State = {
  language: 'en',
  translations: null,
  allTranslations: null,
  ready: false,
};

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getSnapshot(): Level2State {
  return state;
}

// SSR fallback (same as client — no SSR in this project)
export function getServerSnapshot(): Level2State {
  return state;
}

function detectLanguage(): Language {
  // 1. Check localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_LANGS.includes(stored as Language)) {
      return stored as Language;
    }
  } catch { /* ignore */ }

  // 2. Check browser navigator.languages
  try {
    const browserLangs = navigator.languages || [navigator.language];
    for (const rawLang of browserLangs) {
      const code = rawLang.split('-')[0].toLowerCase() as Language;
      if (VALID_LANGS.includes(code)) return code;
    }
  } catch { /* ignore */ }

  return 'en';
}

let booted = false;

export async function bootstrap(): Promise<void> {
  if (booted) return;
  booted = true;

  const detectedLang = detectLanguage();

  // Dynamic import — creates a separate chunk, not in initial bundle
  const mod = await import('@/data/translations');

  state = {
    language: detectedLang,
    translations: detectedLang === 'en' ? null : (mod.translations[detectedLang] || null),
    allTranslations: mod.translations,
    ready: true,
  };

  // Set RTL direction and lang attribute for Arabic
  if (detectedLang === 'ar') {
    document.documentElement.dir = 'rtl';
  }
  document.documentElement.lang = detectedLang;

  // Persist detected language
  localStorage.setItem(STORAGE_KEY, detectedLang);

  emit();
}

export function switchLang(lang: Language): void {
  if (!state.allTranslations) return; // Not yet loaded
  
  state = {
    ...state,
    language: lang,
    translations: lang === 'en' ? null : (state.allTranslations[lang] || null),
  };

  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  emit();
}
