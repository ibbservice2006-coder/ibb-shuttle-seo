import { useLevel2Language } from "@/hooks/useLevel2Language";

const ImpressiveService = () => {
  const { t } = useLevel2Language();

  return (
    <section className="bg-secondary pt-12 md:pt-14 pb-8 md:pb-10">
      <div className="container mx-auto px-4 text-center">
        <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-secondary-foreground mb-3">
          {t('impressive.title', 'Impressive Service Coverage')}
        </h3>
        <p className="text-secondary-foreground/90 text-base md:text-lg max-w-2xl mx-auto">
          {t('impressive.description', 'We cover all major destinations across Thailand, from Bangkok to Chiang Mai, Phuket, and beyond.')}
        </p>
      </div>
    </section>
  );
};

export default ImpressiveService;
