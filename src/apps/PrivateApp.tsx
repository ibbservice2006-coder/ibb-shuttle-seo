import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LoadingFallback from "@/components/LoadingFallback";

// ============================================
// PRIVATE APP - System-heavy, Auth required
// Providers only mount when user enters /app/* routes
// ============================================

// All private pages are lazy loaded
// Portal moved to PublicApp
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const CustomerDashboard = lazy(() => import("@/pages/CustomerDashboard"));
const Balance = lazy(() => import("@/pages/Balance"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const DriverDashboard = lazy(() => import("@/pages/DriverDashboard"));
const PartnerDashboard = lazy(() => import("@/pages/PartnerDashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// QueryClient scoped to PrivateApp only
const queryClient = new QueryClient();

const PrivateApp = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth pages */}
                {/* Portal moved to PublicApp as "/" */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Customer dashboard */}
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/balance" element={<Balance />} />
                
                {/* Admin/Driver/Partner */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/driver-dashboard" element={<DriverDashboard />} />
                <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                
                {/* Catch-all for private routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default PrivateApp;
