# Product taxonomy

Single source of truth for how products are classified. Keep values controlled and consistent — never mix variants such as `LV`, `LouisVuitton`, `Louis Vuitton` and `louis-vuitton` for the same purpose.

## Fields and their roles

| Field | Used for | Controlled values |
| --- | --- | --- |
| `vendor` | Designer house; drives the designer smart collections | `Louis Vuitton`, `Gucci` (future: `Chanel`, `Dior`, `Prada`, `Fendi`, `Celine`, `Hermès`, `Bottega Veneta`, `Chloé`, `Balenciaga`, `Saint Laurent`) |
| `product_type` (Shopify) | Bag style | `Shoulder bag`, `Crossbody bag`, `Tote bag`, `Top-handle bag`, `Evening bag`, `Travel bag` |
| Shopify product category | Standard taxonomy | Apparel & Accessories > Handbags, Wallets & Cases > Handbags (set per product when meaningful) |
| Metafields (`custom.*`) | Item-specific facts | See below |
| Tags | Automation only | See below |

## Metafields (namespace `custom`, owner: product)

| Key | Type | Notes |
| --- | --- | --- |
| `designer` | single line | Mirrors `vendor`; shown in the specification block |
| `model` | single line | Model or line name |
| `product_type` | single line | Bag style; mirrors Shopify product type |
| `year_or_era` | single line | Only when verified; otherwise empty. A piece is called "vintage" only when it is at least 20 years old and its age is confirmed |
| `condition` | single line | `Excellent`, `Very good`, `Good`, `Fair` (sentence case) — see the Condition guide page |
| `condition_notes` | multi line | Honest, item-specific observations |
| `material` | single line | e.g. `Monogram canvas`, `Epi leather` |
| `color` | single line | Primary colour |
| `dimensions` | single line | `W x H x D cm`, includes units |
| `inclusions` | list of single lines | Dust bag, strap, padlock…; empty = nothing included |
| `serial_or_date_code` | single line | **Customer-safe wording only** (e.g. "Date code present"). Never the full code |
| `provenance` | multi line | Only when verified |
| `authentication_notes` | multi line | Only verified observations; no unsupported claims |

Internal only (namespace `internal`, no storefront access):

| Key | Type | Notes |
| --- | --- | --- |
| `serial_reference` | single line | Full serial/date code for internal records; never rendered |

## Controlled tags (automation only)

| Tag | Purpose |
| --- | --- |
| `bag` | General product marker (reserved for future automation) |
| `new-arrival` | Feeds the New Arrivals smart collection; remove after ±30 days |
| `vp2-test-data` | Marks fictional test products for later deletion |
| `btw` / `marge` | VAT scheme of the piece, from the owner's bookkeeping: `btw` = sold with VAT (variant taxable), `marge` = margin scheme for second-hand goods (variant not taxable, no VAT shown). Mirrors `custom.vat_scheme` (`standard` / `margin`), which must drive the invoice text. Owner decision 2026-10-22: no VAT or margin wording on the storefront; the customer sees the total price only. |

Do not use tags for facts that belong in metafields.

## Collections

| Handle | Type | Rule |
| --- | --- | --- |
| `all-bags` | Smart | variant price > 0 (every sellable product) |
| `new-arrivals` | Smart | tag = `new-arrival` |
| `louis-vuitton` | Smart | vendor = `Louis Vuitton` |
| `gucci` | Smart | vendor = `Gucci` |

Future SEO collections (shoulder bags, crossbody, tote, top-handle, evening, travel, archive, price ranges, decades) are intentionally **not** created until real inventory makes them meaningful; base them on `product_type` or metafield rules, not free-form tags.
