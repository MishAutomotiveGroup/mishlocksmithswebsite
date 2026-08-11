import { siteContent } from "../content/siteContent";

// Normalise a UK phone string to E.164 (+44...). Handles already-international
// input, leading-zero national format, and stray punctuation.
function toE164UK(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("44")) return "+" + digits;
  if (digits.startsWith("0")) return "+44" + digits.slice(1);
  return "+44" + digits;
}

// LocalBusiness (Locksmith) structured data for the whole site.
// Uses only accurate, known business data. Deliberately omits:
//  - aggregateRating/review (Google advises against self-serving review markup)
//  - image (no approved, siteContent-controlled schema image exists yet)
export function getLocalBusinessSchema() {
  const { business, seo, reviews } = siteContent;
  const hasPhone = business.phone !== "PHONE_NUMBER_PLACEHOLDER";
  const telephone = hasPhone ? toE164UK(business.phone) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: business.name,
    description:
      "Vehicle lockout specialist covering Uxbridge and surrounding areas in West London. Vehicle entry only — no key programming or house locksmithing.",
    url: seo.siteUrl,
    ...(telephone ? { telephone } : {}),
    ...(business.email ? { email: business.email } : {}),
    areaServed: business.coverageAreas.map((name) => ({ "@type": "Place", name })),
    address: {
      "@type": "PostalAddress",
      addressLocality: business.baseArea,
      addressRegion: "Greater London",
      addressCountry: "GB",
    },
    ...(reviews.googleReviewsUrl ? { sameAs: [reviews.googleReviewsUrl] } : {}),
  };
}
