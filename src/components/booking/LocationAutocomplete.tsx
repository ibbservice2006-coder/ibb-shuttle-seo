import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Plane, Hotel, Ship, Train, Bus, Landmark, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const IBB_BOOKING_API = "https://ibb-booking-api.ibb-service2006.workers.dev";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  rating: number | null;
  googlePlacesId: string | null;
}

interface LocationAutocompleteProps {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, location?: Location) => void;
  disabled?: boolean;
  className?: string;
}

// ─── Type Icons & Labels ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  airport:       { icon: Plane,    label: "Airport",       color: "text-blue-500" },
  hotel:         { icon: Hotel,    label: "Hotel",         color: "text-amber-500" },
  port:          { icon: Ship,     label: "Port",          color: "text-cyan-500" },
  train_station: { icon: Train,    label: "Train Station", color: "text-green-500" },
  bus_terminal:  { icon: Bus,      label: "Bus Terminal",  color: "text-orange-500" },
  attraction:    { icon: Landmark, label: "Attraction",    color: "text-purple-500" },
  mall:          { icon: ShoppingBag, label: "Mall",       color: "text-pink-500" },
};

// ─── Debounce Hook ───────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Component ───────────────────────────────────────────────────────────────
const LocationAutocomplete = ({
  id,
  placeholder = "Search location...",
  value,
  onChange,
  disabled = false,
  className,
}: LocationAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the input value (300ms like Grab/Bolt)
  const debouncedQuery = useDebounce(inputValue, 300);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // ─── Fetch Autocomplete Results ──────────────────────────────────────────
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      const res = await fetch(
        `${IBB_BOOKING_API}/locations/autocomplete?query=${encodeURIComponent(query)}&limit=10`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json() as { locations: Location[] };
      setSuggestions(data.locations);
      setIsOpen(data.locations.length > 0);
      setHighlightedIndex(-1);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Autocomplete fetch error:", err);
        setSuggestions([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedQuery && !selectedLocation) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, fetchSuggestions, selectedLocation]);

  // ─── Handle Input Change ─────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedLocation(null);
    onChange(newValue); // Pass raw text immediately
    
    if (newValue.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // ─── Handle Selection ────────────────────────────────────────────────────
  const handleSelect = (location: Location) => {
    setInputValue(location.name);
    setSelectedLocation(location);
    setSuggestions([]);
    setIsOpen(false);
    onChange(location.name, location);
  };

  // ─── Keyboard Navigation ─────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // ─── Click Outside to Close ──────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Scroll highlighted item into view ───────────────────────────────────
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("[data-suggestion-item]");
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && !selectedLocation) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          className={cn(
            "pr-8",
            selectedLocation && "border-primary/50 bg-primary/5",
            className
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {/* Selected indicator */}
        {selectedLocation && !isLoading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full max-h-[280px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
          role="listbox"
        >
          {suggestions.map((location, index) => {
            const config = TYPE_CONFIG[location.type] || {
              icon: MapPin,
              label: location.type,
              color: "text-muted-foreground",
            };
            const Icon = config.icon;

            return (
              <div
                key={location.id}
                data-suggestion-item
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                  highlightedIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleSelect(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {/* Type Icon */}
                <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Location Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {location.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {location.address}
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0 mt-0.5">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    "bg-muted text-muted-foreground"
                  )}>
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {isOpen && suggestions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg p-4 text-center text-sm text-muted-foreground"
        >
          No locations found for "{inputValue}"
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
