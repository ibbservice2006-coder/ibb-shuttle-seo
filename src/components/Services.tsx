import airportShuttle from "@/assets/services/airport-shuttle.jpg";
import leisureTravel from "@/assets/services/leisure-travel.jpg";
import corporateTravel from "@/assets/services/corporate-travel.jpg";
import { useLevel2Language } from "@/hooks/useLevel2Language";

const Services = () => {
  const { t } = useLevel2Language();

  const services = [
    {
      title: t('services.airportShuttle', 'Airport Shuttle'),
      desc: t('services.airportShuttleDesc', 'Reliable airport transfers with flight tracking and meet & greet service.'),
      image: airportShuttle,
      alt: "IBB Airport Shuttle Service - Premium airport transfer with professional driver",
    },
    {
      title: t('services.leisureTravel', 'Leisure Travel'),
      desc: t('services.leisureTravelDesc', 'Comfortable transportation for vacation trips and sightseeing tours.'),
      image: leisureTravel,
      alt: "IBB Leisure Travel Service - Comfortable premium transportation for vacation trips",
    },
    {
      title: t('services.corporateTravel', 'Corporate Travel'),
      desc: t('services.corporateTravelDesc', 'Professional business transportation with punctual and discreet service.'),
      image: corporateTravel,
      alt: "IBB Corporate Travel Service - Professional business transportation with luxury vehicles",
    },
  ];

  return (
    <section id="services" className="pt-16 md:pt-20 pb-14 md:pb-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary text-center mb-12">
          {t('services.title', 'Our Services')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-card rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
