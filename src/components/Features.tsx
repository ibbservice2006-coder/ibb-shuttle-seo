import convenienceImg from "@/assets/features/convenience.jpg";
import safetyImg from "@/assets/features/safety.jpg";
import premiumCarsImg from "@/assets/features/premium-cars.jpg";
import { useLevel2Language } from "@/hooks/useLevel2Language";

const Features = () => {
  const { t } = useLevel2Language();

  const features = [
    {
      title: t('features.convenience', 'Convenience'),
      desc: t('features.convenienceDesc', 'Easy online booking with flexible scheduling and door-to-door service.'),
      image: convenienceImg,
      alt: "IBB Shuttle Convenience - Comfortable travel experience with premium amenities",
    },
    {
      title: t('features.safety', 'Safety'),
      desc: t('features.safetyDesc', 'Verified drivers, insured vehicles, and real-time GPS tracking for peace of mind.'),
      image: safetyImg,
      alt: "IBB Shuttle Safety - Professional drivers and verified vehicles for secure travel",
    },
    {
      title: t('features.premiumCars', 'Premium Cars'),
      desc: t('features.premiumCarsDesc', 'Modern, clean, and well-maintained fleet of luxury vehicles for your comfort.'),
      image: premiumCarsImg,
      alt: "IBB Premium Cars - Modern luxury fleet with clean and well-maintained vehicles",
    },
  ];

  return (
    <section className="bg-secondary pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-secondary border border-primary-foreground/20 rounded-lg p-5 text-center group hover:border-primary-foreground/40 transition-colors animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              <h4 className="font-heading text-lg md:text-xl font-bold text-secondary-foreground mb-2">
                {feature.title}
              </h4>
              <p className="text-secondary-foreground/80 text-sm md:text-base mb-4">
                {feature.desc}
              </p>
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  loading="lazy"
                  className="w-full h-40 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
