import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname_resolved = path.dirname(fileURLToPath(import.meta.url));
const nodeRequire = createRequire(import.meta.url);

// ============================================
// CANONICAL LANGUAGE ORDER (LOCKED)
// ============================================
const LANGUAGES = ["en","th","zh","ja","ko","ru","ar","de","fr","es","id","hi","vi"] as const;

// ============================================
// SEO Level 0 Plugin
// Dev: Vite middleware serves HTML from memory
// Build: emitFile injects into dist/ output
// Zero file-system writes required
// ============================================
function seoPrebuildPlugin(): Plugin {
  const seoDir = path.resolve(__dirname_resolved, "seo");

  function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
      } else {
        result[fullKey] = String(value);
      }
    }
    return result;
  }

  function replacePlaceholders(html: string, data: Record<string, string>): string {
    let result = html;
    for (const [key, value] of Object.entries(data)) {
      const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const regex = new RegExp(`\\{\\{${key.replace(/\./g, "\\.")}\\}\\}`, "g");
      result = result.replace(regex, (_match: string, offset: number) => {
        const before = result.substring(0, offset);
        const inJsonLd = before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf("</script>");
        return inJsonLd ? escapedValue : value;
      });
    }
    return result;
  }

  type PageType = "landing" | "pricing" | "partners" | "tracking" | "notfound" | "portal";
  const templateMap: Record<PageType, string> = {
    landing: "Landing.template.html",
    pricing: "Pricing.template.html",
    partners: "Partners.template.html",
    tracking: "Tracking.template.html",
    notfound: "NotFound.template.html",
    portal: "Portal.template.html",
  };

  function generatePage(lang: string, pageType: PageType): string | null {
    try {
      const templatePath = path.join(seoDir, templateMap[pageType]);
      if (!fs.existsSync(templatePath)) return null;

      // Portal is self-contained English HTML — no i18n replacement
      if (pageType === "portal") {
        return fs.readFileSync(templatePath, "utf-8");
      }

      const i18nPath = path.join(seoDir, "i18n", `${lang}.json`);
      if (!fs.existsSync(i18nPath)) return null;

      const template = fs.readFileSync(templatePath, "utf-8");
      const data = JSON.parse(fs.readFileSync(i18nPath, "utf-8"));
      const flatData = flatten(data);

      let html = template;

      // Pricing: inject tables first
      if (pageType === "pricing") {
        const pricingDataPath = path.join(seoDir, "pricing-data.js");
        // Clear cache for hot reload
        delete nodeRequire.cache[nodeRequire.resolve(pricingDataPath)];
        const { generateAllPricingHTML } = nodeRequire(pricingDataPath);
        const tablesHTML = generateAllPricingHTML(lang);
        html = html.replace(/\{\{pricing_tables\}\}/g, tablesHTML);
      }

      // Replace i18n placeholders
      html = replacePlaceholders(html, flatData);

      // Inject lang/dir
      html = html.replace(/\{\{lang\}\}/g, lang);
      html = html.replace(/\{\{dir\}\}/g, lang === "ar" ? "rtl" : "ltr");

      return html;
    } catch (e) {
      console.error(`❌ SEO page generation failed for ${lang}/${pageType}:`, e);
      return null;
    }
  }

  return {
    name: "seo-level0",
    enforce: "pre",

    // DEV: Serve SEO pages via middleware (no disk writes)
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0]; // Strip query params
        if (!url) return next();

        const langPattern = "(en|th|zh|ja|ko|ru|ar|de|fr|es|id|hi|vi)";
        
        // Match /{lang}/ (landing)
        const landingMatch = url.match(new RegExp(`^\\/${langPattern}\\/?$`));
        if (landingMatch) {
          const html = generatePage(landingMatch[1], "landing");
          if (html) { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.statusCode = 200; res.end(html); return; }
        }

        // Match /{lang}/pricing/
        const pricingMatch = url.match(new RegExp(`^\\/${langPattern}\\/pricing\\/?$`));
        if (pricingMatch) {
          const html = generatePage(pricingMatch[1], "pricing");
          if (html) { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.statusCode = 200; res.end(html); return; }
        }

        // Match /{lang}/partners/
        const partnersMatch = url.match(new RegExp(`^\\/${langPattern}\\/partners\\/?$`));
        if (partnersMatch) {
          const html = generatePage(partnersMatch[1], "partners");
          if (html) { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.statusCode = 200; res.end(html); return; }
        }

        // Match /{lang}/tracking/
        const trackingMatch = url.match(new RegExp(`^\\/${langPattern}\\/tracking\\/?$`));
        if (trackingMatch) {
          const html = generatePage(trackingMatch[1], "tracking");
          if (html) { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.statusCode = 200; res.end(html); return; }
        }

        // Match /{lang}/404/
        const notFoundMatch = url.match(new RegExp(`^\\/${langPattern}\\/404\\/?$`));
        if (notFoundMatch) {
          const html = generatePage(notFoundMatch[1], "notfound");
          if (html) { res.setHeader("Content-Type", "text/html; charset=utf-8"); res.statusCode = 404; res.end(html); return; }
        }

        next();
      });
    },

    // BUILD: Emit HTML files into dist/ output directly
    generateBundle() {
      console.log("🔨 Emitting Level 0 SEO pages into build output...");

      // ── Portal (single English file at root) ──
      const portalHtml = generatePage("en", "portal");
      if (portalHtml) {
        // Emit as portal-seo/index.html (not index.html to avoid SPA fallback conflict)
        // Cloudflare Page Rule will serve this for exactly "/" to crawlers
        this.emitFile({
          type: "asset",
          fileName: "portal-seo/index.html",
          source: portalHtml,
        });
        console.log("  ✅ portal-seo/index.html (Portal Level 0)");
      }

      // ── Localized pages (13 languages × 5 page types) ──
      const pageTypes: { type: PageType; subpath: string }[] = [
        { type: "landing", subpath: "" },
        { type: "pricing", subpath: "pricing/" },
        { type: "partners", subpath: "partners/" },
        { type: "tracking", subpath: "tracking/" },
        { type: "notfound", subpath: "404/" },
      ];

      for (const lang of LANGUAGES) {
        for (const { type, subpath } of pageTypes) {
          const html = generatePage(lang, type);
          if (html) {
            this.emitFile({
              type: "asset",
              fileName: `${lang}/${subpath}index.html`,
              source: html,
            });
          }
        }
        console.log(`  ✅ ${lang}/ (all pages)`);
      }

      console.log(`✅ Level 0 SEO: ${LANGUAGES.length * pageTypes.length + 1} HTML pages emitted (incl. Portal)`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    seoPrebuildPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname_resolved, "./src"),
    },
  },
}));
