import { Link } from "wouter";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick, trackWhatsAppClick } from "@/lib/analytics";

const navLinks = [
  { label: "Home", href: "/", external: false },
  { label: "Vehicle Lockout", href: "/vehicle-lockout", external: false },
  { label: "Spare Car Key", href: "/spare-car-key", external: false },
  { label: "Areas We Cover", href: "/areas-we-cover", external: false },
  { label: "Pricing", href: "/pricing", external: false },
  { label: "Reviews", href: "/reviews", external: false },
  { label: "About", href: "/about", external: false },
  { label: "FAQ", href: "/faqs", external: false },
  { label: "Contact", href: "/contact", external: false },
];

const hasPhone = siteContent.business.phone !== "PHONE_NUMBER_PLACEHOLDER";
const hasTrust =
  siteContent.trust.legalName ||
  siteContent.trust.legalAddress ||
  siteContent.trust.companyRegistration ||
  siteContent.trust.vatNumber;

export default function SiteFooter() {
  return (
    <footer className="bg-[#2A2A2A] text-white/80 mt-auto" data-testid="site-footer">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand column */}
          <div>
            <p className="font-bold text-white text-lg leading-tight">
              {siteContent.business.name}
            </p>
            <p className="text-[#C79A1B] text-xs font-medium uppercase tracking-wider mt-1 mb-4">
              {siteContent.business.tagline}
            </p>
            <p className="text-sm text-white/60 mb-4">
              Mobile vehicle locksmith service across all areas within West London zone.
            </p>
            {hasPhone && (
              <a
                href={`tel:${siteContent.business.phoneE164}`}
                onClick={() => trackCallClick("footer")}
                className="inline-flex items-center gap-2 text-white font-semibold text-base hover:text-[#C79A1B] transition-colors"
                data-testid="link-call-footer"
              >
                <Phone size={16} />
                {siteContent.business.phone}
              </a>
            )}
            {siteContent.business.email && (
              <a
                href={`mailto:${siteContent.business.email}`}
                className="flex items-center gap-2 text-white/60 text-sm hover:text-[#C79A1B] transition-colors mt-2"
                data-testid="link-email-footer"
              >
                <Mail size={14} />
                {siteContent.business.email}
              </a>
            )}
            {siteContent.business.whatsappEnabled && siteContent.business.whatsappNumber && (
              <a
                href={`https://wa.me/${siteContent.business.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="flex items-center gap-2 text-white/60 text-sm hover:text-[#25D366] transition-colors mt-2"
                data-testid="link-whatsapp-footer"
              >
                <MessageCircle size={14} />
                WhatsApp us
              </a>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Pages</p>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                      data-testid={`footer-nav-${link.href.replace(/[\/#]/g, "")}`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / trust */}
          <div>
            <p className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors" data-testid="footer-link-privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-white/60 hover:text-white transition-colors" data-testid="footer-link-cookies">
                  Cookie Policy
                </Link>
              </li>
            </ul>

            {hasTrust && (
              <div className="mt-6 text-xs text-white/40 space-y-1">
                {siteContent.trust.legalName && <p>{siteContent.trust.legalName}</p>}
                {siteContent.trust.legalAddress && <p>{siteContent.trust.legalAddress}</p>}
                {siteContent.trust.companyRegistration && (
                  <p>Company No. {siteContent.trust.companyRegistration}</p>
                )}
                {siteContent.trust.vatNumber && (
                  <p>VAT No. {siteContent.trust.vatNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} {siteContent.business.name}. All rights reserved.
          </p>
          <p>Mobile car locksmith services in West London.</p>
        </div>
      </div>
    </footer>
  );
}
