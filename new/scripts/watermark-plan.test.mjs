import assert from "node:assert/strict";
import test from "node:test";

import {
  isPendingPhotoKey,
  photoKeysFromContributions,
  planWatermarks,
  WATERMARK_OPACITY,
  watermarkSvg,
} from "./watermark-plan.mjs";
import { WORDMARK_PATH } from "./watermark-wordmark.mjs";

const PENDING = "pending/11111111-1111-4111-8111-111111111111.jpg";
const PENDING_PNG = "pending/22222222-2222-4222-8222-222222222222.png";
const LEGACY = "seats/2J-2.jpg";

test("only pending uploads are watermarkable", () => {
  assert.equal(isPendingPhotoKey(PENDING), true);
  assert.equal(isPendingPhotoKey(PENDING_PNG), true);
  assert.equal(
    isPendingPhotoKey(LEGACY),
    false,
    "legacy photos are out of reach",
  );
  assert.equal(isPendingPhotoKey("pending/not-a-uuid.jpg"), false);
  assert.equal(
    isPendingPhotoKey("pending/11111111-1111-4111-8111-111111111111.gif"),
    false,
  );
  assert.equal(isPendingPhotoKey(undefined), false);
});

test("collects pending keys from Contributions, ignoring legacy and junk", () => {
  const keys = photoKeysFromContributions([
    { photo: PENDING },
    { photo: LEGACY },
    { photo: PENDING },
    { photo: PENDING_PNG },
    { photo: null },
    {},
  ]);

  assert.deepEqual(keys, [PENDING, PENDING_PNG]);
});

test("plans nothing for a photo already carrying the marker", () => {
  const contributions = [{ photo: PENDING }, { photo: PENDING_PNG }];

  assert.deepEqual(planWatermarks({ contributions, watermarked: [PENDING] }), [
    PENDING_PNG,
  ]);
  assert.deepEqual(
    planWatermarks({ contributions, watermarked: [PENDING, PENDING_PNG] }),
    [],
  );
});

test("plans every pending photo on a first run", () => {
  assert.deepEqual(planWatermarks({ contributions: [{ photo: PENDING }] }), [
    PENDING,
  ]);
});

test("the overlay is sized to the photo and carries the outlined wordmark", () => {
  const svg = watermarkSvg(1280, 960);

  assert.match(svg, /width="1280"/);
  assert.match(svg, /height="960"/);
  assert.match(svg, /viewBox="0 0 1280 960"/);
  assert.match(svg, /<pattern/);
  assert.match(svg, /rotate\(-30\)/);
  assert.ok(
    svg.includes(WORDMARK_PATH),
    "the wordmark is drawn as an outlined path, not live text",
  );
  assert.equal(
    svg.includes("BUKITJALILSTADIUM.COM"),
    false,
    "no live text means no font is needed at render time",
  );
  assert.ok(svg.includes(`opacity="${WATERMARK_OPACITY}"`));
});

test("scales the tile with the image rather than the pixel count", () => {
  const small = watermarkSvg(1000, 750);
  const large = watermarkSvg(4000, 3000);

  const tileWidth = (svg) => Number(svg.match(/<pattern id="tile" width="(\d+)"/)[1]);
  assert.equal(tileWidth(large) / tileWidth(small), 4);
});

test("refuses a photo with no size", () => {
  assert.throws(() => watermarkSvg(0, 100));
  assert.throws(() => watermarkSvg(undefined, undefined));
});
