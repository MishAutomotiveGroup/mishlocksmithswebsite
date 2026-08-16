import { useState } from "react";
import { Link } from "wouter";
import { Phone, CheckCircle, ChevronRight, MessageCircle } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import PhotoCollage from "@/components/sections/PhotoCollage";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = hasPhone
  ? `tel:${siteContent.business.phoneE164}`
  : "/contact";

// Pre-filled WhatsApp messages
const urgentMsg = encodeURIComponent(
  "Hi, I need help with a vehicle lockout.\n\nVehicle make:\nVehicle model:\nLocation:\nWhat happened:\n\nIs the key locked inside the vehicle? Yes / No\n\nMy name:\nBest contact number:"
);
const nonUrgentMsg = encodeURIComponent(
  "Hi, I have a question about a vehicle lockout.\n\nVehicle make:\nVehicle model:\nLocation:\nWhat happened:\n\nMy name:\nBest contact number:"
);
const waBase = `https://wa.me/${siteContent.business.whatsappNumber}`;
const urgentWhatsAppHref = `${waBase}?text=${urgentMsg}`;
const nonUrgentWhatsAppHref = `${waBase}?text=${nonUrgentMsg}`;

const pageFaqs = [
  {
    q: "What information should I have ready when I call?",
    a: "Your current location, the make and model of your vehicle, and a brief description of the situation — for example, whether keys are locked inside or you cannot open the car at all.",
  },
  {
    q: "Can you help if my keys are locked inside the car?",
    a: "Yes. Keys locked inside the vehicle is one of the main situations we assist with. Call us to confirm and we will give you a clear quote and estimated arrival time.",
  },
  {
    q: "How much does vehicle entry cost?",
    a: "The price depends on your vehicle, location and situation. We confirm a clear quote before dispatch — no surprises.",
  },
  {
    q: "Which areas do you cover?",
    a: `We operate within approximately ${siteContent.business.coverageRadius} of ${siteContent.business.baseArea}, covering areas including ${siteContent.business.coverageAreas.slice(0, 6).join(", ")} and surrounding locations.`,
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
        data-testid={`faq-toggle-${q.substring(0, 20).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span>{q}</span>
        <ChevronRight size={18} className={`shrink-0 text-[#171C22]/40 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-[#171C22]/70 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function VehicleLockoutPage() {
  return (
    <PageLayout
      meta={{
        title: "Car Lockout Surrey | Mobile Vehicle Entry Guildford",
        description:
          "Locked out of your car in Surrey? Mish Auto Locksmiths provides mobile vehicle entry across Guildford and surrounding areas. Call for an immediate quote and live ETA.",
        canonical: `${siteContent.seo.siteUrl}/vehicle-lockout`,
        ogTitle: "Car Lockout Surrey — Mish Auto Locksmiths",
        ogDescription:
          "Locked out of your car in Surrey? Mobile vehicle entry across Guildford and surrounding areas. Call for a clear quote before dispatch.",
      }}
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#171C22] text-white" data-testid="section-hero">

        <div
          className="absolute top-0 right-0 w-[70%] h-[400px] md:bottom-0 md:h-full md:w-[60%] pointer-events-none"
          aria-hidden="true"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%)',
            background: 'black',
          }}
        >
          <img src="/images/technician-hero.png" alt="" className="w-full h-full object-contain object-right-top md:object-cover md:object-[center_20%]" loading="eager" fetchPriority="high" decoding="sync" />
        </div>
        <div className="block md:hidden absolute top-0 inset-x-0 h-[400px] pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)' }} />
        <div className="hidden md:block absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: "linear-gradient(to right, #171C22 30%, rgba(23,28,34,0.8) 50%, rgba(23,28,34,0.5) 62%, transparent 80%)" }} />

        {/* Content */}
        <div className="relative z-10 max-w-[1150px] mx-auto px-4 md:px-6">
          <div className="pt-7 md:pt-10 pb-4 md:max-w-[55%]">

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3 text-white">
              Locked Out of Your Car?
            </h1>

            <div className="max-w-[60%] md:max-w-none">
              <p className="text-[#1677FF] font-semibold text-sm mb-1 leading-snug">
                We can unlock your vehicle with no damage.
              </p>

              <p className="text-white/60 text-xs md:text-sm leading-relaxed mb-3">
                Fast, professional vehicle entry across Surrey.
              </p>

              {/* Reassurance ticks */}
              <div className="flex flex-col gap-[6.5px] mb-4">
                {([
                  ["Immediate non-destructive\nvehicle entry", <>Immediate non-destructive<br />vehicle entry</>],
                  ["Live ETA before we travel", "Live ETA before we travel"],
                  ["Local mobile auto locksmith", "Local mobile auto locksmith"],
                ] as [string, React.ReactNode][]).map(([key, label]) => (
                  <span key={key} className="inline-flex items-start gap-1.5 text-[11px] text-white/80">
                    <CheckCircle size={10} className="text-[#1677FF] shrink-0 mt-[1px]" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[#171C22]/90 border border-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1677FF] mb-1.5">Vehicle Lockout</p>
              <p className="text-4xl font-bold text-white mb-1.5">£90–£110</p>
              <p className="text-sm text-white/55">Exact price confirmed before travel.</p>
              <p className="text-sm text-white/40">No hidden call-out fees. Never more than £110.</p>
            </div>

            {/* Availability */}
            <div className="flex justify-center mb-5">
              <AvailabilityIndicator />
            </div>

            {/* Primary CTA */}
            <a
              href={phoneHref}
              onClick={() => trackCallClick("lockout-hero")}
              className="flex flex-col items-center justify-center w-full px-6 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded-lg hover:bg-[#0D63DA] transition-colors min-h-[64px] mb-3"
              data-testid="button-call-hero"
            >
              <span className="flex items-center gap-2.5">
                <Phone size={22} />
                Call for Immediate Assistance
              </span>
              {hasPhone && (
                <span className="text-[#171C22]/60 font-normal text-sm mt-0.5">{siteContent.business.phone}</span>
              )}
            </a>

            {/* Secondary CTA */}
            {siteContent.business.whatsappEnabled && (
              <a
                href={urgentWhatsAppHref}
                onClick={() => trackWhatsAppClick("lockout-hero")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-white/25 text-white text-sm font-semibold rounded-lg hover:border-white/55 transition-colors min-h-[50px] mb-6"
                data-testid="button-whatsapp-hero"
              >
                <MessageCircle size={18} />
                Message on WhatsApp
              </a>
            )}

          </div>

        </div>
      </section>

      <section className="bg-[#171C22] px-4 pb-8" data-testid="section-photo-collage">
        <PhotoCollage />
      </section>

      {/* ── NEED HELP NOW? ────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-spare-key-prompt">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#171C22] rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Looking for a spare key instead?</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              If you already have a working key and need a spare, visit our Spare Car Key page to find out more.
            </p>
            <Link
              href="/spare-car-key"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#1677FF] text-[#171C22] font-bold text-base rounded hover:bg-[#0D63DA] transition-colors min-h-[52px]"
            >
              Visit our Spare Car Key page <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOT URGENT? WHATSAPP ──────────────────────────────────────────── */}
      {siteContent.business.whatsappEnabled && (
        <section className="pb-10 px-4 bg-[#F4F6F8]" data-testid="section-not-urgent-whatsapp">
          <div className="max-w-2xl mx-auto">
            <div className="border border-[#171C22]/15 rounded-xl p-6 bg-white text-center">
              <h3 className="text-base font-bold text-[#171C22] mb-1">Not Urgent?</h3>
              <p className="text-sm text-[#171C22]/60 leading-relaxed mb-4 max-w-sm mx-auto">
                For non-urgent questions, send us a WhatsApp message with your vehicle make, model, location and what has happened.
              </p>
              <a
                href={nonUrgentWhatsAppHref}
                onClick={() => trackWhatsAppClick("lockout-not-urgent")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#1677FF] text-[#171C22] font-semibold text-sm rounded hover:bg-[#1677FF]/10 transition-colors min-h-[44px]"
                data-testid="button-whatsapp-not-urgent"
              >
                <MessageCircle size={16} className="text-[#1677FF]" />
                Message on WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}


      {/* ── WHAT HAPPENS WHEN YOU CALL ────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-how-it-works">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-8">
            What Happens When You Call
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {[
              {
                n: "1",
                title: "Tell Us Your Location",
                desc: "Give us your vehicle make, model, location and what has happened.",
              },
              {
                n: "2",
                title: "Get a Quote and ETA",
                desc: "We confirm availability, give you a clear quote and provide a live ETA before dispatch.",
              },
              {
                n: "3",
                title: "Vehicle Entry",
                desc: "If suitable, we attend and use non-destructive entry methods where possible.",
              },
            ].map(step => (
              <div key={step.n} className="flex flex-col" data-testid={`step-${step.n}`}>
                <div className="w-10 h-10 rounded-full bg-[#171C22] text-white flex items-center justify-center font-bold text-base mb-3 shrink-0">
                  {step.n}
                </div>
                <h3 className="font-bold text-[#171C22] mb-1.5">{step.title}</h3>
                <p className="text-sm text-[#171C22]/65 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#171C22]/50 border-l-2 border-[#1677FF] pl-3 max-w-2xl">
            We may need to confirm you are entitled to access the vehicle before entry.
          </p>
        </div>
      </section>

      {/* ── COVERAGE ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" data-testid="section-coverage">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-3">
            Mobile Vehicle Entry Across Surrey
          </h2>
          <p className="text-[#171C22]/65 mb-6 text-sm leading-relaxed max-w-xl">
            Based in Guildford, we provide mobile vehicle lockout help to car owners across Surrey and nearby areas. Call with your location and we'll confirm availability and ETA before we set off.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#171C22]/40 mb-3">Some of the areas we cover</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {siteContent.business.coverageAreas.map(area => (
              <span
                key={area}
                className="px-3 py-1.5 bg-[#F4F6F8] border border-[#171C22]/15 rounded text-sm text-[#171C22] font-medium"
                data-testid={`area-tag-${area.replace(/\s/g, "-").toLowerCase()}`}
              >
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#171C22]/60 mb-6">Don't see your area listed? Call us to check availability for your location.</p>
          <Link
            href="/areas-we-cover"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
            data-testid="link-areas"
          >
            See Areas We Cover <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-why-choose-us">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-6">
            Why Choose Mish Auto Locksmiths?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Clear pricing before dispatch",
              "Mobile across Surrey",
              "Non-destructive entry methods",
              "No Call-Out Fee",
            ].map(pt => (
              <div key={pt} className="flex items-center gap-3">
                <CheckCircle size={17} className="text-[#1677FF] shrink-0" />
                <p className="text-sm font-medium text-[#171C22]">{pt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" data-testid="section-faq-preview">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-6">Common Questions</h2>
          <div className="divide-y divide-[#171C22]/15">
            {pageFaqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
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
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-cta-vehicle-lockout-final">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#171C22] rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Locked Out Now?</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              Call Mish Auto Locksmiths for an immediate quote and live ETA. Mobile vehicle entry across Surrey.
            </p>
            <a
              href={phoneHref}
              onClick={() => trackCallClick("lockout-final")}
              className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded hover:bg-[#0D63DA] transition-colors min-h-[56px] mb-6"
              data-testid="button-call-final"
            >
              <Phone size={20} />
              {hasPhone ? `Call Now — ${siteContent.business.phone}` : "Call Now"}
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              {["Estimated arrival time", "Clear quote before dispatch", "Immediate dispatch if available"].map(pt => (
                <span key={pt} className="inline-flex items-center gap-1.5 text-xs text-white/55">
                  <CheckCircle size={13} className="text-[#1677FF] shrink-0" />
                  {pt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PageLayout>
  );
}
