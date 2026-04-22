import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Home,
  LogOut,
  Wallet,
  User,
  Menu,
  X,
  CreditCard,
  History,
  Settings,
} from "lucide-react";

interface CustomerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: {
    full_name: string | null;
    email: string | null;
    membership: string;
  } | null;
  translations: {
    tabs: {
      bookings: string;
      wallet: string;
      profile: string;
    };
    signOut: string;
    back: string;
  };
}

export const CustomerSidebar = ({
  activeTab,
  setActiveTab,
  profile,
  translations: t,
}: CustomerSidebarProps) => {
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

  const menuItems = [
    { id: "bookings", label: t.tabs.bookings, icon: History },
    { id: "wallet", label: t.tabs.wallet, icon: CreditCard },
    { id: "profile", label: t.tabs.profile, icon: Settings },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-6 border-b border-primary-foreground/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-montserrat">IBB Shuttle</h1>
            <p className="text-xs text-primary-foreground/70">Customer Portal</p>
          </div>
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

      {/* User Info */}
      <div className="p-4 border-b border-primary-foreground/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <Badge
              variant="outline"
              className="text-[10px] border-primary-foreground/30 text-primary-foreground/80 px-1.5 py-0"
            >
              {profile?.membership?.toUpperCase() || "GENERAL"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
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

      {/* Footer */}
      <div className="p-4 border-t border-primary-foreground/10">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>{t.back}</span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
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

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 min-h-screen bg-primary text-primary-foreground flex flex-col shrink-0",
          "fixed lg:static z-50 lg:z-auto transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
