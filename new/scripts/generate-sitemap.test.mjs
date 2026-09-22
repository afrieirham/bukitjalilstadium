import assert from "node:assert/strict";
import test from "node:test";

import { sitemapUrls } from "./generate-sitemap.mjs";

const SITE = "https://bukitjalilstadium.com";

test("lists the home page, every Section and the contributors page", () => {
  const urls = sitemapUrls({
    htmlFiles: ["index.html", "101.html", "201A-B.html", "contributors.html"],
    siteUrl: SITE,
  });

  assert.deepEqual(urls, [
    SITE,
    `${SITE}/101`,
    `${SITE}/201A-B`,
    `${SITE}/contributors`,
  ]);
});

test("leaves out the pages that should not be indexed", () => {
  const urls = sitemapUrls({
    htmlFiles: ["index.html", "404.html", "__spa-fallback.html", "contribute.html"],
    siteUrl: SITE,
  });

  assert.deepEqual(urls, [SITE]);
});

test("ignores everything that is not a built page", () => {
  const urls = sitemapUrls({
    htmlFiles: ["index.html", "assets", "101.data", "_routes.json", "logo.png"],
    siteUrl: SITE,
  });

  assert.deepEqual(urls, [SITE]);
});

test("lists a page once even if the build repeats it", () => {
  const urls = sitemapUrls({
    htmlFiles: ["101.html", "101.html", "index.html"],
    siteUrl: SITE,
  });

  assert.deepEqual(urls, [SITE, `${SITE}/101`]);
});

test("an empty build lists nothing", () => {
  assert.deepEqual(sitemapUrls({ htmlFiles: [], siteUrl: SITE }), []);
});
