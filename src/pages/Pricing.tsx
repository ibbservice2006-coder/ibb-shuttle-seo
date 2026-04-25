import { useState, useCallback, useEffect, Component, ReactNode } from "react";
import Header from "@/components/Header";
import PublicNavigation from "@/components/PublicNavigation";
import Footer from "@/components/Footer";
import StaticPricingAccordion from "@/components/pricing/StaticPricingAccordion";

import { allTables, currencies, PriceRow, VehicleData } from "@/data/pricingDataComplete";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Plane, Building2, Compass, Palmtree, Mountain, TreePine,
  Wheat, Clock, Calendar, LucideIcon
} from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";

// Error Boundary for Pricing Table
class PricingErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PricingErrorBoundary] Caught:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <p className="text-white text-lg mb-2">⚠️ Pricing table encountered an error</p>
          <p className="text-white/60 text-sm mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================
// PRICING PAGE - Level 1+2+3
// L1: Pure Static UI Shell (English, THB)
// L2: Silent Language swap after bootstrap
// L3: Currency conversion engine
// ============================================

type VehicleType = "car" | "van" | "bus";

const routeIcons: Record<string, LucideIcon> = {
  airport: Plane, central: Building2, east: Compass, south: Palmtree,
  west: Mountain, north: TreePine, northeast: Wheat, hourly: Clock, period: Calendar,
};

// Static table renderers with dynamic price formatting
const renderCarTable = (data: PriceRow[], tableId: string, t: (key: string, fb: string) => string, formatPrice: (price: number | string) => string) => (
  <div className="mb-6">
    <p style={{ fontSize: '23px', fontWeight: 'bold', color: 'white' }} className="mb-2">
      {allTables.find(t2 => t2.id === tableId)?.title || tableId}
    </p>
    <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
      <thead>
        <tr>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.distance', 'Distance')}</th>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.destination', 'Destination')}</th>
          <th colSpan={4} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.carSuv', 'Car & SUV')}</th>
          <th colSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.limousine', 'Limousine')}</th>
        </tr>
        <tr>
          {[
            t('pricingPage.standard', 'Standard'),
            t('pricingPage.executive', 'Executive'),
            t('pricingPage.family', 'Family'),
            t('pricingPage.electric', 'Electric'),
            t('pricingPage.premium', 'Premium'),
            t('pricingPage.luxury', 'Luxury'),
          ].map(h => (
            <th key={h} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {[row.distance, row.destination, formatPrice(row.standard), formatPrice(row.executive), formatPrice(row.family), formatPrice(row.electric), formatPrice(row.premium || "N/A"), formatPrice(row.luxury || "N/A")].map((val, ci) => (
              <td key={ci} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#2d4f4f', color: 'white', padding: '8px', textAlign: 'center' }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderVanTable = (data: PriceRow[], tableId: string, t: (key: string, fb: string) => string, formatPrice: (price: number | string) => string) => (
  <div className="mb-6">
    <p style={{ fontSize: '23px', fontWeight: 'bold', color: 'white' }} className="mb-2">
      {allTables.find(t2 => t2.id === tableId)?.title || tableId}
    </p>
    <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
      <thead>
        <tr>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.distance', 'Distance')}</th>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.destination', 'Destination')}</th>
          <th colSpan={4} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.mpvVan', 'MPV/Van')}</th>
        </tr>
        <tr>
          {[
            t('pricingPage.standard', 'Standard'),
            t('pricingPage.executive', 'Executive'),
            t('pricingPage.premium', 'Premium'),
            t('pricingPage.luxury', 'Luxury'),
          ].map(h => (
            <th key={h} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {[row.distance, row.destination, formatPrice(row.standard), formatPrice(row.executive), formatPrice(row.family), formatPrice(row.electric)].map((val, ci) => (
              <td key={ci} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#2d4f4f', color: 'white', padding: '8px', textAlign: 'center' }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderBusTable = (data: PriceRow[], tableId: string, t: (key: string, fb: string) => string, formatPrice: (price: number | string) => string) => (
  <div className="mb-6">
    <p style={{ fontSize: '23px', fontWeight: 'bold', color: 'white' }} className="mb-2">
      {allTables.find(t2 => t2.id === tableId)?.title || tableId}
    </p>
    <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
      <thead>
        <tr>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.distance', 'Distance')}</th>
          <th rowSpan={2} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.destination', 'Destination')}</th>
          <th colSpan={3} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{t('pricingPage.busCoach', 'BUS/Coach')}</th>
        </tr>
        <tr>
          {[
            t('pricingPage.minibus', 'Minibus'),
            t('pricingPage.midSized', 'Mid-sized'),
            t('pricingPage.groupBus', 'Group Bus'),
          ].map(h => (
            <th key={h} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#ffffff', color: '#2d4f4f', fontSize: '1.2em', padding: '5px', textAlign: 'center' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {[row.distance, row.destination, formatPrice(row.standard), formatPrice(row.executive), formatPrice(row.family)].map((val, ci) => (
              <td key={ci} style={{ border: '2.3px solid #87CEEB', backgroundColor: '#2d4f4f', color: 'white', padding: '8px', textAlign: 'center' }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PricingPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("car");
  const { t } = useLevel2Language();
  const { selectedCurrency, setSelectedCurrency, convertPrice, loading } = useCurrencyConverter();

  // Dynamic price formatter — uses currency engine (L3)
  const currencyInfo = currencies.find(c => c.code === selectedCurrency) || currencies[0];
  
  const formatPrice = useCallback((price: number | string): string => {
    if (price === "N/A" || typeof price === "string") return "N/A";
    if (selectedCurrency === "THB") return `฿${price.toLocaleString()}`;
    const converted = convertPrice(price);
    return `${currencyInfo.symbol}${converted.toLocaleString()}`;
  }, [selectedCurrency, convertPrice, currencyInfo]);

  // Debug: log re-renders when currency changes
  useEffect(() => {
    console.log(`[Currency] Table re-render triggered — currency: ${selectedCurrency}, vehicle: ${selectedVehicle}`);
  }, [selectedCurrency, selectedVehicle]);

  const renderTable = (tableData: VehicleData, tableId: string) => {
    const data = tableData[selectedVehicle];
    if (selectedVehicle === "car") return renderCarTable(data, tableId, t, formatPrice);
    if (selectedVehicle === "van") return renderVanTable(data, tableId, t, formatPrice);
    return renderBusTable(data, tableId, t, formatPrice);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PublicNavigation />

      {/* Static Hero */}
      <section
        id="home"
        className="relative h-[329px] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/seo/hero-bangkok.jpg')` }}
        />
        {/* Full-width gradient overlay for premium readability — no visible edges */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.10) 65%, rgba(0,0,0,0.02) 100%)' }}
        />
        <div className="absolute z-10 top-[12%] left-0 right-0 text-center">
          <h1 className="font-heading text-xl sm:text-2xl md:text-4xl lg:text-[49px] font-light md:font-normal lg:font-medium animate-fade-in-up leading-tight text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.5)]">
            {t('pricingPage.heroTitle', 'Transparent Fixed Pricing')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wider text-white/[0.92] [text-shadow:0_4px_20px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.5)]">
            {t('pricingPage.heroSubtitle', 'Premium Service. No Hidden Fees.')}
          </p>
        </div>
        <div className="absolute z-10 bottom-[26%] left-0 right-0 text-center">
          <a href="/#booking">
            <Button variant="cta" size="lg" className="animate-blink h-14 px-[1.825rem] border-0">
              {t('hero.bookNow', 'Book Now')}
            </Button>
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ backgroundColor: '#2d4f4f' }} className="flex-1 px-3 py-3 sm:px-5 sm:py-3">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-center text-xl sm:text-2xl md:text-[2rem] text-white mb-3 sm:mb-4">
            IBB Shuttle Service Price List
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-[50px]">
            {/* Vehicle Selector */}
            <div className="flex gap-2">
              {(["car", "van", "bus"] as VehicleType[]).map((vehicle) => (
                <button
                  key={vehicle}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={cn(
                    "px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded transition-transform",
                    selectedVehicle === vehicle
                      ? "bg-[#007BFF] text-white scale-95"
                      : "bg-white text-gray-800 hover:bg-gray-300"
                  )}
                >
                  {vehicle === "car" ? t('pricing.car', 'Car') : vehicle === "van" ? t('pricing.van', 'Van') : t('pricing.bus', 'Bus')}
                </button>
              ))}
            </div>

            {/* Currency Selector — functional L3 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">{t('pricingPage.currency', 'Currency')}:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-300 rounded bg-white text-black"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code} style={{ color: '#000000' }}>
                    {currency.country} {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              {loading && (
                <span className="text-xs text-white/50 animate-pulse">...</span>
              )}
            </div>
          </div>

          {/* Route Heading */}
          <h2 className="text-left text-xl sm:text-2xl md:text-[2rem] text-white mb-3 sm:mb-4 -mt-2 sm:-mt-8 ml-1 sm:ml-2">
            {t('pricingPage.route', 'Route')}
          </h2>

          {/* All Tables */}
          <PricingErrorBoundary>
            <div className="space-y-6">
              {allTables.map((table) => (
                <div key={table.id}>
                  {/* Mobile & Tablet Accordion Layout */}
                  <div className="xl:hidden">
                    <StaticPricingAccordion
                      data={table.data[selectedVehicle]}
                      title={table.title}
                      vehicleType={selectedVehicle}
                      formatPrice={formatPrice}
                      icon={routeIcons[table.id]}
                    />
                  </div>
                  {/* Desktop Table */}
                  <div className="hidden xl:block">
                    {renderTable(table.data, table.id)}
                  </div>
                </div>
              ))}
            </div>
          </PricingErrorBoundary>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
