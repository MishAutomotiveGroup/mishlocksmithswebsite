import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";

export default function CookiesPage() {
  const handleWithdraw = () => {
    localStorage.removeItem("cookie_consent");
    window.location.reload();
  };

  return (
    <PageLayout
      meta={{
        title: "Cookie Policy | West London Auto Locksmith",
        description: "Cookie policy for West London Auto Locksmith.",
        canonical: `${siteContent.seo.siteUrl}/cookies`,
      }}
    >
      <section className="bg-[#121212] text-white py-12 px-4" data-testid="section-cookies-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
          <p className="text-sm text-white/50">
            Last updated: {siteContent.legal.cookiesLastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white" data-testid="section-cookies-content">
        <div className="max-w-3xl mx-auto prose prose-sm prose-slate max-w-none">
          <h2>What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device by your browser when you
            visit a website. They are used to remember preferences and to gather analytics
            data about how a site is used.
          </p>

          <h2>Cookies We Use</h2>

          <h3>Essential cookies</h3>
          <p>
            This website does not currently use any essential cookies that are strictly
            necessary for the site to function.
          </p>

          <h3>Analytics cookies (optional)</h3>
          <p>
            If you accept cookies via the notice at the bottom of the page, we enable Google
            Analytics. This sets cookies from Google to track anonymised page views and
            usage patterns. The data helps us understand which pages are most useful and how
            people find our site.
          </p>
          <p>
            Analytics cookies are only set after you give consent. If you decline, these
            cookies are not placed.
          </p>

          <h3>Consent cookie</h3>
          <p>
            When you accept or decline cookies, we store a small item in your
            browser&rsquo;s localStorage (not a cookie, but a similar browser storage mechanism)
            so that we do not show you the consent notice again. This contains only
            &ldquo;accepted&rdquo; or &ldquo;declined&rdquo; — no personal data.
          </p>

          <h2>Withdrawing Consent</h2>
          <p>
            You can withdraw your consent at any time. Clicking the button below will remove
            your stored preference and reload the page, showing the cookie consent notice
            again.
          </p>
          <button
            onClick={handleWithdraw}
            className="mt-2 px-5 py-2.5 border border-[#121212]/20 text-sm font-medium text-[#121212] rounded hover:border-[#121212]/50 transition-colors min-h-[44px] not-prose"
            data-testid="button-withdraw-consent"
          >
            Withdraw Cookie Consent
          </button>

          <h2>Managing Cookies in Your Browser</h2>
          <p>
            You can also delete all cookies through your browser settings. Most browsers
            allow you to block cookies entirely. If you do this, some features of websites
            may stop working, though this site will continue to function normally.
          </p>

          <h2>Privacy Policy</h2>
          <p>
            For more information about how we handle data, see our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
