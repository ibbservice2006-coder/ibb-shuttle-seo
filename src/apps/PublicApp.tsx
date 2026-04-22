import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import LoadingFallback from "@/components/LoadingFallback";
import { LanguageProvider, isValidLanguage, getStoredLanguage } from "@/contexts/LanguageContext";
import { switchLang, bootstrap } from "@/lib/level2-language";

// ============================================
// PUBLIC APP - Level 1: Zero-dependency routing
// Landing, Pricing, Partners, Tracking = eagerly loaded
// No providers wrapping public pages
// ============================================

// Eager load — Level 1 pure static UI shells
import Index from "@/pages/Index";
import PricingPage from "@/pages/Pricing";
import PartnersPage from "@/pages/Partners";
import TrackingPage from "@/pages/Tracking";
import Portal from "@/pages/Portal";
import NotFound from "@/pages/NotFound";

// Lazy loaded — These require system providers (Level 4+)
const GuestPaymentPage = lazy(() => import("@/pages/GuestPayment"));
const VoucherRedemptionPage = lazy(() => import("@/pages/VoucherRedemption"));

// Providers for lazy-loaded routes only
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const WithProviders = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </TooltipProvider>
  </HelmetProvider>
);

// ============================================
// Language-aware route wrapper
// Syncs URL :lang param with Level 2 language store
// ============================================
const LangShuttlePage = () => {
  const { lang } = useParams<{ lang: string }>();
  const validLang = isValidLanguage(lang) ? lang : 'en';

  // Sync Level 2 external store with URL language param
  useEffect(() => {
    bootstrap().then(() => {
      switchLang(validLang);
    });
  }, [validLang]);

  return (
    <LanguageProvider initialLang={validLang}>
      <Index />
    </LanguageProvider>
  );
};

// Redirect /shuttle → /{storedLang}/shuttle
const ShuttleRedirect = () => {
  const lang = getStoredLanguage();
  return <Navigate to={`/${lang}/shuttle`} replace />;
};

const PublicApp = () => (
  <Routes>
    {/* Portal — ประตูหลัก: ผู้ใช้เห็นหน้านี้ก่อน */}
    <Route path="/" element={<Portal />} />

    {/* Landing page — เข้าถึงได้ตรงที่ /landing */}
    <Route path="/landing" element={<Index />} />

    {/* Landing page — language-aware */}
    <Route path="/shuttle" element={<ShuttleRedirect />} />
    <Route path="/:lang/shuttle" element={<LangShuttlePage />} />

    {/* Pricing page — Level 1: zero-dependency */}
    <Route path="/pricing" element={<PricingPage />} />

    {/* Portal page — Level 1: zero-dependency */}
    <Route path="/portal" element={<Portal />} />

    {/* Partners page — Level 1: zero-dependency */}
    <Route path="/partners" element={<PartnersPage />} />

    {/* Tracking page — Level 1: zero-dependency */}
    <Route path="/tracking" element={<TrackingPage />} />
    <Route path="/tracking/:bookingNumber" element={<TrackingPage />} />

    {/* Guest Payment & Voucher — Level 4+: require providers */}
    <Route path="/guest-payment" element={
      <WithProviders>
        <Suspense fallback={<LoadingFallback />}>
          <GuestPaymentPage />
        </Suspense>
      </WithProviders>
    } />
    <Route path="/voucher" element={
      <WithProviders>
        <Suspense fallback={<LoadingFallback />}>
          <VoucherRedemptionPage />
        </Suspense>
      </WithProviders>
    } />

    {/* 404 catch-all — Level 1: eagerly loaded, no spinner */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default PublicApp;
