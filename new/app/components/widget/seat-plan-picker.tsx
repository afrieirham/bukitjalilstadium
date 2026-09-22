import { useEffect, useRef, useState } from "react";

import {
  CollapseIcon,
  ExpandIcon,
  Refresh04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useGesture } from "@use-gesture/react";

import { Button } from "~/components/core/button";
import { Slider } from "~/components/core/slider";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

import {
  gates,
  lrtLabel,
  outerRingPath,
  sections,
  standingPath,
} from "./seat-plan-data";

const initialState = { x: 0, y: 0, scale: 1 };
const minScale = 1;
const maxScale = 5;

function clampPosition(
  crop: typeof initialState,
  cw: number,
  ch: number,
): typeof initialState {
  const mx = Math.max(0, (cw * (crop.scale - minScale)) / (2 * crop.scale));
  const my = Math.max(0, (ch * (crop.scale - minScale)) / (2 * crop.scale));
  return {
    ...crop,
    x: Math.min(mx, Math.max(-mx, crop.x)),
    y: Math.min(my, Math.max(-my, crop.y)),
  };
}

function clampCrop(
  crop: typeof initialState,
  cw: number,
  ch: number,
): typeof initialState {
  return clampPosition(
    {
      ...crop,
      scale: Math.min(maxScale, Math.max(minScale, crop.scale)),
    },
    cw,
    ch,
  );
}

function SeatPlanPicker({
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
  const [crop, setCrop] = useState(initialState);
  const [[cw, ch], setContainerSize] = useState<[number, number]>([0, 0]);
  const [dragging, setDragging] = useState(false);
  const [pinching, setPinching] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize([width, height]);
      setCrop((crop) => clampCrop(crop, width, height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bx = Math.max(0, (cw * (crop.scale - minScale)) / 2);
  const by = Math.max(0, (ch * (crop.scale - minScale)) / 2);

  useGesture(
    {
      onDrag: ({ offset: [dx, dy], movement: [mx, my] }) => {
        if (Math.abs(mx) > 4 || Math.abs(my) > 4) hasDraggedRef.current = true;
        setCrop((crop) => ({
          ...crop,
          x: dx / crop.scale,
          y: dy / crop.scale,
        }));
      },
      onDragStart: () => {
        hasDraggedRef.current = false;
        setDragging(true);
      },
      onDragEnd: () => {
        setDragging(false);
        setCrop((crop) => clampCrop(crop, cw, ch));
      },
      onPinch: ({ offset: [d] }) => {
        setCrop((crop) => clampPosition({ ...crop, scale: d }, cw, ch));
      },
      onPinchStart: () => setPinching(true),
      onPinchEnd: () => {
        setPinching(false);
        setCrop((crop) => clampCrop(crop, cw, ch));
      },
    },
    {
      drag: {
        from: () => [crop.x * crop.scale, crop.y * crop.scale],
        bounds: { left: -bx, right: bx, top: -by, bottom: by },
        rubberband: true,
      },
      pinch: {
        from: () => [crop.scale, 0],
        scaleBounds: { min: minScale, max: maxScale },
        pinchOnWheel: true,
        rubberband: true,
      },
      target: imageRef,
      eventOptions: { passive: false },
    },
  );

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4",
        fullScreen && "absolute top-0 z-10 h-dvh w-dvw p-0",
        className,
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted md:aspect-video",
          fullScreen && "h-full",
          !fullScreen && "border-border border",
        )}
      >
        <SeatPlan
          ref={imageRef}
          crop={crop}
          gesturing={dragging || pinching || sliding}
          hasDraggedRef={hasDraggedRef}
          populated={populated}
          selected={selected}
          onSelect={onSelect}
        />
        <div
          className="absolute bottom-0 flex w-full max-w-sm flex-row items-center gap-2 p-2 md:right-0 md:w-auto md:flex-col md:p-4"
          onPointerDown={() => setSliding(true)}
          onPointerUp={() => setSliding(false)}
          onPointerCancel={() => setSliding(false)}
        >
          <Slider
            step={0.01}
            min={minScale}
            max={maxScale}
            value={crop.scale}
            orientation={isMobile ? "horizontal" : "vertical"}
            onValueChange={(v) => {
              setCrop((crop) =>
                clampCrop({ ...crop, scale: v as number }, cw, ch),
              );
            }}
            variant="muted"
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCrop(initialState)}
            className="text-muted-foreground"
            aria-label="reset"
          >
            <HugeiconsIcon icon={Refresh04Icon} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setFullScreen(!fullScreen)}
            className="text-muted-foreground"
            aria-label={fullScreen ? "minimize" : "full screen"}
          >
            <HugeiconsIcon icon={fullScreen ? CollapseIcon : ExpandIcon} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel(props: { x: number; y: number; children: string; }) {
  return (
    <text
      x={props.x}
      y={props.y}
      className="pointer-events-none fill-muted-foreground select-none"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={24}
    >
      {props.children}
    </text>
  );
}

function SeatPlan(props: {
  ref: React.RefObject<null>;
  crop: typeof initialState;
  gesturing: boolean;
  hasDraggedRef: React.RefObject<boolean>;
  populated: string[];
  selected: string | null;
  onSelect: (section: string) => void;
}) {
  const { ref, crop, gesturing, hasDraggedRef, populated, selected, onSelect } =
    props;

  return (
    <svg
      viewBox="0 0 1737 1414"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative h-full w-full p-6 active:cursor-move"
      onClickCapture={(e) => {
        if (hasDraggedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          hasDraggedRef.current = false;
        }
      }}
      style={{
        transform: `scale(${crop.scale}) translate(${crop.x}px, ${crop.y}px)`,
        transition: gesturing ? "none" : "transform 150ms ease-out",
        touchAction: "none",
      }}
      ref={ref}
    >
      <g id="seat-map">
        <path
          id="outer-ring"
          d={outerRingPath}
          className="stroke-border stroke-2"
        />
        <path id="standing" d={standingPath} className="interactive-svg" />
        {sections.map((section) => {
          const hasPhotos = populated.includes(section.id);
          const isSelected = selected === section.id;

          return (
            <g key={section.id} id={section.id}>
              <path
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
              <SectionLabel x={section.labelX} y={section.labelY}>
                {section.id}
              </SectionLabel>
            </g>
          );
        })}
        <g id="gate">
          {gates.map((gate) => (
            <SectionLabel key={gate.label} x={gate.x} y={gate.y}>
              {gate.label}
            </SectionLabel>
          ))}
        </g>
        <g id="lrt-label">
          <rect
            x="1431.5"
            y="54.5"
            width="270"
            height="48"
            rx="9.5"
            className="interactive-svg"
          />
          <SectionLabel x={lrtLabel.x} y={lrtLabel.y}>
            {lrtLabel.text}
          </SectionLabel>
        </g>
      </g>
    </svg>
  );
}

export { SeatPlanPicker };
