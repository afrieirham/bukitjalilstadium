import { Link, useSearchParams } from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";

import { buttonVariants } from "~/components/core/button";
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
import { cn } from "~/lib/utils";

import type { Route } from "./+types/home";

const sectionIds = sections.map((section) => section.id);

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
    {
      title: "Stadium Bukit Jalil seat views | BukitJalilStadium.com",
    },
    {
      name: "description",
      content:
        "See what the pitch and stage look like from every Section of Stadium Bukit Jalil (TM Stadium Nasional), Kuala Lumpur, using photos shared by fans.",
    },
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
      <nav className="mx-auto mb-4 flex max-w-7xl items-center justify-between p-4">
        <Logo />
        <Link to="/contribute" className={cn(buttonVariants({ variant: "ghost" }))}>
          Upload Photo
        </Link>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-[minmax(0,1fr)_22rem]">
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

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/logo.png" alt="Bukit Jalil Stadium" className="size-10" />
    </Link>
  );
}
