import { PriceRow } from "@/data/pricingDataComplete";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, ChevronRight, LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  getTranslatedDestination, 
  getTranslatedVehicleLabel,
  getTranslatedVehicleCategory 
} from "@/data/pricingTranslations";

interface PricingAccordionProps {
  data: PriceRow[];
  title: string;
  vehicleType: "car" | "van" | "bus";
  formatPrice: (price: number | string) => string;
  icon?: LucideIcon;
}

// Vehicle type color schemes
const vehicleColors = {
  car: {
    accent: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/40",
    label: "text-blue-600",
    icon: "bg-blue-500/20 text-blue-500",
    headerBg: "bg-blue-600",
  },
  van: {
    accent: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/40",
    label: "text-emerald-600",
    icon: "bg-emerald-500/20 text-emerald-500",
    headerBg: "bg-emerald-600",
  },
  bus: {
    accent: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/40",
    label: "text-amber-600",
    icon: "bg-amber-500/20 text-amber-500",
    headerBg: "bg-amber-600",
  },
};

const PricingAccordion = ({ data, title, vehicleType, formatPrice, icon: SectionIcon }: PricingAccordionProps) => {
  const colors = vehicleColors[vehicleType];
  const { language } = useLanguage();
  
  const getPriceItems = (row: PriceRow) => {
    if (vehicleType === "car") {
      return [
        { label: "Standard", value: row.standard, category: "Car & SUV" },
        { label: "Executive", value: row.executive, category: "Car & SUV" },
        { label: "Family", value: row.family, category: "Car & SUV" },
        { label: "Electric", value: row.electric, category: "Car & SUV" },
        { label: "Premium", value: row.premium, category: "Limousine" },
        { label: "Luxury", value: row.luxury, category: "Limousine" },
      ];
    } else if (vehicleType === "van") {
      return [
        { label: "Standard", value: row.standard, category: "MPV/Van" },
        { label: "Executive", value: row.executive, category: "MPV/Van" },
        { label: "Premium", value: row.family, category: "MPV/Van" },
        { label: "Luxury", value: row.electric, category: "MPV/Van" },
      ];
    } else {
      return [
        { label: "Minibus", value: row.standard, category: "BUS/Coach" },
        { label: "Mid-sized", value: row.executive, category: "BUS/Coach" },
        { label: "Group Bus", value: row.family, category: "BUS/Coach" },
      ];
    }
  };

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-1 h-6 rounded-full ${colors.headerBg}`} />
        {SectionIcon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
            <SectionIcon className="w-4 h-4" />
          </div>
        )}
        <h3 className="text-lg font-bold text-primary-foreground">
          {title}
        </h3>
      </div>
      
      <Accordion type="single" collapsible className="space-y-3">
        {data.map((row, index) => {
          const priceItems = getPriceItems(row);
          
          return (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border-0 rounded-xl overflow-hidden bg-gradient-to-br from-card to-card/80 shadow-soft hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AccordionTrigger 
                className="px-4 py-4 hover:no-underline group transition-all duration-300"
                data-vehicle-type={vehicleType}
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Location Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${colors.icon} group-data-[state=open]:bg-white/20`}>
                    <MapPin className="w-5 h-5 transition-colors duration-300 group-data-[state=open]:text-white" />
                  </div>
                  
                  {/* Destination Info */}
                  <div className="flex flex-col items-start text-left flex-1">
                    <span className="font-semibold text-sm text-foreground group-data-[state=open]:text-white transition-colors duration-300">
                      {getTranslatedDestination(row.destination, language)}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-data-[state=open]:text-white/70" />
                      <span className="text-xs text-muted-foreground group-data-[state=open]:text-white/70 transition-colors duration-300">
                        {row.distance}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4 pt-3 bg-gradient-to-b from-muted/30 to-transparent">
                <div className="grid grid-cols-2 gap-3">
                  {priceItems.map((item, priceIndex) => {
                    const displayPrice = formatPrice(item.value || "N/A");
                    const isNA = displayPrice === "N/A";
                    
                    return (
                      <div 
                        key={priceIndex}
                        className={`rounded-xl p-3 text-center transition-all duration-200 hover:scale-[1.02] ${
                          isNA 
                            ? "bg-muted/40 border border-border/30" 
                            : `bg-gradient-to-br ${colors.accent} border ${colors.border} shadow-sm`
                        }`}
                        style={{ 
                          animationDelay: `${priceIndex * 30}ms`,
                        }}
                      >
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5 font-medium">
                          {getTranslatedVehicleCategory(item.category, language)}
                        </p>
                        <p className={`text-xs font-semibold mb-1.5 ${
                          isNA ? "text-muted-foreground/70" : colors.label
                        }`}>
                          {getTranslatedVehicleLabel(item.label, language)}
                        </p>
                        <p className={`font-bold text-base ${
                          isNA ? "text-muted-foreground/50" : "text-foreground"
                        }`}>
                          {displayPrice}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default PricingAccordion;
