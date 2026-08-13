import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";

export default function CookiesPage() {
  return (
    <PageLayout
      meta={{
        title: "Cookie Policy | Mish Auto Locksmiths",
        description: "Cookie policy for Mish Auto Locksmiths.",
        canonical: `${siteContent.seo.siteUrl}/cookies`,
      }}
    >
      <section className="bg-[#171C22] text-white py-12 px-4" data-testid="section-cookies-hero">
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
            visit a website. They can be used to remember preferences or understand how a site is used.
          </p>

          <h2>Cookies We Use</h2>

          <h3>Essential cookies</h3>
          <p>
            This website does not currently use any essential cookies that are strictly
            necessary for the site to function.
          </p>

          <h3>Analytics and advertising cookies</h3>
          <p>
            This website does not currently use analytics or advertising tracking cookies.
          </p>

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
