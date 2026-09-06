# Storefront audit — redesign phase (2026-09-06)

Read-only audit performed before the "complete luxury storefront" redesign
build. Store: `vp2-dev.myshopify.com` (password-protected dev store, GitHub
sync `main` → published theme `vp2-theme/main`, id 143416721467).

## Repository / theme state

- Branch base: `main` at merge of PR #8; feature branch `claude/website-bouwen-ds3nki`.
- `config/settings_data.json` SHA-256 at start:
  `576f1237bd404e2232ff2f38356c19c17867ed438a3fac09fbfb89640311d1a6`
  (must be identical at the end of this phase).
- `sections/header-group.json` and `sections/footer-group.json` are repo
  files → announcement copy, selector settings and footer blocks are
  editable WITHOUT touching `settings_data.json`.
- Header `enable_language_selector` / `enable_country_selector` are already
  `true`; the storefront has 4 published languages, 1 country (US) — so only
  the language selector renders. Announcement bar block text is the Dawn
  default `Welcome to our store` → must be replaced (§36.6).

## Existing custom feature inventory (retain unless noted)

| Component | Verdict |
| --- | --- |
| `editorial-hero` (full-bleed overlay hero) | **deprecate-but-preserve** — replaced on homepage by new split hero (§10/H1, §36.6); file kept for Theme Editor use |
| `trust-strip` | retain → used as quiet proof strip (H2) with §10 wording |
| `featured-collection`, `collection-list` | retain |
| `featured-designers` | retain; homepage limited to LV / Gucci / Jacquemus |
| `find-a-bag-form`, `sell-to-us-form`, `faq-page`, `archive-actions`, `drop-signup` | retain |
| wishlist / recently-viewed (assets + sections) | retain |
| PDP blocks (condition report, what fits, shipping card, enquiry, sold state) | retain |
| `localization-discovery` (browser-language switch + suggestion banner) | retain — satisfies "automatic language handling + manual override" |
| collection/page banner `image-banner` instances | subject to image-register triage (§36.3) |

## Shopify data state

- 21 products: 15 Louis Vuitton, 3 Gucci, **2 Jacquemus**, 1 Unbranded
  (bag organizer). 20 ACTIVE + 1 DRAFT (publication-blocked accessory).
  7 tagged `sold-archive` (6 active + the draft).
- Collections (smart): all-bags (TAG=bag), new-arrivals (TAG=new-arrival —
  **0 products, empty nav destination**), louis-vuitton (VENDOR),
  gucci (VENDOR), archive (TAG=sold-archive), accessories (TAG=accessory).
  → Designer/all-bags collections **mix sold and available** (§36.7
  availability architecture violation). No Jacquemus collection despite two
  available products.
- Blog `journal` with 4 articles (LV/Gucci popularity guides, EN+NL pairs).
- Shop currency **USD**, zero orders. Migrated prices are EUR-intended →
  publication blocker; base-currency change is an Admin-only action
  (see launch-readiness / final report for the click path).

## Planned changes (this phase)

1. **Availability separation (API, idempotent):** add `available` tag to the
   14 available products; smart-collection rules become conjunctive
   (`… AND tag=available`) for all-bags, louis-vuitton, gucci, accessories,
   new-arrivals; add `new-arrival` tag to available pieces; create
   `jacquemus` collection (+ translations); archive rule unchanged.
2. **Shell:** announcement copy, footer restructure to four columns +
   non-affiliation + newsletter, popular searches in search overlay,
   language selector presentation per §36.9.
3. **Homepage:** ten-module composition per §10 with new sections
   `editorial-split-hero`, `service-panel`, `archive-feature`,
   `journal-feature`; §36 image purge applied.
4. **Cards/collections:** card typography per §36.7, condition line,
   differentiators from verified metafields.
5. **Docs:** design-system, photography-brief, image-register,
   content-roadmap, internal-link-map, QA checklist.
6. **Journal:** hub/article template refinements; Tier-1 drafts 1–4, 7–9 as
   unpublished articles (EN + NL/DE/FR on the same resources).

Out of scope by guardrail: `settings_data.json`, publishing policies,
currency/Markets mutation, theme role changes, removing password,
unresolved migration records.
