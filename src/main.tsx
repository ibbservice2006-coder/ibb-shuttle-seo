import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// ============================================
// CONDITIONAL HYDRATION for Portal Level 0
// If #root has pre-rendered children (from Cloudflare Worker),
// use hydrateRoot() to preserve static content without flash.
// Otherwise, use createRoot().render() for standard SPA behavior.
// ============================================
const root = document.getElementById("root")!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (root.children.length > 0 && window.location.pathname === "/") {
  // Portal page: Worker injected static HTML
  // Strategy: Fade-out SEO shell → render React → fade-in
  // This avoids hydration mismatch issues while eliminating visual flash

  // Step 1: Match Portal bg so fade-out doesn't flash white
  document.body.style.backgroundColor = "#0f1623";

  // Step 2: Apply fade-out transition to existing SEO content
  root.style.transition = "opacity 0.15s ease-out";
  root.style.opacity = "0";

  // Step 2: After fade-out completes, swap to React
  setTimeout(() => {
    root.innerHTML = "";
    const reactRoot = createRoot(root);
    reactRoot.render(app);

    // Step 3: Fade-in React content on next frame
    requestAnimationFrame(() => {
      root.style.opacity = "1";
      // Clean up inline styles after transition
      setTimeout(() => {
        root.style.removeProperty("transition");
        root.style.removeProperty("opacity");
      }, 150);
    });
  }, 150);
} else {
  // All other routes: standard SPA rendering
  if (root.children.length > 0) {
    root.innerHTML = ""; // Clear any stale pre-rendered content
  }
  createRoot(root).render(app);
}
