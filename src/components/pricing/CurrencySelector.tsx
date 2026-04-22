import { currencies } from "@/data/pricingData";
import { ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  selected: string;
  onSelect: (currencyCode: string) => void;
  loading?: boolean;
}

const CurrencySelector = ({ selected, onSelect, loading }: CurrencySelectorProps) => {
  const selectedCurrency = currencies.find((c) => c.code === selected);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Currency:</span>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          disabled={loading}
          className="appearance-none bg-card border-2 border-border rounded-lg px-4 py-2 pr-10 text-foreground font-medium cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:border-primary disabled:opacity-50"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.country} {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
      {loading && (
        <span className="text-xs text-muted-foreground animate-pulse">
          Loading rates...
        </span>
      )}
    </div>
  );
};

export default CurrencySelector;
