import { siteContent } from "@/content/siteContent";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-[#C79A1B]" : "text-[#D8D8D3]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface ReviewsListProps {
  heading?: string;
  showGoogleLink?: boolean;
}

export default function ReviewsList({
  heading = "Customer Reviews",
  showGoogleLink = true,
}: ReviewsListProps) {
  const { items, googleReviewsUrl } = siteContent.reviews;

  if (!items || items.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-white" data-testid="section-reviews">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#121212] mb-8">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((review, i) => (
            <article
              key={i}
              className="bg-[#F7F7F4] border border-[#D8D8D3] rounded-lg p-5"
              data-testid={`review-card-${i}`}
            >
              <StarRating rating={review.rating} />
              <blockquote className="mt-3 text-sm text-[#121212]/80 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <footer className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#121212]">{review.name}</p>
                  <p className="text-xs text-[#121212]/50">{review.source}</p>
                </div>
                {review.date && (
                  <p className="text-xs text-[#121212]/40">{review.date}</p>
                )}
              </footer>
            </article>
          ))}
        </div>
        {showGoogleLink && googleReviewsUrl && (
          <div className="mt-8 text-center">
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#121212] border border-[#121212]/20 rounded px-5 py-2.5 hover:border-[#121212]/50 transition-colors min-h-[44px]"
              data-testid="link-google-reviews"
            >
              See Our Google Reviews
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
