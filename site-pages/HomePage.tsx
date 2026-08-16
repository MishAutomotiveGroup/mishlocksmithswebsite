import { useState } from "react";
import { Link } from "wouter";
import { Phone, ChevronRight, CheckCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackEvent } from "@/lib/analytics";

const phoneHref = `tel:${siteContent.business.phoneE164}`;
const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";

// ── FAQ ───────────────────────────────────────────────────────────────────────

const homeFaqs = [
  {
    q: "Can you help if I am locked out of my car?",
    a: "Yes. Vehicle lockout is our core service. Call with your location and vehicle details and we will confirm availability, give you a clear quote and an estimated arrival time before we set off.",
  },
  {
    q: "Can you make a spare or replacement car key?",
    a: "We offer spare and replacement key services for supported vehicles. Call with your vehicle make, model, year and whether you still have a working key and we will confirm whether we can help.",
  },
  {
    q: "Can you help if I have lost all my car keys?",
    a: "All-keys-lost work depends on the vehicle make, model and year. Call us with those details and your location and we will confirm whether we can assist.",
  },
  {
    q: "What details do you need when I call?",
    a: "Your current location, the vehicle make, model and year, and a description of the situation — for example, keys locked inside, need a spare key, or all keys lost.",
  },
  {
    q: "Do you need proof that I own the vehicle?",
    a: "Yes. We ask for proof of ownership or entitlement to access the vehicle before any work begins.",
  },
  {
    q: "How is the price confirmed?",
    a: "We confirm a clear price before travelling to you. The cost depends on your location, vehicle and the service needed. There are no hidden charges.",
  },
  {
    q: "Which areas do you cover?",
    a: "We cover Guildford and the wider Surrey area. Call with your location and postcode and we will confirm immediately.",
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
      >
        <span>{q}</span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-[#171C22]/40 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-[#171C22]/70 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <PageLayout
      meta={{
        title: "Car Locksmith in Guildford & Surrey | Mish Auto Locksmiths",
        description:
          "Locked out, need a spare car key or lost all your keys? Mobile car locksmith services across Guildford and surrounding Surrey. Call for availability, a clear price and a live ETA.",
        canonical: `${siteContent.seo.siteUrl}/`,
        ogTitle: "Car Locksmith in Guildford & Surrey | Mish Auto Locksmiths",
        ogDescription:
          "Locked out, need a spare car key or lost all your keys? Mobile car locksmith services across Guildford and Surrey.",
      }}
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] text-white pt-7 pb-8 px-4" data-testid="section-hero">
        <div className="max-w-2xl mx-auto text-center">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3 text-white">
            Mobile Auto Locksmith<br className="hidden sm:block" /> Across Surrey
          </h1>
          <p className="text-white/75 text-base sm:text-lg leading-snug mb-2 max-w-lg mx-auto">
            Locked out or need a spare car key? Call now for a clear quote and live ETA.
          </p>
          <div className="flex flex-col items-center gap-1.5 mb-7">
            {[
              "Lockouts £90–£110",
              "Spare keys usually £160–£220",
            ].map(line => (
              <span key={line} className="inline-flex items-center gap-2 text-sm text-[#1677FF] font-semibold">
                <span className="text-[#1677FF]">•</span>
                {line}
              </span>
            ))}
          </div>

          {/* Call CTA */}
          <a
            href={phoneHref}
            onClick={() => trackCallClick("homepage-hero")}
            className="flex items-center justify-center gap-3 w-full px-4 py-5 bg-[#1677FF] text-[#171C22] font-bold text-base sm:text-xl rounded hover:bg-[#0D63DA] transition-colors min-h-[64px] mb-5"
            data-testid="button-call-hero"
          >
            <Phone size={24} />
            {hasPhone ? `Call Now — ${siteContent.business.phone}` : "Call to Check Availability"}
          </a>

          {/* Availability badge */}
          <div className="flex justify-center mb-5">
            <AvailabilityIndicator />
          </div>

        </div>

        <div className="-mx-4 mt-8" data-testid="section-photo-collage">
          <div className="flex flex-col gap-2 md:gap-3 px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-lg">
                <img src="/images/homepage-hero.svg" alt="Mish Auto Locksmiths service vehicle" className="w-full h-full object-cover object-center" loading="eager" />
              </div>
              <div className="col-span-1 overflow-hidden rounded-lg hidden md:block">
                <img src="/images/job6.png" alt="Auto locksmith technician by a service vehicle" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="/images/job1.png" alt="Auto locksmith service vehicle" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="/images/job7.png" alt="Technician working on a vehicle door lock" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="/images/job8.png" alt="Auto locksmith technician beside a service vehicle" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="/images/job5.png" alt="Technician working on a vehicle door" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHOOSE YOUR SERVICE ───────────────────────────────────────────── */}
      <section id="services" className="bg-white py-12 px-4 scroll-mt-16" data-testid="section-service-selector">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[#171C22] mb-2 text-center">
            Choose the Service You Need
          </h2>
          <p className="text-[#171C22]/55 text-sm text-center mb-8">
            We'll confirm availability, price and ETA before we travel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Card 1 — Vehicle Lockout */}
            <div
              className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-xl p-7 flex flex-col"
              data-testid="service-card-lockout"
            >
              <h3 className="font-bold text-[#171C22] text-lg mb-1">Vehicle Lockout</h3>
              <p className="text-2xl font-bold text-[#171C22] mb-1">£90–£110</p>
              <p className="text-sm text-[#171C22]/60 leading-relaxed mb-6 flex-1">
                Fast, non-destructive vehicle entry across Surrey.
              </p>
              <Link
                href="/vehicle-lockout"
                onClick={() => trackEvent("homepage_lockout_card_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#171C22] text-white font-semibold text-sm rounded hover:bg-[#171C22] transition-colors min-h-[48px]"
                data-testid="button-lockout-card"
              >
                Vehicle Lockout Service
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Card 2 — Spare Car Key */}
            <div
              className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-xl p-7 flex flex-col"
              data-testid="service-card-spare-key"
            >
              <h3 className="font-bold text-[#171C22] text-lg mb-1">Spare Car Keys</h3>
              <p className="text-2xl font-bold text-[#171C22] mb-1">£160–£220</p>
              <p className="text-sm text-[#171C22]/60 leading-relaxed mb-6 flex-1">
                Working key required for most vehicles. Some keys up to £300.
              </p>
              <Link
                href="/spare-car-key"
                onClick={() => trackEvent("homepage_spare_key_card_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#171C22] text-white font-semibold text-sm rounded hover:bg-[#171C22] transition-colors min-h-[48px]"
                data-testid="button-spare-key-card"
              >
                Spare Car Key Service
                <ChevronRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <section className="bg-[#EAF3FF] py-12 px-4" data-testid="section-why-us">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[#171C22] mb-8 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {[
              "Clear pricing before travel",
              "Mobile across Surrey",
              "No hidden call-out fee",
              "Live ETA before we travel",
              "Damage-free vehicle entry",
              "Compatibility checked before booking",
            ].map(point => (
              <div key={point} className="flex items-center gap-2.5">
                <CheckCircle size={16} className="text-[#1677FF] shrink-0" />
                <span className="text-sm font-medium text-[#171C22]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-white py-14 px-4" data-testid="section-how-it-works">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-10 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Call Us",
                desc: "Tell us your location, vehicle make, model, year and what has happened.",
              },
              {
                n: "2",
                title: "Price and ETA Confirmed",
                desc: "We confirm availability, a clear price and your estimated arrival time before we set off.",
              },
              {
                n: "3",
                title: "We Help You Get Moving",
                desc: "We attend with the right equipment for the service you need, where the job is supported.",
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-start" data-testid={`step-${step.n}`}>
                <div className="w-11 h-11 rounded-full bg-[#171C22] text-white flex items-center justify-center font-bold text-base mb-4 shrink-0">
                  {step.n}
                </div>
                <h3 className="font-bold text-[#171C22] mb-2">{step.title}</h3>
                <p className="text-sm text-[#171C22]/65 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE AREA ──────────────────────────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-14 px-4" data-testid="section-coverage">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-3">
            Based in Guildford, Serving Surrey
          </h2>
          <p className="text-[#171C22]/70 text-base leading-relaxed mb-3 max-w-xl">
            We provide mobile car locksmith help throughout Surrey, including Guildford, Woking, Godalming, Farnham, Camberley, Epsom and nearby locations.
          </p>
          <p className="text-[#171C22]/60 text-sm leading-relaxed mb-7 max-w-xl">
            Don't see your area listed? Call with your postcode and we'll confirm availability and a live ETA before we set off.
          </p>
          <Link
            href="/areas-we-cover"
            onClick={() => trackEvent("homepage_areas_click")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/25 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
            data-testid="link-areas"
          >
            View Areas We Cover <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-14 px-4" data-testid="section-faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-6">
            Car Locksmith Questions
          </h2>
          <div className="divide-y divide-[#171C22]/15">
            {homeFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
              data-testid="link-all-faqs"
            >
              See All FAQs <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] py-16 px-4" data-testid="section-final-cta">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need Car Locksmith Help?
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Call now with your location and vehicle details. We will confirm availability, price and a live ETA before we set off.
          </p>
          <a
            href={phoneHref}
            onClick={() => trackCallClick("homepage-final")}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded hover:bg-[#0D63DA] transition-colors min-h-[56px] min-w-[240px]"
            data-testid="button-call-final"
          >
            <Phone size={22} />
            {hasPhone ? `Call Now — ${siteContent.business.phone}` : "Call to Check Availability"}
          </a>
          <p className="mt-5 text-sm text-white/45">
            Vehicle lockouts, spare keys, replacement keys and all-keys-lost help for supported vehicles.
          </p>
        </div>
      </section>

    </PageLayout>
  );
}
