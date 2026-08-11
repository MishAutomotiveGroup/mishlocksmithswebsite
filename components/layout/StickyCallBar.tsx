import { Phone, MessageCircle } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const phoneHref = hasPhone
  ? `tel:${siteContent.business.phone.replace(/\s/g, "")}`
  : "/contact";

const lockoutWhatsAppMsg =
  "Hi, I need help with a vehicle lockout.\n\nVehicle make:\nVehicle model:\nLocation:\nWhat happened:\n\nIs the key locked inside the vehicle? Yes / No\n\nMy name:\nBest contact number:";
const lockoutWhatsAppHref = siteContent.business.whatsappEnabled
  ? `https://wa.me/${siteContent.business.whatsappNumber}?text=${encodeURIComponent(lockoutWhatsAppMsg)}`
  : "/contact";

export default function StickyCallBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#121212] border-t border-white/10 py-3 px-4"
      data-testid="sticky-call-bar"
    >
      <div className="flex items-center gap-3">
        <a
          href={phoneHref}
          onClick={() => trackCallClick("sticky")}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C79A1B] text-[#121212] font-bold text-base rounded py-3 min-h-[52px] hover:bg-[#A07A10] transition-colors active:scale-[0.99]"
          data-testid="button-call-sticky"
        >
          <Phone size={18} />
          Call Now
        </a>
        {siteContent.business.whatsappEnabled && (
          <a
            href={lockoutWhatsAppHref}
            onClick={() => trackWhatsAppClick("sticky-lockout")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm rounded py-3 px-4 min-h-[52px] hover:bg-white/20 transition-colors active:scale-[0.99]"
            data-testid="button-whatsapp-sticky-lockout"
            aria-label="WhatsApp"
          >
            <MessageCircle size={18} />
            <span className="sr-only">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
