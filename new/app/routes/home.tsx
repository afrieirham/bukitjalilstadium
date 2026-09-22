import { useSearchParams } from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";

import { PageContainer } from "~/components/core/app-shell";
import { SeatPlanPicker } from "~/components/widget/seat-plan-picker";
import {
  SectionPanelContent,
  SectionPanelPlaceholder,
  SectionSheet,
} from "~/components/widget/section-panel";
import { sections } from "~/components/widget/seat-plan-data";
import { contributions } from "~/data/contributions";
import {
  photosBySection,
  populatedSections,
  sectionSlug,
} from "~/lib/contributions";
import { useHydrated } from "~/hooks/use-hydrated";
import { useIsMobile } from "~/hooks/use-mobile";
import { SITE_NAME, SITE_URL } from "~/lib/site";

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
  const isMobile = useIsMobile();

  // The prerendered HTML for "/" never has a Section selected, since a static
  // host cannot prerender every ?section= variant. Selection is therefore
  // applied after hydration, or the two renders disagree.
  const hydrated = useHydrated();

  const slug = searchParams.get("section");
  const selected = hydrated
    ? (sectionIds.find((id) => sectionSlug(id) === slug) ?? null)
    : null;
  const photos = selected ? (loaderData.photosBySection[selected] ?? []) : [];

  function selectSection(section: string | null) {
    const next = new URLSearchParams(searchParams);
    const wasOpen = searchParams.has("section");

    if (section) next.set("section", sectionSlug(section));
    else next.delete("section");

    // Opening the gallery pushes a history entry so the browser Back button
    // closes it; changing or closing it replaces, so selecting around the map
    // does not pile up entries.
    setSearchParams(next, { replace: wasOpen, preventScrollReset: true });
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stadiumSchema) }}
      />

      <PageContainer>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_22rem]">
          <SeatPlanPicker
            populated={loaderData.populatedSections}
            selected={selected}
            onSelect={selectSection}
          />

          <aside className="hidden md:block">
            {selected ? (
              <SectionPanelContent
                section={selected}
                photos={photos}
                onClose={() => selectSection(null)}
              />
            ) : (
              <SectionPanelPlaceholder />
            )}
          </aside>
        </div>
      </PageContainer>

      {isMobile && selected && (
        <SectionSheet
          section={selected}
          photos={photos}
          onClose={() => selectSection(null)}
        />
      )}
    </div>
  );
}
