// ============================================
// JsonLd - Static SEO schema
// NO Helmet provider required
// Renders script tag directly
// ============================================

const JsonLd = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IBB Shuttle Service",
    "url": "https://ibbservice.com",
    "logo": "https://ibbservice.com/logo.png",
    "description": "Premium private shuttle service offering safe, reliable, and comfortable transportation with professional drivers and modern vehicles across Thailand.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+66-XX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Thai", "Chinese"]
    },
    "sameAs": [
      "https://www.facebook.com/ibbshuttleservice",
      "https://www.instagram.com/ibbshuttleservice",
      "https://line.me/ibbshuttleservice"
    ]
  };

  const transportationServiceSchema = {
    "@context": "https://schema.org",
    "@type": "TransportationService",
    "name": "IBB Shuttle Service",
    "description": "Premium private shuttle service offering safe, reliable, and comfortable transportation with professional drivers and modern vehicles across Thailand.",
    "url": "https://ibbservice.com",
    "logo": "https://ibbservice.com/logo.png",
    "areaServed": {
      "@type": "Country",
      "name": "Thailand"
    },
    "serviceType": [
      "Airport Shuttle Service",
      "Private Shuttle Service",
      "Corporate Transportation",
      "Leisure Travel",
      "VIP Transportation"
    ],
    "provider": {
      "@type": "Organization",
      "name": "IBB Shuttle Service"
    },
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "IBB Shuttle Service",
    "description": "Premium private shuttle booking platform delivering safe, flexible, and reliable travel experiences across Thailand.",
    "url": "https://ibbservice.com",
    "logo": "https://ibbservice.com/logo.png",
    "image": "https://ibbservice.com/seo/og-image.jpg",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TH",
      "addressLocality": "Bangkok"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "13.7563",
      "longitude": "100.5018"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What types of vehicles are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a range of premium vehicles including sedans (1-4 passengers), vans (5-10 passengers), and buses (11+ passengers). All vehicles are modern, clean, and well-maintained."
        }
      },
      {
        "@type": "Question",
        "name": "Is the service available 24/7?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, IBB Shuttle Service operates 24 hours a day, 7 days a week. We can accommodate early morning airport pickups and late-night transfers."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book a shuttle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can book directly on our website by filling out the booking form with your travel details. Our team will review and confirm your booking promptly."
        }
      },
      {
        "@type": "Question",
        "name": "Are the drivers professional?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All our drivers are fully verified, professionally trained, and experienced in providing premium transportation services. Safety and reliability are our top priorities."
        }
      }
    ]
  };

  // Render script tags directly without Helmet
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(transportationServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};

export default JsonLd;
