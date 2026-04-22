import { Loader2 } from "lucide-react";

/**
 * Loading fallback component for Suspense boundaries
 * Used during lazy loading of route components
 * Designed to be lightweight and fast to render
 */
const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
