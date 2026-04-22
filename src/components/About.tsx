import { Shield, Clock, Award, Users } from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";

const About = () => {
  const { t } = useLevel2Language();

  const aboutPoints = [
    { icon: Shield, title: t('about.safeSecure', 'Safe & Secure'), desc: t('about.safeSecureDesc', 'All vehicles are regularly inspected and drivers are professionally trained for your safety.') },
    { icon: Clock, title: t('about.service247', '24/7 Service'), desc: t('about.service247Desc', 'Available around the clock to accommodate any schedule, day or night.') },
    { icon: Award, title: t('about.premiumQuality', 'Premium Quality'), desc: t('about.premiumQualityDesc', 'Top-tier vehicles with modern amenities for maximum comfort.') },
    { icon: Users, title: t('about.customerFirst', 'Customer First'), desc: t('about.customerFirstDesc', 'Dedicated support team ensuring your complete satisfaction.') },
  ];

  return (
    <section id="about" className="pt-12 md:pt-[60px] pb-8 md:pb-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-4">
            {t('about.title', 'Premium Private Shuttle Service Designed Around You')}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-base md:text-lg">
            {t('about.description', 'IBB Shuttle Service is a premium private shuttle booking platform focused on safety, flexibility, and reliability. We provide whole-vehicle rentals, carefully selecting professional drivers and modern vehicles to ensure a seamless travel experience.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {aboutPoints.map((point, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-card shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <point.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {point.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
