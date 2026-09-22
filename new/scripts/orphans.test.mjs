import assert from "node:assert/strict";
import test from "node:test";

import { orphansToDelete } from "../functions/lib/orphans.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 8, 21);
const THRESHOLD = 30 * DAY;

function pending(key, ageInDays) {
  return { key, uploadedAt: new Date(NOW - ageInDays * DAY) };
}

function decide(pendingObjects, referenced) {
  return orphansToDelete({
    pending: pendingObjects,
    referenced,
    olderThanMs: THRESHOLD,
    now: NOW,
  });
}

test("deletes a photo nothing points at once it is old enough", () => {
  const orphans = decide([pending("pending/abc.jpg", 31)], []);

  assert.deepEqual(orphans, ["pending/abc.jpg"]);
});

test("keeps a photo that was never published but is still recent", () => {
  const orphans = decide([pending("pending/abc.jpg", 29)], []);

  assert.deepEqual(orphans, []);
});

test("keeps a published photo however old it is", () => {
  const orphans = decide(
    [pending("pending/abc.jpg", 3650)],
    ["pending/abc.jpg"],
  );

  assert.deepEqual(orphans, []);
});

test("the threshold is inclusive, so a photo on the boundary goes", () => {
  assert.deepEqual(decide([pending("pending/abc.jpg", 30)], []), [
    "pending/abc.jpg",
  ]);
});

test("sorts through a mixed pile", () => {
  const orphans = decide(
    [
      pending("pending/published-old.jpg", 100),
      pending("pending/rejected-old.jpg", 100),
      pending("pending/rejected-new.jpg", 1),
    ],
    ["pending/published-old.jpg"],
  );

  assert.deepEqual(orphans, ["pending/rejected-old.jpg"]);
});

test("an empty pending area deletes nothing", () => {
  assert.deepEqual(decide([], ["pending/abc.jpg"]), []);
});
