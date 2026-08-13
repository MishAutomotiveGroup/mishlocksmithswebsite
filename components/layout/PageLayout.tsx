import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import StickyCallBar from "./StickyCallBar";
import SEOMeta from "@/components/SEOMeta";

interface PageLayoutProps {
  children: React.ReactNode;
  meta: {
    title: string;
    description: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    structuredData?: object;
  };
  /** Optional override for the mobile sticky action bar. Defaults to the call bar. */
  stickyBar?: React.ReactNode;
}

export default function PageLayout({ children, meta, stickyBar }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      <SEOMeta {...meta} />
      <SiteHeader />
      <div aria-hidden="true" className="h-px bg-[#171C22] pointer-events-none" />
      <main className="flex-1 pb-20 md:pb-0" id="main-content">
        {children}
      </main>
      <SiteFooter />
      {stickyBar !== undefined ? stickyBar : <StickyCallBar />}
    </div>
  );
}
