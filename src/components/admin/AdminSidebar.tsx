import { useState } from "react";
import { Calendar, Home, LogOut, Users, Wallet, Globe, Handshake, Car, Map, Ticket, MapPin, PartyPopper, Bell, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "external", label: "External Orders", icon: Globe },
  { id: "drivers", label: "Drivers", icon: Users },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "fleet-map", label: "Fleet Map", icon: Map },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "zones", label: "Zones & Pricing", icon: MapPin },
  { id: "festivals", label: "Festival Pricing", icon: PartyPopper },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "wallet", label: "Wallet Management", icon: Wallet },
  { id: "partners", label: "Partners", icon: Handshake },
];

export const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-primary-foreground/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-montserrat">IBB Admin</h1>
            <p className="text-sm text-primary-foreground/70">Management Portal</p>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm",
                  activeTab === item.id
                    ? "bg-primary-foreground/20 text-primary-foreground font-medium"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-foreground/10">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Back to Website</span>
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop always visible, mobile slide-in */}
      <aside
        className={cn(
          "w-64 min-h-screen bg-primary text-primary-foreground flex flex-col shrink-0",
          // Mobile: fixed overlay
          "fixed lg:static z-50 lg:z-auto transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
