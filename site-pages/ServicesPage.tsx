import { Link } from "wouter";
import { Phone, CheckCircle, MessageCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import StickyWhatsAppBar from "@/components/layout/StickyWhatsAppBar";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick, trackEvent } from "@/lib/analytics";

const phoneHref = `tel:${siteContent.business.phoneE164}`;
const hasPhone  = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";

const waBase = `https://wa.me/${siteContent.business.whatsappNumber}`;
const servicesMsg = encodeURIComponent(
  "Hi, I need help with my vehicle.\n\nService needed (lockout / spare key / unsure):\nVehicle make:\nVehicle model:\nYear:\nLocation:\n\nMy name:\nBest contact number:"
);
const whatsappHref = `${waBase}?text=${servicesMsg}`;

const lockoutTicks = [
  "Exact quote confirmed before travel",
  "No hidden call-out fees",
  "Live ETA before dispatch",
];

const spareKeyTicks = [
  "Compatibility checked before booking",
  "Working key required for most vehicles",
  "Exact price confirmed before attendance",
];

const trustPoints = [
  "5-Star Google rated",
  "Clear quote before travel",
  "Mobile service across West London",
  "Vehicle details checked before dispatch",
];

export default function ServicesPage() {
  return (
    <PageLayout
      meta={{
        title: "Services | West London Auto Locksmith",
        description:
          "Vehicle lockouts and spare car keys across West London. Call with your location and vehicle details. We confirm availability, price and ETA before dispatch.",
        canonical: `${siteContent.seo.siteUrl}/services`,
        ogTitle: "Services | West London Auto Locksmith",
        ogDescription:
          "Vehicle lockouts and spare car keys across West London. Call to confirm availability, price and ETA before we attend.",
      }}
      hideReviewCarousel
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] text-white pt-9 pb-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 text-white">
            What Do You Need Help With?
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg mx-auto mb-7">
            Choose the service you need below. We'll confirm availability, pricing and the next steps before travelling.
          </p>
          <div className="flex justify-center">
            <AvailabilityIndicator />
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS ─────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] pb-12 px-4" data-testid="section-service-selector">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Card 1 — Vehicle Lockout */}
            <div
              className="bg-[#171C22] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col"
              data-testid="service-card-lockout"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-2">Vehicle Lockout</p>
              <h2 className="font-bold text-white text-xl mb-2 leading-snug">Locked Your Keys in the Car?</h2>
              <p className="text-3xl font-bold text-white mb-3">£90–£110</p>
              <p className="text-sm text-white/55 leading-relaxed mb-5 flex-1">
                Fast mobile vehicle entry across West London using non-destructive methods where possible.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {lockoutTicks.map(point => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    <span className="text-sm text-white/65">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/vehicle-lockout"
                onClick={() => trackEvent("services_page_lockout_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px] mb-3"
                data-testid="button-lockout-service"
              >
                View Vehicle Lockout Service
              </Link>
              {hasPhone && (
                <a
                  href={phoneHref}
                  onClick={() => trackCallClick("services-lockout-card")}
                  className="text-center text-[12px] text-white/35 hover:text-white/60 transition-colors py-1"
                  data-testid="link-call-lockout"
                >
                  Call for immediate assistance
                </a>
              )}
            </div>

            {/* Card 2 — Spare Car Key */}
            <div
              className="bg-[#171C22] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col"
              data-testid="service-card-spare-key"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-2">Spare Car Keys</p>
              <h2 className="font-bold text-white text-xl mb-2 leading-snug">Need a Spare Car Key?</h2>
              <div className="mb-3">
                <span className="text-xs text-white/40 font-medium">Typically </span>
                <span className="text-3xl font-bold text-white">£160–£220</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-5 flex-1">
                Mobile spare-key supply, cutting and programming for compatible vehicles across West London.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {spareKeyTicks.map(point => (
                  <div key={point} className="flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    <span className="text-sm text-white/65">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/spare-car-key"
                onClick={() => trackEvent("services_page_spare_key_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px] mb-3"
                data-testid="button-spare-key-service"
              >
                View Spare Car Key Service
              </Link>
              {hasPhone && (
                <a
                  href={phoneHref}
                  onClick={() => trackCallClick("services-spare-key-card")}
                  className="text-center text-[12px] text-white/35 hover:text-white/60 transition-colors py-1"
                  data-testid="link-call-spare-key"
                >
                  Call to check compatibility
                </a>
              )}
            </div>

          </div>

          {/* Comparison guidance */}
          <p className="text-center text-white/35 text-xs leading-relaxed mt-7 max-w-lg mx-auto">
            Locked out now? Choose Vehicle Lockout. Already have a working key and want another? Choose Spare Car Keys.
          </p>
        </div>
      </section>

      {/* ── NOT SURE ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-12 px-4" data-testid="section-not-sure">
        <div className="max-w-xl mx-auto">
          <div className="border border-[#171C22]/15 rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-xl font-bold text-[#171C22] mb-3">
              Not Sure Which Service You Need?
            </h2>
            <p className="text-sm text-[#171C22]/60 leading-relaxed mb-7 max-w-sm mx-auto">
              Call us with your vehicle make, model, year, location and what has happened. We'll tell you which service is suitable and confirm the likely price before travelling.
            </p>
            {hasPhone && (
              <a
                href={phoneHref}
                onClick={() => trackCallClick("services-not-sure")}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#1677FF] text-[#171C22] font-bold rounded hover:bg-[#0D63DA] transition-colors min-h-[56px] mb-3 text-base"
                data-testid="button-call-not-sure"
              >
                <Phone size={20} />
                Call Now — {siteContent.business.phone}
              </a>
            )}
            {siteContent.business.whatsappEnabled && (
              <a
                href={whatsappHref}
                onClick={() => trackWhatsAppClick("services-not-sure")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border border-[#171C22]/20 text-[#171C22] font-semibold text-sm rounded hover:border-[#171C22]/40 transition-colors min-h-[48px]"
                data-testid="button-whatsapp-not-sure"
              >
                <MessageCircle size={16} />
                Message on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUST ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 px-4 pb-28 md:pb-14" data-testid="section-trust">
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-[#171C22] mb-6 text-center">
            Why Choose West London Auto Locksmith?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {trustPoints.map(point => (
              <div key={point} className="flex items-center gap-2.5">
                <CheckCircle size={16} className="text-[#1677FF] shrink-0" />
                <span className="text-sm font-medium text-[#171C22]">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StickyWhatsAppBar whatsappHref={whatsappHref} />

    </PageLayout>
  );
}
