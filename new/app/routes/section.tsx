import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { sections } from "~/components/widget/seat-plan-data";
import { contributions } from "~/data/contributions";
import { sectionPhotos, sectionSlug } from "~/lib/contributions";
import { sectionLevel, sectionNeighbours } from "~/lib/sections";
import { SITE_NAME, SITE_URL, photoUrl } from "~/lib/site";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/section";

const sectionIds = sections.map((section) => section.id);

export function loader({ params }: Route.LoaderArgs) {
  const section = sectionIds.find((id) => sectionSlug(id) === params.slug);

  if (!section) throw new Response("Not Found", { status: 404 });

  return {
    section,
    photos: sectionPhotos(contributions, section),
    ...sectionNeighbours(section, sectionIds),
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: `Section not found | ${SITE_NAME}` }];

  const title = sectionTitle(loaderData.section);
  const description = sectionDescription(loaderData.section);
  const photo = loaderData.photos[0];

  return [
    { title: `${title}, Stadium Bukit Jalil (TM Stadium Nasional)` },
    { name: "description", content: description },
    {
      tagName: "link",
      rel: "canonical",
      href: `${SITE_URL}/${sectionSlug(loaderData.section)}`,
    },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: SITE_NAME },
    {
      property: "og:title",
      content: `${title}, Stadium Bukit Jalil (TM Stadium Nasional)`,
    },
    { property: "og:description", content: description },
    {
      property: "og:image",
      content: photo ? photoUrl(photo.photo) : `${SITE_URL}/og.png`,
    },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Section({ loaderData }: Route.ComponentProps) {
  const { section, photos, previous, next } = loaderData;
  const title = sectionTitle(section);
  const description = sectionDescription(section);
  const contributeHref = `/contribute?section=${sectionSlug(section)}`;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <Link
        to="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 self-start")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} />
        Seat map
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      <nav className="flex items-center justify-between gap-4">
        <SectionLink slug={sectionSlug(previous)} label={previous} direction="previous" />
        <SectionLink slug={sectionSlug(next)} label={next} direction="next" />
      </nav>

      {photos.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2">
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
      ) : (
        <section className="border-border bg-muted/40 flex flex-col items-start gap-3 rounded-lg border p-6">
          <h2 className="font-medium">No photo for this Section yet</h2>
          <p className="text-muted-foreground text-sm">
            Nobody has shared a view from Section {section}. If you have one, it
            would help the next person decide.
          </p>
          <Link to={contributeHref} className={cn(buttonVariants())}>
            Share a photo
          </Link>
        </section>
      )}

      {photos.length > 0 && (
        <Link to={contributeHref} className="text-muted-foreground text-sm hover:underline">
          Got a better photo? Share it with us.
        </Link>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: `${SITE_NAME} — Stadium Bukit Jalil seating view`,
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: title,
                item: `${SITE_URL}/${sectionSlug(section)}`,
              },
            ],
          }),
        }}
      />
    </main>
  );
}

function SectionLink({
  slug,
  label,
  direction,
}: {
  slug: string;
  label: string;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";

  return (
    <Link
      to={`/${slug}`}
      rel={direction}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        isNext && "ml-auto",
      )}
    >
      {!isNext && <HugeiconsIcon icon={ArrowLeft01Icon} />}
      Section {label}
      {isNext && <HugeiconsIcon icon={ArrowRight01Icon} />}
    </Link>
  );
}

function PhotoCaption({ photo }: { photo: (typeof contributions)[number] }) {
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

function sectionTitle(section: string): string {
  return `Section ${section} (Level ${sectionLevel(section)})`;
}

function sectionDescription(section: string): string {
  return `View of the field from section ${section} (Level ${sectionLevel(
    section,
  )}) at Stadium Bukit Jalil (TM Stadium Nasional), Kuala Lumpur. See what the pitch and stage look like from this seat before you buy.`;
}
