#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { sectionSlug } from "../app/lib/contributions.ts";

export function photoObjectKey(filename) {
  return `seats/${filename}`;
}

export function parseLegacySeats(source) {
  return objectLiterals(arrayLiteral(source, "export const seats")).map(
    (entry) => ({
      section: stringField(entry, "section"),
      photos: stringListField(entry, "photosUrl"),
    }),
  );
}

export function parseLegacyContributors(source) {
  return objectLiterals(arrayLiteral(source, "const contributors")).map(
    (entry) => ({
      name: stringField(entry, "name")?.trim() ?? null,
      seat: stringField(entry, "seat")?.trim() ?? null,
      href: stringField(entry, "href")?.trim() ?? null,
    }),
  );
}

/**
 * Legacy credit is per Section, not per photo, so a Section's credited people
 * are paired with its photos in order. A photo with no credited person gets a
 * null Contributor rather than an invented one.
 */
export function buildContributions({ seats, contributors }) {
  const creditsBySection = new Map();
  for (const contributor of contributors) {
    const key = sectionSlug(contributor.seat);
    const credits = creditsBySection.get(key) ?? [];
    credits.push({ name: contributor.name, href: contributor.href ?? null });
    creditsBySection.set(key, credits);
  }

  return seats.flatMap((seat) => {
    const key = sectionSlug(seat.section);
    const credits = creditsBySection.get(key) ?? [];

    return seat.photos.map((filename, index) => ({
      submissionId: `legacy-${key}-${index + 1}`,
      section: seat.section,
      photo: photoObjectKey(filename),
      date: null,
      caption: null,
      row: null,
      seat: null,
      contributor: credits[index] ?? null,
    }));
  });
}

function arrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) throw new Error(`Could not find "${marker}"`);
  const open = source.indexOf("[", markerIndex);
  if (open === -1) throw new Error(`Could not find the array after "${marker}"`);

  let depth = 0;
  for (let i = open; i < source.length; i++) {
    i = skipString(source, i) ?? i;
    const character = source[i];
    if (character === "[") depth += 1;
    if (character === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`Unbalanced array after "${marker}"`);
}

function objectLiterals(arraySource) {
  const entries = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < arraySource.length; i++) {
    i = skipString(arraySource, i) ?? i;
    const character = arraySource[i];
    if (character === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        entries.push(arraySource.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return entries;
}

function skipString(source, index) {
  const quote = source[index];
  if (quote !== '"' && quote !== "'" && quote !== "`") return null;
  for (let i = index + 1; i < source.length; i++) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === quote) return i;
  }
  return source.length - 1;
}

function stringField(entry, name) {
  const match = new RegExp(`${name}\\s*:\\s*"([^"]*)"`).exec(entry);
  return match ? match[1] : null;
}

function stringListField(entry, name) {
  const match = new RegExp(`${name}\\s*:\\s*\\[([^\\]]*)\\]`).exec(entry);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((value) => value.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const appRoot = path.resolve(import.meta.dirname, "..");
  const legacyRoot = path.resolve(appRoot, "../legacy");
  const dataRoot = path.join(appRoot, "data/contributions");

  const seats = parseLegacySeats(
    readFileSync(path.join(legacyRoot, "src/constant.ts"), "utf8"),
  );
  const contributors = parseLegacyContributors(
    readFileSync(path.join(legacyRoot, "src/pages/contributors.tsx"), "utf8"),
  );
  const contributions = buildContributions({ seats, contributors });

  const attributed = contributions.filter((item) => item.contributor).length;
  const credited = contributors.length;

  for (const submissionId of new Set(contributions.map((c) => c.submissionId))) {
    const directory = path.join(dataRoot, submissionId);
    if (existsSync(directory)) rmSync(directory, { recursive: true });
  }

  const counters = new Map();
  for (const contribution of contributions) {
    const count = (counters.get(contribution.submissionId) ?? 0) + 1;
    counters.set(contribution.submissionId, count);

    const directory = path.join(dataRoot, contribution.submissionId);
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, `photo-${count}.json`),
      `${JSON.stringify(contribution, null, 2)}\n`,
    );
  }

  console.log(
    `backfill-legacy: wrote ${contributions.length} photos across ${counters.size} submissions`,
  );
  console.log(
    `backfill-legacy: attributed ${attributed} photos to ${credited} credited contributors`,
  );
  if (attributed < credited) {
    console.warn(
      `backfill-legacy: ${credited - attributed} contributors could not be attributed to a photo`,
    );
  }
}
