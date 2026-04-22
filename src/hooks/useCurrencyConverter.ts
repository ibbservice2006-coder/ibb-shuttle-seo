import { useState, useEffect, useCallback } from "react";

interface ExchangeRates {
  [key: string]: number;
}

const MARKUP_RATE = 1.04; // 4% markup

export const useCurrencyConverter = () => {
  const [rates, setRates] = useState<ExchangeRates>({ THB: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState("THB");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using exchangerate-api.com free endpoint
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/THB"
        );
        if (!response.ok) throw new Error("Failed to fetch rates");
        const data = await response.json();
        setRates(data.rates);
      } catch (err) {
        setError("Unable to fetch exchange rates. Using default values.");
        // Fallback rates (approximate)
        setRates({
          THB: 1,
          USD: 0.028,
          EUR: 0.026,
          GBP: 0.022,
          CNY: 0.2,
          JPY: 4.2,
          MYR: 0.13,
          IDR: 450,
          SGD: 0.038,
          BND: 0.038,
          AED: 0.1,
          RUB: 2.5,
          SAR: 0.1,
          OMR: 0.011,
          INR: 2.35,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertPrice = useCallback(
    (priceInTHB: number): number => {
      if (selectedCurrency === "THB") return priceInTHB;
      const rate = rates[selectedCurrency] || 1;
      console.log(`[Currency] Rate applied: ${selectedCurrency} = ${rate}`);
      // Apply 4% markup for converted currencies
      return Math.round(priceInTHB * rate * MARKUP_RATE);
    },
    [rates, selectedCurrency]
  );

  const formatPrice = useCallback(
    (priceInTHB: number, symbol: string): string => {
      const converted = convertPrice(priceInTHB);
      if (selectedCurrency === "JPY" || selectedCurrency === "KRW") {
        return `${symbol}${converted.toLocaleString()}`;
      }
      return `${symbol}${converted.toLocaleString()}`;
    },
    [convertPrice, selectedCurrency]
  );

  const handleSetCurrency = useCallback((code: string) => {
    console.log(`[Currency] Selected: ${code}`);
    setSelectedCurrency(code);
  }, []);

  return {
    selectedCurrency,
    setSelectedCurrency: handleSetCurrency,
    convertPrice,
    formatPrice,
    loading,
    error,
  };
};
