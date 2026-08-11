import { Phone, MessageCircle } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = `tel:${siteContent.business.phoneE164}`;

interface Props {
  whatsappHref: string;
}

export default function StickyWhatsAppBar({ whatsappHref }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#121212] border-t border-white/10 py-3 px-4"
      data-testid="sticky-whatsapp-bar"
    >
      <div className="flex items-center gap-3">
        {hasPhone && (
          <a
            href={phoneHref}
            onClick={() => trackCallClick("sticky-spare-key")}
            className="flex-1 flex items-center justify-center gap-2 bg-[#C79A1B] text-[#121212] font-bold text-sm rounded py-3 min-h-[52px] hover:bg-[#A07A10] transition-colors active:scale-[0.99]"
            data-testid="button-call-sticky-spare-key"
          >
            <Phone size={18} />
            Call Now
          </a>
        )}
        <a
          href={whatsappHref}
          onClick={() => trackWhatsAppClick("sticky-spare-key")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm rounded py-3 px-4 min-h-[52px] hover:bg-white/20 transition-colors active:scale-[0.99]"
          data-testid="button-whatsapp-sticky"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
