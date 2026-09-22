import assert from "node:assert/strict";
import test from "node:test";

import {
  MERGED_GRACE_MS,
  parsePullRequests,
  stalePullRequests,
  sweepDecisions,
} from "../functions/lib/sweep.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 8, 21);
const THRESHOLD = 30 * DAY;

const OLD = "pending/11111111-1111-4111-8111-111111111111.jpg";
const OTHER = "pending/22222222-2222-4222-8222-222222222222.png";

function pending(key, ageInDays) {
  return { key, uploadedAt: new Date(NOW - ageInDays * DAY) };
}

function review({ branch = "contribution/c-one", open = true, merged = false, photos = [OLD] } = {}) {
  return { branch, open, merged, photos, openedAt: new Date(NOW - DAY) };
}

function decide({ pendingObjects, reviews = [], published = [], olderThanMs = THRESHOLD }) {
  return sweepDecisions({
    pending: pendingObjects,
    reviews,
    published,
    olderThanMs,
    now: NOW,
  });
}

function reasonFor(decisions, key) {
  return decisions.find((decision) => decision.key === key)?.reason;
}

test("a photo in an open pull request is kept, however old", () => {
  const decisions = decide({
    pendingObjects: [pending(OLD, 400)],
    reviews: [review({ open: true })],
  });

  assert.equal(reasonFor(decisions, OLD), "under-review");
  assert.equal(decisions[0].delete, false);
});

test("a photo in a closed, unmerged pull request is rejected", () => {
  const decisions = decide({
    pendingObjects: [pending(OLD, 1)],
    reviews: [review({ open: false, merged: false })],
  });

  assert.equal(reasonFor(decisions, OLD), "rejected");
  assert.equal(decisions[0].delete, true);
});

test("a merged pull request keeps what it publishes", () => {
  const decisions = decide({
    pendingObjects: [pending(OLD, 5)],
    reviews: [review({ open: false, merged: true })],
    published: [OLD],
  });

  assert.equal(reasonFor(decisions, OLD), "published");
  assert.equal(decisions[0].delete, false);
});

test("a merged pull request drops the photos it no longer contains", () => {
  const decisions = decide({
    pendingObjects: [pending(OTHER, 5)],
    reviews: [review({ open: false, merged: true, photos: [OLD, OTHER] })],
    published: [OLD],
  });

  assert.equal(reasonFor(decisions, OTHER), "rejected-photo");
  assert.equal(decisions[0].delete, true);
});

test("a just-merged photo waits for the deploy that publishes it", () => {
  const decisions = decide({
    pendingObjects: [{ key: OTHER, uploadedAt: new Date(NOW - MERGED_GRACE_MS / 2) }],
    reviews: [review({ open: false, merged: true, photos: [OTHER] })],
    published: [],
  });

  assert.equal(reasonFor(decisions, OTHER), "awaiting-deploy");
  assert.equal(decisions[0].delete, false);
});

test("a photo no pull request knows about falls back to age", () => {
  const decisions = decide({
    pendingObjects: [pending(OLD, 31), pending(OTHER, 3)],
    reviews: [],
  });

  assert.equal(reasonFor(decisions, OLD), "abandoned");
  assert.equal(reasonFor(decisions, OTHER), "recent");
  assert.deepEqual(
    decisions.filter((decision) => decision.delete).map((decision) => decision.key),
    [OLD],
  );
});

test("keeps only the Contribution pull requests, so a development pull request cannot decide anything", () => {
  const parsed = parsePullRequests([
    {
      head: { ref: "feat/section-pages" },
      state: "merged",
      merged_at: "2026-09-01T00:00:00Z",
      created_at: "2026-08-30T00:00:00Z",
      body: `this dev pull request mentions ${OLD} in passing`,
    },
    {
      head: { ref: "contribution/c-two" },
      state: "open",
      merged_at: null,
      created_at: "2026-09-20T00:00:00Z",
      body: `1. https://storage.bukitjalilstadium.com/${OLD}\n2. https://storage.bukitjalilstadium.com/${OTHER}`,
    },
  ]);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].branch, "contribution/c-two");
  assert.deepEqual(parsed[0].photos.sort(), [OLD, OTHER].sort());
});

test("a photo listed twice in one body is held once", () => {
  const parsed = parsePullRequests([
    {
      head: { ref: "contribution/c-three" },
      state: "open",
      created_at: "2026-09-20T00:00:00Z",
      body: `${OLD}\n${OLD}`,
    },
  ]);

  assert.deepEqual(parsed[0].photos, [OLD]);
});

test("reports the submissions that have been waiting too long", () => {
  const stale = stalePullRequests(
    [
      { branch: "contribution/c-old", open: true, merged: false, photos: [], openedAt: new Date(NOW - 45 * DAY) },
      { branch: "contribution/c-fresh", open: true, merged: false, photos: [], openedAt: new Date(NOW - 2 * DAY) },
      { branch: "contribution/c-done", open: false, merged: true, photos: [], openedAt: new Date(NOW - 90 * DAY) },
    ],
    THRESHOLD,
    NOW,
  );

  assert.deepEqual(stale, [{ branch: "contribution/c-old", waitingDays: 45 }]);
});
