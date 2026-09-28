/**
 * The reasoning half of the publish-time watermark: which photos need it, and
 * what the overlay looks like. Kept free of `sharp`, S3 and the filesystem so
 * it runs under `node --test scripts/` without the tool's dependencies
 * installed. The IO half is `new/tools/watermark/watermark.mjs`.
 *
 * Plain `.mjs` rather than TypeScript for the same reason as
 * `generate-referenced-photos.mjs`: this runs as a CI step under whatever Node
 * the runner provides.
 */

import { WORDMARK_PATH, WORDMARK_UNITS_PER_EM } from "./watermark-wordmark.mjs";

/** The tiled wordmark drawn across every new photo. */
export const WATERMARK_LABEL = "BUKITJALILSTADIUM.COM";
export const WATERMARK_COLOUR = "#ffd400";
export const WATERMARK_OPACITY = 0.1;

/** Object metadata marking a photo as already watermarked, so a re-run is a
 * no-op rather than a second pass of ink. */
export const WATERMARKED_METADATA_KEY = "watermarked";
export const WATERMARKED_METADATA_VALUE = "v1";

// The shape the contribute form accepts (new/app/lib/submission.ts). Only keys
// this site uploaded through the form may be watermarkable, which is what keeps
// the legacy `seats/*` photos out of reach.
const PENDING_PHOTO_KEY = /^pending\/[0-9a-f-]{36}\.(jpg|png)$/;

export function isPendingPhotoKey(key) {
  return typeof key === "string" && PENDING_PHOTO_KEY.test(key);
}

/**
 * The photo keys a set of Contributions point at, deduplicated and limited to
 * the pending keys this tool may touch. Legacy photos are named `seats/*` and
 * are filtered out here, so they are never re-watermarked.
 */
export function photoKeysFromContributions(contributions) {
  const keys = new Set();

  for (const contribution of contributions) {
    const key = contribution?.photo;
    if (isPendingPhotoKey(key)) keys.add(key);
  }

  return [...keys];
}

/**
 * Which pending photos still need the watermark. `watermarked` is the set of
 * keys already carrying the marker, read from object metadata, so the plan is
 * empty on a repeat run.
 */
export function planWatermarks({ contributions, watermarked = [] }) {
  const done = new Set(watermarked);
  return photoKeysFromContributions(contributions).filter(
    (key) => !done.has(key),
  );
}

/**
 * A full-frame SVG overlay: the wordmark tiled diagonally in the one accent,
 * sized to the photo so it composites 1:1 and the mark scales with the image
 * instead of staying a fixed pixel size. The wordmark is an outlined path, not
 * live text, so it needs no font on the machine that renders it.
 */
export function watermarkSvg(width, height) {
  if (!(width > 0) || !(height > 0)) {
    throw new Error(
      `a watermark needs a positive size, got ${width}x${height}`,
    );
  }

  const font = Math.round(width * 0.032);
  const scale = font / WORDMARK_UNITS_PER_EM;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="tile" width="${font * 20}" height="${font * 7}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <path d="${WORDMARK_PATH}" transform="translate(0 ${font}) scale(${scale} ${-scale})" fill="${WATERMARK_COLOUR}"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#tile)" opacity="${WATERMARK_OPACITY}"/>
</svg>`;
}
