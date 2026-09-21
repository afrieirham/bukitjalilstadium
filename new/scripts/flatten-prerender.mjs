#!/usr/bin/env node
import { existsSync, readdirSync, renameSync, rmdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * React Router prerenders each route to `<path>/index.html`, and Cloudflare
 * Pages canonicalises that as `<path>/`. Moving each index.html to a sibling
 * `<path>.html` keeps `<path>` as the canonical URL, matching the legacy site.
 *
 * Directories that still hold a nested route's flattened page are kept.
 */
export function flattenPrerender(clientDir, root = clientDir) {
  for (const entry of readdirSync(clientDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      flattenPrerender(path.join(clientDir, entry.name), root);
    }
  }

  if (clientDir === root) return;

  const index = path.join(clientDir, "index.html");
  if (existsSync(index)) {
    const flattened = path.join(
      path.dirname(clientDir),
      `${path.basename(clientDir)}.html`,
    );
    renameSync(index, flattened);
  }

  if (readdirSync(clientDir).length === 0) {
    rmdirSync(clientDir);
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const clientDir = path.resolve(process.argv[2] ?? "build/client");

  if (!existsSync(clientDir)) {
    console.error(`flatten-prerender: ${clientDir} does not exist`);
    process.exit(1);
  }

  flattenPrerender(clientDir);
  console.log(`flatten-prerender: flattened ${path.relative(process.cwd(), clientDir)}`);
}
