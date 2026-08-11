import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";

export default function CarKeysPage() {
  return (
    <PageLayout
      meta={{
        title: "Car Key Services | West London Auto Locksmith",
        description:
          "Spare keys, replacement keys and key programming for supported vehicles across West London. Call for availability and a clear price.",
        canonical: `${siteContent.seo.siteUrl}/car-keys`,
        ogTitle: "Car Key Services | West London Auto Locksmith",
        ogDescription:
          "Spare keys, replacement keys and key programming for supported vehicles across West London.",
      }}
    >
      <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
        <p className="text-[#121212]/30 text-sm">Car Keys page — coming soon</p>
      </section>
    </PageLayout>
  );
}
