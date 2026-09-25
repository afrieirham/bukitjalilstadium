---
version: 1
slug: "route"
primary_target: "route:/"
related_targets: [":slug","contributors","contribute","404"]
---

# Surface brief: the seat-map home

## Scope and mode

Whole-app visual system, led by the home/seat-map surface. Mode: Operate. Every
route is prerendered and served as a static asset (ADR 0001), so nothing here may
depend on a server at runtime.

## Audience, job, action

A concert-goer on a phone mid-purchase comparing Section numbers; a fan at home
deciding. Their job: find a Section and see the real view from it. The action:
tap the bowl or type a Section, land on the photo.

## Constraints

Keep the UX, copy, semantics, URLs, metadata, and static rendering exactly as
they are. No filters or colour treatment on any photo. Light-only is replaced by
a single dark world; do not add a theme toggle. The home fits one viewport with
the seat map always visible. Fast on a slow Malaysian mobile connection.

## Direction contract

THESIS: The stadium wears its own wayfinding signage. One viewport of black and
signal yellow; the fan's real photo, a map that shows which Sections are
photographed, and a ruled Section list — refusing the gallery-grid-plus-cards
default every seat-view site ships.

OWN-WORLD: Ground `#0a0a0a`, surfaces `#111`, white ink `#fff`, muted `#b3b3b3`,
hairline rules `#2c2c2c`, one high-chroma signal yellow `#ffd400` as the only
accent, black-on-yellow for primary actions, white for the selected Section on
the map, yellow for photographed Sections, square 8px radius, uppercase tracked
labels, tabular numerals. Inter throughout, tighter tracking at display sizes.
Photos are never filtered.

STORY: The visitor understands in one glance that the map shows where photos
exist, picks their Section by number or by tapping the bowl, and sees the real
view. The contributor understands their photo will appear the same way.

FIRST VIEWPORT: A ruled masthead (wordmark, stadium name, nav, yellow CTA), then
a level node bar. Below it a two-column body filling the remaining height. With
no Section chosen, the left holds the hero — the title at display size under a
yellow rule, a supporting line, and the find field — and the top-bar find field
is hidden so there is one search control; the rail holds the map (always
visible). Once a Section is chosen the left is the true photo with a caption
strip beneath it, the top-bar find field returns, and the rail adds a three-cell
readout, prev/next Section, and a ruled Section list that scrolls inside itself.
The page itself never scrolls.

FORM: Post-roll pivot. The user rejected the dealt world and pinned "elevate,
don't replace" plus a black-and-yellow signage palette; this is a refinement of
the incumbent system, so there is no concept seed key. The layout is a synthesis
of The Bill's ruled column and Man-Machine's node bar, minus its per-seat grid.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
