/**
 * Portal Page Translations — 13 Languages
 * Used by Portal.tsx for client-side i18n (Hub Page strategy)
 * URL stays at / (single canonical), content changes by language
 */

export interface PortalTranslations {
  tagline: string;
  shuttle: {
    description: string;
    features: [string, string, string];
    cta: string;
  };
  travel: {
    description: string;
    features: [string, string, string];
    cta: string;
  };
  health: {
    description: string;
    features: [string, string, string];
    cta: string;
  };
  copyright: string;
}

export const portalTranslations: Record<string, PortalTranslations> = {
  en: {
    tagline: "Your Exclusive Gateway",
    shuttle: {
      description: "Premium private & exclusive whole-vehicle shuttle service",
      features: ["Maximum Safety & GPS Tracking", "Fixed Zone-Based Pricing", "Crypto & Wallet Supported"],
      cta: "Tap to Book",
    },
    travel: {
      description: "Experience world-class travel, custom routes designed for you",
      features: ["Custom Private Tours", "Luxury Hotel Booking", "Professional Guide"],
      cta: "Tap to Explore",
    },
    health: {
      description: "Your personal health assistant, comprehensive care like family",
      features: ["Medical Consultation", "Medical Transport", "Wellness Programs"],
      cta: "Tap to Assist",
    },
    copyright: "IBB Service Group. All Rights Reserved.",
  },
  th: {
    tagline: "ประตูสู่บริการพิเศษเฉพาะคุณ",
    shuttle: {
      description: "บริการรถรับ-ส่งแบบเหมาคัน ระดับพรีเมียม (Private & Exclusive)",
      features: ["ปลอดภัยสูงสุด & GPS Tracking", "ราคาเหมาจ่ายตามโซน (Fixed Price)", "รองรับ Crypto & Wallet"],
      cta: "แตะเพื่อจอง",
    },
    travel: {
      description: "สัมผัสประสบการณ์ท่องเที่ยวเหนือระดับ ออกแบบเส้นทางได้ตามใจคุณ",
      features: ["ทัวร์ส่วนตัวออกแบบเอง", "จองโรงแรมหรู", "ไกด์มืออาชีพ"],
      cta: "แตะเพื่อสำรวจ",
    },
    health: {
      description: "ผู้ช่วยส่วนตัวด้านสุขภาพ ดูแลคุณดุจญาติมิตร พร้อมบริการครบวงจร",
      features: ["ปรึกษาแพทย์", "บริการรถพยาบาล", "โปรแกรมสุขภาพ"],
      cta: "แตะเพื่อรับบริการ",
    },
    copyright: "IBB Service Group สงวนลิขสิทธิ์",
  },
  zh: {
    tagline: "您的专属服务入口",
    shuttle: {
      description: "尊享私人包车接送服务",
      features: ["最高安全标准 & GPS追踪", "固定区域定价", "支持加密货币和钱包"],
      cta: "点击预订",
    },
    travel: {
      description: "体验世界级旅行，为您量身定制路线",
      features: ["定制私人旅游", "豪华酒店预订", "专业导游"],
      cta: "点击探索",
    },
    health: {
      description: "您的私人健康助理，如家人般的全方位关怀",
      features: ["医疗咨询", "医疗运输", "健康计划"],
      cta: "点击咨询",
    },
    copyright: "IBB Service Group 版权所有",
  },
  ja: {
    tagline: "あなただけの特別な入口",
    shuttle: {
      description: "プレミアムプライベート貸切シャトルサービス",
      features: ["最高の安全性 & GPS追跡", "ゾーン別固定料金", "暗号通貨・ウォレット対応"],
      cta: "タップして予約",
    },
    travel: {
      description: "ワールドクラスの旅行体験、あなただけのルート設計",
      features: ["カスタムプライベートツアー", "高級ホテル予約", "プロフェッショナルガイド"],
      cta: "タップして探索",
    },
    health: {
      description: "あなた専属の健康アシスタント、家族のような総合ケア",
      features: ["医療相談", "医療搬送", "ウェルネスプログラム"],
      cta: "タップして相談",
    },
    copyright: "IBB Service Group 全著作権所有",
  },
  ko: {
    tagline: "당신만의 프리미엄 게이트웨이",
    shuttle: {
      description: "프리미엄 프라이빗 전용 차량 셔틀 서비스",
      features: ["최고 안전 & GPS 추적", "구역별 고정 요금", "암호화폐 & 월렛 지원"],
      cta: "탭하여 예약",
    },
    travel: {
      description: "세계 수준의 여행 경험, 맞춤 노선 설계",
      features: ["맞춤 프라이빗 투어", "럭셔리 호텔 예약", "전문 가이드"],
      cta: "탭하여 탐색",
    },
    health: {
      description: "당신의 개인 건강 어시스턴트, 가족 같은 종합 케어",
      features: ["의료 상담", "의료 이송", "웰니스 프로그램"],
      cta: "탭하여 상담",
    },
    copyright: "IBB Service Group 모든 권리 보유",
  },
  ru: {
    tagline: "Ваш эксклюзивный портал",
    shuttle: {
      description: "Премиальный частный трансфер с персональным автомобилем",
      features: ["Максимальная безопасность и GPS", "Фиксированные зональные цены", "Поддержка криптовалют и кошельков"],
      cta: "Забронировать",
    },
    travel: {
      description: "Путешествия мирового класса с индивидуальными маршрутами",
      features: ["Индивидуальные туры", "Бронирование люкс-отелей", "Профессиональный гид"],
      cta: "Исследовать",
    },
    health: {
      description: "Ваш личный ассистент по здоровью с комплексным уходом",
      features: ["Медицинская консультация", "Медицинский транспорт", "Программы здоровья"],
      cta: "Получить помощь",
    },
    copyright: "IBB Service Group. Все права защищены.",
  },
  ar: {
    tagline: "بوابتك الحصرية",
    shuttle: {
      description: "خدمة نقل خاصة فاخرة بسيارة مخصصة بالكامل",
      features: ["أقصى درجات الأمان وتتبع GPS", "أسعار ثابتة حسب المنطقة", "دعم العملات الرقمية والمحفظة"],
      cta: "اضغط للحجز",
    },
    travel: {
      description: "استمتع بتجربة سفر عالمية المستوى مع مسارات مصممة خصيصاً لك",
      features: ["جولات خاصة مخصصة", "حجز فنادق فاخرة", "مرشد محترف"],
      cta: "اضغط للاستكشاف",
    },
    health: {
      description: "مساعدك الصحي الشخصي، رعاية شاملة كالعائلة",
      features: ["استشارة طبية", "نقل طبي", "برامج صحية"],
      cta: "اضغط للمساعدة",
    },
    copyright: "IBB Service Group جميع الحقوق محفوظة",
  },
  de: {
    tagline: "Ihr exklusives Tor",
    shuttle: {
      description: "Premium-Privatshuttle mit exklusivem Fahrzeug",
      features: ["Höchste Sicherheit & GPS-Tracking", "Feste zonenbasierte Preise", "Krypto- & Wallet-Unterstützung"],
      cta: "Jetzt buchen",
    },
    travel: {
      description: "Erstklassige Reiseerlebnisse mit individuellen Routen",
      features: ["Maßgeschneiderte Privattouren", "Luxushotelbuchung", "Professioneller Reiseführer"],
      cta: "Jetzt entdecken",
    },
    health: {
      description: "Ihr persönlicher Gesundheitsassistent mit umfassender Betreuung",
      features: ["Medizinische Beratung", "Medizinischer Transport", "Wellness-Programme"],
      cta: "Jetzt anfragen",
    },
    copyright: "IBB Service Group. Alle Rechte vorbehalten.",
  },
  fr: {
    tagline: "Votre portail exclusif",
    shuttle: {
      description: "Service de navette privée premium avec véhicule dédié",
      features: ["Sécurité maximale & suivi GPS", "Tarifs fixes par zone", "Crypto & portefeuille acceptés"],
      cta: "Réserver",
    },
    travel: {
      description: "Vivez des voyages d'exception avec des itinéraires sur mesure",
      features: ["Circuits privés personnalisés", "Réservation d'hôtels de luxe", "Guide professionnel"],
      cta: "Explorer",
    },
    health: {
      description: "Votre assistant santé personnel, des soins complets comme en famille",
      features: ["Consultation médicale", "Transport médical", "Programmes bien-être"],
      cta: "Demander",
    },
    copyright: "IBB Service Group. Tous droits réservés.",
  },
  es: {
    tagline: "Tu portal exclusivo",
    shuttle: {
      description: "Servicio de transporte privado premium con vehículo exclusivo",
      features: ["Máxima seguridad y rastreo GPS", "Precios fijos por zona", "Soporte de cripto y billetera"],
      cta: "Reservar",
    },
    travel: {
      description: "Experimenta viajes de clase mundial con rutas personalizadas",
      features: ["Tours privados personalizados", "Reserva de hoteles de lujo", "Guía profesional"],
      cta: "Explorar",
    },
    health: {
      description: "Tu asistente de salud personal, atención integral como en familia",
      features: ["Consulta médica", "Transporte médico", "Programas de bienestar"],
      cta: "Consultar",
    },
    copyright: "IBB Service Group. Todos los derechos reservados.",
  },
  id: {
    tagline: "Gerbang Eksklusif Anda",
    shuttle: {
      description: "Layanan antar-jemput pribadi premium dengan kendaraan eksklusif",
      features: ["Keamanan maksimal & pelacakan GPS", "Harga tetap berbasis zona", "Dukungan kripto & dompet"],
      cta: "Ketuk untuk pesan",
    },
    travel: {
      description: "Nikmati perjalanan kelas dunia dengan rute yang dirancang khusus",
      features: ["Tur pribadi kustom", "Pemesanan hotel mewah", "Pemandu profesional"],
      cta: "Ketuk untuk jelajahi",
    },
    health: {
      description: "Asisten kesehatan pribadi Anda, perawatan komprehensif seperti keluarga",
      features: ["Konsultasi medis", "Transportasi medis", "Program kesehatan"],
      cta: "Ketuk untuk bantuan",
    },
    copyright: "IBB Service Group. Hak cipta dilindungi.",
  },
  hi: {
    tagline: "आपका विशेष प्रवेश द्वार",
    shuttle: {
      description: "प्रीमियम प्राइवेट और एक्सक्लूसिव शटल सेवा",
      features: ["अधिकतम सुरक्षा और GPS ट्रैकिंग", "निश्चित ज़ोन-आधारित मूल्य", "क्रिप्टो और वॉलेट समर्थित"],
      cta: "बुक करने के लिए टैप करें",
    },
    travel: {
      description: "विश्व स्तरीय यात्रा का अनुभव, आपके लिए डिज़ाइन किए गए मार्ग",
      features: ["कस्टम प्राइवेट टूर", "लक्जरी होटल बुकिंग", "पेशेवर गाइड"],
      cta: "एक्सप्लोर करने के लिए टैप करें",
    },
    health: {
      description: "आपका व्यक्तिगत स्वास्थ्य सहायक, परिवार जैसी व्यापक देखभाल",
      features: ["चिकित्सा परामर्श", "चिकित्सा परिवहन", "वेलनेस कार्यक्रम"],
      cta: "सहायता के लिए टैप करें",
    },
    copyright: "IBB Service Group. सर्वाधिकार सुरक्षित।",
  },
  vi: {
    tagline: "Cổng dịch vụ độc quyền của bạn",
    shuttle: {
      description: "Dịch vụ đưa đón riêng cao cấp với xe chuyên dụng",
      features: ["An toàn tối đa & theo dõi GPS", "Giá cố định theo khu vực", "Hỗ trợ tiền điện tử & ví"],
      cta: "Nhấn để đặt",
    },
    travel: {
      description: "Trải nghiệm du lịch đẳng cấp thế giới với lộ trình tùy chỉnh",
      features: ["Tour riêng tùy chỉnh", "Đặt khách sạn hạng sang", "Hướng dẫn viên chuyên nghiệp"],
      cta: "Nhấn để khám phá",
    },
    health: {
      description: "Trợ lý sức khỏe cá nhân, chăm sóc toàn diện như gia đình",
      features: ["Tư vấn y tế", "Vận chuyển y tế", "Chương trình sức khỏe"],
      cta: "Nhấn để hỗ trợ",
    },
    copyright: "IBB Service Group. Bảo lưu mọi quyền.",
  },
};
