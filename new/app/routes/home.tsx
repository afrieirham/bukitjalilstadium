import { useEffect, useState } from "react";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";

import { SectionLocator } from "~/components/widget/section-locator";
import { sections } from "~/components/widget/seat-plan-data";
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
  sectionOrder,
} from "~/lib/sections";
import { SITE_NAME, SITE_URL, photoUrl } from "~/lib/site";
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
  const grouped = photosBySection(contributions);

  return {
    photosBySection: Object.fromEntries(grouped),
    populatedSections: [...populatedSections(contributions)],
    counts: Object.fromEntries(
      [...grouped].map(([id, list]) => [id, list.length]),
    ),
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

  const level = selected ? sectionLevel(selected) : 2;
  const coverage = Math.round(
    (loaderData.populatedSections.length / sectionIds.length) * 100,
  );
  const onLevel = sectionOrder(
    sectionIds.filter((id) => sectionLevel(id) === level),
  );

  return (
    <div className="home">
      <h1 className="sr-only">
        Seat views from every Section at Stadium Bukit Jalil
      </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stadiumSchema) }}
      />

      <div className="home-nodes">
        {([1, 2, 3] as const).map((n) => (
          <button
            key={n}
            type="button"
            className="home-node"
            data-on={level === n ? "" : undefined}
            onClick={() => {
              const first =
                sectionIds.find(
                  (id) => sectionLevel(id) === n && photographed.has(id),
                ) ?? sectionIds.find((id) => sectionLevel(id) === n);
              if (first) selectSection(first);
            }}
          >
            Level {n}
            <em>
              {loaderData.populatedSections.filter(
                (id) => sectionLevel(id) === n,
              ).length}{" "}
              photographed
            </em>
          </button>
        ))}

        <FindSection onSelect={selectSection} />

        <span className="home-cov">
          <b>{loaderData.populatedSections.length}</b> / {sectionIds.length}{" "}
          Sections photographed
        </span>
      </div>

      <div className="home-rule" aria-hidden>
        <span style={{ width: `${coverage}%` }} />
      </div>

      <div className="home-body">
        <section className="home-stage">
          <div className="home-photo">
            {selected && photos[0] ? (
              <SectionPhoto key={selected} section={selected} photos={photos} />
            ) : (
              <div className="home-nophoto">
                {selected ? (
                  <>
                    <p>No photo for Section {selected} yet.</p>
                    <p className="text-sm">
                      If you have one, it would help the next person decide.{" "}
                      <Link
                        to={`/contribute?section=${sectionSlug(selected)}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Share a photo
                      </Link>
                    </p>
                  </>
                ) : (
                  <p>
                    Pick a Section on the bowl, or type its number, to see the
                    view from it.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="home-cap">
            <b>Section {selected ?? "—"}</b>
            <span>Level {selected ? sectionLevel(selected) : "—"}</span>
            <span>
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </span>
            <span className="home-date">{photos[0]?.date ?? "undated"}</span>
          </div>
        </section>

        <aside className="home-rail">
          <div className="home-map">
            <SectionLocator
              populated={loaderData.populatedSections}
              selected={selected}
              onSelect={selectSection}
            />
          </div>

          <div className="home-readout">
            <div>
              <span>Section</span>
              <b>{selected ?? "—"}</b>
            </div>
            <div>
              <span>Level</span>
              <b>{selected ? sectionLevel(selected) : "—"}</b>
            </div>
            <div>
              <span>Photos</span>
              <b>{photos.length}</b>
            </div>
          </div>

          {selected && (
            <div className="home-jump">
              <button
                type="button"
                onClick={() => {
                  const { left } = sectionNeighbours(selected, sectionIds);
                  selectSection(left);
                }}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} aria-hidden />
                {sectionNeighbours(selected, sectionIds).left}
              </button>
              <button
                type="button"
                onClick={() => {
                  const { right } = sectionNeighbours(selected, sectionIds);
                  selectSection(right);
                }}
              >
                {sectionNeighbours(selected, sectionIds).right}
                <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden />
              </button>
            </div>
          )}

          <ol className="home-list">
            {onLevel.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="home-row"
                  data-on={id === selected ? "" : undefined}
                  style={{ opacity: photographed.has(id) ? 1 : 0.7 }}
                  onClick={() => selectSection(id)}
                >
                  <b>{id}</b>
                  <span>Level {sectionLevel(id)}</span>
                  <span>{loaderData.counts[id] ?? 0} ph.</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

/**
 * One Section's photo at the size the view deserves, with the Section's other
 * photos as a thin strip under it. The parent keys this by Section so a new
 * Section starts at its first photo.
 */
function SectionPhoto({
  section,
  photos,
}: {
  section: string;
  photos: Contribution[];
}) {
  const [chosen, setChosen] = useState(0);
  const active = Math.min(chosen, photos.length - 1);
  const photo = photos[active];

  return (
    <figure className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <img
          src={photoUrl(photo.photo)}
          alt={photo.caption ?? `View from Section ${section}`}
          className="home-shot"
        />
      </div>
      {photos.length > 1 && (
        <div
          className="border-border flex shrink-0 gap-2 border-t p-2"
          role="group"
          aria-label={`Photos of Section ${section}`}
        >
          {photos.map((item, position) => (
            <button
              key={item.submissionId}
              type="button"
              aria-current={position === active ? "true" : undefined}
              aria-label={`Photo ${position + 1} of ${photos.length}`}
              onClick={() => setChosen(position)}
              className={cn(
                "overflow-hidden rounded border-2 leading-none transition-colors",
                position === active
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground",
              )}
            >
              <img
                src={photoUrl(item.photo)}
                alt=""
                className="bg-muted h-12 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

function FindSection({ onSelect }: { onSelect: (section: string) => void }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  return (
    <form
      className="home-find"
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
      <input
        value={value}
        placeholder="Find your Section — 201A-B"
        aria-label="Find your Section"
        aria-invalid={invalid}
        aria-describedby={invalid ? "home-find-error" : undefined}
        data-invalid={invalid ? "" : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setInvalid(false);
        }}
      />
      <button type="submit">Find</button>
      {invalid && (
        <span id="home-find-error" role="alert" className="home-error">
          No Section matches that. Check the number on your ticket.
        </span>
      )}
    </form>
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
