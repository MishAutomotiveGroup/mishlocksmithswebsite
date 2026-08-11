import { useState, useEffect } from "react";
import { siteContent } from "@/content/siteContent";

const CONSENT_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!siteContent.analytics.gaId && !siteContent.analytics.gadsId) return;
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const updateConsent = (granted: boolean) => {
    const value = granted ? "granted" : "denied";
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: value,
        ad_user_data: value,
        ad_personalization: value,
        analytics_storage: value,
      });
    }
  };

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    updateConsent(true);
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    updateConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-50 bg-[#121212] text-white border border-white/10 md:border-0 md:border-t rounded-xl md:rounded-none px-4 py-2 md:py-3"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-4xl mx-auto flex flex-row items-center gap-3 sm:gap-4">
        <p className="text-[11px] md:text-sm text-white/90 flex-1 leading-snug">
          We use cookies to measure calls and improve ads.{" "}
          <a href="/cookies" className="underline text-white hover:text-[#C79A1B] transition-colors whitespace-nowrap">
            Cookie Policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-colors min-h-[40px] md:min-h-[44px]"
            data-testid="cookie-decline"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 rounded bg-[#C79A1B] text-[#121212] font-semibold hover:bg-[#A07A10] transition-colors min-h-[40px] md:min-h-[44px]"
            data-testid="cookie-accept"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
