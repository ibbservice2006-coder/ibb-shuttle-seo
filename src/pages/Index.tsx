import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import PublicNavigation from "@/components/PublicNavigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import ImpressiveService from "@/components/ImpressiveService";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;

    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      attempts += 1;
      if (attempts < 20) {
        window.setTimeout(tryScroll, 50);
      }
    };

    window.setTimeout(tryScroll, 0);
    return () => { cancelled = true; };
  }, [location.hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PublicNavigation />
      <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <ImpressiveService />
        <Features />
        <Pricing />
        <BookingSection />
      </main>
      <Footer />

      {/* Floating Back to Portal button */}
      <Link
        to="/"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground text-sm font-medium shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
      >
        <ArrowLeft className="w-4 h-4" />
        Portal
      </Link>
    </div>
  );
};

export default Index;
