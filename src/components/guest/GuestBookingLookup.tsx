import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Car, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/ibb/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface BookingData {
  id: string;
  booking_number: string;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  vehicle_type: string;
  passenger_count: number;
  total_price: number;
  final_price: number;
  currency: string;
  deposit_amount?: number | null;
  deposit_paid?: boolean | null;
  cash_to_driver_amount?: number | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at?: string;
  confirmed_at?: string | null;
  completed_at?: string | null;
}

interface GuestBookingLookupProps {
  onBookingFound: (booking: BookingData) => void;
  initialBookingNumber?: string;
  initialEmail?: string;
}

const GuestBookingLookup = ({ 
  onBookingFound, 
  initialBookingNumber = "", 
  initialEmail = "" 
}: GuestBookingLookupProps) => {
  const [bookingNumber, setBookingNumber] = useState(initialBookingNumber);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingNumber.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both booking number and email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use edge function for secure lookup with rate-limiting
      const { data, error } = await supabase.functions.invoke("guest-booking-lookup", {
        body: {
          booking_number: bookingNumber.trim(),
          email: email.trim(),
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to search for booking.",
          variant: "destructive",
        });
        setBooking(null);
        return;
      }

      if (data?.error) {
        toast({
          title: "Not Found",
          description: data.error,
          variant: "destructive",
        });
        setBooking(null);
        return;
      }

      if (data?.booking) {
        setBooking(data.booking);
        onBookingFound(data.booking);
        toast({
          title: "Booking Found",
          description: `Booking ${data.booking.booking_number} found successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; icon: typeof CheckCircle }> = {
      pending: { class: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30", icon: Clock },
      pending_payment: { class: "bg-orange-500/20 text-orange-700 border-orange-500/30", icon: AlertCircle },
      pending_assignment: { class: "bg-amber-500/20 text-amber-700 border-amber-500/30", icon: Clock },
      confirmed: { class: "bg-blue-500/20 text-blue-700 border-blue-500/30", icon: CheckCircle },
      assigned: { class: "bg-purple-500/20 text-purple-700 border-purple-500/30", icon: User },
      in_progress: { class: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30", icon: Car },
      completed: { class: "bg-green-500/20 text-green-700 border-green-500/30", icon: CheckCircle },
      cancelled: { class: "bg-red-500/20 text-red-700 border-red-500/30", icon: AlertCircle },
    };
    return statusConfig[status] || { class: "bg-muted text-muted-foreground", icon: Clock };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      pending_payment: "Awaiting Payment",
      pending_assignment: "Finding Driver",
      confirmed: "Confirmed",
      assigned: "Driver Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Your Booking
          </CardTitle>
          <CardDescription>
            Enter your booking number and email to view your booking details and make payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingNumber">Booking Number</Label>
                <Input
                  id="bookingNumber"
                  placeholder="e.g., IBB-20240101-001"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? "Searching..." : "Find Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {booking && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Booking Details</CardTitle>
              <Badge className={getStatusBadge(booking.status).class}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
            <CardDescription>
              Booking Number: <span className="font-mono font-semibold">{booking.booking_number}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium">{booking.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drop-off</p>
                    <p className="font-medium">{booking.dropoff_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(booking.pickup_datetime), "PPP 'at' p")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p className="font-medium capitalize">
                      {booking.vehicle_type} ({booking.passenger_count} passengers)
                    </p>
                  </div>
                </div>
                {booking.guest_name && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Guest</p>
                      <p className="font-medium">{booking.guest_name}</p>
                      {booking.guest_email && (
                        <p className="text-xs text-muted-foreground">{booking.guest_email}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Price Summary */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{booking.currency} {booking.final_price.toLocaleString()}</span>
                  </div>
                  {booking.deposit_amount && booking.deposit_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Deposit {booking.deposit_paid ? "(Paid)" : "(Due)"}
                      </span>
                      <span className={booking.deposit_paid ? "text-green-600" : "text-orange-600"}>
                        {booking.currency} {booking.deposit_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {booking.cash_to_driver_amount && booking.cash_to_driver_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pay to Driver</span>
                      <span>{booking.currency} {booking.cash_to_driver_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {(booking.created_at || booking.confirmed_at || booking.completed_at) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  {booking.created_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Booked: {format(new Date(booking.created_at), "PPP 'at' p")}</span>
                    </div>
                  )}
                  {booking.confirmed_at && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirmed: {format(new Date(booking.confirmed_at), "PPP 'at' p")}</span>
                    </div>
                  )}
                  {booking.completed_at && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed: {format(new Date(booking.completed_at), "PPP 'at' p")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuestBookingLookup;
