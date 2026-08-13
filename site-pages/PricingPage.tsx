import { useState } from "react";
import { Link } from "wouter";
import { Phone, CheckCircle, MessageCircle, ChevronRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import StickyWhatsAppBar from "@/components/layout/StickyWhatsAppBar";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick, trackEvent } from "@/lib/analytics";

const hasPhone  = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = `tel:${siteContent.business.phoneE164}`;

const waBase = `https://wa.me/${siteContent.business.whatsappNumber}`;
const pricingMsg = encodeURIComponent(
  "Hi, I'd like a quote.\n\nService needed (lockout / spare key / unsure):\nVehicle make:\nVehicle model:\nYear:\nRegistration:\nLocation:\n\nMy name:\nBest contact number:"
);
const whatsappHref = `${waBase}?text=${pricingMsg}`;

// ── FAQ ───────────────────────────────────────────────────────────────────────

const pricingFaqs = [
  {
    q: "Is there a call-out fee?",
    a: "There is no separate hidden call-out fee. The total agreed price includes attendance for the confirmed job.",
  },
  {
    q: "Will the price change after you arrive?",
    a: "Not for the work already agreed. We confirm the price before travelling. Any additional work would be discussed and agreed first.",
  },
  {
    q: "Why do spare key prices vary?",
    a: "The cost depends on the vehicle, key type, blade, remote and programming system required.",
  },
  {
    q: "Do you accept card payments?",
    a: "Yes. Card, cash and bank transfer are accepted.",
  },
  {
    q: "Can I get a quote through WhatsApp?",
    a: "Yes. Send your vehicle make, model, year, registration, location and the service required.",
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

export default function PricingPage() {
  return (
    <PageLayout
      meta={{
        title: "Pricing | Mish Auto Locksmiths",
        description:
          "Clear auto locksmith prices for vehicle lockouts and spare car keys across Surrey. Exact quote confirmed before travel. No hidden call-out fees.",
        canonical: `${siteContent.seo.siteUrl}/pricing`,
        ogTitle: "Pricing — Mish Auto Locksmiths",
        ogDescription:
          "Know the likely cost before we travel. Exact quote confirmed before attendance. No hidden call-out fees.",
      }}
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] text-white pt-9 pb-8 px-4" data-testid="section-pricing-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2 text-white">
            Clear Auto Locksmith Prices
          </h1>
          <p className="text-[#1677FF] font-semibold text-sm mb-3">
            Know the likely cost before we travel.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xl">
            We confirm the exact price before attendance based on your vehicle, location and the work required.
          </p>
          <div className="flex flex-col gap-2 mb-7">
            {[
              "No hidden call-out fees",
              "Exact quote confirmed before travel",
              "Price agreed before work begins",
            ].map(point => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-[#1677FF] shrink-0" />
                <span className="text-sm text-white/70">{point}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-start">
            <AvailabilityIndicator />
          </div>
        </div>
      </section>

      {/* ── MAIN PRICING CARDS ────────────────────────────────────────────── */}
      <section className="bg-[#171C22] pb-10 px-4" data-testid="section-pricing-cards">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-white/50 uppercase tracking-wider text-xs mb-5">
            Our Typical Prices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

            {/* Card 1 — Vehicle Lockout */}
            <div className="bg-[#171C22] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col" data-testid="pricing-card-lockout">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-2">Vehicle Lockout</p>
              <p className="text-3xl font-bold text-white mb-1">£90–£110</p>
              <p className="text-sm text-white/55 leading-relaxed mb-1 flex-1">
                Mobile non-destructive vehicle entry across Surrey.
              </p>
              <p className="text-[10px] text-white/30 leading-relaxed mb-5">
                Exact price confirmed before travel. Never more than £110 for the standard lockout service.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {[
                  "No hidden call-out fee",
                  "Live ETA before dispatch",
                  "Damage-free entry methods where possible",
                ].map(point => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    <span className="text-sm text-white/65">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/vehicle-lockout"
                onClick={() => trackEvent("pricing_lockout_card_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px] mb-3"
                data-testid="button-pricing-lockout"
              >
                View Vehicle Lockout Service
              </Link>
              {hasPhone && (
                <a
                  href={phoneHref}
                  onClick={() => trackCallClick("pricing-lockout-card")}
                  className="text-center text-[12px] text-white/35 hover:text-white/60 transition-colors py-1"
                >
                  Call for immediate assistance
                </a>
              )}
            </div>

            {/* Card 2 — Spare Car Keys */}
            <div className="bg-[#171C22] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col" data-testid="pricing-card-spare-key">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-2">Spare Car Keys</p>
              <div className="mb-1">
                <span className="text-xs text-white/40 font-medium">Typically </span>
                <span className="text-3xl font-bold text-white">£160–£220</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-1 flex-1">
                Supply, cutting and programming of compatible spare car keys.
              </p>
              <p className="text-[10px] text-white/30 leading-relaxed mb-5">
                Some vehicles may cost up to £300 depending on the key type, vehicle and programming requirements.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {[
                  "Compatibility checked before booking",
                  "Working key required for most vehicles",
                  "Exact price confirmed before attendance",
                ].map(point => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    <span className="text-sm text-white/65">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/spare-car-key"
                onClick={() => trackEvent("pricing_spare_key_card_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px] mb-3"
                data-testid="button-pricing-spare-key"
              >
                View Spare Car Key Service
              </Link>
              {hasPhone && (
                <a
                  href={phoneHref}
                  onClick={() => trackCallClick("pricing-spare-key-card")}
                  className="text-center text-[12px] text-white/35 hover:text-white/60 transition-colors py-1"
                >
                  Call to check compatibility
                </a>
              )}
            </div>

          </div>

          {/* Key Programming secondary card */}
          <div className="bg-[#171C22] border border-white/10 rounded-xl px-5 py-4" data-testid="pricing-card-programming">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-1">Key Programming</p>
            <p className="text-2xl font-bold text-white mb-2">From £100</p>
            <p className="text-[11px] text-white/45 leading-relaxed">
              Remote and transponder programming for compatible vehicles. Contact us with your vehicle details so we can confirm support and provide an exact quote.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW YOUR QUOTE IS CALCULATED ──────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-pricing-how">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#171C22] mb-8">How Your Quote Is Calculated</h2>
          <div className="flex flex-col gap-6">
            {[
              {
                n: "1",
                title: "Tell us your vehicle and location",
                desc: "Provide the make, model, year, registration, location and what service you need.",
              },
              {
                n: "2",
                title: "We check the job",
                desc: "We confirm compatibility, travel distance and the work required.",
              },
              {
                n: "3",
                title: "You receive an exact quote",
                desc: "We agree the total price with you before travelling.",
              },
              {
                n: "4",
                title: "No unexpected extras",
                desc: "The agreed price is what you pay unless you request additional work.",
              },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[#171C22] text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#171C22] mb-0.5">{step.title}</p>
                  <p className="text-sm text-[#171C22]/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WE ASK FOR VEHICLE DETAILS ───────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-12 px-4" data-testid="section-pricing-why">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-4">Why We Ask for Vehicle Details</h2>
          <p className="text-sm text-[#171C22]/70 leading-relaxed mb-3 max-w-xl">
            Different vehicles use different locks, keys and programming systems. Your vehicle details allow us to check compatibility and provide an accurate quote before booking.
          </p>
          <p className="text-sm text-[#171C22]/70 leading-relaxed max-w-xl">
            Your location helps us confirm coverage and travel time.
          </p>
        </div>
      </section>

      {/* ── WHAT CAN AFFECT THE FINAL PRICE ──────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-pricing-factors">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-5">What Can Affect the Final Price?</h2>
          <div className="flex flex-col gap-2.5 mb-5">
            {[
              "Vehicle make, model and year",
              "Type of lock or key system",
              "Whether a working key is available",
              "Key type and programming requirements",
              "Customer location",
              "Additional work requested",
            ].map(factor => (
              <div key={factor} className="flex items-center gap-2.5">
                <CheckCircle size={14} className="text-[#1677FF] shrink-0" />
                <span className="text-sm text-[#171C22]/75">{factor}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#171C22]/55 leading-relaxed">
            We explain any price difference before you book.
          </p>
        </div>
      </section>

      {/* ── PAYMENT METHODS ───────────────────────────────────────────────── */}
      {siteContent.pricing.paymentMethods.length > 0 && (
        <section className="bg-[#F4F6F8] py-12 px-4" data-testid="section-pricing-payment">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-[#171C22] mb-4">Payment Methods Accepted</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {siteContent.pricing.paymentMethods.map(method => (
                <span
                  key={method}
                  className="px-4 py-2 bg-white border border-[#171C22]/15 rounded-lg text-sm font-medium text-[#171C22]"
                  data-testid={`payment-${method.replace(/\s/g, "-").toLowerCase()}`}
                >
                  {method}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#171C22]/50">
              Payment is due once the agreed service has been completed.
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-pricing-faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-2">Pricing Questions</h2>
          <div className="divide-y divide-[#171C22]/15 mt-4">
            {pricingFaqs.map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] py-14 px-4 pb-32 md:pb-14" data-testid="section-pricing-final-cta">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Get an Exact Quote</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Call us with your vehicle and location details. We'll confirm whether we can help and agree the total price before travelling.
          </p>
          {hasPhone && (
            <a
              href={phoneHref}
              onClick={() => trackCallClick("pricing-final")}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#1677FF] text-[#171C22] font-bold rounded hover:bg-[#0D63DA] transition-colors min-h-[56px] mb-3 text-base"
              data-testid="button-call-pricing-final"
            >
              <Phone size={20} />
              Call Now — {siteContent.business.phone}
            </a>
          )}
          {siteContent.business.whatsappEnabled && (
            <a
              href={whatsappHref}
              onClick={() => trackWhatsAppClick("pricing-final")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border border-white/20 text-white font-semibold text-sm rounded hover:border-white/40 transition-colors min-h-[48px] mb-8"
              data-testid="button-whatsapp-pricing-final"
            >
              <MessageCircle size={16} />
              Message on WhatsApp
            </a>
          )}
          <div className="flex flex-col items-center gap-2">
            {[
              "Clear quote before travel",
              "No hidden call-out fees",
              "Vehicle details checked first",
            ].map(point => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-[#1677FF] shrink-0" />
                <span className="text-sm text-white/50">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StickyWhatsAppBar whatsappHref={whatsappHref} />

    </PageLayout>
  );
}
