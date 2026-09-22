#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/** Pages that exist but should not be offered to search engines. */
const EXCLUDED = new Set(["404.html", "__spa-fallback.html", "contribute.html"]);

/**
 * The pages worth listing, taken from the build output rather than from the
 * Section data. The output is what actually got built, so the sitemap cannot
 * drift from the site, and this script needs no TypeScript import — it runs
 * under whatever Node the build host provides.
 */
export function sitemapUrls({ htmlFiles, siteUrl }) {
  const paths = [
    ...new Set(
      htmlFiles
        .filter((file) => file.endsWith(".html") && !EXCLUDED.has(file))
        .map((file) => file.replace(/\.html$/, ""))
        .map((name) => (name === "index" ? "/" : `/${name}`)),
    ),
  ].sort();

  return paths.map((page) => (page === "/" ? siteUrl : `${siteUrl}${page}`));
}

export function renderSitemap(urls) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`),
    "</urlset>",
    "",
  ].join("\n");
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const appRoot = path.resolve(import.meta.dirname, "..");
  const clientDir = path.resolve(process.argv[2] ?? path.join(appRoot, "build/client"));
  const siteUrl = process.env.SITE_URL ?? "https://bukitjalilstadium.com";

  if (!statSync(clientDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`generate-sitemap: ${clientDir} does not exist; build first`);
    process.exit(1);
  }

  const urls = sitemapUrls({ htmlFiles: readdirSync(clientDir), siteUrl });
  writeFileSync(path.join(clientDir, "sitemap.xml"), renderSitemap(urls));

  console.log(`generate-sitemap: ${urls.length} urls → build/client/sitemap.xml`);
}
