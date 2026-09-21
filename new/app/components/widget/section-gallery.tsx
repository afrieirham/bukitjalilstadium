import { Link } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { sectionSlug, type Contribution } from "~/lib/contributions";
import { photoUrl } from "~/lib/site";
import { cn } from "~/lib/utils";

export function SectionGallery({
  section,
  photos,
  className,
}: {
  section: string;
  photos: Contribution[];
  className?: string;
}) {
  if (photos.length === 0) {
    return <SectionGalleryEmpty section={section} />;
  }

  return (
    <section className={cn("grid gap-4", className)}>
      {photos.map((photo) => (
        <figure key={photo.submissionId} className="flex flex-col gap-2">
          <img
            src={photoUrl(photo.photo)}
            alt={photo.caption ?? `View from Section ${section}`}
            loading="lazy"
            className="bg-muted aspect-4/3 w-full rounded-lg object-cover"
          />
          <figcaption className="text-muted-foreground text-sm">
            <PhotoCaption photo={photo} />
          </figcaption>
        </figure>
      ))}
    </section>
  );
}

function SectionGalleryEmpty({ section }: { section: string }) {
  return (
    <section className="border-border bg-muted/40 flex flex-col items-start gap-3 rounded-lg border p-6">
      <h2 className="font-medium">No photo for this Section yet</h2>
      <p className="text-muted-foreground text-sm">
        Nobody has shared a view from Section {section}. If you have one, it
        would help the next person decide.
      </p>
      <Link
        to={`/contribute?section=${sectionSlug(section)}`}
        className={cn(buttonVariants())}
      >
        Share a photo
      </Link>
    </section>
  );
}

function PhotoCaption({ photo }: { photo: Contribution }) {
  const parts = [
    photo.date,
    photo.row ? `Row ${photo.row}` : null,
    photo.seat ? `Seat ${photo.seat}` : null,
    photo.contributor?.name ?? null,
  ].filter(Boolean);

  if (photo.caption) parts.unshift(photo.caption);

  if (parts.length === 0) return <span>Shared by a fellow fan</span>;

  return <span>{parts.join(" · ")}</span>;
}
