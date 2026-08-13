import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";
import { siteContent } from "@/content/siteContent";
import { trackCallClick } from "@/lib/analytics";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Vehicle Lockout", href: "/vehicle-lockout" },
  { label: "Spare Car Key", href: "/spare-car-key" },
  { label: "Areas We Cover", href: "/areas-we-cover" },
  { label: "Prices", href: "/pricing" },
  { label: "Reviews", href: "/reviews" },
  { label: "FAQs", href: "/faqs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const phone = siteContent.business.phone;
const phoneHref = `tel:${siteContent.business.phoneE164}`;

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const isHome = location === "/" || location === "";

  useEffect(() => {
    if (!menuOpen) return;
    function onScroll() { setMenuOpen(false); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  function handleHashLink(e: React.MouseEvent, href: string) {
    e.preventDefault();
    const id = href.replace("/#", "");
    setMenuOpen(false);
    if (isHome) {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      sessionStorage.setItem("scrollTarget", id);
      navigate("/");
    }
  }

  return (
    <div className="sticky top-0 z-40" data-testid="site-header">

      {/* ── Compact header row ──────────────────────────────────────────── */}
      <header className="bg-[#171C22]">
        <div className="max-w-[1150px] mx-auto flex items-center h-[77px] px-3 gap-2">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center h-[77px] w-[55%] md:w-auto shrink-0 overflow-hidden"
            aria-label="Mish Auto Locksmiths — home"
            data-testid="header-logo"
          >
            <img
              src="/logo-mark.svg"
              alt="Mish"
              className="h-11 w-auto object-contain object-left md:hidden"
            />
            <img
              src="/logo-on-dark.svg"
              alt="Mish Auto Locksmiths"
              className="hidden md:block h-10 w-auto max-w-[290px] object-contain"
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Call — mobile: icon only */}
          <a
            href={phoneHref}
            onClick={() => trackCallClick("header")}
            className="md:hidden flex items-center justify-center w-11 h-11 bg-[#1677FF] rounded-lg hover:bg-[#0D63DA] active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Call us on ${phone}`}
            data-testid="button-call-header"
          >
            <Phone size={22} className="text-[#171C22]" />
          </a>

          {/* Call — desktop: pill with number */}
          <a
            href={phoneHref}
            onClick={() => trackCallClick("header")}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-[#1677FF] rounded-lg hover:bg-[#0D63DA] active:scale-95 transition-all text-[#171C22] font-bold text-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Call us on ${phone}`}
            data-testid="button-call-header-desktop"
          >
            <Phone size={16} />
            Call Now — {phone}
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            data-testid="button-menu-toggle"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Nav drawer ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full bg-[#171C22] border-b border-white/10 shadow-xl" data-testid="nav-menu">
          <nav className="max-w-6xl mx-auto px-4 py-2" aria-label="Site navigation">
            {navLinks.map(link =>
              link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => handleHashLink(e, link.href)}
                  className="flex items-center py-3.5 border-b border-white/10 text-white/80 hover:text-white text-sm font-medium transition-colors last:border-0"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center py-3.5 border-b border-white/10 text-white/80 hover:text-white text-sm font-medium transition-colors last:border-0"
                  data-testid={`nav-link-${link.href.replace(/\//g, "")}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      )}

    </div>
  );
}
