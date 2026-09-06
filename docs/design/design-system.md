# Design system — "The private archive"

The storefront follows one visual idea: a contemporary private archive —
tactile, collected, quietly confident. Closer to a fashion journal and
intimate showroom than to a high-volume marketplace.

## Tokens (`assets/vp-tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--vp-space-2xs … --vp-space-2xl` | 0.8–14.4rem | vertical rhythm; sections use l/xl |
| `--vp-measure-text` | 72rem | max text width (≈55–72 chars) |
| `--vp-measure-lead` | 60rem | lead paragraphs |
| `--vp-border` | 1px, foreground @ 12% | thin rules everywhere |
| `--vp-radius` | 2px | imagery/cards near-square |
| `--vp-duration` / `--vp-ease` | 200ms, ease-out-cubic | hover/disclosure; 0ms under reduced motion |

Colours and fonts stay in Theme Editor settings (colour schemes 1–3,
Cormorant display + Inter UI). No colour values are hardcoded in code and
`settings_data.json` is untouched.

## Layout rules

- Editorial max width: theme `page-width` (Dawn setting).
- Product cards: 4:5 media, 3 columns desktop, 2 on mobile (1 below 480px
  in custom grids).
- Section spacing 96px desktop / 72px reduced / ~0.75× on mobile.
- Borders over shadows; no large drop shadows anywhere in new components.
- Buttons ≥ 48px height (Dawn default + `min-height` guards for
  filter/sort/popular-search tap targets, ≥44px).

## Type

Dawn's fluid heading scale (h0–h5) is retained; new sections choose from
h1/h2 only. Uppercase is reserved for eyebrows/captions
(`caption-with-letter-spacing`, 12–13px equivalent). Card typography on
mobile: title 16px, vendor/eyebrow 12px, meta line 12–13px, price 15px
medium (see `vp-tokens.css`).

## Motion

180–300ms transitions only (token default 200ms); one gentle reveal
(`animations_reveal_on_scroll`, Dawn native) on editorial sections; all
non-essential motion disabled under `prefers-reduced-motion`. No carousels,
parallax or scroll hijacking.

## Components added in this phase

| Component | File | Purpose |
| --- | --- | --- |
| Editorial split hero | `sections/editorial-split-hero.liquid` | H1 module: copy panel 42% + image 58%, text-first on mobile, no overlay text on imagery |
| Service panel | `sections/service-panel.liquid` | quiet full-width service block (Find a Bag, H6) |
| Archive feature | `sections/archive-feature.liquid` | 3 sold cards + archive CTA (H8) |
| Journal feature | `sections/journal-feature.liquid` | 1 lead + 2 secondary article cards, honest reading time (H9) |
| Curator's note | `snippets/product-curators-note.liquid` | PDP "Why this piece" from `custom.curators_note`, hidden when empty |
| Popular searches | `snippets/header-search.liquid` | configurable terms in the search overlay (`settings.popular_searches`) |
| Card meta line | `snippets/card-product.liquid` | verified differentiators: material · condition |

Deprecated-but-preserved: `sections/editorial-hero.liquid` (full-bleed
overlay hero) — no longer used on the homepage per §36.6, still available
in the Theme Editor.

## Merchant guardrails

New section schemas expose content, references, colour scheme and spacing
within controlled ranges — not free-form design knobs. Image slots state
their intent (e.g. hero: "one strong editorial image of a real piece;
leave empty for a deliberate typographic hero").
