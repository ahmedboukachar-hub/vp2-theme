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

Colours and fonts stay in Theme Editor settings (colour schemes, Cormorant
display + Inter UI) and `settings_data.json` is untouched. The one fixed
colour in code is the photo ground `--vp-media-ground` (`#f6f2ec`, in
`vp-tokens.css`) behind product photographs in cards and the product gallery;
the wishlist and archive-teaser tiles still use a white ground until the card
shape is decided.

## Layout rules

- Buttons (owner decision 2026-10-23): every call-to-action button has one
  width, `--vp-button-width` (28rem) in `vp-tokens.css`, on tablet and
  desktop; on phones buttons run the full column. On the product page all
  actions (Buy it now, Add to cart, sold-state buttons, Ask about this
  piece) fill the buy column, capped at 44rem. Exception: the two hero
  buttons share the hero copy column side by side. Keep button labels short
  enough to fit 28rem in every language (about 24 characters).
- Product page: "Buy it now" is the filled, most prominent button and sits
  on top; "Add to cart" is the lighter one below it, in markup order too
  (owner decision 2026-10-23).

- Editorial max width: theme `page-width` (Dawn setting).
- Product cards: 4:5 media, 3 columns desktop, 2 on mobile (1 below 480px
  in custom grids).
- Section spacing 96px desktop / 72px reduced / ~0.75× on mobile.
- Borders over shadows; no large drop shadows anywhere in new components.
- Buttons ≥ 48px height (Dawn default + `min-height` guards for
  filter/sort/popular-search tap targets, ≥44px).

## Type

Dawn's fluid heading scale (h0–h5) is retained; new sections choose from
h1/h2 only. Uppercase is reserved for eyebrows (`.vp-eyebrow`, 12px, 0.14em
tracking) and Dawn's functional captions. Card typography on mobile: title
17px, vendor/eyebrow 12px, meta line 12px, price 15px regular (16px on
desktop; see `vp-tokens.css`).

Only the weights the theme loads are used: Inter regular and bold
(`--font-body-weight`, `--font-body-weight-bold`) and Cormorant at its
setting weight. Custom CSS refers to these variables instead of numeric
500/600, which the browser would render as regular/bold anyway.

## Motion

180–300ms transitions only (token default 200ms); one gentle reveal
(`animations_reveal_on_scroll`, Dawn native) on editorial sections; all
non-essential motion disabled under `prefers-reduced-motion`. No carousels,
parallax or scroll hijacking. One exception, owner decision 2026-10-22: the
product gallery uses Dawn's thumbnail slider (`gallery_layout:
thumbnail_slider` in `templates/product.json`). Second exception, owner decision
2026-10-23: "You may also like" and "Recently viewed" on product pages use
Dawn's slider below 990px (one swipeable row with a peek of the next card,
prev/next buttons and a counter); on desktop they stay a four-column grid.

## Components added in this phase

| Component | File | Purpose |
| --- | --- | --- |
| Editorial split hero | `sections/editorial-split-hero.liquid` | H1 module: copy panel 42% + image 58%, text-first on mobile, no overlay text on imagery |
| Service panel | `sections/service-panel.liquid` | quiet full-width service block (Find a Bag, H6) |
| Archive feature | `sections/archive-feature.liquid` | 3 sold cards + archive CTA (H8) |
| Journal feature | `sections/journal-feature.liquid` | 1 lead + 2 secondary article cards, honest reading time (H9) |
| Curator's note | `snippets/product-curators-note.liquid` | PDP "Why this piece" from `custom.curators_note`, hidden when empty |
| Popular searches | `snippets/header-search.liquid` | configurable terms in the search overlay (`settings.popular_searches`) |
| Card meta line | `snippets/card-product.liquid` | verified differentiators: material, then condition, else year or era, else colour (translated through `snippets/product-value.liquid`; hidden when empty) |

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

## Announcement bar (owner decision, 2026-10-23)

The announcement bar is disabled (`"disabled": true` in
`sections/header-group.json`): it repeated the hero line and read as a stock
Shopify element. Its content is kept, so it can be switched back on in the
Theme Editor; do not re-enable it without the owner.

## Footer behaviour

Link groups render as native `<details open>`, so without JavaScript every
link stays readable. `assets/footer-groups.js` (14 lines, no dependencies)
collapses them below 750px and forces them open above it, where the layout is
static columns. Keyboard and screen-reader behaviour is the browser's own
disclosure semantics. The language/region control and the legal row sit
outside the groups. The newsletter moved to the homepage so the footer stays
short on mobile.

---

# Current state (2026-09-26)

The refinement pull requests merged between 12 and 26 September changed the
surface distribution described above. This section records what is live.

- Homepage order: hero → New arrivals (off-white since #47, 2026-09-27) →
  designers (white since #47) →
  editorial statement (**white**, scheme-3, no longer near-black) → Journal
  (stone, scheme-2) → Find a Bag (off-white) → newsletter. The proof strip was
  removed from `templates/index.json` (section file kept) and the archive
  teaser is `disabled` there.
- The footer uses scheme-2 (stone). scheme-4 is not used on the homepage.
- Hero copy comes from the `brand.hero.*` locale keys when `use_brand_copy`
  is on; the section settings are the fallback.
- Brand name: `settings.brand_display_name` (Theme settings → Brand), fallback
  "La Retrouvée". The document title, Open Graph and Twitter titles use it on
  the homepage instead of the technical store name.
- The language selector shows flag emoji with native language names; the
  country selector was removed.
- The dark editorial interruption and the archive teaser described above are
  no longer on the homepage. Restoring them is a merchant decision.

---

# Homepage colour rhythm (owner decision, 2026-09-26)

**Decision.** The owner found the near-black editorial section (scheme-4) too
much contrast and had it removed. The replacement is one warm-dark
interruption instead of none: a new **Espresso** scheme, chosen from four
candidates (espresso, taupe, deep stone, oxblood) on a side-by-side mock-up of
the whole homepage.

**Espresso scheme (`scheme-6`, `config/settings_data.json`, preset "Dawn"):**

| Role | Value |
| --- | --- |
| background | `#4E3F36` |
| text | `#F7F3EC` |
| button | `#F7F3EC` |
| button_label | `#4E3F36` |
| secondary_button_label | `#F7F3EC` |
| shadow | `#1D1A18` |

Contrast ivory on espresso is about 9:1, comfortably above AA for body text.

**Homepage rhythm, top to bottom (`templates/index.json`):**

| Section | Scheme | Surface |
| --- | --- | --- |
| hero | scheme-1 | ivory |
| new_arrivals | scheme-1 | ivory (changed from white in #47, 2026-09-27) |
| designers | scheme-3 | white (changed from ivory in #47, 2026-09-27) |
| editorial | **scheme-6** | espresso, the one dark interruption |
| journal | scheme-2 | stone |
| find_a_bag | scheme-1 | ivory |
| archive | scheme-1 | ivory (section currently disabled) |
| newsletter | scheme-3 | white, full-width band (owner decision 2026-10-23) |
| footer (`sections/footer-group.json`) | scheme-2 | stone |

Product grids on collection, search and product pages also sit on the ivory
canvas (scheme-1), with product photographs on the `--vp-media-ground` photo
ground; see `docs/design/photography-brief.md` for the matching photo
background.

Rules that follow from this:

- scheme-4 (near-black) is not used as a surface anywhere on the storefront;
  it remains the text colour of the light schemes.
- Exactly one espresso section per page. Do not add a second dark surface,
  and do not put product cards or the cart on it.
- Stone appears twice (Journal, footer) and is the soft rest point between
  ivory and white; avoid two stone sections back to back.
- Closing panels above the stone footer (the `service-panel` on content pages,
  `drop-signup` on New arrivals) are white (scheme-3), or ivory (scheme-1) where
  the section above is already white, as on Designers (owner decision
  2026-10-23).
- Changing this rhythm is an owner decision, not a refinement.

Superseded: the "Colour roles and distribution" table above (scheme-4 as
"editorial interruption + footer") and the "Current state (2026-09-26)" note
that scheme-4 was unused. This section is authoritative.

### Houses section hierarchy (2026-10-22)

Owner decision: Louis Vuitton and Gucci are the core of the catalogue, so the
homepage houses section shows them as two large cards and Dior and Jacquemus
as two small cards side by side beneath them. Implemented as a block setting
`size` (large = two grid tracks, small = one) on `featured-designers`; the
Designers page keeps four large cards. An `image_position` block setting
chooses which part of a portrait-cropped image to keep.

