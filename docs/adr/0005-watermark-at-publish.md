# Watermark new Contribution photos at publish time in CI

Photos on the site are the product, and the useful ones get copied. A tiled
`BUKITJALILSTADIUM.COM` wordmark in the one accent is composited over every new
Contribution photo, so a copy carries the source and scraping the set cleanly is
not worth the effort. The mark is applied by a GitHub Action after a
Contribution merges — the moment the photo is actually published — and written
back to the same R2 key, so neither the Contribution JSON nor the photo URL
changes.

It is applied to new photos only. The roughly hundred legacy photos already
carry the predecessor's centred mark and are left exactly as they are.

## Considered Options

- **Request-path watermark in the Pages Function** (`wasm-vips` or a JS codec).
  Enforced at the source whatever the client does, but a decode, composite and
  re-encode of a 10 MB photo will not fit the free Workers CPU budget — the same
  wall ADR 0001 hit when it rejected SSR. It also cannot reach photos that were
  uploaded before it existed.
- **Client-side canvas in the contribute form.** Cheapest in infrastructure, but
  anyone can POST straight to `/api/photos`, and it would bake the mark into the
  only master with no way to restyle it.
- **Cloudflare Images / Image Resizing `draw` at delivery.** Keeps a clean master
  and composes at the edge, but adds a paid dependency and a new delivery URL on
  top of a money model that is still undecided in `PRODUCT.md`.
- **A second step inside the Pages build.** Pulls a native `sharp` binary and R2
  writes into a build that ADR 0001 wants reproducible and read-only.
- **A GitHub Action on the merge (chosen),** keeping the transform out of the
  request path and the build, on the same "moderation absorbs the delay" model
  the publish flow already uses.

## Consequences

- The write path needs an R2 S3 token as repository secrets (`R2_ACCOUNT_ID`,
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`), separate from the
  Worker's R2 binding.
- The unwatermarked photo is public-but-unguessable from upload until the merge,
  which is the same window in which the reviewer sees it. The pending object is
  written with `Cache-Control: no-store` so that no edge caches the unmarked
  version; the Action rewrites it immutable once marked.
- Watermarking in place leaves the URL stable, so the sweep's bookkeeping is
  unchanged and publishing still waits only for its build.
- A `watermarked` object-metadata marker makes the Action idempotent: a re-run,
  or a later edit to an already-published Contribution, is a no-op.
- Changing the artwork only affects photos published after the change. Making it
  retroactive is a deliberate migration — bump the marker version and process
  the keys you mean to.
- `sharp` lives in `new/tools/watermark/`, not the app's `package.json`, so its
  native binary never enters the static build.
