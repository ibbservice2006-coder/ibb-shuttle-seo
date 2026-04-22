import { useState } from "react";
import Header from "@/components/Header";
import PublicNavigation from "@/components/PublicNavigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";

// ============================================
// TRACKING PAGE - Level 1 shell + Level 2 Language
// First Paint < 0.3s with English fallback
// Backend logic deferred to Level 4
// ============================================

const Tracking = () => {
  const [inputBookingNumber, setInputBookingNumber] = useState("");
  const { t } = useLevel2Language();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PublicNavigation />

      <main className="flex-1 bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-foreground">{t('tracking.title', 'Track Your Vehicle')}</h1>
              <p className="text-muted-foreground mt-2">
                {t('tracking.description', 'Enter your booking number to view your vehicle\'s real-time location')}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Level 1: form submission is a no-op
                // Backend activation happens at Level 4
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder={t('tracking.placeholder', 'e.g. IBB-20250101-1234')}
                value={inputBookingNumber}
                onChange={(e) => setInputBookingNumber(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button
                type="submit"
                disabled={!inputBookingNumber.trim()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 w-full hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {t('tracking.button', 'Track Vehicle')}
              </button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Tracking;