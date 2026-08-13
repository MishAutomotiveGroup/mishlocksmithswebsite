import { useState } from "react";
import { Link } from "wouter";
import {
  Phone, CheckCircle, ChevronRight, MessageCircle, Star,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import StickyWhatsAppBar from "@/components/layout/StickyWhatsAppBar";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick, reportQuoteFormConversion } from "@/lib/analytics";

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
    a: "We operate from Uxbridge and cover many areas across West London and nearby locations. Send your location and we'll confirm availability.",
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

// ── Quote form ─────────────────────────────────────────────────────────────
type FormState = {
  name: string; make: string; model: string; year: string;
  registration: string; postcode: string; workingKey: string;
  details: string; mobile: string; email: string;
  website: string; consent: boolean;
};

const empty: FormState = {
  name: "", make: "", model: "", year: "",
  registration: "", postcode: "", workingKey: "",
  details: "", mobile: "", email: "",
  website: "", consent: false,
};

function buildWhatsAppUrl(form: FormState): string {
  const wkLabel =
    form.workingKey === "yes" ? "Yes" :
    form.workingKey === "no" ? "No" :
    form.workingKey === "notsure" ? "Not sure" : "Yes / No";

  const msg = [
    "Hi, I'd like a quote for a spare car key.",
    "",
    `Vehicle make: ${form.make}`,
    `Vehicle model: ${form.model}`,
    `Year: ${form.year}`,
    `Vehicle registration: ${form.registration}`,
    `Postcode / area: ${form.postcode}`,
    "",
    `Do you have a working original key? ${wkLabel}`,
    "",
    `Any additional information: ${form.details}`,
    "",
    `My name: ${form.name}`,
    `Best WhatsApp number: ${form.mobile}`,
    `Email address: ${form.email}`,
  ].join("\n");

  return `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1" role="alert">{msg}</p>;
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SpareCarKeyPage() {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "contact", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error" | "unconfigured">("idle");

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field as keyof typeof n]; delete n.contact; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.make.trim()) errs.make = "Vehicle make is required";
    if (!form.model.trim()) errs.model = "Vehicle model is required";
    if (!form.year.trim()) errs.year = "Year is required";
    if (!form.postcode.trim()) errs.postcode = "Postcode or location is required";
    if (!form.workingKey) errs.workingKey = "Please select an option";
    if (!form.consent) errs.consent = "Please tick the box to agree";
    if (!form.mobile.trim() && !form.email.trim()) errs.contact = "Please provide at least one contact method — mobile or email";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/spare-key-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitState("success");
        reportQuoteFormConversion();
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitState(data.error === "EMAIL_NOT_CONFIGURED" ? "unconfigured" : "error");
      }
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappUrl = buildWhatsAppUrl(form);

  function scrollToForm(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("email-form-card")?.scrollIntoView({ behavior: "smooth" });
  }

  const inputClass = (field: keyof FormState) =>
    `w-full border ${errors[field] ? "border-red-400" : "border-[#171C22]/15"} rounded px-3 py-2.5 text-sm text-[#171C22] bg-white focus:outline-none focus:ring-2 focus:ring-[#1677FF]/50 focus:border-[#1677FF] placeholder:text-[#171C22]/35 min-h-[44px]`;

  const firstReview = siteContent.reviews.items[0] ?? null;

  return (
    <PageLayout
      meta={{
        title: "Spare Car Key West London | Mobile Auto Locksmith",
        description:
          "Need a spare car key in West London? Mobile spare car key service from Uxbridge. Send your vehicle details to get a quote before we attend.",
        canonical: `${siteContent.seo.siteUrl}/spare-car-key`,
        ogTitle: "Spare Car Key West London | West London Auto Locksmith",
        ogDescription:
          "Mobile spare car key service across West London. Send your vehicle details for a quote before dispatch.",
      }}
      stickyBar={<StickyWhatsAppBar whatsappHref={whatsappUrl} />}
      hideReviewCarousel
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#171C22] text-white" data-testid="section-hero">

        {/* Photo right panel */}
        <div
          className="absolute top-0 right-0 w-[70%] h-[400px] md:bottom-0 md:h-full md:w-[60%] pointer-events-none"
          aria-hidden="true"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, black 55%)',
            background: 'black',
          }}
        >
          <img
            src="/images/technician-hero.png"
            alt=""
            className="w-full h-full object-contain object-right-top md:object-cover md:object-[center_20%]"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </div>

        {/* Mobile scrim */}
        <div
          className="block md:hidden absolute top-0 inset-x-0 h-[400px] pointer-events-none"
          aria-hidden="true"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)' }}
        />

        {/* Desktop gradient */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: "linear-gradient(to right, #171C22 30%, rgba(23,28,34,0.8) 50%, rgba(23,28,34,0.5) 62%, transparent 80%)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1150px] mx-auto px-4 md:px-6">
          <div className="pt-9 md:pt-12 pb-4 md:max-w-[55%]">

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-white">
              Need a Spare Car Key?
            </h1>

            <div className="max-w-[60%] md:max-w-none">
              <p className="text-[#1677FF] font-semibold text-sm mb-5 leading-snug">
                Mobile spare key service across West London.
              </p>

              {/* Bullets */}
              <div className="flex flex-col gap-2.5 mb-6">
                {([
                  "Mobile service across West London",
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

            {/* Google trust badge */}
            <a
              href={siteContent.reviews.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read West London Auto Locksmith reviews on Google"
              className="inline-flex items-center gap-2 border border-white/20 rounded-xl bg-[#171C22] px-[11px] py-[9px] mb-8 hover:border-[#1677FF] hover:bg-[#0D63DA] transition-colors duration-150"
            >
              <img
                src="/images/google-g.png"
                alt=""
                className="object-contain w-[25px] h-[25px] shrink-0"
                style={{ mixBlendMode: 'screen' }}
              />
              <div className="w-px h-[20px] bg-white/25 shrink-0" />
              <span className="flex items-center gap-1 text-white font-semibold text-[10px] leading-tight whitespace-nowrap">
                <svg className="w-[8px] h-[8px] shrink-0 text-[#1677FF]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Rated 5 Stars on Google
              </span>
            </a>

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

            {/* Tertiary — Email */}
            <a
              href="#quote-form"
              onClick={scrollToForm}
              className="flex items-center justify-center w-full px-5 py-3.5 rounded border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-colors text-white/55 hover:text-white/80 text-sm font-medium min-h-[48px] mb-4"
              data-testid="button-email-quote"
            >
              Email Quote
            </a>

            {/* Compatibility reassurance */}
            <p className="text-[11px] text-white/40 leading-relaxed text-center mb-6">
              Compatibility confirmed before we travel.
            </p>

          </div>
        </div>
      </section>

      {/* ── PHOTO COLLAGE ─────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] px-4 pb-8" data-testid="section-photo-collage">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-lg">
              <img src="/images/job-lockout-top.png" alt="Technician unlocking a car door" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="col-span-1 overflow-hidden rounded-lg hidden md:block">
              <img src="/images/job6.png" alt="West London Auto Locksmith technician by van" className="w-full h-full object-cover object-top" loading="lazy" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img src="/images/job3.png" alt="West London Auto Locksmith technician" className="w-full h-full object-cover object-top" loading="lazy" />
            </div>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img src="/images/job5.png" alt="Technician working on a vehicle" className="w-full h-full object-cover object-top" loading="lazy" />
            </div>
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
              Need immediate vehicle entry? Visit our Vehicle Lockout page for fast non-destructive entry across West London.
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

      {/* ── QUOTE FORM ────────────────────────────────────────────────────── */}
      <section id="quote-form" className="py-12 px-4 bg-[#F4F6F8] scroll-mt-16" data-testid="section-quote">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-2">
            Send Vehicle Details for a Quote
          </h2>
          <p className="text-[#171C22]/60 text-sm mb-8 max-w-2xl">
            Use WhatsApp or the form below. We'll check compatibility before confirming a quote.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* WhatsApp card */}
            {siteContent.business.whatsappEnabled && (
              <div className="border-2 border-[#1677FF] rounded-xl p-6 bg-[#EAF3FF] flex flex-col" data-testid="whatsapp-card">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle size={20} className="text-[#1677FF]" />
                  <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider">Fastest Option</p>
                </div>
                <h3 className="text-lg font-bold text-[#171C22] mb-2">WhatsApp Quote</h3>
                <p className="text-sm text-[#171C22]/65 leading-relaxed mb-5 flex-1">
                  Send your vehicle details and we'll check compatibility before replying with a quote.
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

            {/* Email form */}
            <div id="email-form-card" className="border border-[#171C22]/15 rounded-xl p-6 bg-white" data-testid="email-form-card">
              <h3 className="text-lg font-bold text-[#171C22] mb-1">Send Details by Email</h3>
              <p className="text-sm text-[#171C22]/60 mb-5">Prefer email? Send your vehicle details below.</p>

              {submitState === "success" ? (
                <div className="text-center py-6" data-testid="form-success">
                  <CheckCircle size={36} className="text-[#1677FF] mx-auto mb-3" />
                  <p className="font-bold text-[#171C22] mb-2">Details received</p>
                  <p className="text-sm text-[#171C22]/65 leading-relaxed">
                    Thanks — we've received your vehicle details. We'll check compatibility and get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate data-testid="spare-key-form">
                  <input type="text" name="website" value={form.website} onChange={e => set("website", e.target.value)} className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="name">Full name <span className="text-[#171C22]/40 font-normal">(optional)</span></label>
                      <input id="name" type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your name" className={inputClass("name")} autoComplete="name" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="make">Vehicle make <span className="text-red-500">*</span></label>
                        <input id="make" type="text" value={form.make} onChange={e => set("make", e.target.value)} placeholder="e.g. Ford" className={inputClass("make")} />
                        <FieldError msg={errors.make} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="model">Vehicle model <span className="text-red-500">*</span></label>
                        <input id="model" type="text" value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Focus" className={inputClass("model")} />
                        <FieldError msg={errors.model} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="year">Year <span className="text-red-500">*</span></label>
                        <input id="year" type="text" inputMode="numeric" value={form.year} onChange={e => set("year", e.target.value)} placeholder="e.g. 2015" className={inputClass("year")} />
                        <FieldError msg={errors.year} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="registration">Registration <span className="text-[#171C22]/40 font-normal">(helps identify key type)</span></label>
                        <input id="registration" type="text" value={form.registration} onChange={e => set("registration", e.target.value)} placeholder="e.g. AB12 CDE" className={inputClass("registration")} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="postcode">Postcode / location <span className="text-red-500">*</span></label>
                      <input id="postcode" type="text" value={form.postcode} onChange={e => set("postcode", e.target.value)} placeholder="e.g. UB8" className={inputClass("postcode")} />
                      <FieldError msg={errors.postcode} />
                    </div>

                    <fieldset>
                      <legend className="block text-sm font-medium text-[#171C22] mb-2">Do you have a working original key? <span className="text-red-500">*</span></legend>
                      <div className="flex gap-4">
                        {[{ v: "yes", label: "Yes" }, { v: "no", label: "No" }, { v: "notsure", label: "Not sure" }].map(opt => (
                          <label key={opt.v} className="flex items-center gap-2 cursor-pointer text-sm text-[#171C22]">
                            <input type="radio" name="workingKey" value={opt.v} checked={form.workingKey === opt.v} onChange={() => set("workingKey", opt.v)} className="accent-[#1677FF] w-4 h-4" />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                      <FieldError msg={errors.workingKey} />
                    </fieldset>

                    <div>
                      <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="details">Anything else we should know? <span className="text-[#171C22]/40 font-normal">(optional)</span></label>
                      <textarea id="details" rows={3} value={form.details} onChange={e => set("details", e.target.value)} placeholder="For example: remote buttons not working, number of working keys, damaged key or any other useful details." className="w-full border border-[#171C22]/15 rounded px-3 py-2.5 text-sm text-[#171C22] bg-white focus:outline-none focus:ring-2 focus:ring-[#1677FF]/50 focus:border-[#1677FF] placeholder:text-[#171C22]/35 resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="mobile">Mobile / WhatsApp number</label>
                        <input id="mobile" type="tel" value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="Your mobile number" className={inputClass("mobile")} autoComplete="tel" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#171C22] mb-1" htmlFor="email">Email address</label>
                        <input id="email" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Your email address" className={inputClass("email")} autoComplete="email" />
                      </div>
                    </div>
                    {errors.contact && <FieldError msg={errors.contact} />}
                    <p className="text-xs text-[#171C22]/50">Please provide at least one contact method.</p>

                    <div>
                      <label className="flex items-start gap-2.5 cursor-pointer text-sm text-[#171C22]">
                        <input type="checkbox" checked={form.consent} onChange={e => set("consent", e.target.checked)} className="accent-[#1677FF] w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                          I agree to be contacted about this quote request.{" "}
                          <Link href="/privacy" className="underline text-[#171C22]/60 hover:text-[#171C22]">Privacy Policy</Link>
                        </span>
                      </label>
                      <FieldError msg={errors.consent} />
                    </div>

                    {submitState === "error" && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700" role="alert" data-testid="form-error">
                        Something went wrong sending your details. Please try again or use the WhatsApp option.
                      </div>
                    )}
                    {submitState === "unconfigured" && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800" role="alert" data-testid="form-unconfigured">
                        Email submission is not currently available. Please use the WhatsApp quote option or call us directly.
                      </div>
                    )}

                    <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#1677FF] text-[#171C22] font-bold text-sm rounded hover:bg-[#0D63DA] transition-colors min-h-[48px] disabled:opacity-60" data-testid="button-submit-form">
                      {submitting ? "Sending…" : "Send Quote Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── COVERAGE ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-white" data-testid="section-coverage">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171C22] mb-3">
            Mobile Spare Key Service Across West London
          </h2>
          <p className="text-[#171C22]/65 mb-6 text-sm leading-relaxed max-w-xl">
            Based in Uxbridge, we provide mobile spare car key services across West London and nearby areas. Send your location and vehicle details and we'll confirm availability.
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
            Why Choose West London Auto Locksmith?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Compatibility checked before booking",
              "Mobile across West London",
              "Quality replacement keys",
              "Programming included where supported",
              "5-Star Google Reviews",
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

      {/* ── REVIEW (if real content available) ───────────────────────────── */}
      {firstReview && (
        <section className="py-10 px-4 bg-[#F4F6F8]" data-testid="section-review">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex justify-center gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-[#1677FF] fill-[#1677FF]" />
              ))}
            </div>
            <p className="text-[#171C22]/75 text-sm leading-relaxed italic mb-3 max-w-md mx-auto">
              "{firstReview.text}"
            </p>
            <p className="text-xs font-semibold text-[#171C22]">{firstReview.name}</p>
            <p className="text-xs text-[#171C22]/45">Google Review</p>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#F4F6F8]" data-testid="section-cta-final">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#171C22] rounded-xl p-7 sm:p-9 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get a Quote?</h2>
            <p className="text-white/65 text-sm leading-relaxed mb-7 max-w-md mx-auto">
              Call us with your vehicle details for a quick compatibility check and quote. You can also send the details through WhatsApp or email.
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
              {["Compatibility checked", "Quote before booking", "Mobile service across West London"].map(pt => (
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
