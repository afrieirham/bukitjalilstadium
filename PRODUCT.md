# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fans deciding on a seat at Bukit Jalil National Stadium, Kuala Lumpur, before
buying a ticket. The primary audience is concert-goers — the stage view is the
view that matters most — with football fans as the second, already-supported
audience. They arrive from search or a ticketing flow, on a phone, in the middle
of a purchase decision, and they want to know what the view from a specific
Section actually looks like.

The secondary audience is the Contributor: a fan who was at the stadium, has
photos of their view, and is willing to share them. They have no account and no
standing relationship with the site.

## Product Purpose

A crowd-sourced reference of real seat views inside one stadium, so fans can see
what a Section actually looks like before buying a ticket. Every photo is shared
by a fan and reviewed by hand before it appears.

Success, in the order the owner ranked it:

1. **Coverage.** Every one of the 104 Sections carries at least one real fan
   photo. Coverage is also what makes the site useful to the fan deciding.
2. **Usefulness.** The visitor leaves confident about the seat.
3. **Low upkeep.** It stays accurate and operating without becoming a second
   job; the review cost is the thing to protect.
4. **Visibility.** Being found when someone searches for a Section or a seating
   view — already happening through organic search.

## Positioning

One stadium, documented deeply. Where the site that inspired this one spreads
across many venues, this product deliberately has no venue dimension: it answers
the seat question for Bukit Jalil better than a generic multi-venue site can.
The mechanism a neighbouring product could not truthfully copy is the fan photo
of the actual view, taken from the actual seat, plus the hand-review that keeps
each one accountable and attributed.

## Operating Context

- Bukit Jalil National Stadium (TM Stadium Nasional), Kuala Lumpur. Sections are
  numbered across three levels (1xx, 2xx, 3xx), some with `A/B` suffixes.
- The event calendar — concerts and football matches — is the reason a fan looks
  up a Section; the Section view is what the site owns.
- Contributions are moderated through GitHub pull requests: one JSON file per
  photo, in the repository. Merging publishes and rebuilds; deleting files
  rejects those photos; closing the pull request rejects all of it.
- Moderation is done by the site's owner, by hand. That is the standing cost of
  running the product.
- The predecessor is the `legacy/` Next.js app, whose URLs the current site must
  keep serving.

## Capabilities and Constraints

- **One Stadium, by design.** No venue picker, no venue field anywhere. A second
  stadium would be a deliberate migration, not configuration (ADR 0003).
- **No accounts.** Contributors are a self-supplied name and an optional link.
  They can never sign in, edit, or delete.
- **Private until reviewed.** A Contribution does not exist to visitors until a
  moderator merges its pull request (ADR 0002).
- **Static prerender on Cloudflare Pages.** Every page is built ahead of time; a
  publication waits for the rebuild triggered by the merge (ADR 0001). Only the
  contribute endpoints are dynamic.
- **Slashless URLs are canonical and permanent.** The build flattens route
  directories to `.html`; `/201A-B` must keep serving without a redirect
  (ADR 0004).
- **Repository is the source of truth.** Contribution JSON lives in the repo;
  photo binaries live in Cloudflare R2. No database, no admin UI.
- **Abuse and cost controls exist and are load-bearing:** Cloudflare Turnstile on
  the form, rate limiting in KV, photo type/size limits, EXIF/location stripping,
  and a sweep of unreferenced photos.
- **Money model is undecided.** Recorded as open; nothing is assumed about
  advertising, sponsorship, or donations.

## Brand Commitments

- The name is **Bukit Jalil Stadium** / **BukitJalilStadium.com**; the venue's
  formal and alternate names (TM Stadium Nasional, Stadium Nasional Bukit Jalil,
  Bukit Jalil National Stadium) are part of how the site is found and should be
  preserved.
- Voice: plain, fan-to-fan, no marketing gloss. "Seat views shared by fans, for
  fans."
- Built by Afrie Irham, credited in the footer with a link to afrieirham.com.
- The predecessor's "Built by @afrieirham" credit and the original logo are the
  identity the product carries forward.

## Evidence on Hand

- `new/data/contributions/` — roughly a hundred real Contributions migrated from
  the legacy site, one JSON record per photo, with photo binaries in R2.
- `legacy/` — the working Next.js predecessor, including its seat map and the
  original section list, as the record of what the current app replaces.
- `new/public/logo.png` and `new/public/og.png` — the existing logo and social
  card.
- Live domain `bukitjalilstadium.com`, indexed by search, with a sitemap,
  robots, and self-hosted Umami analytics reporting production only.
- The seat-plan SVG export in `seat-plan-data.ts` is the authoritative geometry
  for all 104 Sections.
- No fabricated testimonials, venue counts, attendance figures, or coverage
  claims: none exist to draw on.

## Product Principles

- **Coverage is the product.** A Section page with no photo is the gap to close;
  every accepted Contribution makes the whole map more valuable.
- **Answer the seat question, not the event.** Occasions come and go; the view
  from a seat is the durable answer.
- **Keep the two hard edges cheap.** Contributing should stay near-frictionless
  for the fan, and reviewing should stay tolerable for one person — automate the
  maintenance, never add a surface that needs its own upkeep.
- **Depth over breadth.** One stadium, done properly, beats a thin index of many.
- **Don't break what search rewards.** URLs, metadata, and static rendering are
  load-bearing assets, not incidental implementation.

## Accessibility & Inclusion

The predecessor's seat map was built to be keyboard- and touch-navigable, and
the current Section picker carries that forward. A fan mid-purchase, often on a
phone and possibly on a slow Malaysian mobile connection, is the accessibility
scene to design for.
