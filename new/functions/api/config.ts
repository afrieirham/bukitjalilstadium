import type { PagesContext } from "../lib/types.ts";

/**
 * Public configuration the browser needs before it can render the form's bot
 * challenge. It is a route rather than a build variable because a Pages
 * project configured by wrangler.jsonc cannot take plain variables from the
 * dashboard, and there is nothing secret about a Turnstile site key.
 */
export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  return new Response(
    JSON.stringify({ turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? null }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    },
  );
};
