import { useEffect, useRef, useState } from "react";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useGesture } from "@use-gesture/react";
import { Link } from "react-router";

import { Button, buttonVariants } from "~/components/core/button";
import { SectionGallery } from "~/components/widget/section-gallery";
import { sectionSlug, type Contribution } from "~/lib/contributions";
import { sectionLevel } from "~/lib/sections";
import { cn } from "~/lib/utils";

function SectionPanelContent({
  section,
  photos,
  onClose,
}: {
  section: string;
  photos: Contribution[];
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">Section {section}</h2>
          <p className="text-muted-foreground text-sm">
            Level {sectionLevel(section)}
          </p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        )}
      </header>

      <SectionGallery
        section={section}
        photos={photos}
        className="grid-cols-1"
      />

      <Link
        to={`/${sectionSlug(section)}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "self-start",
        )}
      >
        Open Section page
      </Link>
    </div>
  );
}

function SectionPanelPlaceholder() {
  return (
    <div className="border-border text-muted-foreground flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm">
      Select a Section on the map to see photos taken from it.
    </div>
  );
}

const SNAPS = [0, 0.34, 0.64];
const PEEK = SNAPS[SNAPS.length - 1];

function SectionSheet({
  section,
  photos,
  onClose,
}: {
  section: string;
  photos: Contribution[];
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const fractionRef = useRef(SNAPS[1]);
  const [fraction, setFraction] = useState<number>(SNAPS[1]);
  const [dragging, setDragging] = useState(false);

  // The sheet mounts when it opens and unmounts when it closes, so this is the
  // open/close lifecycle. Kept in a ref so a new onClose identity each render
  // cannot tear the effect down and steal focus back mid-drag.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", onKeyDown);

    // The sheet covers the page; scrolling the page behind it is never wanted.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  function move(next: number) {
    fractionRef.current = next;
    setFraction(next);
  }

  useGesture(
    {
      onDragStart: () => setDragging(true),
      onDrag: ({ movement: [, my] }) => {
        const height = sheetRef.current?.offsetHeight ?? 1;
        move(
          Math.min(PEEK, Math.max(0, fractionRef.current + my / height)),
        );
      },
      onDragEnd: () => {
        setDragging(false);
        move(
          SNAPS.reduce((closest, snap) =>
            Math.abs(snap - fractionRef.current) <
            Math.abs(closest - fractionRef.current)
              ? snap
              : closest,
          ),
        );
      },
    },
    { target: handleRef, drag: { filterTaps: true } },
  );

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-label={`Photos from Section ${section}`}
      tabIndex={-1}
      className={cn(
        "bg-background border-border fixed inset-x-0 bottom-0 z-40 flex h-[80vh] flex-col rounded-t-xl border-t shadow-lg outline-none md:hidden",
        dragging ? "transition-none" : "transition-transform duration-200 ease-out",
      )}
      style={{ transform: `translateY(${fraction * 100}%)` }}
    >
      <div
        ref={handleRef}
        className="flex shrink-0 cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
      >
        <span className="bg-border h-1.5 w-10 rounded-full" />
      </div>

      <div className="overflow-y-auto px-4 pb-8">
        <SectionPanelContent
          section={section}
          photos={photos}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export { SectionPanelContent, SectionPanelPlaceholder, SectionSheet };
