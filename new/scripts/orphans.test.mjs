import assert from "node:assert/strict";
import test from "node:test";

import {
  orphansToDelete,
  photosUnderReview,
} from "../functions/lib/orphans.ts";

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

test("finds the photos an open pull request is still waiting on", () => {
  const keys = photosUnderReview([
    {
      body: [
        "Contribution `c-abc123` for **Section 104**, 2 photo(s).",
        "",
        "Preview before merging (these links are public but unguessable):",
        "1. https://storage.bukitjalilstadium.com/pending/11111111-1111-4111-8111-111111111111.jpg",
        "2. https://storage.bukitjalilstadium.com/pending/22222222-2222-4222-8222-222222222222.png",
      ].join("\n"),
    },
  ]);

  assert.deepEqual(keys.sort(), [
    "pending/11111111-1111-4111-8111-111111111111.jpg",
    "pending/22222222-2222-4222-8222-222222222222.png",
  ]);
});

test("a photo listed by two pull requests is protected once", () => {
  const body =
    "https://storage.bukitjalilstadium.com/pending/11111111-1111-4111-8111-111111111111.jpg";
  const keys = photosUnderReview([{ body }, { body }]);

  assert.deepEqual(keys, [
    "pending/11111111-1111-4111-8111-111111111111.jpg",
  ]);
});

test("pull requests with no body protect nothing", () => {
  assert.deepEqual(photosUnderReview([{}, { body: null }, { body: "" }]), []);
});

test("a photo under review is kept however old it is", () => {
  const key = "pending/11111111-1111-4111-8111-111111111111.jpg";
  const orphans = orphansToDelete({
    pending: [{ key, uploadedAt: new Date(NOW - 400 * DAY) }],
    referenced: photosUnderReview([{ body: `preview: ${key}` }]),
    olderThanMs: THRESHOLD,
    now: NOW,
  });

  assert.deepEqual(orphans, []);
});
