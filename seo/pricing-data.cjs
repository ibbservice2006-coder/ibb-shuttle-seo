/**
 * Pricing data for Level 0 SEO static HTML generation
 * CommonJS module (required by build-seo.js)
 * Source of truth: src/data/pricingDataComplete.ts
 */

const allTables = [
  {
    id: "airport", title: { en: "Airport Transfer", th: "รับส่งสนามบิน", zh: "机场接送" },
    car: [
      { distance: "26 km", destination: "Bangkok - Don Mueang Airport", standard: 1100, executive: 1300, family: 1300, electric: 1300, premium: 3500, luxury: 5000 },
      { distance: "32 km", destination: "Bangkok - Suvarnabhumi Airport", standard: 1100, executive: 1300, family: 1300, electric: 1300, premium: 3500, luxury: 5000 },
      { distance: "178 km", destination: "Bangkok - Utapao Airport", standard: 3000, executive: 3300, family: 3300, electric: 3300, premium: 15000, luxury: 16500 },
    ],
    van: [
      { distance: "26 km", destination: "Bangkok - Don Mueang Airport", standard: 1400, executive: 1600, family: 3500, electric: 10000 },
      { distance: "32 km", destination: "Bangkok - Suvarnabhumi Airport", standard: 1400, executive: 1600, family: 3500, electric: 10000 },
      { distance: "178 km", destination: "Bangkok - Utapao Airport", standard: 3800, executive: 4000, family: 15000, electric: "N/A" },
    ],
    bus: [
      { distance: "26 km", destination: "Bangkok - Don Mueang Airport", standard: 6000, executive: 10000, family: 14000 },
      { distance: "32 km", destination: "Bangkok - Suvarnabhumi Airport", standard: 6000, executive: 10000, family: 14000 },
      { distance: "178 km", destination: "Bangkok - Utapao Airport", standard: "N/A", executive: 25000, family: 28000 },
    ],
  },
  {
    id: "central", title: { en: "Central Region", th: "ภาคกลาง", zh: "中部地区" },
    car: [
      { distance: "35 km", destination: "Bangkok - Nonthaburi", standard: 1100, executive: 1300, family: 1300, electric: 1300, premium: "N/A", luxury: "N/A" },
      { distance: "45 km", destination: "Bangkok - Pathum Thani", standard: 1500, executive: 1500, family: 1500, electric: 1500, premium: "N/A", luxury: "N/A" },
      { distance: "51 km", destination: "Bangkok - Samut Prakan", standard: 1700, executive: 1800, family: 1800, electric: 2000, premium: "N/A", luxury: "N/A" },
      { distance: "59 km", destination: "Bangkok - Samut Sakhon", standard: 1800, executive: 2100, family: 2100, electric: 2100, premium: "N/A", luxury: "N/A" },
      { distance: "69 km", destination: "Bangkok - Nakhon Pathom", standard: 2200, executive: 2500, family: 2500, electric: 2500, premium: 9500, luxury: 10900 },
      { distance: "78 km", destination: "Bangkok - Chachoengsao", standard: 2300, executive: 2600, family: 2600, electric: 2600, premium: "N/A", luxury: "N/A" },
    ],
    van: [
      { distance: "35 km", destination: "Bangkok - Nonthaburi", standard: 1400, executive: 1600, family: "N/A", electric: 18000 },
      { distance: "45 km", destination: "Bangkok - Pathum Thani", standard: 2200, executive: 2400, family: "N/A", electric: "N/A" },
      { distance: "51 km", destination: "Bangkok - Samut Prakan", standard: 2200, executive: 2400, family: "N/A", electric: "N/A" },
      { distance: "59 km", destination: "Bangkok - Samut Sakhon", standard: 2400, executive: 2600, family: "N/A", electric: "N/A" },
      { distance: "69 km", destination: "Bangkok - Nakhon Pathom", standard: 2800, executive: 3000, family: 12300, electric: "N/A" },
      { distance: "78 km", destination: "Bangkok - Chachoengsao", standard: 2800, executive: 3000, family: 12000, electric: "N/A" },
    ],
    bus: [
      { distance: "35 km", destination: "Bangkok - Nonthaburi", standard: "N/A", executive: 12000, family: 14000 },
      { distance: "45 km", destination: "Bangkok - Pathum Thani", standard: "N/A", executive: 13000, family: 15000 },
      { distance: "51 km", destination: "Bangkok - Samut Prakan", standard: "N/A", executive: 12000, family: 14000 },
      { distance: "59 km", destination: "Bangkok - Samut Sakhon", standard: "N/A", executive: "N/A", family: "N/A" },
      { distance: "69 km", destination: "Bangkok - Nakhon Pathom", standard: "N/A", executive: 16000, family: "N/A" },
      { distance: "78 km", destination: "Bangkok - Chachoengsao", standard: 12000, executive: 19000, family: 23000 },
    ],
  },
  {
    id: "east", title: { en: "East of Thailand", th: "ภาคตะวันออก", zh: "泰国东部" },
    car: [
      { distance: "100 km", destination: "Bangkok - Bangsean", standard: 2100, executive: 2400, family: 2400, electric: 2400, premium: "N/A", luxury: "N/A" },
      { distance: "150 km", destination: "Bangkok - Pattaya", standard: 2600, executive: 2850, family: 2850, electric: 2850, premium: 10000, luxury: 12500 },
      { distance: "220 km", destination: "Bangkok - Rayong", standard: 3200, executive: 3500, family: 3500, electric: 3500, premium: 15000, luxury: 16500 },
      { distance: "275 km", destination: "Bangkok - Chanthaburi", standard: 3800, executive: 4000, family: 4000, electric: 4000, premium: "N/A", luxury: "N/A" },
      { distance: "400 km", destination: "Bangkok - Trat", standard: 5300, executive: 5500, family: 5500, electric: 5500, premium: 22000, luxury: 24000 },
      { distance: "450 km", destination: "Bangkok - Koh Chang", standard: 6000, executive: 6500, family: 6500, electric: 6500, premium: "N/A", luxury: "N/A" },
    ],
    van: [
      { distance: "100 km", destination: "Bangkok - Bangsean", standard: 2600, executive: 2800, family: "N/A", electric: "N/A" },
      { distance: "150 km", destination: "Bangkok - Pattaya", standard: 3600, executive: 3800, family: 10000, electric: 22000 },
      { distance: "220 km", destination: "Bangkok - Rayong", standard: 3800, executive: 4000, family: 15000, electric: 28000 },
      { distance: "275 km", destination: "Bangkok - Chanthaburi", standard: 4300, executive: 4500, family: 13000, electric: 33000 },
      { distance: "400 km", destination: "Bangkok - Trat", standard: 6800, executive: 7000, family: 22000, electric: 30000 },
      { distance: "450 km", destination: "Bangkok - Koh Chang", standard: 7800, executive: 8000, family: 16000, electric: "N/A" },
    ],
    bus: [
      { distance: "100 km", destination: "Bangkok - Bangsean", standard: 12000, executive: 20000, family: 24000 },
      { distance: "150 km", destination: "Bangkok - Pattaya", standard: 14000, executive: 23000, family: 25000 },
      { distance: "220 km", destination: "Bangkok - Rayong", standard: 16000, executive: 27000, family: 30000 },
      { distance: "275 km", destination: "Bangkok - Chanthaburi", standard: 16000, executive: 27000, family: 30000 },
      { distance: "400 km", destination: "Bangkok - Trat", standard: 18000, executive: 30000, family: 33000 },
      { distance: "450 km", destination: "Bangkok - Koh Chang", standard: "N/A", executive: "N/A", family: "N/A" },
    ],
  },
  {
    id: "south", title: { en: "South of Thailand", th: "ภาคใต้", zh: "泰国南部" },
    car: [
      { distance: "220 km", destination: "Bangkok - Hua Hin", standard: 3500, executive: 3800, family: 3800, electric: 3800, premium: 13000, luxury: 15000 },
      { distance: "380 km", destination: "Bangkok - Bang Saphan", standard: 5300, executive: 5500, family: 5500, electric: 5500, premium: 17000, luxury: "N/A" },
      { distance: "500 km", destination: "Bangkok - Chumphon", standard: 6500, executive: 7200, family: 7200, electric: 7200, premium: 25000, luxury: "N/A" },
      { distance: "867 km", destination: "Bangkok - Phuket", standard: 12500, executive: 14500, family: 14500, electric: 14500, premium: 40000, luxury: "N/A" },
      { distance: "946 km", destination: "Bangkok - Krabi", standard: 14500, executive: 15500, family: 15500, electric: 15500, premium: "N/A", luxury: "N/A" },
    ],
    van: [
      { distance: "220 km", destination: "Bangkok - Hua Hin", standard: 4300, executive: 4500, family: 13000, electric: 33000 },
      { distance: "380 km", destination: "Bangkok - Bang Saphan", standard: 6300, executive: 6500, family: 26000, electric: 35000 },
      { distance: "500 km", destination: "Bangkok - Chumphon", standard: 8600, executive: 8800, family: 25000, electric: "N/A" },
      { distance: "867 km", destination: "Bangkok - Phuket", standard: 17300, executive: 17500, family: 40000, electric: 109000 },
      { distance: "946 km", destination: "Bangkok - Krabi", standard: 18300, executive: 18500, family: "N/A", electric: "N/A" },
    ],
    bus: [
      { distance: "220 km", destination: "Bangkok - Hua Hin", standard: 14000, executive: 23000, family: 25000 },
      { distance: "500 km", destination: "Bangkok - Chumphon", standard: 24000, executive: 40000, family: "N/A" },
      { distance: "867 km", destination: "Bangkok - Phuket", standard: "N/A", executive: 73000, family: 75000 },
      { distance: "946 km", destination: "Bangkok - Krabi", standard: "N/A", executive: 52000, family: "N/A" },
    ],
  },
  {
    id: "west", title: { en: "West of Thailand", th: "ภาคตะวันตก", zh: "泰国西部" },
    car: [
      { distance: "130 km", destination: "Bangkok - Kanchanaburi", standard: 3200, executive: 3500, family: 3500, electric: 3500, premium: 11500, luxury: 14000 },
      { distance: "165 km", destination: "Bangkok - Ratchaburi", standard: 2800, executive: 3100, family: 3100, electric: 3100, premium: "N/A", luxury: "N/A" },
      { distance: "235 km", destination: "Bangkok - Sai Yok", standard: 3900, executive: 4200, family: 4200, electric: 4200, premium: "N/A", luxury: "N/A" },
      { distance: "380 km", destination: "Bangkok - Sangkhla Buri", standard: 6500, executive: 7200, family: 7200, electric: 7200, premium: "N/A", luxury: "N/A" },
    ],
    van: [
      { distance: "130 km", destination: "Bangkok - Kanchanaburi", standard: 4200, executive: 4400, family: 11500, electric: 22000 },
      { distance: "165 km", destination: "Bangkok - Ratchaburi", standard: 3600, executive: 3800, family: "N/A", electric: "N/A" },
      { distance: "235 km", destination: "Bangkok - Sai Yok", standard: 5600, executive: 5800, family: "N/A", electric: "N/A" },
      { distance: "380 km", destination: "Bangkok - Sangkhla Buri", standard: 7800, executive: 8000, family: "N/A", electric: "N/A" },
    ],
    bus: [
      { distance: "130 km", destination: "Bangkok - Kanchanaburi", standard: 15000, executive: 25000, family: "N/A" },
      { distance: "165 km", destination: "Bangkok - Ratchaburi", standard: "N/A", executive: 20000, family: "N/A" },
    ],
  },
  {
    id: "north", title: { en: "North of Thailand", th: "ภาคเหนือ", zh: "泰国北部" },
    car: [
      { distance: "76 km", destination: "Bangkok - Ayutthaya", standard: 2300, executive: 2500, family: 2500, electric: 2500, premium: 8750, luxury: 10000 },
      { distance: "400 km", destination: "Bangkok - Phitsanulok", standard: 6300, executive: 7000, family: 7000, electric: 7000, premium: 17000, luxury: "N/A" },
      { distance: "500 km", destination: "Bangkok - Sukhothai", standard: 7500, executive: 8000, family: 8000, electric: 8000, premium: "N/A", luxury: "N/A" },
      { distance: "695 km", destination: "Bangkok - Chiang Mai", standard: 12500, executive: 15000, family: 15000, electric: 15000, premium: 34000, luxury: "N/A" },
      { distance: "820 km", destination: "Bangkok - Chiang Rai", standard: 14500, executive: 16500, family: 16500, electric: 16500, premium: "N/A", luxury: "N/A" },
    ],
    van: [
      { distance: "76 km", destination: "Bangkok - Ayutthaya", standard: 2900, executive: 3100, family: 10000, electric: "N/A" },
      { distance: "400 km", destination: "Bangkok - Phitsanulok", standard: 7800, executive: 8000, family: 17000, electric: 35000 },
      { distance: "695 km", destination: "Bangkok - Chiang Mai", standard: 18300, executive: 18500, family: 34000, electric: 52000 },
      { distance: "820 km", destination: "Bangkok - Chiang Rai", standard: 20300, executive: 20500, family: "N/A", electric: "N/A" },
    ],
    bus: [
      { distance: "76 km", destination: "Bangkok - Ayutthaya", standard: 10000, executive: 16000, family: 20000 },
      { distance: "695 km", destination: "Bangkok - Chiang Mai", standard: 32000, executive: 52000, family: "N/A" },
    ],
  },
  {
    id: "northeast", title: { en: "Northeast of Thailand", th: "ภาคตะวันออกเฉียงเหนือ", zh: "泰国东北部" },
    car: [
      { distance: "165 km", destination: "Bangkok - Khao Yai", standard: 3500, executive: 3800, family: 3800, electric: 3800, premium: 10500, luxury: 15000 },
      { distance: "299 km", destination: "Bangkok - Nakhon Ratchasima", standard: 3800, executive: 4000, family: 4000, electric: 4000, premium: 11500, luxury: "N/A" },
    ],
    van: [
      { distance: "165 km", destination: "Bangkok - Khao Yai", standard: 4200, executive: 4400, family: 10500, electric: 19500 },
      { distance: "299 km", destination: "Bangkok - Nakhon Ratchasima", standard: 4600, executive: 4800, family: 11500, electric: 28000 },
    ],
    bus: [
      { distance: "165 km", destination: "Bangkok - Khao Yai", standard: 14000, executive: 23000, family: "N/A" },
      { distance: "299 km", destination: "Bangkok - Nakhon Ratchasima", standard: "N/A", executive: 25000, family: "N/A" },
    ],
  },
  {
    id: "hourly", title: { en: "Hourly Rental", th: "รายชั่วโมง", zh: "按小时租车" },
    car: [
      { distance: "4 Hrs", destination: "04 Hours (Max 250 Km.)", standard: 2200, executive: 2600, family: 2600, electric: 2600, premium: 7500, luxury: 10000 },
      { distance: "6 Hrs", destination: "06 Hours (Max 300 Km.)", standard: 3300, executive: 3900, family: 3900, electric: 3900, premium: 9000, luxury: 15000 },
      { distance: "8 Hrs", destination: "08 Hours (Max 350 Km.)", standard: 4200, executive: 5000, family: 5000, electric: 5000, premium: 12000, luxury: 20000 },
      { distance: "10 Hrs", destination: "10 Hours (Max 400 Km.)", standard: 5250, executive: 6250, family: 6250, electric: 6250, premium: 15000, luxury: 25000 },
    ],
    van: [
      { distance: "4 Hrs", destination: "04 Hours (Max 250 Km.)", standard: 3200, executive: 3400, family: 7500, electric: 10000 },
      { distance: "6 Hrs", destination: "06 Hours (Max 300 Km.)", standard: 4600, executive: 4800, family: 9000, electric: 16000 },
      { distance: "8 Hrs", destination: "08 Hours (Max 350 Km.)", standard: 5800, executive: 6000, family: 12000, electric: 20000 },
      { distance: "10 Hrs", destination: "10 Hours (Max 400 Km.)", standard: 7300, executive: 7500, family: 15000, electric: 24000 },
    ],
    bus: [
      { distance: "4 Hrs", destination: "04 Hours (Max 250 Km.)", standard: 12000, executive: 20000, family: 28000 },
      { distance: "6 Hrs", destination: "06 Hours (Max 300 Km.)", standard: 18000, executive: 30000, family: 38000 },
      { distance: "8 Hrs", destination: "08 Hours (Max 350 Km.)", standard: 21000, executive: 35000, family: 50000 },
      { distance: "10 Hrs", destination: "10 Hours (Max 400 Km.)", standard: 27000, executive: 45000, family: 65000 },
    ],
  },
  {
    id: "period", title: { en: "Period Rental", th: "รายวัน/สัปดาห์/เดือน", zh: "按天/周/月租车" },
    car: [
      { distance: "1 Day", destination: "01 Day (Max 350 Km./Day)", standard: 4200, executive: 5000, family: 5000, electric: 5000, premium: 12000, luxury: 20000 },
      { distance: "7 Days", destination: "07 Days (Max 350 Km./Day)", standard: 25000, executive: 30000, family: 30000, electric: 30000, premium: 84000, luxury: 140000 },
      { distance: "15 Days", destination: "15 Days (Max 350 Km./Day)", standard: 50000, executive: 60000, family: 60000, electric: 60000, premium: 180000, luxury: 300000 },
      { distance: "30 Days", destination: "30 Days (Max 350 Km./Day)", standard: 85000, executive: 100000, family: 100000, electric: 100000, premium: 350000, luxury: 600000 },
    ],
    van: [
      { distance: "1 Day", destination: "01 Day (Max 350 Km./Day)", standard: 5800, executive: 6000, family: 12000, electric: 20000 },
      { distance: "7 Days", destination: "07 Days (Max 350 Km./Day)", standard: 39800, executive: 40000, family: 84000, electric: "N/A" },
      { distance: "15 Days", destination: "15 Days (Max 350 Km./Day)", standard: 84800, executive: 85000, family: 180000, electric: "N/A" },
      { distance: "30 Days", destination: "30 Days (Max 350 Km./Day)", standard: 149800, executive: 150000, family: 350000, electric: "N/A" },
    ],
    bus: [
      { distance: "1 Day", destination: "01 Day (Max 350 Km./Day)", standard: 21000, executive: 35000, family: 50000 },
      { distance: "7 Days", destination: "07 Days (Max 350 Km./Day)", standard: "N/A", executive: "N/A", family: "N/A" },
    ],
  },
];

function formatTHB(val) {
  if (val === "N/A" || typeof val === "string") return "N/A";
  return "฿" + val.toLocaleString("en-US");
}

function generateCarTable(rows, regionTitle) {
  let html = `<h3>${regionTitle} — Car &amp; SUV / Limousine</h3>\n<table><thead><tr>`;
  html += '<th>Distance</th><th>Destination</th><th>Standard</th><th>Executive</th><th>Family</th><th>Electric</th><th>Premium</th><th>Luxury</th>';
  html += '</tr></thead><tbody>\n';
  for (const r of rows) {
    html += `<tr><td>${r.distance}</td><td>${r.destination}</td><td>${formatTHB(r.standard)}</td><td>${formatTHB(r.executive)}</td><td>${formatTHB(r.family)}</td><td>${formatTHB(r.electric)}</td><td>${formatTHB(r.premium || "N/A")}</td><td>${formatTHB(r.luxury || "N/A")}</td></tr>\n`;
  }
  html += '</tbody></table>\n';
  return html;
}

function generateVanTable(rows, regionTitle) {
  let html = `<h3>${regionTitle} — MPV / Van</h3>\n<table><thead><tr>`;
  html += '<th>Distance</th><th>Destination</th><th>Standard</th><th>Executive</th><th>Premium</th><th>Luxury</th>';
  html += '</tr></thead><tbody>\n';
  for (const r of rows) {
    html += `<tr><td>${r.distance}</td><td>${r.destination}</td><td>${formatTHB(r.standard)}</td><td>${formatTHB(r.executive)}</td><td>${formatTHB(r.family)}</td><td>${formatTHB(r.electric)}</td></tr>\n`;
  }
  html += '</tbody></table>\n';
  return html;
}

function generateBusTable(rows, regionTitle) {
  let html = `<h3>${regionTitle} — BUS / Coach</h3>\n<table><thead><tr>`;
  html += '<th>Distance</th><th>Destination</th><th>Minibus</th><th>Mid-sized</th><th>Group Bus</th>';
  html += '</tr></thead><tbody>\n';
  for (const r of rows) {
    html += `<tr><td>${r.distance}</td><td>${r.destination}</td><td>${formatTHB(r.standard)}</td><td>${formatTHB(r.executive)}</td><td>${formatTHB(r.family)}</td></tr>\n`;
  }
  html += '</tbody></table>\n';
  return html;
}

function generateAllPricingHTML(lang) {
  const l = (lang === 'th' || lang === 'zh') ? lang : 'en';
  let html = '';
  for (const section of allTables) {
    const title = section.title[l] || section.title.en;
    html += `<div class="pricing-section">\n<h2 class="region-title">${title}</h2>\n`;
    if (section.car.length > 0) html += generateCarTable(section.car, title);
    if (section.van.length > 0) html += generateVanTable(section.van, title);
    if (section.bus.length > 0) html += generateBusTable(section.bus, title);
    html += '</div>\n';
  }
  return html;
}

module.exports = { allTables, generateAllPricingHTML };
