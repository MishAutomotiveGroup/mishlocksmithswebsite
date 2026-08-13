import PageLayout from "@/components/layout/PageLayout";
import { siteContent } from "@/content/siteContent";

export default function CarKeysPage() {
  return (
    <PageLayout
      meta={{
        title: "Car Key Services | Mish Auto Locksmiths",
        description:
          "Spare keys, replacement keys and key programming for supported vehicles across Surrey. Call for availability and a clear price.",
        canonical: `${siteContent.seo.siteUrl}/car-keys`,
        ogTitle: "Car Key Services | Mish Auto Locksmiths",
        ogDescription:
          "Spare keys, replacement keys and key programming for supported vehicles across Surrey.",
      }}
    >
      <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
        <p className="text-[#171C22]/30 text-sm">Car Keys page — coming soon</p>
      </section>
    </PageLayout>
  );
}
