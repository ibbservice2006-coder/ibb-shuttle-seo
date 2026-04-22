# SEO Level 0 Specification — FINAL v2.0

> **Project:** IBB Shuttle Service (ibbservice.com)  
> **Stack:** Static HTML only (no React, no SPA) + Cloudflare  
> **Date:** 2025-07-15  
> **Status:** LOCKED — ห้ามเพิ่ม performance/UX items เข้า Level 0

---

## 🎯 นิยาม Level 0

**SEO Correctness Only** — ทำให้ Crawler เข้าใจธุรกิจ + อ่าน content ได้ 100% โดยไม่ต้องใช้ JavaScript

### Rule ตัดสิน

> ถ้าลบแล้ว Google ยัง index ได้เหมือนเดิม → **ไม่ใช่ Level 0**

---

## ✅ CORE Requirements (บังคับทั้งหมด)

### 1. Static HTML Files

| Item | Detail |
|------|--------|
| Path | `public/{lang}/index.html` (13 ภาษา) |
| Languages | en, th, zh, ja, ko, ru, ar, de, fr, es, id, hi, vi |
| Template | `seo/Landing.template.html` |
| i18n Data | `seo/i18n/{lang}.json` × 13 |
| Generator | `seo/build-seo.js` |

**ห้ามมี:**
- ❌ React / useState / useEffect
- ❌ Router / SDK
- ❌ Dynamic state
- ❌ Inline/external `<script>` (ยกเว้น `<script type="application/ld+json">` เท่านั้น)
- ❌ JS bundle reference
- ❌ External font CDN `<link>`

**Language order MUST be identical in:** hreflang, sitemap, i18n JSON, generator loop
```
en, th, zh, ja, ko, ru, ar, de, fr, es, id, hi, vi
```

### 2. HTML Head (ทุกภาษา)

```html
<!DOCTYPE html>
<html lang="{lang}" dir="{rtl|ltr}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{translated_title}</title>
  <meta name="description" content="{translated_description}">
  <link rel="canonical" href="https://ibbservice.com/{lang}/">
  
  <!-- hreflang × 13 + x-default -->
  <link rel="alternate" hreflang="en" href="https://ibbservice.com/en/">
  <link rel="alternate" hreflang="th" href="https://ibbservice.com/th/">
  <!-- ... all 13 languages ... -->
  <link rel="alternate" hreflang="x-default" href="https://ibbservice.com/en/">
  
  <!-- Open Graph -->
  <meta property="og:title" content="{translated_title}">
  <meta property="og:description" content="{translated_description}">
  <meta property="og:url" content="https://ibbservice.com/{lang}/">
  <meta property="og:image" content="https://ibbservice.com/seo/og-image.jpg">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{og_locale}">
</head>
```

### 3. RTL Support

| Language | dir |
|----------|-----|
| ar (Arabic) | `rtl` |
| All others | `ltr` |

### 4. JSON-LD Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TransportationService",
  "name": "IBB Shuttle Service",
  "url": "https://ibbservice.com/{lang}/",
  "description": "{translated_description}",
  "areaServed": "Thailand",
  "availableLanguage": [
    {"@type": "Language", "name": "English"},
    {"@type": "Language", "name": "Thai"},
    {"@type": "Language", "name": "Chinese"},
    {"@type": "Language", "name": "Japanese"},
    {"@type": "Language", "name": "Korean"},
    {"@type": "Language", "name": "Russian"},
    {"@type": "Language", "name": "Arabic"},
    {"@type": "Language", "name": "German"},
    {"@type": "Language", "name": "French"},
    {"@type": "Language", "name": "Spanish"},
    {"@type": "Language", "name": "Indonesian"},
    {"@type": "Language", "name": "Hindi"},
    {"@type": "Language", "name": "Vietnamese"}
  ],
  "address": { ... }
}
</script>
```

### 5. Body Content

- ✅ 1 × `<h1>` (ต้องมีเพียง 1 ตัว)
- ✅ Semantic sections: `<header>`, `<main>`, `<section>`, `<footer>`
- ✅ Real text content (ไม่ใช่ placeholder)
- ✅ `<img>` ต้องมี `alt` attribute

### 6. sitemap.xml

**Path:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://ibbservice.com/en/</loc>
    <lastmod>2025-07-15</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="https://ibbservice.com/en/"/>
    <xhtml:link rel="alternate" hreflang="th" href="https://ibbservice.com/th/"/>
    <!-- ... all 13 + x-default ... -->
  </url>
  <!-- repeat for each language -->
</urlset>
```

**Requirements:**
- 13 URLs (one per language)
- `<xhtml:link hreflang>` ในทุก URL
- `<lastmod>` tag
- Trailing slash on all URLs

### 7. robots.txt

**Path:** `public/robots.txt`

```
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /customer
Disallow: /driver
Disallow: /partner
Disallow: /tracking
Disallow: /balance
Disallow: /guest-payment
Disallow: /reset-password
Disallow: /assets/

Sitemap: https://ibbservice.com/sitemap.xml
```

### 8. 404.html

**Path:** `public/404.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex">
  <title>404 - Page Not Found | IBB Shuttle</title>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The page you requested does not exist.</p>
  <a href="/en/">Return to Home</a>
</body>
</html>
```

**บังคับ:**
- `<meta name="robots" content="noindex">` — ป้องกัน Google index 404
- **Server MUST return HTTP 404 status code (not 200)** — ถ้าส่ง 200 Google จะ index เป็น soft 404

### 9. Build Order

**Path:** `scripts/build.sh`

```bash
#!/bin/bash
set -e

# Step 1: Generate static SEO pages (MUST run first)
node seo/build-seo.js

# Step 2: Vite build (SPA)
npx vite build
```

**Rule:** `build-seo.js` → `vite build` — ลำดับนี้ห้ามสลับ

### 10. Cloudflare Edge Rules

| Rule | Action | Priority |
|------|--------|----------|
| `/{lang}/*` | Serve static HTML | **1 (highest)** |
| `/ (root)` | 301 → `/en/` | 2 |
| Fallback | React SPA | 3 (lowest) |

**Static routes MUST have higher priority than SPA fallback**
**ห้ามใช้ HTML meta redirect** — ต้อง Edge redirect เท่านั้น

### 11. CI Validation Guards

build-seo.js ต้อง validate ทุก generated file:

- [ ] `<link rel="canonical">` มี trailing slash
- [ ] `<h1>` มี 1 ตัวเท่านั้น
- [ ] ไม่มี external font CDN `<link>`
- [ ] ไม่มี inline `<script>` (ยกเว้น JSON-LD)
- [ ] ไม่มี React bundle reference
- [ ] `<html lang>` ตรงกับภาษา
- [ ] `dir="rtl"` สำหรับ Arabic

---

## ❌ สิ่งที่ไม่ใช่ Level 0 (ห้ามเอามาปน)

| Item | ประโยชน์ | ควรอยู่ Level |
|------|---------|--------------|
| `<link rel="preload">` hero image | LCP ดีขึ้น | Level 2 (Performance) |
| Critical CSS inline | Render เร็วขึ้น | Level 2 |
| `manifest.json` | PWA / installable | Level 4-5 |
| Favicon set หลายขนาด | UX / branding | Level 2 |
| `_headers` file | Cache / security | Infra layer |
| Cache rules | Speed | Infra layer |
| Image optimization | Speed | Level 2 |
| Lazy loading | Speed | Level 2 |
| Font optimization | Speed | Level 2 |
| `prefetch` / `preconnect` | Speed | Level 2 |

---

## 📐 Architecture Overview

```
Cloudflare Edge
   ↓
/          → 301 → /en/
/en/       → static HTML (Level 0)
/th/       → static HTML (Level 0)
/ja/       → static HTML (Level 0)
...13 langs...
/pricing   → React SPA (Level 1+)
/admin     → React SPA (Level 1+)
/portal    → React SPA (Level 1+)
```

**Principle:** SEO = static only / React = ไม่เกี่ยวกับ SEO

---

## 📋 File Structure

```
project/
├── seo/
│   ├── Landing.template.html    # HTML template with placeholders
│   ├── build-seo.js             # Static HTML generator
│   └── i18n/
│       ├── en.json
│       ├── th.json
│       ├── zh.json
│       ├── ja.json
│       ├── ko.json
│       ├── ru.json
│       ├── ar.json
│       ├── de.json
│       ├── fr.json
│       ├── es.json
│       ├── id.json
│       ├── hi.json
│       └── vi.json
├── public/
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── 404.html
│   ├── en/index.html            # Generated
│   ├── th/index.html            # Generated
│   └── .../index.html           # Generated × 13
└── scripts/
    └── build.sh                 # Build order lock
```

---

> **Document version:** v2.0 FINAL  
> **ห้ามเพิ่ม item ใด ๆ ที่ไม่ผ่าน rule:** "ลบแล้ว Google ยัง index ได้เหมือนเดิม → ไม่ใช่ Level 0"
