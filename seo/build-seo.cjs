/**
 * SEO Level 0 Static HTML Generator
 * 
 * STRICT RULES:
 * - Pure static HTML only
 * - No React, no JSX, no Vite
 * - No JS execution (except JSON-LD)
 * - Output: public/{lang}/index.html × 13 + sitemap.xml + robots.txt + 404.html
 * 
 * Build order: node seo/build-seo.cjs → vite build
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
      // SPECIAL CASE: German "Saubere" or "saubere" contains "uber" but is not the competitor "Uber"
      if (term === 'uber' && lower.includes('saubere')) {
        continue;
      }
      errors.push(`Forbidden term "${term}" found in ${lang}`);
    }
  }
  for (const term of FORBIDDEN_STANDALONE) {
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
const landingTemplate = fs.readFileSync(landingTemplatePath, 'utf-8');

const pricingTemplatePath = path.join(__dirname, 'Pricing.template.html');
const pricingTemplate = fs.readFileSync(pricingTemplatePath, 'utf-8');

const partnersTemplatePath = path.join(__dirname, 'Partners.template.html');
const partnersTemplate = fs.readFileSync(partnersTemplatePath, 'utf-8');

const trackingTemplatePath = path.join(__dirname, 'Tracking.template.html');
const trackingTemplate = fs.readFileSync(trackingTemplatePath, 'utf-8');

const notFoundTemplatePath = path.join(__dirname, 'NotFound.template.html');
const notFoundTemplate = fs.readFileSync(notFoundTemplatePath, 'utf-8');

// Load pricing data generator
const { generateAllPricingHTML } = require('./pricing-data.cjs');

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
// GENERATE LANDING STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Landing pages)...');

for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18n', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);
  
  let html = landingTemplate;
  for (const [key, value] of Object.entries(flatData)) {
    const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
    html = html.replace(regex, (match, offset) => {
      const before = html.substring(0, offset);
      const inJsonLd = (before.lastIndexOf('<script type="application/ld+json">') > before.lastIndexOf('</script>'));
      return inJsonLd ? escapedValue : value;
    });
  }

  // Inject lang/dir
  html = html.replace(/\{\{lang\}\}/g, lang);
  html = html.replace(/\{\{dir\}\}/g, lang === 'ar' ? 'rtl' : 'ltr');

  // Write output
  const outDir = path.join(__dirname, '..', 'public', lang);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  
  // Validation
  const errors = [];
  if (!html.includes(`href="${DOMAIN}/${lang}/"`)) errors.push(`Missing canonical for ${lang}`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errors.push(`Expected 1 <h1> in ${lang}`);
  if (lang === 'ar') {
    if (!html.includes('dir="rtl"')) errors.push(`Arabic ${lang} missing dir="rtl"`);
  } else {
    if (!html.includes('dir="ltr"')) errors.push(`Non-Arabic ${lang} missing dir="ltr"`);
  }
  const vocabErrors = vocabularyCheck(html, `${lang} (HTML)`);
  if (vocabErrors.length > 0) errors.push(...vocabErrors);

  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}:`, errors);
    process.exit(1);
  }
  console.log(`  ✅ ${lang}/index.html (landing)`);
}

// ============================================
// GENERATE PRICING STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Pricing pages)...');
for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18n', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);
  const pricingTablesHTML = generateAllPricingHTML(lang);
  let html = pricingTemplate.replace(/\{\{pricing_tables\}\}/g, pricingTablesHTML);

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

  const outDir = path.join(__dirname, '..', 'public', lang, 'pricing');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');

  const errors = [];
  if (lang === 'ar') {
    if (!html.includes('dir="rtl"')) errors.push(`Arabic pricing missing dir="rtl"`);
  } else {
    if (!html.includes('dir="ltr"')) errors.push(`Non-Arabic pricing missing dir="ltr"`);
  }
  if (!html.includes('<table>')) errors.push(`No pricing tables in ${lang}`);
  if (errors.length > 0) {
    console.error(`❌ Validation failed for ${lang}/pricing:`, errors);
    process.exit(1);
  }
  console.log(`  ✅ ${lang}/pricing/index.html`);
}

// ============================================
// GENERATE PARTNERS STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Partners pages)...');
for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18n', `${lang}.json`);
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
  const outDir = path.join(__dirname, '..', 'public', lang, 'partners');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`  ✅ ${lang}/partners/index.html`);
}

// ============================================
// GENERATE TRACKING STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (Tracking pages)...');
for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18n', `${lang}.json`);
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
  const outDir = path.join(__dirname, '..', 'public', lang, 'tracking');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`  ✅ ${lang}/tracking/index.html`);
}

// ============================================
// GENERATE 404 STATIC HTML × 13
// ============================================
console.log('🔨 Generating Level 0 static HTML (404 pages)...');
for (const lang of LANGUAGES) {
  const i18nPath = path.join(__dirname, 'i18n', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(i18nPath, 'utf-8'));
  const flatData = flatten(data);
  let html = notFoundTemplate;
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
  const outDir = path.join(__dirname, '..', 'public', lang, '404');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`  ✅ ${lang}/404/index.html`);
}

// ============================================
// GENERATE sitemap.xml
// 1 portal + 13 langs × 4 page types = 53 URLs
// Includes xhtml:link hreflang alternates per URL
// NOTE: Update SITEMAP_LASTMOD when content changes
// ============================================
console.log('🔨 Generating sitemap.xml...');

const SITEMAP_LASTMOD = '2026-01-03';
// DOMAIN already declared at top of file: const DOMAIN = 'https://ibbservice.com'

const sitemapPageTypes = [
  { subpath: '',          changefreq: 'weekly',  priority: '0.9' },
  { subpath: 'pricing/',  changefreq: 'weekly',  priority: '0.8' },
  { subpath: 'partners/', changefreq: 'monthly', priority: '0.7' },
  { subpath: 'tracking/', changefreq: 'monthly', priority: '0.6' },
];

function hreflangLinks(subpath) {
  return LANGUAGES.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}/${l}/${subpath}"/>`
  ).join('\n') + '\n' +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en/${subpath}"/>`;
}

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n';

sitemap += '  <!-- Portal: root URL -->\n';
sitemap += '  <url>\n';
sitemap += `    <loc>${DOMAIN}/</loc>\n`;
sitemap += `    <lastmod>${SITEMAP_LASTMOD}</lastmod>\n`;
sitemap += '    <changefreq>monthly</changefreq>\n';
sitemap += '    <priority>1.0</priority>\n';
sitemap += '  </url>\n\n';

for (const { subpath, changefreq, priority } of sitemapPageTypes) {
  const label = subpath || 'landing/';
  sitemap += `  <!-- ${label}: 13 languages -->\n`;
  for (const lang of LANGUAGES) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${DOMAIN}/${lang}/${subpath}</loc>\n`;
    sitemap += `    <lastmod>${SITEMAP_LASTMOD}</lastmod>\n`;
    sitemap += `    <changefreq>${changefreq}</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += hreflangLinks(subpath) + '\n';
    sitemap += '  </url>\n';
  }
  sitemap += '\n';
}

sitemap += '</urlset>\n';

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap, 'utf-8');
const urlCount = (sitemap.match(/<loc>/g) || []).length;
console.log(`  ✅ sitemap.xml (${urlCount} URLs)`);

console.log('✅ SEO Level 0 Generation Complete!');
