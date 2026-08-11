import { siteContent } from "@/content/siteContent";

interface JobGalleryProps {
  heading?: string;
}

export default function JobGallery({ heading = "Recent Vehicle Entry Work" }: JobGalleryProps) {
  const { photos } = siteContent.recentJobs;

  if (!photos || photos.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-[#F7F7F4]" data-testid="section-job-gallery">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#121212] mb-8">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <figure
              key={i}
              className="rounded-lg overflow-hidden border border-[#D8D8D3] bg-white"
              data-testid={`job-photo-${i}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <figcaption className="p-4">
                <p className="text-sm font-medium text-[#121212]">{photo.caption}</p>
                {photo.area && (
                  <p className="text-xs text-[#121212]/50 mt-1">{photo.area}</p>
                )}
                {photo.jobDescription && (
                  <p className="text-xs text-[#121212]/60 mt-1">{photo.jobDescription}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
