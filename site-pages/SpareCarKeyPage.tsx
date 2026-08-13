import { useState } from "react";
import { Link } from "wouter";
import {
  Phone, CheckCircle, ChevronRight, MessageCircle,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import StickyWhatsAppBar from "@/components/layout/StickyWhatsAppBar";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = `tel:${siteContent.business.phoneE164}`;
const coverageAreas = siteContent.business.coverageAreas;

const pageFaqs = [
  {
    q: "Do I need a working key?",
    a: "For spare key jobs, yes, a working key is normally required. If you have lost all keys, call us first so we can confirm whether we can help.",
  },
  {
    q: "Can you make remote keys?",
    a: "We can help with many remote key jobs, but support depends on the vehicle, key type and available stock. Send your vehicle details and we'll check before booking.",
  },
  {
    q: "How much does a spare car key cost?",
    a: "Most spare car keys cost between £160 and £220. Some vehicles may cost up to £300 depending on key type and programming requirements. We'll confirm the exact price before booking.",
  },
  {
    q: "Do you cover my area?",
    a: "We operate from Guildford and cover many areas across Surrey and nearby locations. Send your location and we'll confirm availability.",
  },
];

// ── FAQ accordion ──────────────────────────────────────────────────────────
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
        <ChevronRight size={18} className={`shrink-0 text-[#171C22]/40 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-[#171C22]/70 leading-relaxed">{a}</p>}
    </div>
  );
}

const spareKeyMessage = [
    "Hi, I'd like a quote for a spare car key.",
    "",
    "Vehicle make:",
    "Vehicle model:",
    "Year:",
    "Vehicle registration:",
    "Postcode / area:",
    "",
    "Do you have a working original key? Yes / No",
    "",
    "Any additional information:",
    "",
    "My name:",
  ].join("\n");
const whatsappUrl = `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(spareKeyMessage)}`;

// ── Page ───────────────────────────────────────────────────────────────────
export default function SpareCarKeyPage() {
  return (
    <PageLayout
      meta={{
        title: "Spare Car Key Surrey | Mobile Auto Locksmith",
        description:
          "Need a spare car key in Surrey? Mobile spare car key service from Guildford. Send your vehicle details to get a quote before we attend.",
        canonical: `${siteContent.seo.siteUrl}/spare-car-key`,
        ogTitle: "Spare Car Key Surrey | Mish Auto Locksmiths",
        ogDescription:
          "Mobile spare car key service across Surrey. Send your vehicle details for a quote before dispatch.",
      }}
      stickyBar={<StickyWhatsAppBar whatsappHref={whatsappUrl} />}
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#171C22] text-white" data-testid="section-hero">

        {/* Content */}
        <div className="relative z-10 max-w-[1150px] mx-auto px-4 md:px-6">
          <div className="pt-9 md:pt-12 pb-8 max-w-2xl mx-auto">

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-white">
              Need a Spare Car Key?
            </h1>

            <div className="max-w-[60%] md:max-w-none">
              <p className="text-[#1677FF] font-semibold text-sm mb-5 leading-snug">
                Mobile spare key service across Surrey.
              </p>

              {/* Bullets */}
              <div className="flex flex-col gap-2.5 mb-6">
                {([
                  "Mobile service across Surrey",
                  "Compatibility checked before travel",
                  "Key cutting and programming where supported",
                ] as string[]).map(label => (
                  <span key={label} className="inline-flex items-start gap-1.5 text-[11px] text-white/80">
                    <CheckCircle size={10} className="text-[#1677FF] shrink-0 mt-[1px]" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing card */}
            <div className="bg-[#171C22]/90 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1677FF] mb-1">Typical Spare Car Key Cost</p>
              <p className="text-4xl font-bold text-white mb-1">£160–£220</p>
              <p className="text-[10px] text-white/35 leading-relaxed">
                Exact price confirmed before booking. Some vehicles may cost up to £300 depending on key type and programming requirements.
              </p>
            </div>

            {/* Availability */}
            <div className="flex justify-center mb-5">
              <AvailabilityIndicator />
            </div>

            {/* Primary CTA — Call Now */}
            {hasPhone && (
              <a
                href={phoneHref}
                onClick={() => trackCallClick("spare-key-hero")}
                className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded-lg hover:bg-[#0D63DA] transition-colors min-h-[64px] mb-3"
                data-testid="button-call-hero"
              >
                <Phone size={22} />
                Call Now
              </a>
            )}

            {/* Secondary — WhatsApp */}
            {siteContent.business.whatsappEnabled && (
              <a
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("spare-key-hero")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-white/25 text-white text-sm font-semibold rounded-lg hover:border-white/55 transition-colors min-h-[50px] mb-3"
                data-testid="button-whatsapp-hero"
              >
                <MessageCircle size={16} />
                WhatsApp Quote
              </a>
            )}

            {/* Compatibility reassurance */}
            <p className="text-[11px] text-white/40 leading-relaxed text-center mb-6">
              Compatibility confirmed before we travel.
            </p>

          </div>
        </div>
      </section>

      {/* ── KEY PROGRAMMING CARD ─────────────────────────────────────────── */}
      <section className="px-4 pb-8 bg-[#171C22]" data-testid="section-key-programming">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-[#171C22] border border-white/10 rounded-xl px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1677FF] mb-1">Key Programming</p>
            <p className="text-2xl font-bold text-white mb-2">From £100</p>
            <p className="text-[11px] text-white/45 leading-relaxed">
              Remote and transponder programming for compatible vehicles. Contact us with your vehicle details so we can confirm support and provide an exact quote.
            </p>
          </div>
        </div>
      </section>

      {/* ── LOCKED OUT INSTEAD? ───────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-lockout-prompt">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#171C22] rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Locked Out Instead?</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              Need immediate vehicle entry? Visit our Vehicle Lockout page for fast non-destructive entry across Surrey.
            </p>
            <Link
              href="/vehicle-lockout"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#1677FF] text-[#171C22] font-bold text-base rounded hover:bg-[#0D63DA] transition-colors min-h-[52px]"
            >
              Visit Vehicle Lockout Page <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOT URGENT? ───────────────────────────────────────────────────── */}
      {siteContent.business.whatsappEnabled && (
        <section className="pb-10 px-4 bg-[#F4F6F8]" data-testid="section-not-urgent">
          <div className="max-w-2xl mx-auto">
            <div className="border border-[#171C22]/15 rounded-xl p-6 bg-white text-center">
              <h3 className="text-base font-bold text-[#171C22] mb-1">Not Urgent?</h3>
              <p className="text-sm text-[#171C22]/60 leading-relaxed mb-4 max-w-sm mx-auto">
                Send your vehicle details using WhatsApp or the form below and we'll check compatibility before confirming a quote.
              </p>
              <a
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("spare-key-not-urgent")}
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

      {/* ── WHAT HAPPENS NEXT ─────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" data-testid="section-how-it-works">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-8">
            What Happens Next
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { n: "1", title: "Send Vehicle Details", desc: "Tell us your make, model, year, registration and location." },
              { n: "2", title: "Compatibility Checked", desc: "We'll confirm whether we can supply and programme a suitable key." },
              { n: "3", title: "Receive Your Quote", desc: "We'll confirm the total price before booking." },
              { n: "4", title: "Mobile Appointment", desc: "If you wish to proceed we'll arrange a convenient time and location." },
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
            A working key is required for most spare key jobs. We'll confirm requirements when you send your details.
          </p>
        </div>
      </section>

      {/* ── WHATSAPP QUOTE ────────────────────────────────────────────────── */}
      <section id="quote" className="py-12 px-4 bg-[#F4F6F8] scroll-mt-16" data-testid="section-quote">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-2">
            Send Vehicle Details for a Quote
          </h2>
          <p className="text-[#171C22]/60 text-sm mb-8">
            Send your vehicle details on WhatsApp and we'll check compatibility before confirming a quote.
          </p>
          {siteContent.business.whatsappEnabled && (
            <div className="border-2 border-[#1677FF] rounded-xl p-6 bg-[#EAF3FF] flex flex-col" data-testid="whatsapp-card">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={20} className="text-[#1677FF]" />
                <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider">Fastest Option</p>
              </div>
              <h3 className="text-lg font-bold text-[#171C22] mb-2">WhatsApp Quote</h3>
              <p className="text-sm text-[#171C22]/65 leading-relaxed mb-5">
                The message opens with prompts for the vehicle make, model, year, registration and location.
              </p>
              <a
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("spare-key-contact-card")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px]"
                data-testid="button-whatsapp-card"
              >
                <MessageCircle size={17} />
                Start WhatsApp Quote
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── COVERAGE ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" data-testid="section-coverage">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-3">
            Mobile Spare Key Service Across Surrey
          </h2>
          <p className="text-[#171C22]/65 mb-6 text-sm leading-relaxed max-w-xl">
            Based in Guildford, we provide mobile spare car key services across Surrey and nearby areas. Send your location and vehicle details and we'll confirm availability.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#171C22]/40 mb-3">Some of the areas we cover</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {coverageAreas.map(area => (
              <span key={area} className="px-3 py-1.5 bg-[#F4F6F8] border border-[#171C22]/15 rounded text-sm text-[#171C22] font-medium">
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#171C22]/60 mb-6">Don't see your area listed? Contact us and we'll check availability.</p>
          <Link
            href="/areas-we-cover"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
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
              "Compatibility checked before booking",
              "Mobile across Surrey",
              "Quality replacement keys",
              "Programming included where supported",
              "Clear pricing before booking",
              "No hidden charges",
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
      <section className="py-12 px-4 bg-white" data-testid="section-faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-6">Common Questions</h2>
          <div className="divide-y divide-[#171C22]/15">
            {pageFaqs.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
          <div className="mt-6">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
            >
              See All FAQs <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-cta-final">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#171C22] rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get a Quote?</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              Call us with your vehicle details for a quick compatibility check and quote, or send the details through WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              {hasPhone && (
                <a
                  href={phoneHref}
                  onClick={() => trackCallClick("spare-key-final")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#1677FF] text-[#171C22] font-bold text-base rounded hover:bg-[#0D63DA] transition-colors min-h-[52px] w-full sm:w-auto"
                  data-testid="button-call-final"
                >
                  <Phone size={18} />
                  Call Now
                </a>
              )}
              {siteContent.business.whatsappEnabled && (
                <a
                  href={whatsappUrl}
                  onClick={() => trackWhatsAppClick("spare-key-final")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/25 text-white font-semibold text-base rounded hover:border-white/55 transition-colors min-h-[52px] w-full sm:w-auto"
                  data-testid="button-whatsapp-final"
                >
                  <MessageCircle size={18} />
                  WhatsApp Quote
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              {["Compatibility checked", "Quote before booking", "Mobile service across Surrey"].map(pt => (
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
