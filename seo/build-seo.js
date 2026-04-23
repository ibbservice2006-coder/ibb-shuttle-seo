/**
 * SEO Level 0 Static HTML Generator
 * 
 * STRICT RULES:
 * - Pure static HTML only
 * - No React, no JSX, no Vite
 * - No JS execution (except JSON-LD)
 * - Output: public/{lang}/index.html × 13 + sitemap.xml + robots.txt + 404.html
 * 
 * Build order: node seo/build-seo.js → vite build
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CANONICAL LANGUAGE ORDER (LOCKED)
// Must be identical in: hreflang, sitemap, i18n, this loop
// ============================================
const LANGUAGES = Object.freeze(['en', 'th', 'zh', 'ja', 'ko', 'ru', 'ar', 'de', 'fr', 'es', 'id', 'hi', 'vi']);
const DOMAIN = 'https://ibbservice.com';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ============================================
// VOCABULARY GUARD v3
// ============================================
const FORBIDDEN_TERMS = ['taxi', 'cab', 'grab', 'uber', 'cleaning', 'repair'];
const FORBIDDEN_STANDALONE = ['air']; // prevent collision with 'Airport'

function vocabularyCheck(text, lang) {
  const lower = text.toLowerCase();
  const errors = [];
  for (const term of FORBIDDEN_TERMS) {
    if (lower.includes(term)) {
      errors.push(`Forbidden term "${term}" found in ${lang}`);
    }
  }
  for (const term of FORBIDDEN_STANDALONE) {
    // Match standalone word only (not inside "airport", "aircon", etc.)
    const regex = new RegExp(`\\b${term}\\b(?!port|craft|line|plane|way)`, 'gi');
    if (regex.test(text)) {
      errors.push(`Forbidden standalone term "${term}" found in ${lang}`);
    }
  }
  return errors;
}

// ============================================
// LOAD TEMPLATES
// ============================================
const landingTemplatePath = path.join(__dirname, 'Landing.template.html');
if (!fs.existsSync(landingTemplatePath)) {
  console.error('❌ FATAL: seo/Landing.template.html not found. Aborting.');
  process.exit(1);
}
const landingTemplate = fs.readFileSync(landingTemplatePath, 'utf-8');

const pricingTemplatePath = path.join(__dirname, 'Pricing.template.html');
if (!fs.existsSync(pricingTemplatePath)) {
  console.error('❌ FATAL: seo/Pricing.template.html not found. Aborting.');
  process.exit(1);
}
const pricingTemplate = fs.readFileSync(pricingTemplatePath, 'utf-8');

const partnersTemplatePath = path.join(__dirname, 'Partners.template.html');
if (!fs.existsSync(partnersTemplatePath)) {
  console.error('❌ FATAL: seo/Partners.template.html not found. Aborting.');
  process.exit(1);
}
const partnersTemplate = fs.readFileSync(partnersTemplatePath, 'utf-8');

const trackingTemplatePath = path.join(__dirname, 'Tracking.template.html');
if (!fs.existsSync(trackingTemplatePath)) {
  console.error('❌ FATAL: seo/Tracking.template.html not found. Aborting.');
  process.exit(1);
}
const trackingTemplate = fs.readFileSync(trackingTemplatePath, 'utf-8');

const notFoundTemplatePath = path.join(__dirname, 'NotFound.template.html');
if (!fs.existsSync(notFoundTemplatePath)) {
  console.error('❌ FATAL: seo/NotFound.template.html not found. Aborting.');
  process.exit(1);
}
const notFoundTemplate = fs.readFileSync(notFoundTemplatePath, 'utf-8');

// Load pricing data generator
const { generateAllPricingHTML } = require('./pricing-data.js');

// ============================================
// FLATTEN NESTED OBJECTS FOR {{dot.notation}}
// ============================================
function flatten(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

// ============================================
// GENERATE PORTAL STATIC HTML (Single file, English only)
// ============================================
console.log('🔨 Generating Level 0 static HTML (Portal — root /)...');

const portalTemplatePath = path.join(__dirname, 'Portal.template.html');
if (!fs.existsSync(portalTemplatePath)) {
  console.error('❌ FATAL: seo/Portal.template.html not found. Aborting.');
  process.exit(1);
}
const portalTemplate = fs.readFileSync(portalTemplatePath, 'utf-8');

// Portal is hardcoded English — no i18n replacement needed
// Validate it
{
  const html = portalTemplate;
  const errors = [];

  // 1. canonical is exactly https://ibbservice.com/
  if (!html.includes('href="https://ibbservice.com/"')) {
    errors.push('Missing or incorrect canonical URL for Portal');
  }

  // 2. exactly 1 <h1>
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    errors.push(`Expected 1 <h1>, found ${h1Count} in Portal`);
  }

  // 3. no external font CDN
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) {
    errors.push('External font CDN found in Portal');
  }

  // 4. no inline <script> except JSON-LD
  const scriptMatches = html.match(/<script[\s>]/g) || [];
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/g) || [];
  if (scriptMatches.length !== jsonLdMatches.length) {
    errors.push('Non-JSON-LD <script> found in Portal');
  }

  // 5. no React bundle reference
  if (html.includes('/assets/index-') || html.includes('src/main.tsx')) {
    errors.push('React bundle reference found in Portal');
  }

  // 6. <html lang="en">
  if (!html.includes('lang="en"')) {
    errors.push('<html lang="en"> not found in Portal');
  }

  // 7. No hreflang (Portal is single-language)
  if (html.includes('hreflang=')) {
    errors.push('Portal should NOT have hreflang tags (single-language page)');
  }

  // 8. Vocabulary guard
  const htmlVocabErrors = vocabularyCheck(html, 'Portal (HTML output)');
  if (htmlVocabErrors.length > 0) {
    errors.push(...htmlVocabErrors);
  }

  if (errors.length > 0) {
    console.error('❌ Validation failed for Portal:');
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }

  // Write Portal index.html — this REPLACES the SPA shell at public/index.html
  // Note: We write to a special location; Vite's index.html is in project root, not public/
  // Portal L0 is emitted via Vite plugin (generateBundle), not here.
  // Here we only validate. The actual emit happens in vite.config.ts seoPrebuildPlugin.
  console.log('  ✅ Portal template validated (emit via Vite plugin)');
}

// ============================================
// GENERATE STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Landing pages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18N', `${lang}.json`);
  
  if (!fs.existsSync(i18nPath)) {
    console.error(`❌ Missing i18n file: ${i18nPath}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  } catch (e) {
    console.error(`❌ Invalid JSON in ${lang}.json: ${e.message}`);
    process.exit(1);
  }

  // Vocabulary guard on i18n content
  const vocabErrors = vocabularyCheck(JSON.stringify(data), lang);
  if (vocabErrors.length > 0) {
    console.error(`❌ Vocabulary guard failed for ${lang}:`);
    vocabErrors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }

  // Flatten for nested key support (e.g. {{meta.title}})
  const flatData = flatten(data);
  
  // Replace all {{placeholders}} with i18n data
  let html = landingTemplate;
  for (const [key, value] of Object.entries(flatData)) {
    // Escape values inside JSON-LD context (prevent broken JSON from quotes)
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    
    // Use escaped value inside <script> blocks, raw value elsewhere
    // Split by JSON-LD script boundaries for context-aware replacement
    html = html.replace(regex, (match, offset) => {
      const before = html.substring(0, offset);
      const inJsonLd = (before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf('</script>'));
      return inJsonLd ? escapedValue : value;
    });
  }

  // FAIL-FAST: Check for any remaining {{placeholders}}
  const remainingPlaceholders = html.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.error(`❌ FATAL: Unreplaced placeholders in ${lang}:`);
    remainingPlaceholders.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  // Write output
  const outDir = path.join(__dirname, '..', 'public', lang);
  fs.mkdirSync(outDir, { recursive: true });
  
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  
  // ============================================
  // CI VALIDATION GUARDS
  // ============================================
  const errors = [];
  
  // 1. canonical has trailing slash
  if (!html.includes(`href="${DOMAIN}/${lang}/"`)) {
    errors.push(`Missing or incorrect canonical URL for ${lang}`);
  }
  
  // 2. exactly 1 <h1>
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    errors.push(`Expected 1 <h1>, found ${h1Count} in ${lang}`);
  }
  
  // 3. no external font CDN <link>
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) {
    errors.push(`External font CDN found in ${lang}`);
  }
  
  // 4. no inline <script> except JSON-LD (tolerant regex for whitespace)
  const scriptMatches = html.match(/<script[\s>]/g) || [];
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/g) || [];
  if (scriptMatches.length !== jsonLdMatches.length) {
    errors.push(`Non-JSON-LD <script> found in ${lang}`);
  }
  
  // 5. no React bundle reference
  if (html.includes('/assets/index-') || html.includes('src/main.tsx')) {
    errors.push(`React bundle reference found in ${lang}`);
  }
  
  // 6. <html lang> matches
  if (!html.includes(`lang="${lang}"`)) {
    errors.push(`<html lang="${lang}"> not found`);
  }
  
  // 7. dir="rtl" for Arabic
  if (lang === 'ar' && !html.includes('dir="rtl"')) {
    errors.push('Arabic page missing dir="rtl"');
  }
  if (lang !== 'ar' && html.includes('dir="rtl"')) {
    errors.push(`Non-Arabic page ${lang} has dir="rtl"`);
  }

  // 8. Vocabulary guard on final HTML output
  const htmlVocabErrors = vocabularyCheck(html, `${lang} (HTML output)`);
  if (htmlVocabErrors.length > 0) {
    errors.push(...htmlVocabErrors);
  }

  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}:`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
  
  console.log(`  ✅ ${lang}/index.html (landing)`);
}

// ============================================
// GENERATE PRICING STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Pricing pages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18N', `${lang}.json`);
  // i18n file already validated in landing loop above
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);

  // Generate pricing tables HTML for this language
  const pricingTablesHTML = generateAllPricingHTML(lang);

  // Start with pricing template
  let html = pricingTemplate;

  // Replace {{pricing_tables}} FIRST (before general placeholders)
  html = html.replace(/\{\{pricing_tables\}\}/g, pricingTablesHTML);

  // Replace all {{placeholders}} with i18n data
  for (const [key, value] of Object.entries(flatData)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(regex, (match, offset) => {
      const before = html.substring(0, offset);
      const inJsonLd = (before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf('</script>'));
      return inJsonLd ? escapedValue : value;
    });
  }

  // Inject lang/dir variables (same as landing)
  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{dir\}\}/g, lang === 'ar' ? 'rtl' : 'ltr');

  // FAIL-FAST: Check for any remaining {{placeholders}}
  const remainingPlaceholders = html.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.error(`❌ FATAL: Unreplaced placeholders in ${lang}/pricing:`);
    remainingPlaceholders.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  // Write output
  const outDir = path.join(__dirname, '..', 'public', lang, 'pricing');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf-8');

  // ============================================
  // CI VALIDATION GUARDS (Pricing)
  // ============================================
  const errors = [];

  // 1. canonical has trailing slash
  if (!html.includes(`href="${DOMAIN}/${lang}/pricing/"`)) {
    errors.push(`Missing or incorrect canonical URL for ${lang}/pricing`);
  }

  // 2. exactly 1 <h1>
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) {
    errors.push(`Expected 1 <h1>, found ${h1Count} in ${lang}/pricing`);
  }

  // 3. no external font CDN
  if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) {
    errors.push(`External font CDN found in ${lang}/pricing`);
  }

  // 4. no inline <script> except JSON-LD
  const scriptMatches = html.match(/<script[\s>]/g) || [];
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/g) || [];
  if (scriptMatches.length !== jsonLdMatches.length) {
    errors.push(`Non-JSON-LD <script> found in ${lang}/pricing`);
  }

  // 5. no React bundle reference
  if (html.includes('/assets/index-') || html.includes('src/main.tsx')) {
    errors.push(`React bundle reference found in ${lang}/pricing`);
  }

  // 6. <html lang> matches
  if (!html.includes(`lang="${lang}"`)) {
    errors.push(`<html lang="${lang}"> not found in pricing`);
  }

  // 7. dir="rtl" for Arabic
  if (lang === 'ar' && !html.includes('dir="rtl"')) {
    errors.push('Arabic pricing page missing dir="rtl"');
  }
  if (lang !== 'ar' && html.includes('dir="rtl"')) {
    errors.push(`Non-Arabic pricing page ${lang} has dir="rtl"`);
  }

  // 8. Vocabulary guard on final HTML output
  const htmlVocabErrors = vocabularyCheck(html, `${lang}/pricing (HTML output)`);
  if (htmlVocabErrors.length > 0) {
    errors.push(...htmlVocabErrors);
  }

  // 9. Pricing tables must contain actual data (not empty)
  if (!html.includes('<table>')) {
    errors.push(`No pricing tables found in ${lang}/pricing`);
  }

  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}/pricing:`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }

  console.log(`  ✅ ${lang}/pricing/index.html`);
}

// ============================================
// GENERATE PARTNERS STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Partners pages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18N', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);

  let html = partnersTemplate;
  for (const [key, value] of Object.entries(flatData)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(regex, (match, offset) => {
      const before = html.substring(0, offset);
      const inJsonLd = (before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf('</script>'));
      return inJsonLd ? escapedValue : value;
    });
  }

  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{dir\}\}/g, lang === 'ar' ? 'rtl' : 'ltr');

  const remainingPlaceholders = html.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.error(`❌ FATAL: Unreplaced placeholders in ${lang}/partners:`);
    remainingPlaceholders.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'public', lang, 'partners');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');

  // Validation
  const errors = [];
  if (!html.includes(`href="${DOMAIN}/${lang}/partners/"`)) errors.push(`Missing canonical for ${lang}/partners`);
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) errors.push(`Expected 1 <h1>, found ${h1Count} in ${lang}/partners`);
  const scriptMatches = html.match(/<script[\s>]/g) || [];
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/g) || [];
  if (scriptMatches.length !== jsonLdMatches.length) errors.push(`Non-JSON-LD <script> in ${lang}/partners`);
  if (!html.includes(`lang="${lang}"`)) errors.push(`<html lang="${lang}"> not found in partners`);
  if (lang === 'ar' && !html.includes('dir="rtl"')) errors.push('Arabic partners missing dir="rtl"');
  if (lang !== 'ar' && html.includes('dir="rtl"')) errors.push(`Non-Arabic partners ${lang} has dir="rtl"`);
  const htmlVocabErrors = vocabularyCheck(html, `${lang}/partners (HTML output)`);
  if (htmlVocabErrors.length > 0) errors.push(...htmlVocabErrors);

  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}/partners:`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
  console.log(`  ✅ ${lang}/partners/index.html`);
}

// ============================================
// GENERATE TRACKING STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Tracking pages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18N', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);

  let html = trackingTemplate;
  for (const [key, value] of Object.entries(flatData)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(regex, (match, offset) => {
      const before = html.substring(0, offset);
      const inJsonLd = (before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf('</script>'));
      return inJsonLd ? escapedValue : value;
    });
  }

  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{dir\}\}/g, lang === 'ar' ? 'rtl' : 'ltr');

  const remainingPlaceholders = html.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.error(`❌ FATAL: Unreplaced placeholders in ${lang}/tracking:`);
    remainingPlaceholders.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'public', lang, 'tracking');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');

  // Validation
  const errors = [];
  if (!html.includes(`href="${DOMAIN}/${lang}/tracking/"`)) errors.push(`Missing canonical for ${lang}/tracking`);
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) errors.push(`Expected 1 <h1>, found ${h1Count} in ${lang}/tracking`);
  const scriptMatches = html.match(/<script[\s>]/g) || [];
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>/g) || [];
  if (scriptMatches.length !== jsonLdMatches.length) errors.push(`Non-JSON-LD <script> in ${lang}/tracking`);
  if (!html.includes(`lang="${lang}"`)) errors.push(`<html lang="${lang}"> not found in tracking`);
  if (lang === 'ar' && !html.includes('dir="rtl"')) errors.push('Arabic tracking missing dir="rtl"');
  if (lang !== 'ar' && html.includes('dir="rtl"')) errors.push(`Non-Arabic tracking ${lang} has dir="rtl"`);
  const htmlVocabErrors = vocabularyCheck(html, `${lang}/tracking (HTML output)`);
  if (htmlVocabErrors.length > 0) errors.push(...htmlVocabErrors);

  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}/tracking:`);
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
  console.log(`  ✅ ${lang}/tracking/index.html`);
}

// ============================================
// GENERATE SITEMAP.XML
// ============================================
console.log('🔨 Generating sitemap.xml...');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

// Portal root URL (English only, no hreflang)
sitemap += `  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>\n`;

for (const lang of LANGUAGES) {
  // Landing page URL
  sitemap += `  <url>
    <loc>${DOMAIN}/${lang}/</loc>
    <lastmod>${TODAY}</lastmod>
`;
  for (const altLang of LANGUAGES) {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}/${altLang}/"/>\n`;
  }
  sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en/"/>\n`;
  sitemap += `  </url>\n`;

  // Pricing page URL
  sitemap += `  <url>
    <loc>${DOMAIN}/${lang}/pricing/</loc>
    <lastmod>${TODAY}</lastmod>
`;
  for (const altLang of LANGUAGES) {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}/${altLang}/pricing/"/>\n`;
  }
  sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en/pricing/"/>\n`;
  sitemap += `  </url>\n`;

  // Partners page URL
  sitemap += `  <url>
    <loc>${DOMAIN}/${lang}/partners/</loc>
    <lastmod>${TODAY}</lastmod>
`;
  for (const altLang of LANGUAGES) {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}/${altLang}/partners/"/>\n`;
  }
  sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en/partners/"/>\n`;
  sitemap += `  </url>\n`;

  // Tracking page URL
  sitemap += `  <url>
    <loc>${DOMAIN}/${lang}/tracking/</loc>
    <lastmod>${TODAY}</lastmod>
`;
  for (const altLang of LANGUAGES) {
    sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}/${altLang}/tracking/"/>\n`;
  }
  sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en/tracking/"/>\n`;
  sitemap += `  </url>\n`;
}

sitemap += `</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap, 'utf-8');
console.log('  ✅ sitemap.xml');

// ============================================
// GENERATE ROBOTS.TXT
// ============================================
console.log('🔨 Generating robots.txt...');

const robotsTxt = `User-agent: Googlebot
Allow: /

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
Allow: /seo/

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), robotsTxt, 'utf-8');
console.log('  ✅ robots.txt');

// ============================================
// GENERATE 404 STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (404 pages × 13 languages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18N', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);

  let html = notFoundTemplate;
  for (const [key, value] of Object.entries(flatData)) {
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(regex, value);
  }

  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{dir\}\}/g, lang === 'ar' ? 'rtl' : 'ltr');

  const remainingPlaceholders = html.match(/\{\{[^}]+\}\}/g);
  if (remainingPlaceholders) {
    console.error(`❌ FATAL: Unreplaced placeholders in ${lang}/404:`);
    remainingPlaceholders.forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'public', lang, '404');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');

  console.log(`  ✅ ${lang}/404/index.html`);
}

// Also generate root 404.html (English fallback for non-language paths)
console.log('🔨 Generating root 404.html (English fallback)...');

const enData = JSON.parse(fs.readFileSync(path.join(__dirname, 'i18N', 'en.json'), 'utf-8'));
const enFlat = flatten(enData);
let root404 = notFoundTemplate;
for (const [key, value] of Object.entries(enFlat)) {
  const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
  root404 = root404.replace(regex, value);
}
root404 = root404.replace(/\{\{lang\}\}/g, 'en');
root404 = root404.replace(/\{\{dir\}\}/g, 'ltr');

fs.writeFileSync(path.join(__dirname, '..', 'public', '404.html'), root404, 'utf-8');
console.log('  ✅ 404.html (root fallback)');

// ============================================
// SUMMARY
// ============================================
console.log('');
console.log('✅ Level 0 SEO build complete!');
console.log('   1 Portal page validated (English only, emitted via Vite plugin)');
console.log(`   ${LANGUAGES.length} landing pages generated`);
console.log(`   ${LANGUAGES.length} pricing pages generated`);
console.log(`   ${LANGUAGES.length} partners pages generated`);
console.log(`   ${LANGUAGES.length} tracking pages generated`);
console.log(`   ${LANGUAGES.length} 404 pages generated + root 404.html`);
console.log('   sitemap.xml generated (includes / root URL)');
console.log('   robots.txt generated');
console.log('   All CI validation guards passed');
console.log('   Vocabulary guard passed');
