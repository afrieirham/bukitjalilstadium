# Static prerendering on Cloudflare Pages instead of SSR with incremental caching

The site is read-dominated and its Sections are a fixed list, so every page can be prerendered at build time and served as a static asset. We first designed SSR on Workers with edge caching, on-demand tag purging and a cron warmer, and rejected it: the Workers free CPU limit is too tight for React Router SSR, and prerendering is what a read-dominated site with rare writes actually wants. The cost we accept is that publishing a Contribution waits for a build instead of appearing at once.

## Considered Options

- SSR on Workers with Workers Cache (TTL, `stale-while-revalidate`, `Cache-Tag` purge, cron warmer) — instant publish, but needs Workers Paid and a cache-invalidation story to own.
- Static prerender on Cloudflare Pages — free and unlimited reads, no cache to invalidate; content changes require a rebuild.

## Consequences

- The moderation queue absorbs the build delay, so the wait is invisible to everyone.
- `@cloudflare/vite-plugin` cannot be used: it does not support prerendering.
- One dynamic endpoint remains, as a Pages Function for the contribute form.
