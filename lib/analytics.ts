import { siteContent } from "../content/siteContent";
import { toast } from "@/hooks/use-toast";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";

// Laptops/desktops usually have no app registered to handle `tel:` links, so the
// click appears to do nothing. Identify phones/tablets (which DO have a dialer)
// and skip the fallback for them so the mobile experience is unchanged.
// Prefer the UA "mobile" hint (reliable, and unaffected by touch emulation);
// fall back to the coarse-pointer media query for browsers without UA-CH.
function isLikelyDesktop(): boolean {
  if (typeof window === "undefined") return false;
  const uaMobile = (navigator as any)?.userAgentData?.mobile;
  if (typeof uaMobile === "boolean") return !uaMobile;
  if (!window.matchMedia) return false;
  return !window.matchMedia("(pointer: coarse)").matches;
}

// On desktop only: copy the number to the clipboard and surface it in a toast so
// the visitor can dial from their phone. Never runs on mobile, so the native
// dialer experience is unchanged. Does not block the `tel:` link in any way.
function offerDesktopCallFallback() {
  if (!hasPhone || !isLikelyDesktop()) return;

  const number = siteContent.business.phone;

  const dialPrompt = () =>
    toast({
      title: `Call ${number}`,
      description:
        "Dial this number from your phone to reach us. If your computer has a calling app linked, it will open automatically.",
      duration: 8000,
    });

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      navigator.clipboard.writeText(number).then(
        () =>
          toast({
            title: "Phone number copied",
            description: `Call ${number} — we've copied it to your clipboard so you can dial it from your phone.`,
            duration: 8000,
          }),
        dialPrompt,
      );
    } catch {
      dialPrompt();
    }
  } else {
    dialPrompt();
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  
  if (siteContent.analytics.enabled && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}

// Fires the Google Ads "click to call" conversion. Called on every call button.
export function reportCallConversion() {
  if (typeof window === "undefined") return;
  const label = siteContent.analytics.gadsCallConversionLabel;
  if (siteContent.analytics.enabled && label && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: label,
      value: 1.0,
      currency: "GBP",
    });
  }
}

// Fires the Google Ads WhatsApp click conversion. Called on every WhatsApp button.
export function reportWhatsAppConversion() {
  if (typeof window === "undefined") return;
  const label = siteContent.analytics.gadsWhatsAppConversionLabel;
  if (siteContent.analytics.enabled && label && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: label,
      value: 1.0,
      currency: "GBP",
    });
  }
}

// Fires the Google Ads quote form submission conversion. Called on a successful spare key quote form submit.
export function reportQuoteFormConversion() {
  if (typeof window === "undefined") return;
  const label = siteContent.analytics.gadsQuoteFormConversionLabel;
  if (siteContent.analytics.enabled && label && (window as any).gtag) {
    (window as any).gtag("event", "conversion", {
      send_to: label,
      value: 1.0,
      currency: "GBP",
    });
  }
}

export function trackWhatsAppClick(source: string) {
  trackEvent("whatsapp_click", { source });
  reportWhatsAppConversion();
}

export function trackCallClick(source: string) {
  trackEvent("call_click", { source });
  trackEvent(`call_click_${source}`);
  reportCallConversion();
  offerDesktopCallFallback();
}
