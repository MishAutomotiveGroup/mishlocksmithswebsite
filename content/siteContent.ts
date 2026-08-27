// src/content/siteContent.ts
export const siteContent = {
  business: {
    name: "Mish Auto Locksmiths",
    tagline: "Mobile Car Locksmith",
    phone: "0800 246 1851",
    phoneDisplay: "0800 246 1851",
    phoneE164: "+448002461851",
    email: "info@mishlocksmiths.co.uk",
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
    legalName: "Mish Automotive Group",
    legalAddress: "",
    yearEstablished: "",
  },
  analytics: {
    gaId: "",
    gadsId: "",
    gadsCallConversionLabel: "",
    gadsWhatsAppConversionLabel: "",
    enabled: false,
  },
  seo: {
    siteUrl: "https://mishlocksmiths.co.uk",
  },
  legal: {
    privacyLastUpdated: "August 2026",
    cookiesLastUpdated: "August 2026",
  },
};
