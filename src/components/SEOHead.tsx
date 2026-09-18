import Head from "next/head";

export const SITE_URL = "https://bukitjalilstadium.com";
export const SITE_NAME = "BukitJalilStadium.com";

/** Canonical URL for a path. `/` maps to the bare origin, everything else to origin + path. */
function canonicalUrl(path: string) {
  if (!path || path === "/") return SITE_URL;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/\/+$/, "")}`;
}

/** Absolute URL for an image so OG/Twitter cards resolve when shared off-site. */
function absoluteUrl(url: string) {
  if (!url) return `${SITE_URL}/og.png`;
  if (/^https?:\/\//.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function SEOHead({
  title,
  description,
  path,
  ogPath = "/og.png",
  structuredData,
}: {
  title: string;
  description: string;
  path: string;
  ogPath?: string;
  structuredData?: Record<string, unknown>;
}) {
  const canonical = canonicalUrl(path);
  const ogImage = absoluteUrl(ogPath);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={canonical} />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* <!-- Facebook Meta Tags --> */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* <!-- Twitter Meta Tags --> */}
      <meta name="twitter:creator" content="@afrieirham_" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="bukitjalilstadium.com" />
      <meta property="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

export default SEOHead;
