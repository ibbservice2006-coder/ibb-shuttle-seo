import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bus, Plane, Heart, Shield, Tags, Wallet, MapPin, Hotel, UserCheck, Stethoscope, Ambulance, ClipboardList } from "lucide-react";
import logoGold from "@/assets/logo-ibb-gold.png";
import patternBg from "@/assets/thai-pattern-bg.jpg";
import shuttleImg from "@/assets/portal/shuttle-service.jpg";
import travelImg from "@/assets/portal/travel-service.jpg";
import healthImg from "@/assets/portal/health-service.jpg";
import PortalServiceCard, { type ServiceCardProps } from "@/components/portal/PortalServiceCard";
import PortalFloatingParticles from "@/components/portal/PortalFloatingParticles";
import PortalLanguageSwitcher from "@/components/portal/PortalLanguageSwitcher";
import { portalTranslations, type PortalTranslations } from "@/data/portalTranslations";

const STORAGE_KEY = "ibb-language";

const getInitialLang = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in portalTranslations) return stored;
  } catch {}
  return "en";
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15, duration: 0.6 },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 10 },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Portal = () => {
  const [lang, setLang] = useState(getInitialLang);
  const t = portalTranslations[lang] ?? portalTranslations.en;

  // Listen for language changes from PortalLanguageSwitcher (via storage event or custom event)
  useEffect(() => {
    const onStorage = () => {
      const newLang = localStorage.getItem(STORAGE_KEY);
      if (newLang && newLang in portalTranslations && newLang !== lang) {
        setLang(newLang);
      }
    };

    // Listen for both storage events and custom events from the switcher
    window.addEventListener("storage", onStorage);
    window.addEventListener("portal-lang-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("portal-lang-change", onStorage);
    };
  }, [lang]);

  // Build localized href for shuttle
  const shuttleHref = `/${lang}/shuttle`;

  const services: ServiceCardProps[] = [
    {
      href: shuttleHref,
      image: shuttleImg,
      icon: <Bus size={32} />,
      title: "SHUTTLE",
      titleLine2: "SERVICE",
      description: t.shuttle.description,
      features: [
        { icon: <Shield size={20} />, text: t.shuttle.features[0] },
        { icon: <Tags size={20} />, text: t.shuttle.features[1] },
        { icon: <Wallet size={20} />, text: t.shuttle.features[2] },
      ],
      ctaText: t.shuttle.cta,
    },
    {
      href: "#",
      image: travelImg,
      icon: <Plane size={32} />,
      title: "TRAVEL",
      titleLine2: "SERVICE",
      description: t.travel.description,
      features: [
        { icon: <MapPin size={20} />, text: t.travel.features[0] },
        { icon: <Hotel size={20} />, text: t.travel.features[1] },
        { icon: <UserCheck size={20} />, text: t.travel.features[2] },
      ],
      ctaText: t.travel.cta,
    },
    {
      href: "#",
      image: healthImg,
      icon: <Heart size={32} />,
      title: "HEALTH",
      titleLine2: "ASSISTANT",
      description: t.health.description,
      features: [
        { icon: <Stethoscope size={20} />, text: t.health.features[0] },
        { icon: <Ambulance size={20} />, text: t.health.features[1] },
        { icon: <ClipboardList size={20} />, text: t.health.features[2] },
      ],
      ctaText: t.health.cta,
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-8 relative"
      style={{
        backgroundColor: '#0f1623',
        backgroundImage: `url('${patternBg}'), radial-gradient(circle at 50% 40%, #1e2b42 0%, #0f1623 100%)`,
        backgroundBlendMode: 'overlay, normal',
        backgroundSize: '400px, cover',
        backgroundPosition: 'center, center',
      }}
    >
      <PortalLanguageSwitcher onLangChange={setLang} />
      <PortalFloatingParticles />

      {/* Logo & Header */}
      <motion.div 
        className="text-center mb-12 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="w-32 h-32 md:w-40 md:h-40 bg-white/5 rounded-3xl p-4 mb-6 border border-white/10 flex items-center justify-center"
          variants={logoVariants}
        >
          <img src={logoGold} alt="IBB Service Logo" className="w-full h-full object-contain" />
        </motion.div>
        <motion.p className="text-gray-400 text-sm tracking-[0.4em] uppercase" variants={textVariants}>
          {t.tagline}
        </motion.p>
      </motion.div>

      {/* Service Cards */}
      <motion.div 
        className="flex flex-col xl:flex-row gap-8 xl:gap-12 items-center justify-center w-full max-w-[1400px]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {services.map((service, index) => (
          <motion.div key={index} variants={cardVariants}>
            <PortalServiceCard {...service} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-16 text-center text-gray-500 text-xs">
        &copy; 2026 {t.copyright}
      </div>
    </div>
  );
};

export default Portal;
