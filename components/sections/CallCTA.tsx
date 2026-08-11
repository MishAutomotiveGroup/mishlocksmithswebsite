import { Phone } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick } from "@/lib/analytics";

interface CallCTAProps {
  heading: string;
  subtext?: string;
  source: string;
  dark?: boolean;
}

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";

export default function CallCTA({ heading, subtext, source, dark = true }: CallCTAProps) {
  return (
    <section
      className={`py-16 px-4 ${dark ? "bg-[#121212] text-white" : "bg-[#F7F7F4] text-[#121212]"}`}
      data-testid={`section-cta-${source}`}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${dark ? "text-white" : "text-[#121212]"}`}>
          {heading}
        </h2>
        {subtext && (
          <p className={`text-base mb-8 ${dark ? "text-white/70" : "text-[#121212]/60"}`}>
            {subtext}
          </p>
        )}
        <a
          href={hasPhone ? `tel:${siteContent.business.phone.replace(/\s/g, "")}` : "/contact"}
          onClick={() => trackCallClick(source)}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C79A1B] text-[#121212] font-bold text-lg rounded hover:bg-[#A07A10] transition-colors min-h-[56px] min-w-[200px]"
          data-testid={`button-call-${source}`}
        >
          <Phone size={20} />
          {hasPhone ? `Call Now — ${siteContent.business.phone}` : "Call to Check Availability"}
        </a>
      </div>
    </section>
  );
}
