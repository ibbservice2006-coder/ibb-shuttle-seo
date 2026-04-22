import { Button } from "@/components/ui/button";
import { useLevel2Language } from "@/hooks/useLevel2Language";

const Hero = () => {
  const { t } = useLevel2Language();

  return (
    <section
      id="home"
      className="relative h-[329px] flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/seo/hero-bangkok.jpg')` }}
      />

      {/* Full-width gradient overlay — lighter than Pricing for more vivid mood */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.07) 65%, rgba(0,0,0,0.01) 100%)' }}
      />

      <div className="absolute z-10 top-[12%] left-0 right-0 text-center">
        <h1 className="inline-block font-heading text-xl sm:text-2xl md:text-4xl lg:text-[49px] font-light md:font-normal lg:font-medium text-white animate-fade-in-up leading-tight [text-shadow:0_4px_20px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.5)]">
          {t('hero.title', 'Trusted Premium Shuttle Service')}
        </h1>
        <p className="sr-only text-white/[0.92]">
          Convenient and Reliable Shuttle
        </p>
      </div>

      <div className="absolute z-10 bottom-[26%] left-0 right-0 text-center">
        <Button
          variant="cta"
          size="lg"
          className="animate-blink h-14 px-[1.825rem] border-0"
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('hero.bookNow', 'Book Now')}
        </Button>
      </div>
    </section>
  );
};

export default Hero;
