#!/usr/bin/env node
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Every photo object that a set of Contributions points at.
 *
 * Deliberately plain JavaScript with no TypeScript import: this runs as a
 * build step under whatever Node the host provides, and Node only strips types
 * from 22.18 onwards. The Functions can import TypeScript because a bundler
 * handles them; a build script cannot.
 */
export function collectReferencedPhotos(contributions) {
  return [...new Set(contributions.map((contribution) => contribution.photo))];
}

export function readContributions(dataRoot) {
  if (!statSync(dataRoot, { throwIfNoEntry: false })?.isDirectory()) return [];

  return readdirSync(dataRoot).flatMap((submissionId) => {
    const submissionPath = path.join(dataRoot, submissionId);
    if (!statSync(submissionPath).isDirectory()) return [];

    return readdirSync(submissionPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) =>
        JSON.parse(readFileSync(path.join(submissionPath, file), "utf8")),
      );
  });
}

/**
 * Publishes the list of photo objects that committed Contributions point at, so
 * the cleanup endpoint can tell a photo that is merely awaiting review from one
 * whose Contribution was rejected.
 *
 * It is generated on every build rather than committed, so it always matches
 * the Contributions that this deployment is actually publishing.
 */
export function generateReferencedPhotos({ dataRoot, outFile }) {
  const contributions = readContributions(dataRoot);

  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `${JSON.stringify({ photos: collectReferencedPhotos(contributions) }, null, 2)}\n`,
  );

  return contributions.length;
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const appRoot = path.resolve(import.meta.dirname, "..");
  const outFile = path.resolve(
    process.argv[2] ?? path.join(appRoot, "build/client/referenced-photos.json"),
  );

  const count = generateReferencedPhotos({
    dataRoot: path.join(appRoot, "data/contributions"),
    outFile,
  });

  console.log(
    `generate-referenced-photos: ${count} contributions → ${path.relative(process.cwd(), outFile)}`,
  );
}
