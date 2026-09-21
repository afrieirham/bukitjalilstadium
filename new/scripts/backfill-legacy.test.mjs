import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { sectionSlug, sectionPhotos } from "../app/lib/contributions.ts";
import {
  buildContributions,
  parseLegacyContributors,
  parseLegacySeats,
  photoObjectKey,
} from "./backfill-legacy.mjs";

const appRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const dataRoot = path.join(appRoot, "data/contributions");

const SEATS_SOURCE = `
export const seats = [
  {
    section: "104",
    level: 1,
    right: "103",
    left: "105",
    photosUrl: ["C-104-1.jpg", "C-104-2.jpg"],
  },
  {
    section: "201A/B",
    level: 2,
    right: "120",
    left: "202",
    photosUrl: ["2A-1.jpg"],
  },
  {
    section: "330",
    level: 3,
    right: "329",
    left: "331",
    photosUrl: [],
  },
];
`;

const CONTRIBUTORS_SOURCE = `
const contributors = [
  {
    name: "@violetzero_94",
    seat: "104",
    href: "https://www.tiktok.com/@violetzero_94",
  },
  { name: "Emily Yeo", seat: "104" },
  { name: "Anon", seat: "201A-B" },
];
`;

test("reads each Section and the photo filenames it lists", () => {
  assert.deepEqual(parseLegacySeats(SEATS_SOURCE), [
    { section: "104", photos: ["C-104-1.jpg", "C-104-2.jpg"] },
    { section: "201A/B", photos: ["2A-1.jpg"] },
    { section: "330", photos: [] },
  ]);
});

test("reads each Contributor with an optional link", () => {
  assert.deepEqual(parseLegacyContributors(CONTRIBUTORS_SOURCE), [
    { name: "@violetzero_94", seat: "104", href: "https://www.tiktok.com/@violetzero_94" },
    { name: "Emily Yeo", seat: "104", href: null },
    { name: "Anon", seat: "201A-B", href: null },
  ]);
});

test("turns Sections and Contributors into one contribution per photo", () => {
  const contributions = buildContributions({
    seats: parseLegacySeats(SEATS_SOURCE),
    contributors: parseLegacyContributors(CONTRIBUTORS_SOURCE),
  });

  assert.deepEqual(contributions, [
    {
      submissionId: "legacy-104-1",
      section: "104",
      photo: "seats/C-104-1.jpg",
      date: null,
      caption: null,
      row: null,
      seat: null,
      contributor: {
        name: "@violetzero_94",
        href: "https://www.tiktok.com/@violetzero_94",
      },
    },
    {
      submissionId: "legacy-104-2",
      section: "104",
      photo: "seats/C-104-2.jpg",
      date: null,
      caption: null,
      row: null,
      seat: null,
      contributor: { name: "Emily Yeo", href: null },
    },
    {
      submissionId: "legacy-201A-B-1",
      section: "201A/B",
      photo: "seats/2A-1.jpg",
      date: null,
      caption: null,
      row: null,
      seat: null,
      contributor: { name: "Anon", href: null },
    },
  ]);
});

test("matches credited Sections written in slug form", () => {
  assert.equal(sectionSlug("201A/B"), "201A-B");
  assert.equal(photoObjectKey("C-104-1.jpg"), "seats/C-104-1.jpg");

  const contributions = buildContributions({
    seats: [{ section: "201A/B", photos: ["2A-1.jpg"] }],
    contributors: [{ name: "Anon", seat: "201A-B", href: null }],
  });

  assert.deepEqual(contributions[0].contributor, { name: "Anon", href: null });
});

test("a Section with no photos yields no contributions", () => {
  const contributions = buildContributions({
    seats: [{ section: "330", photos: [] }],
    contributors: [],
  });

  assert.deepEqual(contributions, []);
  assert.deepEqual(sectionPhotos(contributions, "330"), []);
});

test("committed contributions cover every legacy photo and Section", () => {
  const contributions = readCommittedContributions();

  assert.equal(contributions.length, 104);
  assert.equal(new Set(contributions.map((item) => item.section)).size, 60);

  for (const item of contributions) {
    assert.match(item.photo, /^seats\//);
    assert.equal(item.section, item.section.trim());
    assert.equal(item.submissionId, item.submissionId.trim());
  }

  assert.equal(sectionPhotos(contributions, "104").length, 2);
  assert.deepEqual(sectionPhotos(contributions, "101"), []);
});

function readCommittedContributions() {
  const files = readdirSync(dataRoot).flatMap((submissionId) => {
    const submissionPath = path.join(dataRoot, submissionId);
    if (!statSync(submissionPath).isDirectory()) return [];
    return readdirSync(submissionPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(submissionPath, file));
  });

  return files
    .map((file) => JSON.parse(readFileSync(file, "utf8")))
    .sort((a, b) => a.submissionId.localeCompare(b.submissionId));
}
