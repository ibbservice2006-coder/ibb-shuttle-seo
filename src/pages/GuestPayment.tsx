import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuestBookingLookup from "@/components/guest/GuestBookingLookup";
import GuestPaymentForm from "@/components/guest/GuestPaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CreditCard, UserPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/ibb/client";

import { BookingData } from "@/components/guest/GuestBookingLookup";

const GuestPayment = () => {
  const [searchParams] = useSearchParams();
  const [foundBooking, setFoundBooking] = useState<BookingData | null>(null);
  const [activeTab, setActiveTab] = useState("lookup");
  const [autoLoading, setAutoLoading] = useState(false);

  // Auto-load booking from URL params (from booking success modal)
  useEffect(() => {
    const bookingNumber = searchParams.get("booking");
    const email = searchParams.get("email");

    if (bookingNumber && email) {
      setAutoLoading(true);
      supabase.functions
        .invoke("guest-booking-lookup", {
          body: { booking_number: bookingNumber, email },
        })
        .then(({ data, error }) => {
          setAutoLoading(false);
          if (!error && data?.booking) {
            setFoundBooking(data.booking);
            if (data.booking.status === "pending" || data.booking.status === "pending_payment") {
              setActiveTab("payment");
            }
          }
        });
    }
  }, [searchParams]);

  const handleBookingFound = (booking: BookingData) => {
    setFoundBooking(booking);
    // Only show payment form for pending bookings
    if (booking.status === "pending" || booking.status === "pending_payment") {
      setActiveTab("payment");
    }
  };

  const handlePaymentSubmitted = () => {
    setFoundBooking(null);
    setActiveTab("lookup");
  };

  return (
    <>
      <Helmet>
        <title>Guest Payment | IBB Shuttle Service</title>
        <meta
          name="description"
          content="Check your booking status and make payment without registration. Simple and secure payment for your shuttle booking."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
                Guest Payment
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Check your booking status and submit payment without creating an account.
                Simply enter your booking number and email to get started.
              </p>
            </div>

            {/* Benefits Card */}
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Want more features?</p>
                      <p className="text-sm text-muted-foreground">
                        Create an account for wallet credits, transaction history, and faster booking.
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/auth">
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="lookup" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Find Booking
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="flex items-center gap-2"
                  disabled={!foundBooking}
                >
                  <CreditCard className="h-4 w-4" />
                  Make Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lookup">
                {autoLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading your booking...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <GuestBookingLookup 
                    onBookingFound={handleBookingFound}
                    initialBookingNumber={searchParams.get("booking") || ""}
                    initialEmail={searchParams.get("email") || ""}
                  />
                )}
              </TabsContent>

              <TabsContent value="payment">
                {foundBooking ? (
                  foundBooking.status === "pending" || foundBooking.status === "pending_payment" ? (
                    <GuestPaymentForm
                      booking={{
                        id: foundBooking.id,
                        booking_number: foundBooking.booking_number,
                        final_price: foundBooking.final_price,
                        currency: foundBooking.currency,
                        guest_email: foundBooking.guest_email,
                        vehicle_type: foundBooking.vehicle_type as "car" | "van" | "bus",
                      }}
                      onPaymentSubmitted={handlePaymentSubmitted}
                      initialMethod={searchParams.get("method") || undefined}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            This booking is already <strong>{foundBooking.status}</strong>.
                            {foundBooking.status === "confirmed" && (
                              <span> Payment has been received.</span>
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Please find your booking first to make a payment.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("lookup")}
                          className="mt-4"
                        >
                          Find Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Help Section */}
            <Card className="mt-8">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      Can't find your booking?
                    </p>
                    <p className="text-muted-foreground">
                      Make sure you're using the same email address used during booking.
                      Check your spam folder for the confirmation email.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">
                      Payment not verified?
                    </p>
                    <p className="text-muted-foreground">
                      Verification usually takes 1-24 hours. Contact us if you need urgent
                      confirmation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default GuestPayment;
