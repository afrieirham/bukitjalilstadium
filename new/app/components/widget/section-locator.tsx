import { cn } from "~/lib/utils";

import { outerRingPath, sections, standingPath } from "./seat-plan-data";

/**
 * The seat plan as a locator rather than a browse surface: a small bowl that
 * says where the current Section sits, and that can be tapped to move to
 * another one. The full-size, zoomable plan lives on the map.
 */
export function SectionLocator({
  populated,
  selected,
  onSelect,
  className,
}: {
  populated: string[];
  selected: string | null;
  onSelect: (section: string) => void;
  className?: string;
}) {
  const photographed = new Set(populated);

  return (
    <svg
      viewBox="0 0 1737 1414"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="group"
      aria-label="Where this Section sits in the stadium"
      className={cn("h-auto w-full", className)}
    >
      <path d={outerRingPath} className="stroke-border stroke-2" />
      <path d={standingPath} className="fill-muted/50 stroke-border" />
      {sections.map((section) => {
        const hasPhotos = photographed.has(section.id);
        const isSelected = selected === section.id;

        return (
          <path
            key={section.id}
            d={section.d}
            data-empty={hasPhotos ? undefined : true}
            data-selected={isSelected ? true : undefined}
            role="button"
            tabIndex={0}
            aria-label={
              hasPhotos
                ? `Section ${section.id}`
                : `Section ${section.id}, no photos yet`
            }
            aria-pressed={isSelected}
            onClick={() => onSelect(section.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(section.id);
              }
            }}
            className="seat-section"
            strokeLinejoin={section.roundJoin ? "round" : undefined}
          />
        );
      })}
    </svg>
  );
}
