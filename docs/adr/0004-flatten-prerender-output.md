# Flatten React Router's prerender output to keep slashless URLs

React Router hardcodes `path/index.html` for prerendered routes, and Cloudflare Pages canonicalises a directory as `path/`, which would make `/201A-B/` canonical and 308 every existing `/201A-B` URL. Since the migration preserves current URLs to keep search rankings, a permanent build step renames each `dir/index.html` to `dir.html`, reproducing the flat layout of the old Next export. Pages documents `.html` files as serving `/path`, with `/path.html` redirected to `/path`.

Status: accepted, pending verification on a Cloudflare Pages preview that `/201A-B` serves without a redirect and that hydration shows no mismatch.

## Considered Options

- Accept `/201A-B/` as canonical and update canonicals and sitemap — React Router's default, no build step, but every indexed URL changes.
- Flatten in a permanent build step (chosen).

## Consequences

- The flatten runs on every deploy; it is a permanent part of the build command, not a one-off fix.
- React Router regenerates the directory layout on each build, so removing the step silently reverts every URL.
