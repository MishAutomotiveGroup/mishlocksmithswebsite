import { Link } from "wouter";
import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";

export default function PrivacyPage() {
  return (
    <PageLayout
      meta={{
        title: "Privacy Policy | Mish Auto Locksmiths",
        description: "Privacy policy for Mish Auto Locksmiths.",
        canonical: `${siteContent.seo.siteUrl}/privacy`,
      }}
    >
      <section className="bg-[#171C22] text-white py-12 px-4" data-testid="section-privacy-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-white/50">
            Last updated: {siteContent.legal.privacyLastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white" data-testid="section-privacy-content">
        <div className="max-w-3xl mx-auto prose prose-sm prose-slate max-w-none">
          <h2>Who We Are</h2>
          <p>
            {siteContent.trust.legalName || siteContent.business.name} operates the website at{" "}
            {siteContent.seo.siteUrl}. We provide mobile auto locksmith services across Surrey,
            including vehicle entry, car key cutting, key programming, and spare or replacement
            keys for supported vehicles. For any data-related enquiries, please use the contact
            details on our contact page or in the footer of this site.
          </p>

          <h2>What Data We Collect</h2>
          <p>
            When you use the WhatsApp quote buttons on this site, you may
            provide some or all of the following information:
          </p>
          <ul>
            <li>Your name</li>
            <li>Phone number</li>
            <li>Vehicle make, model, and year</li>
            <li>Your postcode or location</li>
            <li>Details of your enquiry</li>
          </ul>
          <p>
            We do not collect payment card details or create user accounts through this website. No
            financial information is processed via this site.
          </p>

          <h2>Instant Quote Searches</h2>
          <p>
            When you use the instant vehicle quote tool, we record the vehicle year, make, model,
            whether you have a working key, the service requested, and whether a matching quote was
            available. This helps us understand which vehicles customers most often need help with
            and improve the quote database.
          </p>
          <p>
            These search records do not include your name, phone number, email address, vehicle
            registration, postcode, or precise location. They are not used to identify you.
          </p>

          <h2>How We Use Your Data</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Respond to your enquiry and provide a quote</li>
            <li>Arrange and carry out the auto locksmith service you requested</li>
            <li>Keep business records as required by law</li>
          </ul>
          <p>
            We will not sell, rent, or share your personal information with third parties for
            marketing purposes.
          </p>

          <h2>WhatsApp</h2>
          <p>
            Some pages on this site include buttons that open a pre-filled WhatsApp message. When
            you tap one of these buttons, WhatsApp (operated by Meta Platforms, Inc.) opens on
            your device with a suggested message. You are in full control of what you send before
            you press send.
          </p>
          <p>
            Any message you send via WhatsApp is processed by Meta in accordance with their privacy
            policy. We advise you not to include sensitive personal information (such as financial
            details) in WhatsApp messages unnecessarily.
          </p>

          <h2>Analytics and Advertising</h2>
          <p>
            This website does not currently use analytics or advertising tracking cookies.
          </p>

          <h2>Legal Basis for Using Your Data</h2>
          <p>We rely on the following lawful bases under UK GDPR:</p>
          <ul>
            <li>
              <strong>Legitimate interest / contract:</strong> Processing your enquiry, providing a
              quote, and carrying out the service you have requested.
            </li>
            <li>
              <strong>Consent:</strong> Sending information to us through WhatsApp.
            </li>
          </ul>

          <h2>How Long We Keep Data</h2>
          <p>
            We retain enquiry and job records for as long as is necessary for business, accounting,
            and legal purposes — typically up to six years in line with standard UK accounting
            obligations. If you would like us to delete your personal data sooner, please contact
            us using the details in the footer.
          </p>

          <h2>Your Rights</h2>
          <p>Under UK data protection law you have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Request restriction of processing</li>
            <li>Object to processing based on legitimate interest</li>
          </ul>
          <p>
            To exercise any of these rights, contact us using the details on our contact page or
            in the footer of this site. We may ask you to verify your identity before
            processing a request.
          </p>

          <h2>Third-Party Services</h2>
          <p>This website uses the following third-party services, each with their own privacy practices:</p>
          <ul>
            <li>
              <strong>Hosting:</strong> Our website is hosted by a third-party web hosting provider.
            </li>
            <li>
              <strong>Supabase:</strong> Our instant quote database stores vehicle compatibility,
              pricing records, and anonymous vehicle-search information.
            </li>
            <li>
              <strong>WhatsApp / Meta:</strong> Pre-filled message buttons link to WhatsApp,
              operated by Meta Platforms, Inc. See the{" "}
              <a
                href="https://www.whatsapp.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Privacy Policy
              </a>
              .
            </li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time to reflect changes to our services or legal
            requirements. The date at the top of the page shows when it was last revised. Continued
            use of the site after a change constitutes acceptance of the updated policy.
          </p>

          <h2>Cookie Policy</h2>
          <p>
            For information about the cookies used on this site, see our{" "}
            <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
