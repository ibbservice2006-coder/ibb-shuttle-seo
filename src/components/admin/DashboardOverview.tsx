import { useState, useEffect } from "react";
import { supabase } from "@/integrations/ibb/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, Users, DollarSign, Clock, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  BookingStatus,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/bookingStatusFlow";

interface RecentBooking {
  id: string;
  booking_number: string;
  guest_name: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  vehicle_type: string;
  status: string;
  final_price: number;
  currency: string;
  created_at: string;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  count: number;
}

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    activeDrivers: 0,
    totalRevenue: 0,
    todayBookings: 0,
    completedToday: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      const today = startOfDay(new Date()).toISOString();

      const [
        totalRes,
        pendingRes,
        driversRes,
        revenueRes,
        todayRes,
        completedTodayRes,
        recentRes,
        last7daysRes,
      ] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).in("status", ["pending", "pending_payment", "pending_assignment"]),
        supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("bookings").select("final_price").eq("status", "completed"),
        supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed").gte("completed_at", today),
        supabase.from("bookings").select("id, booking_number, guest_name, pickup_location, dropoff_location, pickup_datetime, vehicle_type, status, final_price, currency, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("bookings").select("final_price, created_at, status").eq("status", "completed").gte("created_at", subDays(new Date(), 7).toISOString()),
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, b) => sum + (b.final_price || 0), 0) || 0;

      setStats({
        totalBookings: totalRes.count || 0,
        pendingBookings: pendingRes.count || 0,
        activeDrivers: driversRes.count || 0,
        totalRevenue,
        todayBookings: todayRes.count || 0,
        completedToday: completedTodayRes.count || 0,
      });

      setRecentBookings(recentRes.data || []);

      // Build daily revenue chart data
      const revenueByDay: Record<string, { revenue: number; count: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "MM/dd");
        revenueByDay[d] = { revenue: 0, count: 0 };
      }
      last7daysRes.data?.forEach((b) => {
        const d = format(new Date(b.created_at), "MM/dd");
        if (revenueByDay[d]) {
          revenueByDay[d].revenue += b.final_price || 0;
          revenueByDay[d].count += 1;
        }
      });
      setDailyRevenue(Object.entries(revenueByDay).map(([date, data]) => ({ date, ...data })));

      setIsLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending / Action Required",
      value: stats.pendingBookings,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Active Drivers",
      value: stats.activeDrivers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Revenue",
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: Car,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-montserrat text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">Welcome to the IBB Admin Portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-montserrat flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: number) => [`฿${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-montserrat flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium">{b.booking_number}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[b.status as BookingStatus] || ""}`}>
                        {STATUS_LABELS[b.status as BookingStatus] || b.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.pickup_location}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.dropoff_location}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {b.guest_name || "Guest"} · {format(new Date(b.pickup_datetime), "MMM dd, HH:mm")} · {b.vehicle_type}
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-bold">{b.currency} {b.final_price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
