import { useState } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";
import { trackCallClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = `tel:${siteContent.business.phoneE164}`;

const coverageAreas = [
  "Uxbridge", "Hayes", "Hillingdon", "Southall", "Ruislip", "Northolt",
  "Greenford", "Ealing", "Slough", "West Drayton", "Yiewsley", "Harlington",
  "Ickenham", "Denham", "Acton", "Hanwell",
];

const areaFaqs = [
  {
    q: "Do you cover my area?",
    a: "We cover many areas across West London and nearby locations from our Uxbridge dispatch point. Call with your exact location and we'll confirm availability before you book.",
  },
  {
    q: "How quickly can you get to me?",
    a: "Arrival time depends on your location, traffic, and current availability. We'll give you a realistic ETA before dispatch.",
  },
  {
    q: "Is there a call-out fee?",
    a: "No call-out fee when you book a confirmed vehicle lockout job. The price is confirmed before we attend.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#171C22]/15">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-4 flex items-center justify-between gap-4 font-medium text-[#171C22] hover:text-[#171C22]/70 transition-colors min-h-[56px]"
        aria-expanded={open}
        data-testid={`faq-toggle-areas-${q.substring(0, 15).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span>{q}</span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-[#171C22]/40 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && <p className="pb-4 text-sm text-[#171C22]/70 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function AreasPage() {
  return (
    <PageLayout
      meta={{
        title: "Areas We Cover Across West London | West London Auto Locksmith",
        description:
          "Mobile vehicle lockout service across West London and nearby areas, dispatching from Uxbridge. Call to confirm availability, price and ETA for your location.",
        canonical: `${siteContent.seo.siteUrl}/areas-we-cover`,
        ogTitle: "Areas We Cover Across West London — West London Auto Locksmith",
        ogDescription:
          "Mobile vehicle lockout help across West London. Call with your location and we'll confirm availability and price before dispatch.",
      }}
      hideReviewCarousel
    >
      {/* Hero */}
      <section className="bg-[#171C22] text-white py-14 px-4" data-testid="section-areas-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
            Vehicle Lockout Help Across West London
          </h1>
          <p className="text-base text-white/75 max-w-xl leading-relaxed mb-7">
            We dispatch from Uxbridge and cover vehicle lockouts across West London and nearby areas.
          </p>
          <a
            href={hasPhone ? phoneHref : "/contact"}
            onClick={() => trackCallClick("areas-hero")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1677FF] text-[#171C22] font-bold rounded hover:bg-[#0D63DA] transition-colors min-h-[48px]"
            data-testid="button-call-areas-hero"
          >
            <Phone size={17} />
            Call Now
          </a>
        </div>
      </section>

      {/* Main coverage section */}
      <section className="py-12 px-4 bg-white" data-testid="section-areas-main">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#171C22] mb-4">West London Vehicle Lockout Coverage</h2>
          <p className="text-[#171C22]/70 text-base leading-relaxed mb-8 max-w-2xl">
            Based in Uxbridge, we regularly help drivers in West London and surrounding areas. If you are locked out of your car, call with your location and vehicle details and we'll confirm whether we can reach you, the price, and the estimated arrival time.
          </p>

          {/* Reassurance card — replaces old radius graphic */}
          <div className="mb-10 bg-[#171C22] text-white rounded-xl p-6 max-w-sm">
            <p className="font-bold text-base mb-2">Based in Uxbridge — Mobile Across West London</p>
            <p className="text-sm text-white/65 leading-relaxed">
              Call with your location and we'll confirm availability before dispatch.
            </p>
          </div>

          <h2 className="text-xl font-bold text-[#171C22] mb-4">Common Areas We Cover</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {coverageAreas.map((area) => (
              <div
                key={area}
                className="px-4 py-2.5 bg-[#F4F6F8] border border-[#171C22]/15 rounded-lg text-sm text-[#171C22] font-medium"
                data-testid={`area-item-${area.replace(/\s/g, "-").toLowerCase()}`}
              >
                {area}
              </div>
            ))}
          </div>

          <div className="bg-[#171C22]/5 border border-[#171C22]/10 rounded-lg p-5 max-w-2xl">
            <p className="text-sm text-[#171C22]/80 leading-relaxed">
              Not sure if we cover your area? Call us anyway. We'll tell you straight away if we can help, confirm the price, and give you a realistic arrival time.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#171C22] py-16 px-4" data-testid="section-areas-final-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Locked Out in West London?
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Call with your location and vehicle details. We'll confirm availability, price, and ETA before dispatch.
          </p>
          <a
            href={hasPhone ? phoneHref : "/contact"}
            onClick={() => trackCallClick("areas-final")}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded hover:bg-[#0D63DA] transition-colors min-h-[56px]"
            data-testid="button-call-areas-final"
          >
            <Phone size={22} />
            {hasPhone ? `Call Now — ${siteContent.business.phone}` : "Call Now"}
          </a>
          <p className="mt-5 text-xs text-white/40">Price confirmed before travel.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 px-4 bg-white" data-testid="section-areas-faqs">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#171C22] mb-4">Coverage Questions</h2>
          <div className="divide-y divide-[#171C22]/15">
            {areaFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/vehicle-lockout"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
              data-testid="link-areas-vehicle-lockout"
            >
              Our Vehicle Lockout Service <ChevronRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
              data-testid="link-areas-contact"
            >
              Contact Us <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
