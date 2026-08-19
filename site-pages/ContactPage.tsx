import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";
import { Phone } from "lucide-react";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";

const hasTrust =
  siteContent.trust.legalName ||
  siteContent.trust.legalAddress ||
  siteContent.trust.companyRegistration;

export default function ContactPage() {
  return (
    <PageLayout
      meta={{
        title: "Contact | Mish Auto Locksmiths",
        description:
          "Contact Mish Auto Locksmiths for vehicle entry, key cutting, programming, and spare or replacement car keys across Guildford and Surrey.",
        canonical: `${siteContent.seo.siteUrl}/contact`,
        ogTitle: "Contact Mish Auto Locksmiths",
        ogDescription:
          "Mobile auto locksmith services across Guildford and Surrey. Call to confirm compatibility, availability and price.",
      }}
    >
      <section className="bg-[#171C22] text-white py-14 px-4" data-testid="section-contact-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
            Contact Mish Auto Locksmiths
          </h1>
          <p className="text-base text-white/75 max-w-xl">
            Call to check availability and get a confirmed price before we travel.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 bg-white" data-testid="section-contact-main">
        <div className="max-w-2xl mx-auto space-y-10">

          {/* Phone */}
          <div data-testid="contact-phone-block">
            <h2 className="text-xl font-bold text-[#171C22] mb-5">Call Us</h2>
            {hasPhone ? (
              <>
                <a
                  href={`tel:${siteContent.business.phone.replace(/\s/g, "")}`}
                  onClick={() => trackCallClick("contact")}
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#1677FF] text-[#171C22] font-bold text-lg rounded hover:bg-[#0D63DA] transition-colors min-h-[60px] mb-4"
                  data-testid="button-call-contact"
                >
                  <Phone size={22} />
                  {siteContent.business.phone}
                </a>
                <p className="text-xs text-[#171C22]/50">Tap to call on mobile</p>
              </>
            ) : (
              <div className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-lg p-5">
                <p className="text-sm text-[#171C22]/70">
                  Phone number coming soon. Please check back shortly.
                </p>
              </div>
            )}
          </div>

          {/* What to have ready */}
          <div data-testid="contact-prep-block">
            <h2 className="text-xl font-bold text-[#171C22] mb-4">Before You Call</h2>
            <p className="text-sm text-[#171C22]/70 mb-4 leading-relaxed">
              Having this information ready helps us give you a clear answer and accurate
              price quickly:
            </p>
            <ul className="space-y-3">
              {[
                "Your current location (street, area, or postcode)",
                "Vehicle make and model",
                "Brief description of the service needed — vehicle entry, spare or replacement key, cutting, or programming",
                "Be ready to confirm you are entitled to access the vehicle (a standard precaution)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#171C22]/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Coverage reminder */}
          <div className="bg-[#F4F6F8] border border-[#171C22]/15 rounded-lg p-5" data-testid="contact-coverage-block">
            <p className="text-sm font-semibold text-[#171C22] mb-1">Coverage area</p>
            <p className="text-sm text-[#171C22]/65 leading-relaxed">
              Based in {siteContent.business.baseArea}, we provide mobile auto locksmith services throughout Surrey,
              including {siteContent.business.coverageAreas.slice(1, 6).join(", ")} and surrounding areas. Call to
              confirm availability for your location.
            </p>
          </div>

          {/* WhatsApp (conditional) */}
          {siteContent.business.whatsappEnabled && siteContent.business.whatsappNumber && (
            <div data-testid="contact-whatsapp-block">
              <h2 className="text-lg font-bold text-[#171C22] mb-3">WhatsApp</h2>
              <a
                href={`https://wa.me/${siteContent.business.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("contact")}
                className="inline-flex items-center gap-2 px-5 py-3 border border-[#25D366] text-[#171C22] font-medium text-sm rounded hover:bg-[#25D366]/5 transition-colors min-h-[48px]"
                data-testid="button-whatsapp"
              >
                Message on WhatsApp
              </a>
              <p className="text-xs text-[#171C22]/50 mt-2">
                For enquiries only — calling is faster for urgent lockouts.
              </p>
            </div>
          )}

          {/* Legal/business details */}
          {hasTrust && (
            <div className="pt-4 border-t border-[#171C22]/15" data-testid="contact-legal-block">
              <h2 className="text-base font-semibold text-[#171C22] mb-3">Business Details</h2>
              <div className="text-xs text-[#171C22]/50 space-y-1">
                {siteContent.trust.legalName && <p>{siteContent.trust.legalName}</p>}
                {siteContent.trust.legalAddress && <p>{siteContent.trust.legalAddress}</p>}
                {siteContent.trust.companyRegistration && (
                  <p>Company No. {siteContent.trust.companyRegistration}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
