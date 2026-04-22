import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "th", label: "ไทย" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "id", label: "Bahasa" },
  { code: "hi", label: "हिन्दी" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

const STORAGE_KEY = "ibb-language";

const getStoredLang = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.find((l) => l.code === stored)?.code ?? "en";
  } catch {
    return "en";
  }
};

interface PortalLanguageSwitcherProps {
  onLangChange?: (lang: string) => void;
}

const PortalLanguageSwitcher = ({ onLangChange }: PortalLanguageSwitcherProps) => {
  const [current, setCurrent] = useState(getStoredLang);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (code: typeof LANGUAGES[number]["code"]) => {
    setOpen(false);
    if (code === current) return;
    setCurrent(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
    // Update document lang & RTL
    document.documentElement.lang = code;
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    // Notify parent directly
    onLangChange?.(code);
    // Also fire custom event for other listeners
    window.dispatchEvent(new Event("portal-lang-change"));
  };

  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label ?? "English";

  return (
    <div ref={ref} className="fixed z-50" style={{ top: "48px", right: "max(calc(2rem + 26px), calc((100vw - 1400px) / 2 + 26px))" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/10 w-[120px]"
        style={{
          backgroundColor: "rgba(15, 22, 35, 0.7)",
          borderColor: "rgb(191, 149, 63)",
          borderWidth: "3px",
          color: "rgb(191, 149, 63)",
        }}
        aria-label="Select language"
      >
        {currentLabel}
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{ color: "rgb(191, 149, 63)", transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg border shadow-lg backdrop-blur-md max-h-[320px] overflow-y-auto min-w-[160px]"
          style={{
            backgroundColor: "rgba(15, 22, 35, 0.95)",
            borderColor: "rgba(191, 149, 63, 0.3)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/10"
              style={{
                color: lang.code === current ? "rgb(191, 149, 63)" : "rgba(255, 255, 255, 0.8)",
                fontWeight: lang.code === current ? 600 : 400,
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalLanguageSwitcher;
