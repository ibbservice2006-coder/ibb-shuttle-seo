import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Settings, User, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptionalAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useDriverRole } from "@/hooks/useDriverRole";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", name: "English" },
  { code: "th", name: "ไทย" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
  { code: "de", name: "Deutsch" },
  { code: "ar", name: "العربية" },
  { code: "id", name: "Indonesia" },
  { code: "ko", name: "한국어" },
  { code: "ja", name: "日本語" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "hi", name: "हिन्दी" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { user, signOut } = useOptionalAuth();
  const { isAdmin } = useAdminRole();
  const { isDriver } = useDriverRole();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  
  const isShuttlePage = location.pathname === "/shuttle";

  const navLinks = [
    { name: t.nav.home, href: "#home", isRoute: false },
    { name: t.nav.services, href: "#services", isRoute: false },
    { name: t.nav.pricing, href: "/pricing", isRoute: true },
    { name: t.nav.booking, href: "#booking", isRoute: false },
    { name: t.nav.balancePayments, href: "/balance", isRoute: true },
    { name: t.nav.contact, href: "#contact", isRoute: false },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isShuttlePage) {
      e.preventDefault();
      navigate("/shuttle" + href);
    }
  };

  return (
    <nav className="bg-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center py-[0.325rem]">
          {/* Left - Empty for balance */}
          <div></div>

          {/* Center - Desktop Navigation */}
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
                    href={isShuttlePage ? link.href : "/shuttle" + link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-secondary-foreground hover:text-secondary-foreground/80 text-sm lg:text-[16.5px] transition-colors hover:underline underline-offset-4"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
            {/* User Account Menu */}
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-secondary-foreground hover:text-secondary-foreground/80 text-sm lg:text-[16.5px] transition-colors hover:underline underline-offset-4 cursor-pointer">
                  {t.nav.userAccount}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {user ? (
                    <>
                      <DropdownMenuItem disabled className="text-muted-foreground">
                        {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <User className="h-4 w-4 mr-2" />
                        My Dashboard
                      </DropdownMenuItem>
                      {isDriver && (
                        <DropdownMenuItem onClick={() => navigate('/driver-dashboard')}>
                          <Car className="h-4 w-4 mr-2" />
                          Driver Dashboard
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Settings className="h-4 w-4 mr-2" />
                            {t.nav.adminDashboard}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        {t.nav.logout}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/auth')}>
                        {t.nav.login}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/auth')}>
                        {t.nav.signup}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>

          {/* Right - Language Selector */}
          <div className="flex items-center justify-end">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-secondary text-secondary-foreground border-2 border-secondary-foreground rounded-md px-3 py-1 pr-8 text-[16px] cursor-pointer hover:border-secondary-foreground/80 transition-colors focus:outline-none focus:border-secondary-foreground"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-secondary">
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-[0.325rem]">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Language Selector Mobile */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-secondary text-secondary-foreground border-2 border-secondary-foreground rounded-md px-3 py-1 pr-8 text-[16px] cursor-pointer hover:border-secondary-foreground/80 transition-colors focus:outline-none focus:border-secondary-foreground"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-secondary">
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-foreground pointer-events-none" />
            </div>
          </div>

          {/* Mobile Navigation Menu */}
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
                      href={isShuttlePage ? link.href : "/shuttle" + link.href}
                      onClick={(e) => {
                        handleAnchorClick(e, link.href);
                        setIsOpen(false);
                      }}
                      className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
              {/* Mobile User Account */}
              <li className="border-t border-secondary-foreground/20 pt-2 mt-2">
                <span className="block py-2 text-secondary-foreground/60 text-sm">{t.nav.userAccount}</span>
                {user ? (
                  <>
                    <span className="block py-1 text-secondary-foreground/80 text-sm">{user.email}</span>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    {isDriver && (
                      <Link
                        to="/driver-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                      >
                        <Car className="h-4 w-4" />
                        Driver Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        {t.nav.adminDashboard}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      {t.nav.login}
                    </Link>
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-secondary-foreground hover:text-secondary-foreground/80 transition-colors"
                    >
                      {t.nav.signup}
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
