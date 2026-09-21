import assert from "node:assert/strict";
import test from "node:test";

import { sections } from "../app/components/widget/seat-plan-data.ts";
import {
  sectionLevel,
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

test("neighbours follow the ring the legacy site linked", () => {
  const expected = [
    ["101", "134", "102"],
    ["131A", "131", "132"],
    ["201A/B", "234", "202"],
    ["212A/B", "211", "213"],
    ["301A/B", "334", "302"],
    ["334", "333", "301A/B"],
  ];

  for (const [section, previous, next] of expected) {
    assert.deepEqual(sectionNeighbours(section, sectionIds), {
      previous,
      next,
    });
  }
});

test("every Section has both neighbours and they stay within its level", () => {
  for (const section of sectionIds) {
    const { previous, next } = sectionNeighbours(section, sectionIds);
    assert.equal(sectionLevel(previous), sectionLevel(section));
    assert.equal(sectionLevel(next), sectionLevel(section));
    assert.notEqual(previous, section);
    assert.notEqual(next, section);
  }
});

test("following next around a level returns to the start", () => {
  const levelOne = sectionIds.filter((id) => sectionLevel(id) === 1);
  const visited = new Set();
  let current = "101";

  for (let step = 0; step < levelOne.length; step += 1) {
    visited.add(current);
    current = sectionNeighbours(current, sectionIds).next;
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
