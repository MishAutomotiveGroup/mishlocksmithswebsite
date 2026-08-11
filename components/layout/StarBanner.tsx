import { siteContent } from "@/content/siteContent";

const googleUrl = siteContent.reviews.googleReviewsUrl;

export default function StarBanner() {
  if (!googleUrl) return null;
  return (
    <div className="bg-[#121212] py-3 text-center border-b border-white/[0.06]">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-white/55 text-xs hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C79A1B] rounded"
      >
        <span className="text-[#C79A1B] text-sm tracking-wide" aria-hidden="true">★★★★★</span>
        <span>Rated 5 stars on Google</span>
      </a>
    </div>
  );
}
