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


---

# Visual refinement phase (2026-09-11)

The storefront no longer reads as a lightly restyled Dawn theme. Dawn remains
the commerce base; the presentation layer is purpose-built.

## Colour roles and distribution

`config/settings_data.json` is untouched; sections choose roles through
`color_scheme`.

| Scheme | Value | Role |
| --- | --- | --- |
| scheme-1 | `#F7F3EC` warm off-white | primary page canvas |
| scheme-2 | `#E9E1D6` stone | one contained service panel only |
| scheme-3 | `#FFFFFF` true white | product grids and clean commercial/editorial sections |
| scheme-4 | `#1D1A18` near-black | one editorial interruption + the footer |
| scheme-5 | `#6A2634` oxblood | reserved for accents; not used as a full surface |

Homepage rhythm: off-white hero → white proof strip → white product grid →
off-white designers → **near-black editorial** → stone service panel →
off-white archive → white Journal → off-white newsletter → near-black footer.
No two consecutive stone sections; stone appears exactly once.

## Type scale (tokens in `assets/vp-tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--vp-type-hero` | `clamp(4rem, 6.4vw, 7.2rem)` | hero H1 |
| `--vp-type-display` | `clamp(3.4rem, 4.6vw, 5.6rem)` | page and article H1 |
| `--vp-type-editorial` | `clamp(3.2rem, 4vw, 5.4rem)` | editorial pull headings |
| `--vp-type-section` | `clamp(3rem, 3.4vw, 4.6rem)` | section headings |
| `--vp-type-lead-story` | `clamp(2.8rem, 3vw, 4.2rem)` | Journal lead headline |
| `--vp-type-body-lead` | `clamp(1.7rem, 1.2vw, 2rem)` | lead paragraphs |
| `--vp-type-eyebrow` | `1.2rem` uppercase, 0.14em tracking | eyebrows |

Container widens to `144rem`; body measure `--vp-measure-article` 70rem,
lead measure 60rem. Buttons ≥48px, tap targets ≥44px. Section rhythm
64–80px mobile, 96–128px desktop.

## Components

| Component | File | Status |
| --- | --- | --- |
| Editorial split hero | `sections/editorial-split-hero.liquid` | rescaled, 46/54, both CTAs visible |
| Proof strip | `sections/trust-strip.liquid` | rebuilt, typography-led, three columns + link |
| Featured designers | `sections/featured-designers.liquid` | rebuilt as large editorial cards with localised CTA |
| Editorial feature | `sections/editorial-feature.liquid` | **new** — the dark interruption |
| Archive teaser | `sections/archive-feature.liquid` | rebuilt: own card treatment, 3 desktop / 2 mobile, price off by default, never a cart control |
| Journal card | `snippets/journal-card.liquid` | **new** — shared by homepage, index and related reading |
| Journal feature | `sections/journal-feature.liquid` | rebuilt as a 62/38 magazine grid |
| Journal index | `sections/journal-index.liquid` | **new** — replaces Dawn's blog listing |
| Article | `sections/main-article.liquid` | rebuilt as long-form reading |
| Related reading | `sections/article-related.liquid` | **new** |
| Page hero | `sections/page-hero.liquid` | **new** — reusable secondary-page opening |
| Main page | `sections/main-page.liquid` | `show_title` setting + editorial rich text |
| Footer | `sections/footer.liquid` | rebuilt: four columns, dark, mobile disclosure groups |

Retired from use: Dawn's `image-banner` as a page header (replaced by
`page-hero`), Dawn's blog listing markup, the homepage `image-with-text`
curation block (superseded by the dark editorial section).

## Footer behaviour

Link groups render as native `<details open>`, so without JavaScript every
link stays readable. `assets/footer-groups.js` (14 lines, no dependencies)
collapses them below 750px and forces them open above it, where the layout is
static columns. Keyboard and screen-reader behaviour is the browser's own
disclosure semantics. The language/region control and the legal row sit
outside the groups. The newsletter moved to the homepage so the footer stays
short on mobile.
