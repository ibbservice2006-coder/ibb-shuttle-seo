import { cn } from "@/lib/utils";
import { vehicleTypes } from "@/data/pricingData";
import { Car, Bus, LucideIcon } from "lucide-react";

interface VehicleSelectorProps {
  selected: string;
  onSelect: (vehicleId: string) => void;
}

// Map vehicle IDs to Lucide icons
const vehicleIcons: Record<string, LucideIcon> = {
  car: Car,
  van: Bus,
  bus: Bus,
};

const VehicleSelector = ({ selected, onSelect }: VehicleSelectorProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
      {vehicleTypes.map((vehicle) => {
        const Icon = vehicleIcons[vehicle.id];
        return (
          <button
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            className={cn(
              "flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all min-w-[120px]",
              selected === vehicle.id
                ? "border-primary bg-primary text-primary-foreground shadow-medium"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-soft"
            )}
          >
            {Icon && (
              <Icon 
                className={cn(
                  "w-8 h-8 mb-2",
                  vehicle.id === "bus" && "w-9 h-9"
                )} 
              />
            )}
            <span className="font-heading font-bold text-lg">{vehicle.name}</span>
            <span
              className={cn(
                "text-xs mt-1",
                selected === vehicle.id
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {vehicle.passengers}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default VehicleSelector;
