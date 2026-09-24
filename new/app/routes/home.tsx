import { useEffect, useState } from "react";

import {
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";

import { PageContainer } from "~/components/core/app-shell";
import { Button } from "~/components/core/button";
import { Input } from "~/components/core/input";
import { sections } from "~/components/widget/seat-plan-data";
import { SectionLocator } from "~/components/widget/section-locator";
import { SectionPhotoViewer } from "~/components/widget/section-photo-viewer";
import { contributions } from "~/data/contributions";
import { useHydrated } from "~/hooks/use-hydrated";
import {
  photosBySection,
  populatedSections,
  sectionSlug,
  type Contribution,
} from "~/lib/contributions";
import {
  findSectionByQuery,
  sectionLevel,
  sectionLevelShift,
  sectionNeighbours,
} from "~/lib/sections";
import { SITE_NAME, SITE_URL } from "~/lib/site";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/home";

const sectionIds = sections.map((section) => section.id);

const TITLE = `Stadium Bukit Jalil (TM Stadium Nasional) Seating View | ${SITE_NAME}`;
const DESCRIPTION =
  "Field view from seats in each section inside Stadium Bukit Jalil (TM Stadium Nasional) — see what the pitch and stage look like from your seat before you buy.";

const stadiumSchema = {
  "@context": "https://schema.org",
  "@type": "StadiumOrArena",
  name: "Stadium Bukit Jalil",
  alternateName: [
    "TM Stadium Nasional",
    "Stadium Nasional Bukit Jalil",
    "Bukit Jalil National Stadium",
    "National Stadium Bukit Jalil",
  ],
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bukit Jalil Sports Complex, Jalan Barat",
    addressLocality: "Kuala Lumpur",
    postalCode: "57000",
    addressCountry: "MY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 3.0546304,
    longitude: 101.6912767,
  },
  sameAs: ["https://en.wikipedia.org/wiki/Bukit_Jalil_National_Stadium"],
};

export function loader() {
  return {
    photosBySection: Object.fromEntries(photosBySection(contributions)),
    populatedSections: [...populatedSections(contributions)],
  };
}

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const onlySearchChanged =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search;

  return onlySearchChanged ? false : defaultShouldRevalidate;
}

export function meta() {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { tagName: "link", rel: "canonical", href: SITE_URL },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hydrated = useHydrated();

  const slug = searchParams.get("section");
  const matched = sectionIds.find((id) => sectionSlug(id) === slug) ?? null;

  // The prerendered HTML never has a Section selected, because a static host
  // cannot build every ?section= variant. Selection is applied after hydration,
  // and a visit with no Section starts on the first one that has a photo.
  const photographed = new Set(loaderData.populatedSections);
  const firstPhotographed =
    sectionIds.find((id) => photographed.has(id)) ?? null;
  const selected = hydrated ? (matched ?? firstPhotographed) : null;

  const photos = selected ? (loaderData.photosBySection[selected] ?? []) : [];

  function selectSection(section: string | null) {
    const next = new URLSearchParams(searchParams);
    const wasOpen = searchParams.has("section");

    if (section) next.set("section", sectionSlug(section));
    else next.delete("section");

    // Opening pushes a history entry so the browser Back button returns to the
    // whole map; changing or closing replaces, so stepping around the bowl does
    // not pile up entries.
    setSearchParams(next, { replace: wasOpen, preventScrollReset: true });
  }

  useSectionKeyboard({ selected, onSelect: selectSection });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stadiumSchema) }}
      />

      <PageContainer className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xl font-semibold">
            Seat views from every Section
          </h1>
          <p className="text-muted-foreground text-sm">
            {sectionIds.length} Sections · {loaderData.populatedSections.length}{" "}
            with a photo
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <aside className="flex flex-col gap-4 lg:order-2">
            <FindSection onSelect={selectSection} />

            <section className="border-border flex flex-col gap-2 rounded-lg border p-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Where this is
              </h2>
              <SectionLocator
                populated={loaderData.populatedSections}
                selected={selected}
                onSelect={selectSection}
              />
              <p className="text-muted-foreground text-xs">
                Rings are Levels 1, 2 and 3, from the pitch outward.
              </p>
            </section>

            <SectionCard
              selected={selected}
              photos={photos}
              onSelect={selectSection}
            />
          </aside>

          <div className="lg:order-1">
            {selected ? (
              <SectionPhotoViewer
                key={selected}
                section={selected}
                photos={photos}
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function FindSection({ onSelect }: { onSelect: (section: string) => void }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  return (
    <form
      className="border-border flex flex-col gap-2 rounded-lg border p-3"
      onSubmit={(event) => {
        event.preventDefault();

        const found = findSectionByQuery(value, sectionIds);
        if (!found) {
          setInvalid(true);
          return;
        }

        setValue("");
        setInvalid(false);
        onSelect(found);
      }}
    >
      <label
        htmlFor="find-section"
        className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        Find your Section
      </label>
      <div className="flex gap-2">
        <Input
          id="find-section"
          value={value}
          placeholder="201A-B"
          aria-invalid={invalid}
          onChange={(event) => {
            setValue(event.target.value);
            setInvalid(false);
          }}
        />
        <Button type="submit">Open</Button>
      </div>
      <p
        className={cn(
          "text-xs",
          invalid ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {invalid
          ? "No Section matches that."
          : "The Section from your ticket, or tap the bowl below."}
      </p>
    </form>
  );
}

function SectionCard({
  selected,
  photos,
  onSelect,
}: {
  selected: string | null;
  photos: Contribution[];
  onSelect: (section: string) => void;
}) {
  if (!selected) {
    return (
      <section className="border-border text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
        Pick a Section on the bowl, or type its number, to see the view from it.
      </section>
    );
  }

  const { left, right } = sectionNeighbours(selected, sectionIds);

  return (
    <section className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div>
        <h2 className="text-lg font-semibold">Section {selected}</h2>
        <p className="text-muted-foreground text-sm">
          Level {sectionLevel(selected)} ·{" "}
          {photos.length
            ? `${photos.length} photo${photos.length > 1 ? "s" : ""}`
            : "no photo yet"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onSelect(left)}
        >
          ← {left}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onSelect(right)}
        >
          {right} →
        </Button>
      </div>

      <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
        <Key>←</Key>
        <Key>→</Key>
        <span>change Section</span>
        <span className="mx-1">·</span>
        <Key>↑</Key>
        <Key>↓</Key>
        <span>change Level</span>
      </p>
    </section>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-sans text-[11px]">
      {children}
    </kbd>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="border-border bg-muted/40 text-muted-foreground flex min-h-72 items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm">
      Pick a Section to see the view from it.
    </div>
  );
}

/**
 * Arrow keys browse Sections the way the bowl is laid out: left and right move
 * around the current Level, up and down move between Levels. Typing in a field
 * is never hijacked.
 */
function useSectionKeyboard({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (section: string) => void;
}) {
  useEffect(() => {
    if (!selected) return;

    const current = selected;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (typing) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const { left, right } = sectionNeighbours(current, sectionIds);
        onSelect(event.key === "ArrowLeft" ? left : right);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const moved = sectionLevelShift(
          current,
          sectionIds,
          event.key === "ArrowUp" ? -1 : 1,
        );

        if (moved) {
          event.preventDefault();
          onSelect(moved);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected, onSelect]);
}
