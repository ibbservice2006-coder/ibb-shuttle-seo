import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LoadingFallback from "@/components/LoadingFallback";

// ============================================
// RENDER-FIRST ARCHITECTURE
// App.tsx only routes - no system initialization
// ============================================

// Public routes - render immediately, no heavy providers
import PublicApp from "@/apps/PublicApp";

// Private routes - lazy loaded, system boots only when needed
const PrivateApp = lazy(() => import("@/apps/PrivateApp"));

// ============================================
// Route definitions
// Public paths render without Auth/Query overhead
// Private paths load system only when accessed
// ============================================
// Private paths that require lazy-loaded PrivateApp with Auth/Query providers
// All other paths (public + unknown) render via PublicApp which includes a catch-all 404

const PRIVATE_PATHS = [
  "/auth",
  "/dashboard",
  "/admin",
  "/driver",
  "/partner-dashboard",
  "/balance",
  "/reset-password",
];

const isPrivatePath = (pathname: string): boolean => {
  return PRIVATE_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
};

// ============================================
// App Router Component
// Minimal - just decides Public vs Private
// ============================================
const AppRouter = () => {
  const location = useLocation();

  // Only lazy-load PrivateApp for known private routes
  // Everything else (public + unknown) goes to PublicApp which has its own catch-all 404
  if (isPrivatePath(location.pathname)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PrivateApp />
      </Suspense>
    );
  }

  return <PublicApp />;
};

// ============================================
// Idle-time Preloading (moved from old App.tsx)
// Only preload after initial render
// ============================================
if (typeof window !== "undefined") {
  const preloadPrivateApp = () => {
    import("@/apps/PrivateApp");
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(preloadPrivateApp, { timeout: 5000 });
  } else {
    setTimeout(preloadPrivateApp, 3000);
  }
}

const App = () => <AppRouter />;

export default App;
