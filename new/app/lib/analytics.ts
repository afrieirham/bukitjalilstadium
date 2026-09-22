export const UMAMI_SCRIPT = "https://analytics.afrieirham.com/script.js";
export const UMAMI_WEBSITE_ID = "ccdf97db-6c20-4e02-8ab5-4cb945f6a4bb";

const LIVE_HOSTS = ["bukitjalilstadium.com", "www.bukitjalilstadium.com"];

/**
 * Whether the self-hosted tracker should run here.
 *
 * A preview deployment serves the same build as the live site, so without this
 * every review visit and every crawl of a preview URL would land in the same
 * analytics as real readers. An exact host match is used rather than a suffix
 * check, so a lookalike domain cannot report into it either.
 */
export function shouldLoadAnalytics(hostname: string): boolean {
  return LIVE_HOSTS.includes(hostname.toLowerCase());
}
