import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Users, Car, Clock, Loader2 } from "lucide-react";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import { supabase } from "@/integrations/ibb/client";
import BookingSuccessModal from "@/components/booking/BookingSuccessModal";
import { toast } from "sonner";

const IBB_BOOKING_API = "https://ibb-booking-api.ibb-service2006.workers.dev";

/**
 * Level 4B — BookingSection with backend integration
 * Handles both guest bookings and registered user bookings.
 * Submits to ibb-booking-api (Cloudflare Worker).
 */

const BookingSection = () => {
  const { t } = useLevel2Language();

  const vehicleTypes = [
    { value: "car", label: t('booking.carOption', 'Car (1-4 passengers)') },
    { value: "van", label: t('booking.vanOption', 'Van (5-10 passengers)') },
    { value: "bus", label: t('booking.busOption', 'Bus (11+ passengers)') },
  ];

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    date: "",
    time: "",
    vehicleType: "",
    passengers: "",
    specialRequests: "",
    name: "",
    phone: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingNumber: string;
    amount: number;
    currency: string;
    guestEmail: string;
    vehicleType: "car" | "van" | "bus";
  } | null>(null);

  // Check if user is authenticated (without requiring AuthProvider)
  const [authUser, setAuthUser] = useState<{ id: string; profileId: string | null } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get profile ID for the authenticated user
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        setAuthUser({
          id: session.user.id,
          profileId: profile?.id || null,
        });
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        setAuthUser({
          id: session.user.id,
          profileId: profile?.id || null,
        });
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.vehicleType) {
      toast.error(t('booking.selectVehicle', 'Please select a vehicle type'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date + time into ISO datetime
      const pickupDatetime = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      const body = {
        pickupLocation:  formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupDatetime,
        vehicleCategory: formData.vehicleType as "car" | "van" | "bus",
        passengerCount:  parseInt(formData.passengers) || 1,
        specialRequests: formData.specialRequests || undefined,
        customer: {
          fullName: formData.name,
          phone:    formData.phone,
          email:    formData.email || undefined,
        },
      };

      const res = await fetch(`${IBB_BOOKING_API}/bookings/inquiry`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Booking API error:", res.status, errData);
        toast.error(t('booking.bookingFailed', 'Failed to create booking. Please try again.'));
        setIsSubmitting(false);
        return;
      }

      const booking = await res.json() as { publicId: string; status: string };

      // Show success modal with booking details
      setBookingResult({
        bookingNumber: booking.publicId,
        amount: 0,
        currency: "THB",
        guestEmail: formData.email,
        vehicleType: formData.vehicleType as "car" | "van" | "bus",
      });
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        pickupLocation: "",
        dropoffLocation: "",
        date: "",
        time: "",
        vehicleType: "",
        passengers: "",
        specialRequests: "",
        name: "",
        phone: "",
        email: "",
      });

    } catch (err) {
      console.error("Booking submission error:", err);
      toast.error(t('booking.bookingFailed', 'Failed to create booking. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set min date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <section id="booking" className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary text-center mb-4">
              {t('booking.title', 'Book Your Shuttle')}
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              {t('booking.description', 'Fill in your trip details and we\'ll get back to you with a confirmed booking.')}
            </p>

            <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-medium p-6 md:p-8 lg:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pickup" className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t('booking.pickupLocation', 'Pickup Location')}
                  </Label>
                  <Input
                    id="pickup"
                    placeholder={t('booking.pickupPlaceholder', 'e.g., Suvarnabhumi Airport')}
                    value={formData.pickupLocation}
                    onChange={(e) => handleChange("pickupLocation", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoff" className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t('booking.dropoffLocation', 'Drop-off Location')}
                  </Label>
                  <Input
                    id="dropoff"
                    placeholder={t('booking.dropoffPlaceholder', 'e.g., Hotel in Bangkok')}
                    value={formData.dropoffLocation}
                    onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    {t('booking.travelDate', 'Travel Date')}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {t('booking.pickupTime', 'Pickup Time')}
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle" className="flex items-center gap-2 text-foreground">
                    <Car className="w-4 h-4 text-primary" />
                    {t('booking.vehicleType', 'Vehicle Type')}
                  </Label>
                  <Select 
                    onValueChange={(value) => handleChange("vehicleType", value)}
                    value={formData.vehicleType}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('booking.selectVehicle', 'Select vehicle type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers" className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    {t('booking.passengers', 'Number of Passengers')}
                  </Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    placeholder={t('booking.passengersPlaceholder', 'e.g., 2')}
                    value={formData.passengers}
                    onChange={(e) => handleChange("passengers", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Show name/phone/email fields for guests only */}
                {!authUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">
                        {t('booking.yourName', 'Your Name')}
                      </Label>
                      <Input
                        id="name"
                        placeholder={t('booking.namePlaceholder', 'Full name')}
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">
                        {t('booking.phone', 'Phone')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('booking.phonePlaceholder', '+66-XX-XXX-XXXX')}
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}

                <div className={`space-y-2 ${authUser ? 'md:col-span-2' : 'md:col-span-2'}`}>
                  <Label htmlFor="email" className="text-foreground">
                    {t('booking.email', 'Email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('booking.emailPlaceholder', 'your@email.com')}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="requests" className="text-foreground">
                    {t('booking.specialRequests', 'Special Requests')}
                  </Label>
                  <Textarea
                    id="requests"
                    placeholder={t('booking.specialRequestsPlaceholder', 'Any special requirements? (optional)')}
                    value={formData.specialRequests}
                    onChange={(e) => handleChange("specialRequests", e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button type="submit" variant="cta" size="lg" className="min-w-[200px]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('booking.submitting', 'Submitting...')}
                    </>
                  ) : (
                    t('booking.submitBooking', 'Submit Booking')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Booking Success Modal */}
      {bookingResult && (
        <BookingSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          bookingNumber={bookingResult.bookingNumber}
          amount={bookingResult.amount}
          currency={bookingResult.currency}
          guestEmail={bookingResult.guestEmail}
          vehicleType={bookingResult.vehicleType}
        />
      )}
    </>
  );
};

export default BookingSection;
