// Pricing data based on PricingUpdate.txt specification
// All prices in Thai Baht (THB)

export interface PricingItem {
  destination: string;
  hourly?: number;
  period?: number;
  oneWay?: number;
  roundTrip?: number;
  daily?: number;
  monthly?: number;
}

export interface PricingTable {
  title: string;
  subtitle?: string;
  headers: string[];
  items: PricingItem[];
}

export interface VehiclePricing {
  airport: PricingTable[];
  central: PricingTable[];
  east: PricingTable[];
  south: PricingTable[];
  west: PricingTable[];
  north: PricingTable[];
  northeast: PricingTable[];
}

// Car pricing (1-4 passengers)
export const carPricing: VehiclePricing = {
  airport: [
    {
      title: "Airport Transfer",
      subtitle: "Suvarnabhumi & Don Mueang",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "BKK - Bangkok City", oneWay: 1200, roundTrip: 2200, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "BKK - Pattaya", oneWay: 2000, roundTrip: 3800, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "BKK - Hua Hin", oneWay: 3500, roundTrip: 6500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "DMK - Bangkok City", oneWay: 1000, roundTrip: 1800, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "DMK - Pattaya", oneWay: 2200, roundTrip: 4000, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  central: [
    {
      title: "Central Region",
      subtitle: "Bangkok & Vicinity",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Ayutthaya", oneWay: 1800, roundTrip: 3200, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Nakhon Pathom", oneWay: 1500, roundTrip: 2800, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Samut Prakan", oneWay: 800, roundTrip: 1400, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Nonthaburi", oneWay: 600, roundTrip: 1000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Pathum Thani", oneWay: 900, roundTrip: 1600, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  east: [
    {
      title: "Eastern Region",
      subtitle: "Pattaya, Rayong, Chanthaburi",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Pattaya", oneWay: 1800, roundTrip: 3200, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Rayong", oneWay: 2500, roundTrip: 4500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Chanthaburi", oneWay: 3500, roundTrip: 6500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Trat", oneWay: 4500, roundTrip: 8500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Pattaya - Rayong", oneWay: 1200, roundTrip: 2000, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  south: [
    {
      title: "Southern Region",
      subtitle: "Hua Hin, Phuket, Krabi",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Hua Hin", oneWay: 3000, roundTrip: 5500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Chumphon", oneWay: 6000, roundTrip: 11000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Surat Thani", oneWay: 8000, roundTrip: 15000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Phuket", oneWay: 12000, roundTrip: 22000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Krabi", oneWay: 11000, roundTrip: 20000, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  west: [
    {
      title: "Western Region",
      subtitle: "Kanchanaburi, Ratchaburi",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Kanchanaburi", oneWay: 2500, roundTrip: 4500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Ratchaburi", oneWay: 2000, roundTrip: 3600, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Samut Songkhram", oneWay: 1500, roundTrip: 2700, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Phetchaburi", oneWay: 2200, roundTrip: 4000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Prachuap Khiri Khan", oneWay: 3500, roundTrip: 6500, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  north: [
    {
      title: "Northern Region",
      subtitle: "Chiang Mai, Chiang Rai",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Chiang Mai", oneWay: 12000, roundTrip: 22000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Chiang Rai", oneWay: 14000, roundTrip: 26000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Lampang", oneWay: 10000, roundTrip: 18000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Sukhothai", oneWay: 8000, roundTrip: 15000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Phitsanulok", oneWay: 7000, roundTrip: 13000, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
  northeast: [
    {
      title: "Northeastern Region",
      subtitle: "Korat, Khon Kaen, Udon Thani",
      headers: ["Route", "One Way", "Round Trip", "Hourly", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Nakhon Ratchasima", oneWay: 4000, roundTrip: 7500, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Khon Kaen", oneWay: 6500, roundTrip: 12000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Udon Thani", oneWay: 8000, roundTrip: 15000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Ubon Ratchathani", oneWay: 9000, roundTrip: 17000, hourly: 450, daily: 3500, monthly: 65000 },
        { destination: "Bangkok - Nakhon Phanom", oneWay: 10000, roundTrip: 19000, hourly: 450, daily: 3500, monthly: 65000 },
      ],
    },
  ],
};

// Van pricing (5-10 passengers) - prices are higher
export const vanPricing: VehiclePricing = {
  airport: [
    {
      title: "Airport Transfer",
      subtitle: "Suvarnabhumi & Don Mueang",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "BKK - Bangkok City", oneWay: 1800, roundTrip: 3200, daily: 4500, monthly: 85000 },
        { destination: "BKK - Pattaya", oneWay: 2800, roundTrip: 5200, daily: 4500, monthly: 85000 },
        { destination: "BKK - Hua Hin", oneWay: 4500, roundTrip: 8500, daily: 4500, monthly: 85000 },
        { destination: "DMK - Bangkok City", oneWay: 1500, roundTrip: 2700, daily: 4500, monthly: 85000 },
        { destination: "DMK - Pattaya", oneWay: 3000, roundTrip: 5600, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  central: [
    {
      title: "Central Region",
      subtitle: "Bangkok & Vicinity",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Ayutthaya", oneWay: 2500, roundTrip: 4500, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Nakhon Pathom", oneWay: 2200, roundTrip: 4000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Samut Prakan", oneWay: 1200, roundTrip: 2200, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Nonthaburi", oneWay: 1000, roundTrip: 1800, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Pathum Thani", oneWay: 1400, roundTrip: 2500, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  east: [
    {
      title: "Eastern Region",
      subtitle: "Pattaya, Rayong, Chanthaburi",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Pattaya", oneWay: 2500, roundTrip: 4500, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Rayong", oneWay: 3500, roundTrip: 6500, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Chanthaburi", oneWay: 5000, roundTrip: 9000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Trat", oneWay: 6000, roundTrip: 11000, daily: 4500, monthly: 85000 },
        { destination: "Pattaya - Rayong", oneWay: 1800, roundTrip: 3200, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  south: [
    {
      title: "Southern Region",
      subtitle: "Hua Hin, Phuket, Krabi",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Hua Hin", oneWay: 4000, roundTrip: 7500, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Chumphon", oneWay: 8000, roundTrip: 15000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Surat Thani", oneWay: 11000, roundTrip: 20000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Phuket", oneWay: 16000, roundTrip: 30000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Krabi", oneWay: 15000, roundTrip: 28000, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  west: [
    {
      title: "Western Region",
      subtitle: "Kanchanaburi, Ratchaburi",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Kanchanaburi", oneWay: 3500, roundTrip: 6500, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Ratchaburi", oneWay: 2800, roundTrip: 5200, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Samut Songkhram", oneWay: 2200, roundTrip: 4000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Phetchaburi", oneWay: 3200, roundTrip: 6000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Prachuap Khiri Khan", oneWay: 4500, roundTrip: 8500, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  north: [
    {
      title: "Northern Region",
      subtitle: "Chiang Mai, Chiang Rai",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Chiang Mai", oneWay: 16000, roundTrip: 30000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Chiang Rai", oneWay: 18000, roundTrip: 34000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Lampang", oneWay: 14000, roundTrip: 26000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Sukhothai", oneWay: 11000, roundTrip: 20000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Phitsanulok", oneWay: 10000, roundTrip: 18000, daily: 4500, monthly: 85000 },
      ],
    },
  ],
  northeast: [
    {
      title: "Northeastern Region",
      subtitle: "Korat, Khon Kaen, Udon Thani",
      headers: ["Route", "One Way", "Round Trip", "Daily", "Monthly"],
      items: [
        { destination: "Bangkok - Nakhon Ratchasima", oneWay: 5500, roundTrip: 10000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Khon Kaen", oneWay: 9000, roundTrip: 17000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Udon Thani", oneWay: 11000, roundTrip: 20000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Ubon Ratchathani", oneWay: 12000, roundTrip: 22000, daily: 4500, monthly: 85000 },
        { destination: "Bangkok - Nakhon Phanom", oneWay: 13000, roundTrip: 24000, daily: 4500, monthly: 85000 },
      ],
    },
  ],
};

// Bus pricing (11+ passengers) - highest prices
export const busPricing: VehiclePricing = {
  airport: [
    {
      title: "Airport Transfer",
      subtitle: "Suvarnabhumi & Don Mueang",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "BKK - Bangkok City", oneWay: 4500, roundTrip: 8000, daily: 12000 },
        { destination: "BKK - Pattaya", oneWay: 7000, roundTrip: 13000, daily: 12000 },
        { destination: "BKK - Hua Hin", oneWay: 10000, roundTrip: 18000, daily: 12000 },
        { destination: "DMK - Bangkok City", oneWay: 4000, roundTrip: 7500, daily: 12000 },
        { destination: "DMK - Pattaya", oneWay: 7500, roundTrip: 14000, daily: 12000 },
      ],
    },
  ],
  central: [
    {
      title: "Central Region",
      subtitle: "Bangkok & Vicinity",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Ayutthaya", oneWay: 6000, roundTrip: 11000, daily: 12000 },
        { destination: "Bangkok - Nakhon Pathom", oneWay: 5500, roundTrip: 10000, daily: 12000 },
        { destination: "Bangkok - Samut Prakan", oneWay: 3500, roundTrip: 6500, daily: 12000 },
        { destination: "Bangkok - Nonthaburi", oneWay: 3000, roundTrip: 5500, daily: 12000 },
        { destination: "Bangkok - Pathum Thani", oneWay: 4000, roundTrip: 7500, daily: 12000 },
      ],
    },
  ],
  east: [
    {
      title: "Eastern Region",
      subtitle: "Pattaya, Rayong, Chanthaburi",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Pattaya", oneWay: 6500, roundTrip: 12000, daily: 12000 },
        { destination: "Bangkok - Rayong", oneWay: 8500, roundTrip: 16000, daily: 12000 },
        { destination: "Bangkok - Chanthaburi", oneWay: 12000, roundTrip: 22000, daily: 12000 },
        { destination: "Bangkok - Trat", oneWay: 14000, roundTrip: 26000, daily: 12000 },
        { destination: "Pattaya - Rayong", oneWay: 4500, roundTrip: 8500, daily: 12000 },
      ],
    },
  ],
  south: [
    {
      title: "Southern Region",
      subtitle: "Hua Hin, Phuket, Krabi",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Hua Hin", oneWay: 9500, roundTrip: 18000, daily: 12000 },
        { destination: "Bangkok - Chumphon", oneWay: 18000, roundTrip: 34000, daily: 12000 },
        { destination: "Bangkok - Surat Thani", oneWay: 25000, roundTrip: 47000, daily: 12000 },
        { destination: "Bangkok - Phuket", oneWay: 38000, roundTrip: 72000, daily: 12000 },
        { destination: "Bangkok - Krabi", oneWay: 36000, roundTrip: 68000, daily: 12000 },
      ],
    },
  ],
  west: [
    {
      title: "Western Region",
      subtitle: "Kanchanaburi, Ratchaburi",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Kanchanaburi", oneWay: 8500, roundTrip: 16000, daily: 12000 },
        { destination: "Bangkok - Ratchaburi", oneWay: 7000, roundTrip: 13000, daily: 12000 },
        { destination: "Bangkok - Samut Songkhram", oneWay: 5500, roundTrip: 10000, daily: 12000 },
        { destination: "Bangkok - Phetchaburi", oneWay: 8000, roundTrip: 15000, daily: 12000 },
        { destination: "Bangkok - Prachuap Khiri Khan", oneWay: 11000, roundTrip: 20000, daily: 12000 },
      ],
    },
  ],
  north: [
    {
      title: "Northern Region",
      subtitle: "Chiang Mai, Chiang Rai",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Chiang Mai", oneWay: 38000, roundTrip: 72000, daily: 12000 },
        { destination: "Bangkok - Chiang Rai", oneWay: 45000, roundTrip: 85000, daily: 12000 },
        { destination: "Bangkok - Lampang", oneWay: 32000, roundTrip: 60000, daily: 12000 },
        { destination: "Bangkok - Sukhothai", oneWay: 26000, roundTrip: 49000, daily: 12000 },
        { destination: "Bangkok - Phitsanulok", oneWay: 24000, roundTrip: 45000, daily: 12000 },
      ],
    },
  ],
  northeast: [
    {
      title: "Northeastern Region",
      subtitle: "Korat, Khon Kaen, Udon Thani",
      headers: ["Route", "One Way", "Round Trip", "Daily"],
      items: [
        { destination: "Bangkok - Nakhon Ratchasima", oneWay: 14000, roundTrip: 26000, daily: 12000 },
        { destination: "Bangkok - Khon Kaen", oneWay: 22000, roundTrip: 42000, daily: 12000 },
        { destination: "Bangkok - Udon Thani", oneWay: 26000, roundTrip: 49000, daily: 12000 },
        { destination: "Bangkok - Ubon Ratchathani", oneWay: 28000, roundTrip: 53000, daily: 12000 },
        { destination: "Bangkok - Nakhon Phanom", oneWay: 32000, roundTrip: 60000, daily: 12000 },
      ],
    },
  ],
};

// Supported currencies with 4% markup
export const currencies = [
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "TH" },
  { code: "USD", name: "US Dollar", symbol: "$", country: "US" },
  { code: "EUR", name: "Euro", symbol: "€", country: "EU" },
  { code: "GBP", name: "Pound Sterling", symbol: "£", country: "GB" },
  { code: "CNY", name: "Yuan Renminbi", symbol: "¥", country: "CN" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "JP" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "MY" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "ID" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", country: "SG" },
  { code: "BND", name: "Brunei Dollar", symbol: "$", country: "BN" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "AE" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "RU" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", country: "SA" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع", country: "OM" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "IN" },
];

export const vehicleTypes = [
  { id: "car", name: "Car", passengers: "1-4 passengers", icon: "🚗" },
  { id: "van", name: "Van", passengers: "5-10 passengers", icon: "🚐" },
  { id: "bus", name: "Bus", passengers: "11+ passengers", icon: "🚌" },
];

export const regions = [
  { id: "airport", name: "Airport" },
  { id: "central", name: "Central" },
  { id: "east", name: "East" },
  { id: "south", name: "South" },
  { id: "west", name: "West" },
  { id: "north", name: "North" },
  { id: "northeast", name: "Northeast" },
];
