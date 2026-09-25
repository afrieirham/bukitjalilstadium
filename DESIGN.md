# DESIGN.md

The visual system for this site. It describes what is built, not what is hoped
for; where it and the code disagree, the code is wrong. Product truth lives in
`PRODUCT.md`, the domain vocabulary in `CONTEXT.md`, and the decisions behind the
architecture in `docs/adr/`.

## The world: Signage

The site wears the stadium's own wayfinding. Every fan photo contains the same
black sign with yellow type, so black and signal yellow are the venue's language,
not a borrowed palette. The home is a single viewport of that language: the real
photo, a seat map that shows which Sections are photographed, and a ruled list of
Sections. It deliberately refuses the gallery-grid-plus-cards shape that every
seat-view site ships.

The world is dark by decision, drawn from the use scene (a fan on a phone,
comparing Sections), not from a category. There is no light mode and no toggle.

## Colour

One accent, high chroma, on black. Roles, not vibes:

| Token | Value | Role |
| --- | --- | --- |
| `--background` | `#0a0a0a` | Page ground |
| `--foreground` | `#ffffff` | Primary ink |
| `--card` | `#111111` | Raised surfaces (rail, cards) |
| `--muted-foreground` | `#b3b3b3` | Secondary text, labels |
| `--border` | `#2c2c2c` | Structural hairlines only |
| `--input` | `#666666` | Control boundaries (meets 3:1) |
| `--primary` | `#ffd400` | The one accent: primary actions, active Section, coverage |
| `--primary-foreground` | `#0a0a0a` | Text on yellow |
| `--destructive` | `#ff6b6b` | Errors |

On the seat plan, colour carries state without a legend:

- **Photographed** Sections are yellow (`--seat-filled` `#ffd400`).
- The **selected** Section is solid white (`--seat-selected`), so it can never be
  mistaken for a photographed one.
- Everything else stays hollow (`--seat-empty` `#0a0a0a`, border `#666666`).

Yellow never means "success" and green never appears; the only semantic colour
is the accent, and it always means "this is actionable or chosen".

## Type

One family, Inter Variable, self-hosted through `@fontsource-variable/inter`.
The signage character comes from treatment, not from a novelty face: uppercase
with wide tracking for short labels, tight tracking (`-0.02em`) on display sizes,
and tabular numerals everywhere a number can change (counts, Section numbers,
dates, statistics) so nothing reflows as data updates.

The scale steps clearly: `text-sm` body, `text-xl` to `text-3xl` headings, and a
`0.6875rem` floor for functional micro-labels (never below 11px). Body copy is
held to `max-w-prose` (65ch). No gradient text; emphasis is weight and size.

## Surfaces and rules

- **Elevation is declared once**: hairline borders, never border-plus-shadow.
  The only shadows are the platform's `shadow-xs` on form controls.
- **Radius** is a crisp 8px (`--radius`); pills are reserved for small controls.
- **Cards are earned**, never the page structure. The Section column, the rail,
  and the contributor list are ruled rows, not cards.
- **Photos are never filtered.** No grayscale, duotone, or blend mode touches an
  image, anywhere in the app.
- No gradient text, glass/blur ornament, coloured side borders, hard offset
  shadows, or texture gradients. All are outside this world.

## Composition

**Chrome.** A ruled masthead: wordmark, the stadium name, nav, and a yellow
"Share a photo" action. Below `sm` the nav and the action collapse into a
hamburger that opens a ruled panel under the header. There is no site footer.
The chrome is identical on every page so the site reads as one product.

**Home, one viewport.** Nothing on the home page scrolls. The shell is capped to
the viewport and the parts are laid out to fit:

1. A node bar: Level 1/2/3 nodes with their photographed counts, and — once a
   Section is chosen — the Section find field.
2. A stage on the left. Before a Section is chosen it holds the hero: the title
   at display size, a yellow rule, a supporting line, and the find field. After
   that it is the Section's photo at the size it deserves, a thumbnail strip when
   there is more than one, and a caption bar (Section, Level, count, date). The
   top-bar find field stays hidden until then, so there is one search control.
3. A rail on the right holding, in order: the seat map (always visible, never
   scrolled to), then — once a Section is chosen — a Section / Level / Photos
   readout, prev/next Section, and the Level's Section list which scrolls inside
   itself.

Below the `lg` breakpoint the stage and rail stack, the Section list steps aside,
and the map, readout and jump stay visible without scrolling. On a first visit
the hero sizes to its copy and the map takes the rest of the viewport, rather
than the hero stretching into empty ground.

**Section page.** A `Section 201A-B` heading with a yellow rule, a frame of
neighbour links, and the photos at `aspect-4/3` with their captions. Every
contribution appears; nothing is cropped into a uniform tile grid.

**Contributors** is a ruled credited list. **Contribute** is a single-column
form. **404** sits on the same page gutter as every other page.

## Interaction and state

- **Selecting a Section** happens through the bowl, the ruled list, the find
  field, prev/next, or the keyboard. Arrow keys move around the current Level;
  up and down shift Level. Typing in a field is never hijacked.
- **Photo choice** within a Section is a thumbnail strip marked with
  `aria-current`.
- **States**: hover (rows, nodes, controls brighten toward the accent), focus
  (`:focus-visible` yellow ring, including SVG Sections), disabled, loading
  (upload progress), error (the find field turns `--destructive` and names the
  problem and the recovery), and empty. The home's first-visit empty state is
  the hero with its find field; a Section with no photo offers "Share a photo"
  with that Section prefilled.

## Motion

One authored moment: the home photo fades and lifts 3px when the Section changes,
on `cubic-bezier(0.16, 1, 0.3, 1)`. Everything else is a short colour or
background transition. `prefers-reduced-motion` disables the entrance.

## Browser surfaces

The parts nobody draws still belong to the world: `color-scheme: dark`, a yellow
`caret-color` in fields, a yellow-tinted `::selection`, themed thin scrollbars,
token focus rings, and tabular numerals set on `body`.

## Invariants

- UX, copy, semantics, URLs, metadata, and static prerendering are unchanged by
  the refresh (see ADR 0001). The look changed; the product did not.
- One accent, one family, dark-only, photos unfiltered. A change that needs a
  second accent, a novelty face, a light mode, or a photo filter is a different
  world, not this one.

## Provenance

`public/logo.png`, `public/og.png`, and `public/favicon.ico` are the existing
brand rasters and were not regenerated; the logo is the axonometric stadium
illustration and is carried forward unchanged. All seat photographs are
contributor-supplied and shown as-is, from
`https://storage.bukitjalilstadium.com`. There are no generated or stock images
in the design.

## Open questions

- `PRODUCT.md` says 104 Sections; the seat plan and sitemap hold 103. The home no
  longer surfaces the count, so the two are a documentation divergence rather
  than a visible one, but they should still be reconciled.
- The mobile home deliberately omits the Section list to keep the viewport. If the
  list is worth having on a phone, it needs a different treatment, not a scroll.
