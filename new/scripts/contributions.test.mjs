import assert from "node:assert/strict";
import test from "node:test";

import {
  photosBySection,
  populatedSections,
} from "../app/lib/contributions.ts";

function contribution(submissionId, section) {
  return {
    submissionId,
    section,
    photo: `seats/${submissionId}.jpg`,
    date: null,
    caption: null,
    row: null,
    seat: null,
    contributor: null,
  };
}

test("groups photos under the Section they were taken from", () => {
  const grouped = photosBySection([
    contribution("a", "104"),
    contribution("b", "101"),
    contribution("c", "104"),
  ]);

  assert.deepEqual([...grouped.keys()].sort(), ["101", "104"]);
  assert.equal(grouped.get("104")?.length, 2);
  assert.equal(grouped.get("101")?.length, 1);
});

test("a Section with no photos is simply absent, not present and empty", () => {
  const grouped = photosBySection([contribution("a", "104")]);

  assert.equal(grouped.has("999"), false);
  assert.deepEqual(grouped.get("999") ?? [], []);
});

test("populated Sections are the ones with at least one photo", () => {
  const populated = populatedSections([
    contribution("a", "104"),
    contribution("b", "104"),
    contribution("c", "301A/B"),
  ]);

  assert.deepEqual([...populated].sort(), ["104", "301A/B"]);
  assert.equal(populated.has("101"), false);
});
