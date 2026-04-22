import { lazy, Suspense, useState, useEffect } from "react";

// Lazy load framer-motion particles - not needed for first paint
const LazyParticles = lazy(() => import("./PortalParticlesInner"));

const PortalFloatingParticles = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay particles until after first paint
    const id = requestAnimationFrame(() => {
      setShow(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <LazyParticles />
    </Suspense>
  );
};

export default PortalFloatingParticles;
