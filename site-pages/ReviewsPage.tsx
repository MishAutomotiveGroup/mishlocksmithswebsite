import PageLayout from "@/components/layout/PageLayout";
import CallCTA from "@/components/sections/CallCTA";
import ReviewsList from "@/components/sections/ReviewsList";
import JobGallery from "@/components/sections/JobGallery";
import { siteContent } from "@/content/siteContent";

const hasReviews = siteContent.reviews.items.length > 0;
const hasPhotos = siteContent.recentJobs.photos.length > 0;

export default function ReviewsPage() {
  return (
    <PageLayout
      meta={{
        title: "Customer Reviews | West London Auto Locksmith",
        description:
          "Customer reviews and recent vehicle lockout work from West London Auto Locksmith, covering Uxbridge and surrounding areas.",
        canonical: `${siteContent.seo.siteUrl}/reviews`,
        ogTitle: "Customer Reviews — West London Auto Locksmith",
        ogDescription:
          "Reviews and recent vehicle entry work from West London Auto Locksmith.",
      }}
      hideReviewCarousel
    >
      {/* Hero */}
      <section className="bg-[#171C22] text-white py-14 px-4" data-testid="section-reviews-hero">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
            Customer Reviews &amp; Recent Jobs
          </h1>
          <p className="text-base text-white/75 max-w-xl">
            Genuine reviews and real job examples from {siteContent.business.name}.
          </p>
        </div>
      </section>

      {/* Reviews section */}
      <ReviewsList heading="Customer Reviews" showGoogleLink={true} />

      {/* Job gallery */}
      <JobGallery heading="Recent Vehicle Entry Work" />

      {/* If both are empty, show honest message */}
      {!hasReviews && !hasPhotos && (
        <section className="py-16 px-4 bg-white" data-testid="section-reviews-placeholder">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-[#F4F6F8] flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#171C22] mb-3">
              Building Our Online Presence
            </h2>
            <p className="text-sm text-[#171C22]/65 leading-relaxed max-w-md mx-auto">
              We are currently building our online review presence. For honest feedback about
              our service, please ask when you call. We are also happy to explain what a job
              involves before we travel.
            </p>
            {siteContent.reviews.googleReviewsUrl && (
              <a
                href={siteContent.reviews.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-5 text-sm font-medium text-[#171C22] border border-[#171C22]/20 rounded px-5 py-2.5 hover:border-[#171C22]/50 transition-colors min-h-[44px]"
                data-testid="link-google-reviews-placeholder"
              >
                See Our Google Reviews
              </a>
            )}
          </div>
        </section>
      )}

      <CallCTA
        heading="Questions Before You Call?"
        subtext="We're straightforward about what we do and what to expect. Call to ask anything."
        source="reviews-final"
      />
    </PageLayout>
  );
}
