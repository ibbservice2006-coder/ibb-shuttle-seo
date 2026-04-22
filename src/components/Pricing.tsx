import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { currencies } from "@/data/pricingDataComplete";
import { cn } from "@/lib/utils";

// ============================================
// PRICING SECTION — Level 1 shell + Level 3 interactive
// L1: Static cards with THB starting prices
// L3: Vehicle toggle, currency conversion (loaded silently)
// ============================================

type VehicleType = "car" | "van" | "bus";

// Starting prices (lowest standard price per vehicle from pricingDataComplete)
const STARTING_PRICES: Record<VehicleType, number> = {
  car: 1100,  // Airport Bangkok - Don Mueang
  van: 1400,  // Airport Bangkok - Don Mueang
  bus: 6000,  // Airport Bangkok - Don Mueang
};

const Pricing = () => {
  const { t } = useLevel2Language();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("car");
  const { selectedCurrency, setSelectedCurrency, convertPrice } = useCurrencyConverter();

  const currencyInfo = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const formatStartingPrice = useCallback((priceTHB: number): string => {
    if (selectedCurrency === "THB") return `฿${priceTHB.toLocaleString()}`;
    const converted = convertPrice(priceTHB);
    return `${currencyInfo.symbol}${converted.toLocaleString()}`;
  }, [selectedCurrency, convertPrice, currencyInfo]);

  const pricingPlans: { vehicle: VehicleType; name: string; passengers: string; desc: string; features: string[]; popular: boolean }[] = [
    {
      vehicle: "car",
      name: t('pricing.car', 'Car'),
      passengers: t('pricing.carPassengers', 'Up to 3 passengers'),
      desc: t('pricing.carDesc', 'Perfect for solo travelers or small groups'),
      features: [
        t('pricing.comfortableSedan', 'Comfortable Sedan'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
        t('pricing.luggageSpace', 'Luggage Space'),
      ],
      popular: false,
    },
    {
      vehicle: "van",
      name: t('pricing.van', 'Van'),
      passengers: t('pricing.vanPassengers', 'Up to 10 passengers'),
      desc: t('pricing.vanDesc', 'Ideal for families and medium groups'),
      features: [
        t('pricing.spaciousMinivan', 'Spacious Minivan'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
        t('pricing.extraLuggageSpace', 'Extra Luggage Space'),
        t('pricing.wifiAvailable', 'WiFi Available'),
      ],
      popular: true,
    },
    {
      vehicle: "bus",
      name: t('pricing.bus', 'Bus'),
      passengers: t('pricing.busPassengers', 'Up to 40 passengers'),
      desc: t('pricing.busDesc', 'Best for large groups and events'),
      features: [
        t('pricing.fullSizeBus', 'Full-Size Bus'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
        t('pricing.maxLuggageCapacity', 'Max Luggage Capacity'),
        t('pricing.wifiAvailable', 'WiFi Available'),
        t('pricing.tourGuideOption', 'Tour Guide Option'),
      ],
      popular: false,
    },
  ];

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-16 md:py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-4">
            {t('pricing.title', 'Simple & Transparent Pricing')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('pricing.description', 'Choose your vehicle type. Prices vary by route and distance.')}
          </p>

          {/* Vehicle Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            {(["car", "van", "bus"] as VehicleType[]).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVehicle(v)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedVehicle === v
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border"
                )}
              >
                {v === "car" ? t('pricing.car', 'Car') : v === "van" ? t('pricing.van', 'Van') : t('pricing.bus', 'Bus')}
              </button>
            ))}
          </div>

          {/* Currency Selector */}
          <div className="flex justify-center items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('pricingPage.currency', 'Currency')}:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:border-primary"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const isSelected = plan.vehicle === selectedVehicle;
            return (
              <div
                key={index}
                onClick={() => setSelectedVehicle(plan.vehicle)}
                className={cn(
                  "relative bg-card rounded-xl shadow-soft hover:shadow-medium transition-all p-6 lg:p-8 animate-fade-in-up opacity-0 cursor-pointer",
                  isSelected
                    ? "border-2 border-primary md:scale-105 ring-2 ring-primary/20"
                    : "border border-border hover:border-primary/30",
                  plan.popular && !isSelected && "border-primary/50"
                )}
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    {t('pricing.mostPopular', 'Most Popular')}
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-heading text-xl lg:text-2xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-primary font-semibold">{plan.passengers}</p>
                  <p className="text-muted-foreground text-sm mt-2">{plan.desc}</p>
                </div>

                {/* Starting Price */}
                <div className="text-center mb-6 py-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {t('pricing.startingFrom', 'Starting from')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatStartingPrice(STARTING_PRICES[plan.vehicle])}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "cta" : "outline"}
                  className="w-full"
                  onClick={(e) => { e.stopPropagation(); scrollToBooking(); }}
                >
                  {t('pricing.getQuote', 'Get a Quote')}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <a href="/pricing" className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4 transition-colors">
            {t('pricing.viewFullPricing', 'View Full Price List →')}
          </a>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          {t('pricing.festivalNote', '* Prices may vary during festival seasons and peak periods.')}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
