import thailandMapInfographic from "@/assets/infographic-thailand-map.png";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceCoverage = () => {
  const { language } = useLanguage();

  const title = {
    en: "Nationwide Coverage",
    th: "ครอบคลุมทั่วประเทศ",
    zh: "全国覆盖",
    ja: "全国対応",
    ko: "전국 서비스",
    ru: "Охват по всей стране",
    de: "Landesweite Abdeckung",
    fr: "Couverture nationale",
    es: "Cobertura nacional",
    ar: "تغطية على مستوى الدولة",
    hi: "राष्ट्रव्यापी कवरेज",
    pt: "Cobertura nacional",
  };

  const subtitle = {
    en: "150+ Destinations Nationwide with Premium Vehicle Fleet",
    th: "กว่า 150 จุดหมายปลายทางทั่วประเทศ พร้อมกองยานพาหนะระดับพรีเมียม",
    zh: "全国150多个目的地，配备高端车队",
    ja: "全国150以上の目的地、プレミアム車両フリート",
    ko: "전국 150개 이상 목적지, 프리미엄 차량 플릿",
    ru: "Более 150 направлений по всей стране с премиальным автопарком",
    de: "Über 150 Reiseziele landesweit mit Premium-Fahrzeugflotte",
    fr: "Plus de 150 destinations dans tout le pays avec une flotte de véhicules premium",
    es: "Más de 150 destinos en todo el país con flota de vehículos premium",
    ar: "أكثر من 150 وجهة في جميع أنحاء البلاد مع أسطول مركبات فاخرة",
    hi: "प्रीमियम वाहन बेड़े के साथ देशभर में 150+ गंतव्य",
    pt: "Mais de 150 destinos em todo o país com frota de veículos premium",
  };

  return (
    <section id="coverage" className="py-16 md:py-20 bg-primary">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary-foreground text-center mb-4">
          {title[language as keyof typeof title] || title.en}
        </h2>
        <p className="text-primary-foreground/80 text-center text-base md:text-lg mb-10 max-w-2xl mx-auto">
          {subtitle[language as keyof typeof subtitle] || subtitle.en}
        </p>

        <div className="flex justify-center">
          <div className="relative max-w-4xl w-full">
            <img
              src={thailandMapInfographic}
              alt="IBB Shuttle Service Coverage Map - 150+ destinations across Thailand with luxury sedans, limos, buses, minibuses, and spacious vans"
              className="w-full h-auto rounded-lg shadow-glow"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCoverage;
