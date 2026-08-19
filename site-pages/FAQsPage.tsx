import { useState } from "react";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import CallCTA from "@/components/sections/CallCTA";
import { siteContent } from "@/content/siteContent";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#171C22]/15">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 font-medium text-[#171C22] hover:text-[#171C22]/70 transition-colors min-h-[60px]"
        aria-expanded={open}
        data-testid={`faq-toggle-${q.substring(0, 20).replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
      >
        <span className="text-base leading-snug">{q}</span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-[#171C22]/40 transition-transform mt-0.5 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-[#171C22]/70 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

const faqs = [
  {
    q: "What should I tell you when I call?",
    a: "Your current location (street, area, postcode if possible), the make and model of your vehicle, and a brief description of the situation — for example, whether keys are locked inside or you cannot open the car. The more detail you can give, the quicker we can confirm whether we can help and give you an accurate price.",
  },
  {
    q: "Can you help if my keys are locked inside the car?",
    a: "Yes. Keys locked inside the vehicle is one of the most common situations we deal with. Call us with your location and vehicle details and we will confirm whether we can help and give you a clear price.",
  },
  {
    q: "Will you damage my vehicle?",
    a: "Our aim is always to gain entry without causing damage, and we use non-destructive entry methods wherever possible. The right approach depends on your vehicle, so if there is anything you should be aware of before we start, we will explain it to you first. We will not begin work without talking you through what is involved.",
  },
  {
    q: "Do you cover my location?",
    a: `We are based in ${siteContent.business.baseArea} and cover locations across Surrey. If you are unsure whether we cover your area, call us with your postcode and we will confirm availability before you book.`,
  },
  {
    q: "How is the price confirmed?",
    a: "We confirm the price before we travel to you. Once we know your location, vehicle, and the situation, we will give you a clear price. There are no hidden charges, and we will not travel without your agreement on the price.",
  },
  {
    q: "Can you unlock every vehicle?",
    a: "We can assist with the majority of standard vehicles, but we cannot guarantee entry on every make and model. If you call us with your vehicle details, we will let you know honestly whether we can help before we travel.",
  },
  {
    q: "Do you need proof that I can access the vehicle?",
    a: "We may ask you to confirm that you are entitled to access the vehicle before we carry out entry. This is a standard precaution. In practice, we use common sense and context, but we reserve the right to ask for reasonable confirmation.",
  },
  {
    q: "Do you offer key programming, key cutting, or replacement keys?",
    a: "Yes. We offer key programming, key coding and key cutting for supported vehicles, including spare and replacement car keys. Call us with your vehicle make, model and year so we can confirm availability and provide a clear price before any work begins.",
  },
  ...(siteContent.pricing.paymentMethods.length > 0
    ? [
        {
          q: "What payment methods do you accept?",
          a: `We currently accept: ${siteContent.pricing.paymentMethods.join(", ")}.`,
        },
      ]
    : []),
];

export default function FAQsPage() {
  return (
    <PageLayout
      meta={{
        title: "FAQs | Mish Auto Locksmiths",
        description:
          "Frequently asked questions about vehicle lockouts, key programming and key cutting in Guildford and Surrey. Clear answers on pricing, coverage, and what to expect.",
        canonical: `${siteContent.seo.siteUrl}/faqs`,
        ogTitle: "FAQs — Mish Auto Locksmiths",
        ogDescription:
          "Common questions about vehicle lockouts, key programming, key cutting, pricing and coverage.",
      }}
    >
      <section className="bg-[#171C22] text-white py-14 px-4" data-testid="section-faqs-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-white/75 max-w-xl leading-relaxed">
            Straightforward answers to common questions about vehicle entry, key programming and key cutting.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white" data-testid="section-faqs-list">
        <div className="max-w-3xl mx-auto">
          <div className="divide-y divide-[#171C22]/15">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <CallCTA
        heading="Still Have a Question?"
        subtext="Call us and we'll answer honestly, including whether we can help with your specific situation."
        source="faqs-final"
      />
    </PageLayout>
  );
}
