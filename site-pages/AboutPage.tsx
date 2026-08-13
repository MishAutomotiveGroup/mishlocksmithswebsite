import { useState } from "react";
import { Link } from "wouter";
import {
  Phone, MessageCircle, CheckCircle, ChevronRight,
  BadgeCheck, MapPin, Shield, User, Star,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import AvailabilityIndicator from "@/components/sections/AvailabilityIndicator";
import StickyWhatsAppBar from "@/components/layout/StickyWhatsAppBar";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick, trackEvent } from "@/lib/analytics";

const hasPhone  = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = `tel:${siteContent.business.phoneE164}`;

const waBase = `https://wa.me/${siteContent.business.whatsappNumber}`;
const aboutMsg = encodeURIComponent(
  "Hi, I have a question about your services.\n\nVehicle make:\nVehicle model:\nYear:\nLocation:\n\nMy query:\n\nMy name:\nBest contact number:"
);
const whatsappHref = `${waBase}?text=${aboutMsg}`;

// ── Team data — fill in role and bio; leave blank to hide ─────────────────────
const teamMembers = [
  {
    src: "/images/team-member-1.png",
    name: "Gabriel",
    role: "", // e.g. "Vehicle Locksmith"
    bio:  "", // 1–2 sentences — hidden if empty
    imgClass: "scale-[1.15] -translate-y-[2%]",
  },
  {
    src: "/images/team-member-2.png",
    name: "Mishkah",
    role: "", // e.g. "Locksmith and Customer Enquiries"
    bio:  "", // 1–2 sentences — hidden if empty
    imgClass: "",
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const aboutFaqs = [
  {
    q: "Who will attend my vehicle?",
    a: "You will be speaking directly with someone involved in the business who will carry out or arrange the work. Mish Auto Locksmiths is not a national agency — your enquiry is handled personally.",
  },
  {
    q: "Will I know the price beforehand?",
    a: "Yes. We confirm the exact price before travelling. You are not committed to anything until you have agreed the cost.",
  },
  {
    q: "Do you work on all vehicles?",
    a: "We work on a wide range of cars and light vehicles. We confirm compatibility before attending so you know upfront whether we can help with your specific vehicle.",
  },
  {
    q: "Can I contact you through WhatsApp?",
    a: "Yes. You can send your vehicle details, location and the service you need via WhatsApp and we will respond as soon as possible.",
  },
  {
    q: "Do you cover my area?",
    a: `We are based in ${siteContent.business.baseArea} and cover the surrounding Surrey area. Call or message with your postcode and we will confirm availability.`,
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

export default function AboutPage() {
  return (
    <PageLayout
      meta={{
        title: "About | Mish Auto Locksmiths — Guildford",
        description:
          "Mish Auto Locksmiths is a local mobile auto locksmith based in Guildford. Vehicle lockouts and spare car keys with clear pricing before we travel.",
        canonical: `${siteContent.seo.siteUrl}/about`,
        ogTitle: "About Mish Auto Locksmiths",
        ogDescription:
          "A local mobile auto locksmith based in Guildford. Clear pricing, honest service, compatibility confirmed before travel.",
      }}
      hideReviewCarousel
    >

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] text-white pt-9 pb-10 px-4" data-testid="section-about-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2 text-white">
            Meet Mish Auto Locksmiths
          </h1>
          <p className="text-[#1677FF] font-semibold text-sm mb-3">
            A local mobile auto locksmith based in Guildford.
          </p>
          <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-lg">
            We provide vehicle lockout and spare key services across Surrey, with clear pricing and direct communication before we travel.
          </p>

          {/* Team cards */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-4">
            The People Behind the Business
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {teamMembers.map((member) => (
              <div key={member.src} className="flex flex-col">
                <div className="aspect-[3/4] overflow-hidden rounded-t-xl">
                  <img
                    src={member.src}
                    alt={`${member.name} — Mish Auto Locksmiths`}
                    className={`w-full h-full object-cover object-top ${member.imgClass}`}
                    loading="eager"
                  />
                </div>
                <div className="bg-[#171C22] border border-white/10 border-t-0 rounded-b-xl px-3 py-2.5 text-center">
                  <p className="text-white font-semibold text-sm">{member.name}</p>
                  {member.role && (
                    <p className="text-[#1677FF] text-[10px] mt-0.5">{member.role}</p>
                  )}
                  <p className="text-white/30 text-[9px] mt-0.5">Based in Guildford</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL BUSINESS INTRO ──────────────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-about-intro">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-xl p-7 sm:p-9">
            <h2 className="text-xl font-bold text-[#171C22] mb-4">
              A Local Business You Can Speak to Directly
            </h2>
            <p className="text-sm text-[#171C22]/70 leading-relaxed mb-3">
              Mish Auto Locksmiths is run locally from Guildford. When you call or message us, you speak directly with someone involved in the business rather than a national call centre or anonymous booking agent.
            </p>
            <p className="text-sm text-[#171C22]/70 leading-relaxed">
              We aim to be straightforward about pricing and vehicle compatibility. Before travelling, we confirm the service required, whether we can help with your vehicle and the agreed price. If a job is not suitable for us, we will tell you rather than waste your time.
            </p>
            {/* Personal bios — shown only when real text is supplied in teamMembers above */}
            {teamMembers.some(m => m.bio) && (
              <div className="mt-6 pt-6 border-t border-[#171C22]/15 flex flex-col gap-5">
                {teamMembers.filter(m => m.bio).map(m => (
                  <div key={m.name}>
                    <p className="font-semibold text-sm text-[#171C22] mb-1">{m.name}</p>
                    <p className="text-sm text-[#171C22]/65 leading-relaxed">{m.bio}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ────────────────────────────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-12 px-4" data-testid="section-about-services">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-6">What We Do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Vehicle Lockouts */}
            <div className="bg-white border border-[#171C22]/15 rounded-xl p-6 flex flex-col">
              <h3 className="font-bold text-[#171C22] text-base mb-1">Vehicle Lockouts</h3>
              <p className="text-[#1677FF] font-bold text-lg mb-3">£90–£110</p>
              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {[
                  "Non-destructive vehicle entry where possible",
                  "Keys locked inside the vehicle",
                  "Lost access to the vehicle",
                  "Clear quote before travel",
                  "Live ETA before dispatch",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#171C22]/70">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/vehicle-lockout"
                onClick={() => trackEvent("about_lockout_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#171C22] text-white font-semibold text-sm rounded hover:bg-[#171C22] transition-colors min-h-[44px]"
                data-testid="button-about-lockout"
              >
                View Vehicle Lockout Service <ChevronRight size={14} />
              </Link>
            </div>

            {/* Spare Car Keys */}
            <div className="bg-white border border-[#171C22]/15 rounded-xl p-6 flex flex-col">
              <h3 className="font-bold text-[#171C22] text-base mb-1">Spare Car Keys</h3>
              <p className="text-[#1677FF] font-bold text-lg mb-3">Typically £160–£220</p>
              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {[
                  "Spare key supply and cutting",
                  "Transponder programming where supported",
                  "Remote programming where supported",
                  "Compatibility checked before booking",
                  "Exact price confirmed before attendance",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#171C22]/70">
                    <CheckCircle size={13} className="text-[#1677FF] shrink-0 mt-[2px]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/spare-car-key"
                onClick={() => trackEvent("about_spare_key_click")}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#171C22] text-white font-semibold text-sm rounded hover:bg-[#171C22] transition-colors min-h-[44px]"
                data-testid="button-about-spare-key"
              >
                View Spare Car Key Service <ChevronRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHO WILL ATTEND ───────────────────────────────────────────────── */}
      <section className="bg-white py-10 px-4" data-testid="section-about-who-attends">
        <div className="max-w-3xl mx-auto">
          <div className="border border-[#171C22]/15 rounded-xl p-6 sm:p-7">
            <h2 className="text-base font-bold text-[#171C22] mb-3">Who Will Attend?</h2>
            <p className="text-sm text-[#171C22]/65 leading-relaxed mb-5">
              Where possible, the person you speak to will be directly involved in arranging or carrying out the work. We do not operate as a national call centre passing jobs to unknown contractors.
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Branded local business",
                "Direct communication",
                "Vehicle and price confirmed first",
              ].map(point => (
                <div key={point} className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-[#1677FF] shrink-0" />
                  <span className="text-sm text-[#171C22]/70">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES WE DON'T OFFER ───────────────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-8 px-4" data-testid="section-about-not-offered">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-semibold text-[#171C22]/50 mb-3">Services We Don't Currently Offer</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "House and commercial locksmith work",
              "Safe opening",
              "Ignition repairs",
              "General roadside recovery",
            ].map(item => (
              <span key={item} className="px-3 py-1.5 bg-white border border-[#171C22]/15 rounded text-sm text-[#171C22]/45">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CUSTOMERS CHOOSE US ───────────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-about-why">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-7">Why Customers Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <BadgeCheck size={20} className="text-[#1677FF]" />,
                title: "Clear Pricing",
                desc: "Exact quote confirmed before we travel.",
              },
              {
                icon: <User size={20} className="text-[#1677FF]" />,
                title: "Real Local Business",
                desc: "You're speaking directly to someone involved in carrying out the work.",
              },
              {
                icon: <CheckCircle size={20} className="text-[#1677FF]" />,
                title: "Vehicle Compatibility Checked",
                desc: "We confirm we can help before dispatch.",
              },
              {
                icon: <Shield size={20} className="text-[#1677FF]" />,
                title: "No Hidden Charges",
                desc: "No surprise costs after arrival.",
              },
            ].map(card => (
              <div key={card.title} className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-xl p-5 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">{card.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-[#171C22] mb-1">{card.title}</p>
                  <p className="text-sm text-[#171C22]/60 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ───────────────────────────────────────────────────── */}
      <section className="bg-[#F4F6F8] py-12 px-4" data-testid="section-about-how">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-8">How We Work</h2>
          <div className="flex flex-col gap-6">
            {[
              { n: "1", title: "Call us", desc: "Reach us directly by phone or WhatsApp." },
              { n: "2", title: "Tell us your vehicle and location", desc: "Share the make, model, year, registration and where you are." },
              { n: "3", title: "We confirm availability, compatibility and price", desc: "We check whether we can help, confirm the cost and give you an ETA before we set off." },
              { n: "4", title: "We travel to you", desc: "Once you're happy with the quote, we make our way to your location." },
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

      {/* ── AREAS WE COVER ────────────────────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-about-areas">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <MapPin size={20} className="text-[#1677FF] shrink-0 mt-0.5" />
            <h2 className="text-xl font-bold text-[#171C22]">Serving Surrey</h2>
          </div>
          <p className="text-sm text-[#171C22]/70 leading-relaxed mb-6 max-w-xl">
            We are based in {siteContent.business.baseArea} and cover the whole of Surrey, including Woking, Godalming, Farnham, Camberley, Epsom, Reigate and nearby locations. Call with your postcode and we'll confirm availability before we travel.
          </p>
          <Link
            href="/areas-we-cover"
            onClick={() => trackEvent("about_areas_click")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171C22] border border-[#171C22]/25 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
          >
            View Areas We Cover <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── TRUST / PHOTOS ────────────────────────────────────────────────── */}
      <section className="bg-[#171C22] py-12 px-4" data-testid="section-about-trust">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-7">Real People. Real Vehicles. Local Service.</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-7">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="/images/team-member-1.png"
                alt="Mish Auto Locksmiths — Gabriel"
                className="w-full h-full object-cover object-top scale-[1.15] -translate-y-[2%]"
                loading="lazy"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="/images/job-lockout-top.png"
                alt="Technician carrying out a vehicle lockout"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src="/images/technician-with-car.png"
                alt="Mish Auto Locksmiths technician beside vehicle"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
            {[
              "Based in Guildford",
              "Real technicians",
              "Real customer vehicles",
              "Mobile service",
            ].map(point => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#1677FF] shrink-0" />
                <span className="text-sm text-white/60">{point}</span>
              </div>
            ))}
          </div>
          {/* Google rating badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
            <img src="/images/google-g.png" alt="Google" className="w-4 h-4 object-contain" />
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className="text-[#1677FF] fill-[#1677FF]" />
              ))}
            </div>
            <span className="text-white/60 text-xs">Rated 5 Stars on Google</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 px-4" data-testid="section-about-faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#171C22] mb-2">About the Service</h2>
          <div className="divide-y divide-[#171C22]/15 mt-4">
            {aboutFaqs.map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AVAILABILITY + FINAL CTA ──────────────────────────────────────── */}
      <section className="bg-[#171C22] py-14 px-4 pb-32 md:pb-14" data-testid="section-about-cta">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <AvailabilityIndicator />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Speak Directly With a Local Auto Locksmith
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Call with your vehicle, location and what has happened. We'll confirm whether we can help, provide a clear price and arrange attendance if suitable.
          </p>
          {hasPhone && (
            <a
              href={phoneHref}
              onClick={() => trackCallClick("about-final")}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#1677FF] text-[#171C22] font-bold rounded hover:bg-[#0D63DA] transition-colors min-h-[56px] mb-3 text-base"
              data-testid="button-call-about-final"
            >
              <Phone size={20} />
              Call Now — {siteContent.business.phone}
            </a>
          )}
          {siteContent.business.whatsappEnabled && (
            <a
              href={whatsappHref}
              onClick={() => trackWhatsAppClick("about-final")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border border-white/20 text-white font-semibold text-sm rounded hover:border-white/40 transition-colors min-h-[48px] mb-8"
              data-testid="button-whatsapp-about-final"
            >
              <MessageCircle size={16} />
              Message on WhatsApp
            </a>
          )}
          <div className="flex flex-col items-center gap-2">
            {[
              "Clear quote before travel",
              "Vehicle compatibility checked",
              "Based in Guildford",
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
