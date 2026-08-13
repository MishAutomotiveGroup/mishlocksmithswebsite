// src/content/siteContent.ts
export const siteContent = {
  business: {
    name: "Mish Auto Locksmiths",
    tagline: "Mobile Car Locksmith",
    phone: "0800 246 1851",
    phoneDisplay: "0800 246 1851",
    phoneE164: "+448002461851",
    email: "",
    whatsappEnabled: true,
    whatsappNumber: "447404349837",
    baseArea: "Guildford",
    coverageRadius: "Surrey-wide",
    coverageAreas: [
      "Guildford", "Woking", "Godalming", "Farnham", "Camberley",
      "Epsom", "Leatherhead", "Dorking", "Reigate", "Redhill",
      "Weybridge", "Esher", "Chertsey", "Staines-upon-Thames",
      "Horley", "Caterham"
    ],
  },
  pricing: {
    showFromPrice: false,
    fromPrice: "",
    defaultWording: "Call for a clear price and estimated arrival time before we travel.",
    approvedWording: "Call for a clear price and estimated arrival time before we travel.",
    priceConfirmBeforeTravel: true,
    paymentMethods: ["Card", "Cash", "Bank transfer"] as string[],
  },
  reviews: {
    googleReviewsUrl: "https://www.google.com/maps/place/West+London+Auto+Locksmith/@51.5392625,-0.4712062,17.64z/data=!4m6!3m5!1s0x2341289f576a5e79:0x78ccd061f5531765!8m2!3d51.5391116!4d-0.4703696!16s%2Fg%2F11njc3_w5j?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D",
    rating: "5.0",
    reviewCount: "",     // set to e.g. "12" when confirmed
    items: [
      {
        name: "Jamie Allan",
        rating: 5,
        text: "Great service this morning, arrived in 20 minutes to assist the keys being locked inside a 2025 BMW X3. Within 10 minutes we had access back in to the car with no damage.\n\nProfessional and highly recommend.",
        source: "Google",
        date: "2 weeks ago",
      },
      {
        name: "Louis Debouze",
        rating: 5,
        text: "Locked my keys in my Lexus and he got it open quickly and without damage.",
        source: "Google",
        date: "1 week ago",
      },
      {
        name: "Ugochukwu Okafor",
        rating: 5,
        text: "Their service is so nice, they're friendly and lovely people. He actually saved me when my key got stuck in the car. I recommend their service 100% for any trusted individual to work with them.",
        source: "Google",
        date: "1 day ago",
      },
    ],
  },
  recentJobs: {
    photos: [] as Array<{
      src: string;
      caption: string;
      area?: string;
      jobDescription?: string;
      alt: string;
    }>,
  },
  trust: {
    invoiceAvailable: false,
    companyRegistration: "",
    vatNumber: "",
    legalName: "",
    legalAddress: "",
    yearEstablished: "",
  },
  analytics: {
    gaId: "",
    gadsId: "AW-18144470949",
    gadsCallConversionLabel: "AW-18144470949/WAD7CKuHi8ocEKXP-stD",
    gadsWhatsAppConversionLabel: "AW-18144470949/qSLsCKfyi8ocEKXP-stD",
    gadsQuoteFormConversionLabel: "AW-18144470949/ZWWICNjvicocEKXP-stD",
    enabled: true,
  },
  seo: {
    siteUrl: "https://mish-car-keys.bigmishkah.chatgpt.site",
  },
  legal: {
    privacyLastUpdated: "July 2026",
    cookiesLastUpdated: "June 2025",
  },
};
