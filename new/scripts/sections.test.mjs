import assert from "node:assert/strict";
import test from "node:test";

import { sections } from "../app/components/widget/seat-plan-data.ts";
import {
  findSectionByQuery,
  sectionLevel,
  sectionLevelShift,
  sectionNeighbours,
  sectionOrder,
} from "../app/lib/sections.ts";

const sectionIds = sections.map((section) => section.id);

test("a Section's level is its leading digit", () => {
  assert.equal(sectionLevel("101"), 1);
  assert.equal(sectionLevel("131A"), 1);
  assert.equal(sectionLevel("201A/B"), 2);
  assert.equal(sectionLevel("334"), 3);
});

test("neighbours match the left/right the legacy site linked", () => {
  const expected = [
    ["101", "102", "134"],
    ["131A", "132", "131"],
    ["201A/B", "202", "234"],
    ["212A/B", "213", "211"],
    ["301A/B", "302", "334"],
    ["334", "301A/B", "333"],
  ];

  for (const [section, left, right] of expected) {
    assert.deepEqual(sectionNeighbours(section, sectionIds), {
      left,
      right,
    });
  }
});

test("every Section has both neighbours and they stay within its level", () => {
  for (const section of sectionIds) {
    const { left, right } = sectionNeighbours(section, sectionIds);
    assert.equal(sectionLevel(left), sectionLevel(section));
    assert.equal(sectionLevel(right), sectionLevel(section));
    assert.notEqual(left, section);
    assert.notEqual(right, section);
  }
});

test("following left around a level returns to the start", () => {
  const levelOne = sectionIds.filter((id) => sectionLevel(id) === 1);
  const visited = new Set();
  let current = "101";

  for (let step = 0; step < levelOne.length; step += 1) {
    visited.add(current);
    current = sectionNeighbours(current, sectionIds).left;
  }

  assert.equal(current, "101");
  assert.equal(visited.size, levelOne.length);
});

test("orders Sections by level, then number, then suffix", () => {
  const ordered = sectionOrder(["132", "131A", "131", "101", "134"]);

  assert.deepEqual(ordered, ["101", "131", "131A", "132", "134"]);
});

test("an unknown Section is rejected rather than guessed at", () => {
  assert.throws(() => sectionNeighbours("999", sectionIds), /Unknown Section/);
});

test("a level shift keeps the Section number", () => {
  assert.equal(sectionLevelShift("104", sectionIds, 1), "204");
  assert.equal(sectionLevelShift("104", sectionIds, -1), null);
  assert.equal(sectionLevelShift("302", sectionIds, -1), "202");
  assert.equal(sectionLevelShift("334", sectionIds, 1), null);
});

test("a level shift matches the suffix when the target has one", () => {
  assert.equal(sectionLevelShift("201A/B", sectionIds, 1), "301A/B");
  assert.equal(sectionLevelShift("301A/B", sectionIds, -1), "201A/B");
});

test("a level shift falls back to the nearest number", () => {
  // There is no 231A, so 131A lands on the closest Level 2 Section.
  const landed = sectionLevelShift("131A", sectionIds, 1);
  assert.equal(sectionLevel(landed), 2);
  assert.equal(landed, "231");
});

test("a level shift always lands on the target level", () => {
  for (const section of sectionIds) {
    for (const direction of [-1, 1]) {
      const landed = sectionLevelShift(section, sectionIds, direction);
      if (landed === null) continue;
      assert.equal(sectionLevel(landed), sectionLevel(section) + direction);
    }
  }
});

test("a lookup ignores case and punctuation", () => {
  assert.equal(findSectionByQuery("201A/B", sectionIds), "201A/B");
  assert.equal(findSectionByQuery("201a-b", sectionIds), "201A/B");
  assert.equal(findSectionByQuery("201ab", sectionIds), "201A/B");
  assert.equal(findSectionByQuery(" 104 ", sectionIds), "104");
  assert.equal(findSectionByQuery("", sectionIds), null);
  assert.equal(findSectionByQuery("999", sectionIds), null);
});

test("a partial lookup returns the first Section that starts with it", () => {
  assert.equal(findSectionByQuery("201A", sectionIds), "201A/B");
  assert.equal(findSectionByQuery("20", sectionIds), "201A/B");
});
