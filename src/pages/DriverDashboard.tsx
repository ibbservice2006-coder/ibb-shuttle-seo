import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverRole } from "@/hooks/useDriverRole";
import { useDriverNotifications } from "@/hooks/useDriverNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/ibb/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverGPSMap from "@/components/driver/DriverGPSMap";
import { 
  Car, 
  MapPin, 
  Clock, 
  User,
  ArrowLeft,
  Navigation,
  CheckCircle,
  XCircle,
  PlayCircle,
  DollarSign,
  Calendar,
  Star,
  Map,
  Bell
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DriverInfo {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  rating: number;
  total_trips: number;
  is_active: boolean;
}

interface AssignedBooking {
  id: string;
  booking_number: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  vehicle_type: string;
  status: string;
  final_price: number;
  currency: string;
  passenger_count: number;
  guest_name: string | null;
  guest_phone: string | null;
  special_requests: string | null;
}

const translations = {
  en: {
    title: "Driver Dashboard",
    subtitle: "Manage your trips and earnings",
    back: "Back to Home",
    notDriver: "You are not registered as a driver",
    tabs: {
      upcoming: "Upcoming Trips",
      inProgress: "In Progress",
      completed: "Completed",
      gpsMap: "GPS Map"
    },
    stats: {
      rating: "Rating",
      totalTrips: "Total Trips",
      earnings: "This Month",
      status: "Status"
    },
    trips: {
      noTrips: "No trips found",
      passenger: "Passenger",
      phone: "Phone",
      requests: "Special Requests",
      startTrip: "Start Trip",
      completeTrip: "Complete Trip",
      status: {
        pending: "Pending",
        pending_payment: "Pending Payment",
        pending_assignment: "Pending Assignment",
        confirmed: "Confirmed",
        assigned: "Assigned",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled"
      }
    },
    active: "Active",
    inactive: "Inactive"
  },
  th: {
    title: "แดชบอร์ดคนขับ",
    subtitle: "จัดการการเดินทางและรายได้",
    back: "กลับหน้าแรก",
    notDriver: "คุณยังไม่ได้ลงทะเบียนเป็นคนขับ",
    tabs: {
      upcoming: "ทริปที่จะมาถึง",
      inProgress: "กำลังเดินทาง",
      completed: "เสร็จสิ้น",
      gpsMap: "แผนที่ GPS"
    },
    stats: {
      rating: "คะแนน",
      totalTrips: "ทริปทั้งหมด",
      earnings: "เดือนนี้",
      status: "สถานะ"
    },
    trips: {
      noTrips: "ไม่พบทริป",
      passenger: "ผู้โดยสาร",
      phone: "เบอร์โทร",
      requests: "คำขอพิเศษ",
      startTrip: "เริ่มทริป",
      completeTrip: "เสร็จสิ้นทริป",
      status: {
        pending: "รอดำเนินการ",
        pending_payment: "รอชำระเงิน",
        pending_assignment: "รอมอบหมาย",
        confirmed: "ยืนยันแล้ว",
        assigned: "มอบหมายแล้ว",
        in_progress: "กำลังเดินทาง",
        completed: "เสร็จสิ้น",
        cancelled: "ยกเลิก"
      }
    },
    active: "พร้อมให้บริการ",
    inactive: "ไม่พร้อม"
  }
};

const DriverDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDriver, driverId, isLoading: driverLoading } = useDriverRole();
  const { notifications, hasNewNotifications } = useDriverNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<AssignedBooking[]>([]);
  const [inProgressBookings, setInProgressBookings] = useState<AssignedBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<AssignedBooking[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!driverId) return;

      setIsLoading(true);
      try {
        // Fetch driver info
        const { data: driverData, error: driverError } = await supabase
          .from("drivers")
          .select("*")
          .eq("id", driverId)
          .single();

        if (driverError) throw driverError;
        setDriverInfo(driverData);

        // Fetch assigned bookings with vehicle info
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .eq("assigned_driver_id", driverId)
          .order("pickup_datetime", { ascending: true });

        if (bookingsError) throw bookingsError;

        const now = new Date();
        const upcoming: AssignedBooking[] = [];
        const inProgress: AssignedBooking[] = [];
        const completed: AssignedBooking[] = [];

        bookingsData?.forEach((booking) => {
          if (booking.status === "completed") {
            completed.push(booking);
          } else if (booking.status === "in_progress") {
            inProgress.push(booking);
            // Set vehicle ID and active booking for GPS tracking
            if (booking.assigned_vehicle_id) {
              setVehicleId(booking.assigned_vehicle_id);
              setActiveBookingId(booking.id);
            }
          } else if (["assigned", "confirmed"].includes(booking.status)) {
            upcoming.push(booking);
          }
        });

        setUpcomingBookings(upcoming);
        setInProgressBookings(inProgress);
        setCompletedBookings(completed.slice(0, 20)); // Last 20 completed

        // Calculate monthly earnings
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyTotal = completed
          .filter((b) => new Date(b.pickup_datetime) >= startOfMonth)
          .reduce((sum, b) => sum + (b.final_price || 0), 0);
        setMonthlyEarnings(monthlyTotal);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (driverId) {
      fetchDriverData();
    } else if (!driverLoading) {
      setIsLoading(false);
    }
  }, [driverId, driverLoading]);

  const handleStartTrip = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "in_progress" })
        .eq("id", bookingId);

      if (error) throw error;

      // Move from upcoming to in progress
      const booking = upcomingBookings.find((b) => b.id === bookingId);
      if (booking) {
        setUpcomingBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setInProgressBookings((prev) => [...prev, { ...booking, status: "in_progress" }]);
      }

      toast.success("Trip started");
    } catch (error) {
      console.error("Error starting trip:", error);
      toast.error("Failed to start trip");
    }
  };

  const handleCompleteTrip = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Move from in progress to completed
      const booking = inProgressBookings.find((b) => b.id === bookingId);
      if (booking) {
        setInProgressBookings((prev) => prev.filter((b) => b.id !== bookingId));
        setCompletedBookings((prev) => [{ ...booking, status: "completed" }, ...prev]);
        setMonthlyEarnings((prev) => prev + (booking.final_price || 0));
      }

      // Update driver's total trips
      if (driverInfo) {
        await supabase
          .from("drivers")
          .update({ total_trips: (driverInfo.total_trips || 0) + 1 })
          .eq("id", driverId);
        
        setDriverInfo((prev) => prev ? { ...prev, total_trips: (prev.total_trips || 0) + 1 } : null);
      }

      toast.success("Trip completed");
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("Failed to complete trip");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "cancelled": return "destructive";
      case "in_progress": return "secondary";
      default: return "outline";
    }
  };

  const renderBookingCard = (booking: AssignedBooking, showActions: boolean = false, isInProgress: boolean = false) => (
    <Card key={booking.id} className="bg-muted/50">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">
                {booking.booking_number}
              </span>
              <Badge variant={getStatusBadgeVariant(booking.status)}>
                {t.trips.status[booking.status as keyof typeof t.trips.status] || booking.status}
              </Badge>
            </div>
            <div className="text-lg font-bold">
              {booking.currency} {booking.final_price?.toLocaleString()}
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{booking.pickup_location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-red-500" />
              <span>{booking.dropoff_location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(booking.pickup_datetime), "dd/MM/yyyy HH:mm")}
            </div>
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              {booking.vehicle_type}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {booking.passenger_count} pax
            </div>
          </div>

          {(booking.guest_name || booking.guest_phone) && (
            <div className="pt-2 border-t space-y-1 text-sm">
              {booking.guest_name && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.trips.passenger}:</span>
                  <span>{booking.guest_name}</span>
                </div>
              )}
              {booking.guest_phone && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.trips.phone}:</span>
                  <a href={`tel:${booking.guest_phone}`} className="text-primary hover:underline">
                    {booking.guest_phone}
                  </a>
                </div>
              )}
              {booking.special_requests && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">{t.trips.requests}:</span>
                  <span className="text-yellow-600">{booking.special_requests}</span>
                </div>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              {!isInProgress ? (
                <Button 
                  size="sm" 
                  onClick={() => handleStartTrip(booking.id)}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  {t.trips.startTrip}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handleCompleteTrip(booking.id)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t.trips.completeTrip}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (authLoading || driverLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDriver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <p className="text-xl text-muted-foreground">{t.notDriver}</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.back}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t.title} | IBB Shuttle Service</title>
        <meta name="description" content={t.subtitle} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.rating}</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {driverInfo?.rating?.toFixed(1) || "5.0"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.totalTrips}</CardTitle>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {driverInfo?.total_trips || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.earnings}</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{monthlyEarnings.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.status}</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={driverInfo?.is_active ? "default" : "secondary"}>
                  {driverInfo?.is_active ? t.active : t.inactive}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t.tabs.upcoming}</span>
                {upcomingBookings.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {upcomingBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inProgress" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t.tabs.inProgress}</span>
                {inProgressBookings.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {inProgressBookings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t.tabs.completed}</span>
              </TabsTrigger>
              <TabsTrigger value="gpsMap" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">{t.tabs.gpsMap}</span>
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Trips Tab */}
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t.trips.noTrips}
                    </CardContent>
                  </Card>
                ) : (
                  upcomingBookings.map((booking) => renderBookingCard(booking, true, false))
                )}
              </div>
            </TabsContent>

            {/* In Progress Tab */}
            <TabsContent value="inProgress">
              <div className="space-y-4">
                {inProgressBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t.trips.noTrips}
                    </CardContent>
                  </Card>
                ) : (
                  inProgressBookings.map((booking) => renderBookingCard(booking, true, true))
                )}
              </div>
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed">
              <div className="space-y-4">
                {completedBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      {t.trips.noTrips}
                    </CardContent>
                  </Card>
                ) : (
                  completedBookings.map((booking) => renderBookingCard(booking, false, false))
                )}
              </div>
            </TabsContent>

            {/* GPS Map Tab */}
            <TabsContent value="gpsMap">
              {driverId && (
                <DriverGPSMap 
                  driverId={driverId} 
                  vehicleId={vehicleId || undefined}
                  bookingId={activeBookingId || undefined}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DriverDashboard;
