import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/ibb/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import {
  User,
  Calendar,
  Wallet,
  MapPin,
  Clock,
  Car,
  Star,
} from "lucide-react";
import RatingModal from "@/components/rating/RatingModal";
import WalletTransactionList from "@/components/wallet/WalletTransactionList";
import { format } from "date-fns";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number;
  membership: string;
}

interface Booking {
  id: string;
  booking_number: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  vehicle_type: string;
  status: string;
  final_price: number;
  currency: string;
  assigned_driver_id: string | null;
  hasReview?: boolean;
}

const translations = {
  en: {
    title: "My Dashboard",
    subtitle: "Manage your bookings, wallet, and profile",
    back: "Back to Home",
    signOut: "Sign Out",
    tabs: {
      bookings: "My Bookings",
      wallet: "Wallet",
      profile: "Profile"
    },
    bookings: {
      title: "Booking History",
      noBookings: "No bookings found",
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
    wallet: {
      title: "Wallet Balance",
      balance: "Current Balance",
      deposit: "Deposit",
      transactions: "Recent Transactions"
    },
    profile: {
      title: "Profile Settings",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      membership: "Membership Level",
      save: "Save Changes",
      saved: "Profile updated successfully"
    }
  },
  th: {
    title: "แดชบอร์ดของฉัน",
    subtitle: "จัดการการจอง กระเป๋าเงิน และโปรไฟล์",
    back: "กลับหน้าแรก",
    signOut: "ออกจากระบบ",
    tabs: {
      bookings: "การจองของฉัน",
      wallet: "กระเป๋าเงิน",
      profile: "โปรไฟล์"
    },
    bookings: {
      title: "ประวัติการจอง",
      noBookings: "ไม่พบการจอง",
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
    wallet: {
      title: "ยอดกระเป๋าเงิน",
      balance: "ยอดคงเหลือ",
      deposit: "เติมเงิน",
      transactions: "รายการล่าสุด"
    },
    profile: {
      title: "ตั้งค่าโปรไฟล์",
      name: "ชื่อ-นามสกุล",
      email: "อีเมล",
      phone: "เบอร์โทรศัพท์",
      membership: "ระดับสมาชิก",
      save: "บันทึกการเปลี่ยนแปลง",
      saved: "อัปเดตโปรไฟล์สำเร็จ"
    }
  }
};

const CustomerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [activeTab, setActiveTab] = useState("bookings");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Rating modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setPhone(profileData.phone || "");
        }

        if (profileData) {
          const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .eq("customer_id", profileData.id)
            .order("created_at", { ascending: false })
            .limit(20);

          if (bookingsError) throw bookingsError;

          if (bookingsData && bookingsData.length > 0) {
            const { data: reviewsData } = await supabase
              .from("reviews")
              .select("booking_id")
              .in("booking_id", bookingsData.map(b => b.id));

            const reviewedBookingIds = new Set(reviewsData?.map(r => r.booking_id) || []);

            setBookings(bookingsData.map(booking => ({
              ...booking,
              hasReview: reviewedBookingIds.has(booking.id)
            })));
          } else {
            setBookings([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: phone })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: fullName, phone: phone });
      toast.success(t.profile.saved);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
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

  const getMembershipBadgeVariant = (membership: string) => {
    switch (membership) {
      case "vvip": return "default";
      case "vip": return "secondary";
      case "business_partner": return "outline";
      default: return "outline";
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "wallet":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-montserrat text-foreground">{t.wallet.title}</h2>
              <p className="text-muted-foreground">{t.wallet.balance}: ฿{profile?.wallet_balance?.toLocaleString() || 0}</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-foreground">
                      ฿{profile?.wallet_balance?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Available Balance</p>
                  </div>
                  <Button onClick={() => navigate("/balance")}>
                    <Wallet className="h-4 w-4 mr-2" />
                    {t.wallet.deposit}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <WalletTransactionList profileId={profile?.id} />
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-montserrat text-foreground">{t.profile.title}</h2>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.profile.name}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.profile.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.profile.email}</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.profile.phone}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+66-XX-XXX-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.profile.membership}</Label>
                  <div>
                    <Badge variant={getMembershipBadgeVariant(profile?.membership || "general")}>
                      {profile?.membership?.toUpperCase() || "GENERAL"}
                    </Badge>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "..." : t.profile.save}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default: // bookings
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-montserrat text-foreground">{t.bookings.title}</h2>
                <p className="text-muted-foreground">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t.wallet.balance}</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">฿{profile?.wallet_balance?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t.bookings.title}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t.profile.membership}</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge variant={getMembershipBadgeVariant(profile?.membership || "general")}>
                    {profile?.membership?.toUpperCase() || "GENERAL"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Booking List */}
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">{t.bookings.noBookings}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{booking.booking_number}</span>
                            <Badge variant={getStatusBadgeVariant(booking.status)}>
                              {t.bookings.status[booking.status as keyof typeof t.bookings.status] || booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.pickup_location}</span>
                            <span>→</span>
                            <span>{booking.dropoff_location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(booking.pickup_datetime), "dd/MM/yyyy HH:mm")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4" />
                              {booking.vehicle_type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-lg font-bold">
                            {booking.currency} {booking.final_price?.toLocaleString()}
                          </div>
                          {booking.status === "completed" && !booking.hasReview && booking.assigned_driver_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setRatingModalOpen(true);
                              }}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate Trip
                            </Button>
                          )}
                          {booking.hasReview && (
                            <Badge variant="secondary">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              Rated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{t.title} | IBB Shuttle Service</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <CustomerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          translations={t}
        />
        <main className="flex-1 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Rating Modal */}
      {selectedBooking && selectedBooking.assigned_driver_id && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          driverId={selectedBooking.assigned_driver_id}
          customerId={profile?.id}
          onRatingSubmitted={() => {
            setBookings(prev =>
              prev.map(b => b.id === selectedBooking.id ? { ...b, hasReview: true } : b)
            );
          }}
        />
      )}
    </>
  );
};

export default CustomerDashboard;
