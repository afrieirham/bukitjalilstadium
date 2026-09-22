import { useState } from "react";

import { Link } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { PhotoCaption } from "~/components/widget/section-gallery";
import { sectionSlug, type Contribution } from "~/lib/contributions";
import { photoUrl } from "~/lib/site";
import { cn } from "~/lib/utils";

/**
 * One Section's photos at the size the view deserves: the selected photo is the
 * page, and the rest of the Section's photos are thumbnails under it.
 */
export function SectionPhotoViewer({
  section,
  photos,
  className,
}: {
  section: string;
  photos: Contribution[];
  className?: string;
}) {
  // The parent keys this component by Section, so a new Section remounts and
  // starts at its first photo rather than whatever index the last one was on.
  const [chosen, setChosen] = useState(0);

  if (photos.length === 0) {
    return <NoPhoto section={section} className={className} />;
  }

  const active = Math.min(chosen, photos.length - 1);
  const photo = photos[active];

  return (
    <figure
      className={cn(
        "border-border bg-card flex flex-col overflow-hidden rounded-lg border",
        className,
      )}
    >
      <img
        src={photoUrl(photo.photo)}
        alt={photo.caption ?? `View from Section ${section}`}
        className="bg-muted aspect-3/2 w-full object-cover"
      />
      <figcaption className="text-muted-foreground border-border flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t px-3 py-2.5 text-sm">
        <PhotoCaption photo={photo} />
        <span className="shrink-0 tabular-nums">
          {photos.length} photo{photos.length > 1 ? "s" : ""}
        </span>
      </figcaption>
      {photos.length > 1 && (
        <div className="border-border flex flex-wrap gap-2 border-t p-3">
          {photos.map((item, position) => (
            <button
              key={item.submissionId}
              type="button"
              onClick={() => setChosen(position)}
              aria-label={`Photo ${position + 1} of ${photos.length}`}
              aria-current={position === active}
              className={cn(
                "overflow-hidden rounded-md border-2 transition-colors",
                position === active
                  ? "border-primary"
                  : "hover:border-border border-transparent",
              )}
            >
              <img
                src={photoUrl(item.photo)}
                alt=""
                className="bg-muted h-14 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

function NoPhoto({
  section,
  className,
}: {
  section: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-muted/40 flex flex-col items-start gap-3 rounded-lg border border-dashed p-8",
        className,
      )}
    >
      <h2 className="font-medium">No photo for Section {section} yet</h2>
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
    </div>
  );
}
