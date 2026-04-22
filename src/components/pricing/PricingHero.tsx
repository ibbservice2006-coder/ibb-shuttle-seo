import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/data/translations";
import { useNavigate } from "react-router-dom";

const PricingHero = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  const handleBookNowClick = () => {
    navigate("/#booking");
  };

  return (
    <section
      id="home"
      className="relative h-[329px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/seo/hero-bangkok.jpg')` }}
      />

      {/* Text - positioned at top */}
      <div className="absolute z-10 top-[12%] left-0 right-0 text-center">
        <h1 className="inline-block font-heading text-xl sm:text-2xl md:text-4xl lg:text-[49px] font-thin text-white animate-fade-in-up leading-tight bg-[#173ca7]/80 px-6 py-5">
          {t.hero.title}
        </h1>
        <p className="sr-only">
          {t.hero.tagline}
        </p>
      </div>
      {/* CTA Button - positioned at bottom */}
      <div className="absolute z-10 bottom-[26%] left-0 right-0 text-center">
        <Button
          variant="cta"
          size="lg"
          className="animate-blink h-14 px-[1.825rem] border-0"
          onClick={handleBookNowClick}
        >
          {t.hero.bookNow}
        </Button>
      </div>
    </section>
  );
};

export default PricingHero;
