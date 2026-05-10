import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import type { Language } from "@/contexts/LanguageContext";

// ============================================
// PublicNavigation - Level 1+2
// L1: Static English shell, immediate render
// L2: Silent language swap after bootstrap
// ============================================

const VALID_LANGS: Language[] = ['en', 'th', 'zh', 'ja', 'ko', 'ru', 'ar', 'de', 'fr', 'es', 'id', 'hi', 'vi'];

const PublicNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, ready, setLanguage, allLanguages } = useLevel2Language();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.home', 'Home'), href: "/landing", isRoute: true },
    { name: t('nav.services', 'Services'), href: "#services", isRoute: false },
    { name: t('nav.pricing', 'Pricing'), href: "/pricing", isRoute: true },
    { name: t('nav.booking', 'Book Now'), href: "#booking", isRoute: false },
    { name: t('nav.balancePayments', 'Balance & Payments'), href: "/balance", isRoute: true },
    { name: t('nav.contact', 'Contact'), href: "#contact", isRoute: false },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLanguage(newLang);

    // If on /:lang/shuttle, update the URL lang segment too
    const langShuttleMatch = location.pathname.match(
      /^\/(en|th|zh|ja|ko|ru|ar|de|fr|es|id|hi|vi)\/(shuttle)$/
    );
    if (langShuttleMatch && VALID_LANGS.includes(newLang)) {
      navigate(`/${newLang}/${langShuttleMatch[2]}`, { replace: true });
    }
  };

  const LanguageSelector = ({ className = "" }: { className?: string }) => (
    <div className={cn("relative", className)}>
      <select
        value={language}
        onChange={handleLanguageChange}
        className="appearance-none bg-secondary text-secondary-foreground border-2 border-secondary-foreground rounded-md px-3 py-1 pr-8 text-[16px] cursor-pointer hover:border-secondary-foreground/80 transition-colors focus:outline-none focus:border-secondary-foreground"
      >
        {ready ? (
          allLanguages.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))
        ) : (
          <option value="en">English</option>
        )}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-foreground pointer-events-none" />
    </div>
  );

  return (
    <nav className="bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center py-[0.325rem]">
          <div></div>

          <ul className="flex items-center justify-center gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.isRoute ? (
                  <Link
                    to={link.href}
                    className="text-secondary-foreground hover:text-secondary-foreground/80 text-sm lg:text-[16.5px] transition-colors hover:underline underline-offset-4"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-secondary-foreground hover:text-secondary-foreground/80 text-sm lg:text-[16.5px] transition-colors hover:underline underline-offset-4"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link
                to="/auth"
                className="text-secondary-foreground hover:text-secondary-foreground/80 text-sm lg:text-[16.5px] transition-colors hover:underline underline-offset-4"
              >
                {t('nav.login', 'Login')} / {t('nav.signup', 'Sign Up')}
              </Link>
            </li>
          </ul>

          <div className="flex items-center justify-end">
            <LanguageSelector />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-[0.325rem]">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <LanguageSelector />
          </div>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isOpen ? "max-h-[500px] pb-4" : "max-h-0"
            )}
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
              <li className="border-t border-secondary-foreground/20 pt-2 mt-2">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                >
                  {t('nav.login', 'Login')} / {t('nav.signup', 'Sign Up')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavigation;
