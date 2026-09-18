// Generates public/sitemap.xml from src/constant.ts so every section page is listed.
// Runs automatically via the "prebuild" script.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://bukitjalilstadium.com";

const source = readFileSync(join(root, "src/constant.ts"), "utf8");
const sections = [...source.matchAll(/section:\s*"([^"]+)"/g)].map((m) => m[1]);

const urls = [
  { loc: SITE_URL, priority: "1.0" },
  ...sections.map((section) => ({
    loc: `${SITE_URL}/${section.replaceAll("/", "-")}`,
    priority: "0.8",
  })),
  { loc: `${SITE_URL}/contributors`, priority: "0.3" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) =>
      `  <url>\n    <loc>${loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(`sitemap.xml written with ${urls.length} urls`);
