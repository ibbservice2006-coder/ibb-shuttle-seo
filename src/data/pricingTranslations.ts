// Pricing page translations for destinations, regions, and vehicle labels
// Supports: EN (English), TH (Thai), ZH (Chinese)

export type PricingLanguage = 'en' | 'th' | 'zh';

// Region translations
export const regionTranslations: Record<string, Record<PricingLanguage, string>> = {
  airport: {
    en: "Airport Transfer",
    th: "รับส่งสนามบิน",
    zh: "机场接送",
  },
  central: {
    en: "Central Region",
    th: "ภาคกลาง",
    zh: "中部地区",
  },
  east: {
    en: "The East of Thailand",
    th: "ภาคตะวันออก",
    zh: "泰国东部",
  },
  south: {
    en: "The South of Thailand",
    th: "ภาคใต้",
    zh: "泰国南部",
  },
  west: {
    en: "The West of Thailand",
    th: "ภาคตะวันตก",
    zh: "泰国西部",
  },
  north: {
    en: "The North of Thailand",
    th: "ภาคเหนือ",
    zh: "泰国北部",
  },
  northeast: {
    en: "The Northeast of Thailand",
    th: "ภาคตะวันออกเฉียงเหนือ",
    zh: "泰国东北部",
  },
  hourly: {
    en: "Hourly",
    th: "รายชั่วโมง",
    zh: "按小时",
  },
  period: {
    en: "Period",
    th: "รายวัน/สัปดาห์/เดือน",
    zh: "按天/周/月",
  },
};

// Vehicle category translations for accordion
export const vehicleCategoryTranslations: Record<string, Record<PricingLanguage, string>> = {
  "Car & SUV": {
    en: "Car & SUV",
    th: "รถยนต์และ SUV",
    zh: "轿车和SUV",
  },
  "Limousine": {
    en: "Limousine",
    th: "รถลีมูซีน",
    zh: "豪华轿车",
  },
  "MPV/Van": {
    en: "MPV/Van",
    th: "รถตู้/แวน",
    zh: "商务车/面包车",
  },
  "BUS/Coach": {
    en: "BUS/Coach",
    th: "รถบัส/โค้ช",
    zh: "巴士/大巴",
  },
};

// Vehicle label translations for accordion
export const vehicleLabelTranslations: Record<string, Record<PricingLanguage, string>> = {
  Standard: {
    en: "Standard",
    th: "มาตรฐาน",
    zh: "标准型",
  },
  Executive: {
    en: "Executive",
    th: "เอ็กเซ็กคิวทีฟ",
    zh: "行政型",
  },
  Family: {
    en: "Family",
    th: "ครอบครัว",
    zh: "家庭型",
  },
  Electric: {
    en: "Electric",
    th: "รถไฟฟ้า",
    zh: "电动车",
  },
  Premium: {
    en: "Premium",
    th: "พรีเมียม",
    zh: "高级型",
  },
  Luxury: {
    en: "Luxury",
    th: "ลักชูรี่",
    zh: "豪华型",
  },
  Minibus: {
    en: "Minibus",
    th: "มินิบัส",
    zh: "小型巴士",
  },
  "Mid-sized": {
    en: "Mid-sized",
    th: "ขนาดกลาง",
    zh: "中型巴士",
  },
  "Group Bus": {
    en: "Group Bus",
    th: "รถบัสกลุ่ม",
    zh: "团体巴士",
  },
};

// Destination translations (key is the English destination)
export const destinationTranslations: Record<string, Record<PricingLanguage, string>> = {
  // Airport
  "Bangkok - Don Mueang Airport": {
    en: "Bangkok - Don Mueang Airport",
    th: "กรุงเทพฯ - สนามบินดอนเมือง",
    zh: "曼谷 - 廊曼机场",
  },
  "Bangkok - Suvarnabhumi Airport": {
    en: "Bangkok - Suvarnabhumi Airport",
    th: "กรุงเทพฯ - สนามบินสุวรรณภูมิ",
    zh: "曼谷 - 素万那普机场",
  },
  "Bangkok - Utapao Airport": {
    en: "Bangkok - Utapao Airport",
    th: "กรุงเทพฯ - สนามบินอู่ตะเภา",
    zh: "曼谷 - 乌塔堡机场",
  },
  
  // Central Region
  "Bangkok - Nonthaburi": {
    en: "Bangkok - Nonthaburi",
    th: "กรุงเทพฯ - นนทบุรี",
    zh: "曼谷 - 暖武里",
  },
  "Bangkok - Pathum Thani": {
    en: "Bangkok - Pathum Thani",
    th: "กรุงเทพฯ - ปทุมธานี",
    zh: "曼谷 - 巴吞他尼",
  },
  "Bangkok - Samut Prakan": {
    en: "Bangkok - Samut Prakan",
    th: "กรุงเทพฯ - สมุทรปราการ",
    zh: "曼谷 - 北榄",
  },
  "Bangkok - Samut Sakhon": {
    en: "Bangkok - Samut Sakhon",
    th: "กรุงเทพฯ - สมุทรสาคร",
    zh: "曼谷 - 龙仔厝",
  },
  "Bangkok - Nakhon Pathom": {
    en: "Bangkok - Nakhon Pathom",
    th: "กรุงเทพฯ - นครปฐม",
    zh: "曼谷 - 佛统",
  },
  "Bangkok - Chachoengsao": {
    en: "Bangkok - Chachoengsao",
    th: "กรุงเทพฯ - ฉะเชิงเทรา",
    zh: "曼谷 - 北柳",
  },

  // East Region
  "Bangkok - Bangsean": {
    en: "Bangkok - Bangsean",
    th: "กรุงเทพฯ - บางแสน",
    zh: "曼谷 - 邦盛",
  },
  "Bangkok - Chon Buri": {
    en: "Bangkok - Chon Buri",
    th: "กรุงเทพฯ - ชลบุรี",
    zh: "曼谷 - 春武里",
  },
  "Bangkok - Pattaya": {
    en: "Bangkok - Pattaya",
    th: "กรุงเทพฯ - พัทยา",
    zh: "曼谷 - 芭提雅",
  },
  "Bangkok - Laem Chabang": {
    en: "Bangkok - Laem Chabang",
    th: "กรุงเทพฯ - แหลมฉบัง",
    zh: "曼谷 - 林查班",
  },
  "Bangkok - Sathahip": {
    en: "Bangkok - Sathahip",
    th: "กรุงเทพฯ - สัตหีบ",
    zh: "曼谷 - 梭桃邑",
  },
  "Bangkok - Rayong": {
    en: "Bangkok - Rayong",
    th: "กรุงเทพฯ - ระยอง",
    zh: "曼谷 - 罗勇",
  },
  "Bangkok - Ban Phae Pier": {
    en: "Bangkok - Ban Phae Pier",
    th: "กรุงเทพฯ - ท่าเรือบ้านเพ",
    zh: "曼谷 - 班佩码头",
  },
  "Bangkok - Chanthaburi": {
    en: "Bangkok - Chanthaburi",
    th: "กรุงเทพฯ - จันทบุรี",
    zh: "曼谷 - 尖竹汶",
  },
  "Bangkok - Aranyaprathet": {
    en: "Bangkok - Aranyaprathet",
    th: "กรุงเทพฯ - อรัญประเทศ",
    zh: "曼谷 - 亚兰",
  },
  "Bangkok - Sa Kaeo": {
    en: "Bangkok - Sa Kaeo",
    th: "กรุงเทพฯ - สระแก้ว",
    zh: "曼谷 - 沙缴",
  },
  "Bangkok - Trat": {
    en: "Bangkok - Trat",
    th: "กรุงเทพฯ - ตราด",
    zh: "曼谷 - 达叻",
  },
  "Bangkok - Hat Lek": {
    en: "Bangkok - Hat Lek",
    th: "กรุงเทพฯ - หาดเล็ก",
    zh: "曼谷 - 哈雷",
  },
  "Bangkok - Koh Chang": {
    en: "Bangkok - Koh Chang",
    th: "กรุงเทพฯ - เกาะช้าง",
    zh: "曼谷 - 象岛",
  },

  // South Region
  "Bangkok - Samut Songkhram": {
    en: "Bangkok - Samut Songkhram",
    th: "กรุงเทพฯ - สมุทรสงคราม",
    zh: "曼谷 - 夜功",
  },
  "Bangkok - Cha-Am": {
    en: "Bangkok - Cha-Am",
    th: "กรุงเทพฯ - ชะอำ",
    zh: "曼谷 - 七岩",
  },
  "Bangkok - Hua Hin": {
    en: "Bangkok - Hua Hin",
    th: "กรุงเทพฯ - หัวหิน",
    zh: "曼谷 - 华欣",
  },
  "Bangkok - Pranburi": {
    en: "Bangkok - Pranburi",
    th: "กรุงเทพฯ - ปราณบุรี",
    zh: "曼谷 - 巴蜀",
  },
  "Bangkok - Kui Buri": {
    en: "Bangkok - Kui Buri",
    th: "กรุงเทพฯ - กุยบุรี",
    zh: "曼谷 - 奎武里",
  },
  "Bangkok - Sam Roi Yot": {
    en: "Bangkok - Sam Roi Yot",
    th: "กรุงเทพฯ - สามร้อยยอด",
    zh: "曼谷 - 三百峰",
  },
  "Bangkok - Bang Saphan": {
    en: "Bangkok - Bang Saphan",
    th: "กรุงเทพฯ - บางสะพาน",
    zh: "曼谷 - 邦萨潘",
  },
  "Bangkok - Chumphon": {
    en: "Bangkok - Chumphon",
    th: "กรุงเทพฯ - ชุมพร",
    zh: "曼谷 - 春蓬",
  },
  "Bangkok - Phuket": {
    en: "Bangkok - Phuket",
    th: "กรุงเทพฯ - ภูเก็ต",
    zh: "曼谷 - 普吉",
  },
  "Bangkok - Don Sak": {
    en: "Bangkok - Don Sak",
    th: "กรุงเทพฯ - ดอนสัก",
    zh: "曼谷 - 东萨",
  },
  "Bangkok - Surat Thani": {
    en: "Bangkok - Surat Thani",
    th: "กรุงเทพฯ - สุราษฎร์ธานี",
    zh: "曼谷 - 素叻他尼",
  },
  "Bangkok - Krabi": {
    en: "Bangkok - Krabi",
    th: "กรุงเทพฯ - กระบี่",
    zh: "曼谷 - 甲米",
  },

  // West Region
  "Bangkok - Ratchaburi": {
    en: "Bangkok - Ratchaburi",
    th: "กรุงเทพฯ - ราชบุรี",
    zh: "曼谷 - 叻丕",
  },
  "Bangkok - Kanchanaburi": {
    en: "Bangkok - Kanchanaburi",
    th: "กรุงเทพฯ - กาญจนบุรี",
    zh: "曼谷 - 北碧",
  },
  "Bangkok - Sai Yok": {
    en: "Bangkok - Sai Yok",
    th: "กรุงเทพฯ - ไทรโยค",
    zh: "曼谷 - 赛育",
  },
  "Bangkok - Sangkhla Buri": {
    en: "Bangkok - Sangkhla Buri",
    th: "กรุงเทพฯ - สังขละบุรี",
    zh: "曼谷 - 桑卡拉武里",
  },

  // North Region
  "Bangkok - Ayutthaya": {
    en: "Bangkok - Ayutthaya",
    th: "กรุงเทพฯ - อยุธยา",
    zh: "曼谷 - 大城",
  },
  "Bangkok - Nakhon Sawan": {
    en: "Bangkok - Nakhon Sawan",
    th: "กรุงเทพฯ - นครสวรรค์",
    zh: "曼谷 - 北榄坡",
  },
  "Bangkok - Phetchabun": {
    en: "Bangkok - Phetchabun",
    th: "กรุงเทพฯ - เพชรบูรณ์",
    zh: "曼谷 - 碧差汶",
  },
  "Bangkok - Phitsanulok": {
    en: "Bangkok - Phitsanulok",
    th: "กรุงเทพฯ - พิษณุโลก",
    zh: "曼谷 - 彭世洛",
  },
  "Bangkok - Sukhothai": {
    en: "Bangkok - Sukhothai",
    th: "กรุงเทพฯ - สุโขทัย",
    zh: "曼谷 - 素可泰",
  },
  "Bangkok - Mae Sot - Tak": {
    en: "Bangkok - Mae Sot - Tak",
    th: "กรุงเทพฯ - แม่สอด - ตาก",
    zh: "曼谷 - 美索 - 达",
  },
  "Bangkok - Chiang Mai": {
    en: "Bangkok - Chiang Mai",
    th: "กรุงเทพฯ - เชียงใหม่",
    zh: "曼谷 - 清迈",
  },
  "Bangkok - Chiang Rai": {
    en: "Bangkok - Chiang Rai",
    th: "กรุงเทพฯ - เชียงราย",
    zh: "曼谷 - 清莱",
  },

  // Northeast Region
  "Bangkok - Saraburi": {
    en: "Bangkok - Saraburi",
    th: "กรุงเทพฯ - สระบุรี",
    zh: "曼谷 - 沙拉武里",
  },
  "Bangkok - Khao Yai": {
    en: "Bangkok - Khao Yai",
    th: "กรุงเทพฯ - เขาใหญ่",
    zh: "曼谷 - 考艾",
  },
  "Bangkok - Wang Nam Khiao": {
    en: "Bangkok - Wang Nam Khiao",
    th: "กรุงเทพฯ - วังน้ำเขียว",
    zh: "曼谷 - 旺南坤",
  },
  "Bangkok - Nakhon Ratchasima": {
    en: "Bangkok - Nakhon Ratchasima",
    th: "กรุงเทพฯ - นครราชสีมา (โคราช)",
    zh: "曼谷 - 呵叻",
  },

  // Hourly Rental
  "04 Hours: Private Car Rental with Driver & Fuel (Max 250 Km.)": {
    en: "04 Hours: Private Car Rental with Driver & Fuel (Max 250 Km.)",
    th: "4 ชั่วโมง: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 250 กม.)",
    zh: "4小时：私人包车含司机和油费（最多250公里）",
  },
  "06 Hours: Private Car Rental with Driver & Fuel (Max 300 Km.)": {
    en: "06 Hours: Private Car Rental with Driver & Fuel (Max 300 Km.)",
    th: "6 ชั่วโมง: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 300 กม.)",
    zh: "6小时：私人包车含司机和油费（最多300公里）",
  },
  "08 Hours: Private Car Rental with Driver & Fuel (Max 350 Km.)": {
    en: "08 Hours: Private Car Rental with Driver & Fuel (Max 350 Km.)",
    th: "8 ชั่วโมง: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 350 กม.)",
    zh: "8小时：私人包车含司机和油费（最多350公里）",
  },
  "10 Hours: Private Car Rental with Driver & Fuel (Max 400 Km.)": {
    en: "10 Hours: Private Car Rental with Driver & Fuel (Max 400 Km.)",
    th: "10 ชั่วโมง: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 400 กม.)",
    zh: "10小时：私人包车含司机和油费（最多400公里）",
  },

  // Period Rental
  "01 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)": {
    en: "01 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)",
    th: "1 วัน: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 350 กม./วัน)",
    zh: "1天：私人包车含司机和油费（每天最多350公里）",
  },
  "07 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)": {
    en: "07 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)",
    th: "7 วัน: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 350 กม./วัน)",
    zh: "7天：私人包车含司机和油费（每天最多350公里）",
  },
  "15 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)": {
    en: "15 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)",
    th: "15 วัน: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 350 กม./วัน)",
    zh: "15天：私人包车含司机和油费（每天最多350公里）",
  },
  "30 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)": {
    en: "30 Day: Private Car Rental with Driver & Fuel (Max 350 Km./Day)",
    th: "30 วัน: เช่ารถพร้อมคนขับและน้ำมัน (สูงสุด 350 กม./วัน)",
    zh: "30天：私人包车含司机和油费（每天最多350公里）",
  },
};

// Helper function to get translated destination
export const getTranslatedDestination = (destination: string, language: string): string => {
  const lang = (language === 'th' || language === 'zh') ? language : 'en';
  return destinationTranslations[destination]?.[lang as PricingLanguage] || destination;
};

// Helper function to get translated region
export const getTranslatedRegion = (regionId: string, language: string): string => {
  const lang = (language === 'th' || language === 'zh') ? language : 'en';
  return regionTranslations[regionId]?.[lang as PricingLanguage] || regionId;
};

// Helper function to get translated vehicle label
export const getTranslatedVehicleLabel = (label: string, language: string): string => {
  const lang = (language === 'th' || language === 'zh') ? language : 'en';
  return vehicleLabelTranslations[label]?.[lang as PricingLanguage] || label;
};

// Helper function to get translated vehicle category
export const getTranslatedVehicleCategory = (category: string, language: string): string => {
  const lang = (language === 'th' || language === 'zh') ? language : 'en';
  return vehicleCategoryTranslations[category]?.[lang as PricingLanguage] || category;
};
