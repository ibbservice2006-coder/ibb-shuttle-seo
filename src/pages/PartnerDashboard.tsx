import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/ibb/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, Wallet, Calendar, Percent, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface AffiliateData {
  id: string;
  company_name: string | null;
  commission_rate: number;
  total_earnings: number | null;
  is_active: boolean | null;
}

interface CommissionData {
  id: string;
  booking_amount: number;
  commission_amount: number;
  commission_rate: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

const translations = {
  en: {
    title: "Partner Dashboard",
    subtitle: "Track your commissions and referrals",
    overview: "Overview",
    totalEarnings: "Total Earnings",
    pendingCommissions: "Pending Commissions",
    paidCommissions: "Paid Commissions",
    commissionRate: "Commission Rate",
    recentCommissions: "Recent Commissions",
    noCommissions: "No commissions yet",
    booking: "Booking Amount",
    commission: "Commission",
    status: "Status",
    date: "Date",
    paid: "Paid",
    pending: "Pending",
    notApproved: "Your partnership application is pending approval",
    loading: "Loading...",
    accessDenied: "Access Denied",
    notPartner: "You are not registered as a partner"
  },
  th: {
    title: "Partner Dashboard",
    subtitle: "ติดตามค่าคอมมิชชั่นและการแนะนำของคุณ",
    overview: "ภาพรวม",
    totalEarnings: "รายได้ทั้งหมด",
    pendingCommissions: "รอดำเนินการ",
    paidCommissions: "จ่ายแล้ว",
    commissionRate: "อัตราคอมมิชชั่น",
    recentCommissions: "คอมมิชชั่นล่าสุด",
    noCommissions: "ยังไม่มีคอมมิชชั่น",
    booking: "ยอดจอง",
    commission: "คอมมิชชั่น",
    status: "สถานะ",
    date: "วันที่",
    paid: "จ่ายแล้ว",
    pending: "รอดำเนินการ",
    notApproved: "ใบสมัครพันธมิตรของคุณอยู่ระหว่างการอนุมัติ",
    loading: "กำลังโหลด...",
    accessDenied: "ไม่มีสิทธิ์เข้าถึง",
    notPartner: "คุณไม่ได้ลงทะเบียนเป็นพันธมิตร"
  }
};

const PartnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [stats, setStats] = useState({
    pendingTotal: 0,
    paidTotal: 0,
  });

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!user) return;

      try {
        // Get profile ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          setIsLoading(false);
          return;
        }

        // Get affiliate data
        const { data: affiliateData } = await supabase
          .from("affiliates")
          .select("*")
          .eq("profile_id", profile.id)
          .single();

        if (!affiliateData) {
          setIsLoading(false);
          return;
        }

        setAffiliate(affiliateData as AffiliateData);

        // Get commissions
        const { data: commissionsData } = await supabase
          .from("affiliate_commissions")
          .select("*")
          .eq("affiliate_id", affiliateData.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (commissionsData) {
          setCommissions(commissionsData);
          
          // Calculate stats
          const pending = commissionsData
            .filter(c => c.status === "pending")
            .reduce((sum, c) => sum + c.commission_amount, 0);
          const paid = commissionsData
            .filter(c => c.status === "paid")
            .reduce((sum, c) => sum + c.commission_amount, 0);
          
          setStats({ pendingTotal: pending, paidTotal: paid });
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!affiliate) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 py-20 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t.accessDenied}</h1>
            <p className="text-muted-foreground">{t.notPartner}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!affiliate.is_active) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 py-20 text-center">
            <Clock className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.notApproved}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t.title} | IBB Shuttle Service</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navigation />
      
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold font-montserrat">{t.title}</h1>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-muted-foreground">{t.subtitle}</p>
            {affiliate.company_name && (
              <p className="text-lg font-medium mt-1">{affiliate.company_name}</p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t.totalEarnings}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  ฿{(affiliate.total_earnings || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t.pendingCommissions}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">
                  ฿{stats.pendingTotal.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  {t.paidCommissions}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ฿{stats.paidTotal.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  {t.commissionRate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {affiliate.commission_rate}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Commissions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t.recentCommissions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t.noCommissions}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.booking}</TableHead>
                      <TableHead>{t.commission}</TableHead>
                      <TableHead>{t.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {format(new Date(commission.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>฿{commission.booking_amount.toLocaleString()}</TableCell>
                        <TableCell className="font-medium text-primary">
                          ฿{commission.commission_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {commission.status === "paid" ? (
                            <Badge variant="default" className="bg-green-600">
                              {t.paid}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {t.pending}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PartnerDashboard;
