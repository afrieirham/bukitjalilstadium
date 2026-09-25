import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router";

import { PageContainer } from "~/components/core/app-shell";
import { buttonVariants } from "~/components/core/button";
import { SectionGallery } from "~/components/widget/section-gallery";
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
  const { section, photos, left, right } = loaderData;
  const title = sectionTitle(section);
  const description = sectionDescription(section);
  const contributeHref = `/contribute?section=${sectionSlug(section)}`;

  return (
    <PageContainer className="flex max-w-5xl flex-col gap-8">
      <Link
        to="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 self-start")}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} />
        Seat map
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Section {section}
        </h1>
        <div className="bg-primary h-[3px] w-16" aria-hidden />
        <p className="text-muted-foreground max-w-prose">{description}</p>
      </header>

      <nav className="flex items-center justify-between gap-4">
        <SectionLink slug={sectionSlug(left)} label={left} side="left" />
        <SectionLink slug={sectionSlug(right)} label={right} side="right" />
      </nav>

      <SectionGallery
        section={section}
        photos={photos}
        className="sm:grid-cols-2"
      />

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
    </PageContainer>
  );
}

function SectionLink({
  slug,
  label,
  side,
}: {
  slug: string;
  label: string;
  side: "left" | "right";
}) {
  const isRight = side === "right";

  return (
    <Link
      to={`/${slug}`}
      rel={isRight ? "prev" : "next"}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        isRight && "ml-auto",
      )}
    >
      {!isRight && <HugeiconsIcon icon={ArrowLeft01Icon} />}
      Section {label}
      {isRight && <HugeiconsIcon icon={ArrowRight01Icon} />}
    </Link>
  );
}

function sectionTitle(section: string): string {
  return `Section ${section} (Level ${sectionLevel(section)})`;
}

function sectionDescription(section: string): string {
  return `View of the field from section ${section} (Level ${sectionLevel(
    section,
  )}) at Stadium Bukit Jalil (TM Stadium Nasional), Kuala Lumpur. See what the pitch and stage look like from this seat before you buy.`;
}
