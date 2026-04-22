import { cn } from "@/lib/utils";
import { regions } from "@/data/pricingData";

interface RegionTabsProps {
  selected: string;
  onSelect: (regionId: string) => void;
}

const RegionTabs = ({ selected, onSelect }: RegionTabsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {regions.map((region) => (
        <button
          key={region.id}
          onClick={() => onSelect(region.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            selected === region.id
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {region.name}
        </button>
      ))}
    </div>
  );
};

export default RegionTabs;
