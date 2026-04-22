import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { BookingsManagement } from "@/components/admin/BookingsManagement";
import { ExternalOrdersManagement } from "@/components/admin/ExternalOrdersManagement";
import { DriversManagement } from "@/components/admin/DriversManagement";
import { VehiclesManagement } from "@/components/admin/VehiclesManagement";
import { AdminFleetMap } from "@/components/admin/AdminFleetMap";
import { AdminWalletManagement } from "@/components/admin/AdminWalletManagement";
import { PartnersManagement } from "@/components/admin/PartnersManagement";
import { VouchersManagement } from "@/components/admin/VouchersManagement";
import { ZonesPricingManagement } from "@/components/admin/ZonesPricingManagement";
import { FestivalPricingManagement } from "@/components/admin/FestivalPricingManagement";
import { NotificationsManagement } from "@/components/admin/NotificationsManagement";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && !roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <BookingsManagement />;
      case "external":
        return <ExternalOrdersManagement />;
      case "drivers":
        return <DriversManagement />;
      case "vehicles":
        return <VehiclesManagement />;
      case "fleet-map":
        return <AdminFleetMap />;
      case "vouchers":
        return <VouchersManagement />;
      case "zones":
        return <ZonesPricingManagement />;
      case "festivals":
        return <FestivalPricingManagement />;
      case "notifications":
        return <NotificationsManagement />;
      case "wallet":
        return <AdminWalletManagement />;
      case "partners":
        return <PartnersManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | IBB Shuttle Service</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
