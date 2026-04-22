import { useLanguage, VALID_LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  th: "ไทย",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  ar: "العربية",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  id: "Bahasa",
  hi: "हिन्दी",
  vi: "Tiếng Việt",
};

const LanguageSwitcher = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLanguage = (newLang: Language) => {
    setOpen(false);
    if (newLang === language) return;

    // Replace /:lang/ segment in current path
    const newPath = location.pathname.replace(/^\/[a-z]{2}\//, `/${newLang}/`);
    navigate(newPath + location.search + location.hash);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="appearance-none bg-secondary text-secondary-foreground border-2 border-secondary-foreground rounded-md px-3 py-1 pr-8 text-[16px] cursor-pointer relative"
        aria-label="Select language"
      >
        {LANGUAGE_LABELS[language]}
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-foreground pointer-events-none" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-medium z-50 min-w-[160px] max-h-[300px] overflow-y-auto">
          {VALID_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                lang === language ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
