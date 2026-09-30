# Migration log — vintagepareltje.com → vp2-dev (snapshot 2026-09-06)

Source of truth used: public Shopify endpoints of the old store
(`/products.json`, `/products/<handle>.js`, collection JSON, pages, policies) —
rank 2 in the agreed source hierarchy (no old Admin API access was available).
Raw export: `vintagepareltje-source-export.json` (sanitised; no customer data).
All migrated records were created as **DRAFT**, tagged `migration-vintagepareltje`,
`migration-review`, `images-pending` (+ `sold-archive` where confirmed sold).
No media was migrated; nothing was published.

## Counts

- Old store public catalogue: 25 products = 18 bags + 3 accessories + 4 gift cards.
- Migrated: 18 bags + 3 accessories = **21 draft products** (13 bags available,
  5 bags sold; 1 accessory available, 2 accessories sold).
- Not migrated: 4 gift cards (business decision pending — see end report).
- Unresolved: 2 seed items (below).

## Unresolved seed items

| Seed # | Item | Probed | Result |
| --- | --- | --- | --- |
| 4 | Louis Vuitton Looping PM (2nd piece, €700, sold) | `/products/louis-vuitton-looping-pm-kopie` (.js) | **404 — not publicly accessible.** Not in `/products.json`. Likely deleted or unpublished; resolvable only via the old store's Admin. NOT migrated; nothing guessed. |
| 13 | Louis Vuitton Nano Speedy (€1,100, sold) | `louis-vuitton-nano-speedy`, `louise-vuitton-nano-speedy`, `nano-speedy` | **404 on all probes.** Same conclusion. NOT migrated. |

## Deviations vs. the migration seed prompt

| Product (old handle) | Seed value | Live source value | Chosen | Reason |
| --- | --- | --- | --- | --- |
| `louis-vuitton-looping-pm` | €650 | €560 (product .js) | **€560** | Source hierarchy: live product page over seed |
| `louis-vuitton-speedy-30-met-slotje-kopie` | €495 (collection showed €525) | €495 | €495 | Confirmed |
| `louis-vuitton-speedy-30-kopie` | €550 (collection €565) | €550 | €550 | Confirmed; padlock-without-key confirmed in source body |
| `louis-vuitton-pochette-accessoires` | €498 (elsewhere €510) | €498 | €498 | Confirmed |
| `louise-vuitton-speedy-30` | €520 (collection €559) | €520 | €520 | Confirmed |
| Not in seed | — | `louis-vuitton-alma-30` €575 avail | Migrated | Live catalogue ranks above seed; also **not** in the old `tassen` collection (only frontpage) — noted |
| Not in seed | — | `naamloos-23jul_22-48-54` (Jacquemus Le Grand Bambino, brown) €485 avail | Migrated | Broken auto-handle; treated as separate physical piece |
| Not in seed | — | `jacquemus-le-grand-bambino` (black) €485 avail | Migrated | Same title/price as the brown piece — **assumed two separate physical pieces (different colours per source bodies); flagged for owner confirmation, not merged** |
| Not in seed | — | `louis-vuitton-saumur-30` €425 avail | Migrated | New since seed |
| Not in seed | — | `louis-vuitton-keepall-60-monogram` €600 sold | Migrated (sold-archive) | New since seed |
| Not in seed | — | `gucci-gg-marmont-shoulder-bag-matelasse-leer` €650 avail | Migrated | New since seed |
| `organizer-…-sac-noe` | stock 4 | public JSON shows only `available: true` (no qty) | **qty 4 from seed** | Quantity not visible in public source; seed used and flagged in the product's internal migration note |
| All old products | vendor `Vintage Pareltje` | — | vendor = designer (Louis Vuitton / Gucci / Jacquemus / Unbranded) | Taxonomy rule (`docs/taxonomy.md`); old trade name never used as vendor |
| Prices EUR | — | store currency is still USD | numeric values migrated as-is | Currency migration to EUR is an existing launch blocker; repricing check required before publication |

## New identities (old → new)

| Old handle | New handle | Ref/SKU | Status |
| --- | --- | --- | --- |
| louis-vuitton-looping-pm | louis-vuitton-looping-pm | VP-B001 | draft, available |
| louis-vuitton-alma-30 | louis-vuitton-alma-30 | VP-B002 | draft, available |
| naamloos-23jul_22-48-54 | jacquemus-le-grand-bambino-brown | VP-B003 | draft, available |
| jacquemus-le-grand-bambino | jacquemus-le-grand-bambino-black | VP-B004 | draft, available |
| louis-vuitton-saumur-30 | louis-vuitton-saumur-30 | VP-B005 | draft, available |
| louis-vuitton-keepall-60-monogram | louis-vuitton-keepall-60 | VP-B006 | draft, sold-archive |
| gucci-gg-marmont-shoulder-bag-matelasse-leer | gucci-gg-marmont-shoulder-bag | VP-B007 | draft, available |
| louis-vuitton-speedy-30-met-slotje-kopie | louis-vuitton-speedy-30-01 | VP-B008 (old SKU "Speedy 30 apr") | draft, available |
| louis-vuitton-speedy-30-kopie | louis-vuitton-speedy-30-02 | VP-B009 (old SKU "Speedy slotje") | draft, available; inclusions: padlock, no key |
| louise-vuitton-speedy-30 | louis-vuitton-speedy-30-03 | VP-B010 | draft, available |
| louis-vuitton-pochette-accessoires | louis-vuitton-pochette-accessoires | VP-B011 | draft, available |
| gucci-jackie-bag | gucci-jackie-bag | VP-B012 | draft, available |
| louise-vuitton-sac-noe-petit-kopie | louis-vuitton-petit-noe-01 | VP-B013 | draft, available |
| sac-noe | louis-vuitton-petit-noe-02 | VP-B014 | draft, available |
| louise-vuitton-sac-noe-petit | louis-vuitton-petit-noe-03 | VP-B015 | draft, sold-archive |
| louise-vuitton-looping-gm-kopie | louis-vuitton-looping-gm-01 | VP-B016 | draft, sold-archive |
| louise-vuitton-looping-gm | louis-vuitton-looping-gm-02 | VP-B017 | draft, sold-archive |
| gucci-gg-schouder-tas | gucci-gg-shoulder-bag | VP-B018 | draft, sold-archive |
| louise-vuitton-strap | louis-vuitton-shoulder-strap | VP-A001 | draft, sold-archive |
| louise-vuitton-accesoires | louis-vuitton-accessory-unidentified | VP-A002 | draft, sold-archive, **publication-blocked** until identified |
| organizer-ideaal-voor-de-louise-vuitton-sac-noe | bag-organizer | VP-A003 | draft, available (qty 4 from seed) |

## Redirect plan (NOT active — activate only when the domain/traffic migrates)

Every old URL above whose handle changed needs `/products/<old>` →
`/products/<new>` on whichever store ends up serving the old domain. No
redirects were created on the old live store (out of scope, per instruction),
and none are needed on the dev store until it serves real traffic under the
migrated domain. The full mapping is the table above; misspelled handles
(`louise-vuitton-*`, `accesoires`, `sac-noe`, `naamloos-*`) are all covered.

## Per-product publication checklist (applies to every migrated draft)

Before any migrated product may be published: own product photography ·
measured dimensions · individual condition grade + notes + condition issues ·
verified inclusions · date/era only if verifiable · customer-safe production-code
wording (full code only in `internal.serial_reference`) · price re-check after
the EUR/Markets migration · removal of the `migration-review` and
`images-pending` tags · for VP-A002 additionally: item identification.
The same list is stored on each product in `internal.migration_note`
(admin-only, never rendered).

---

## Delta 2026-09-30 — four new pieces, one sold

Owner-instructed re-check of the public old-store catalogue (29 products, up
from 25). Raw data: `vintagepareltje-delta-20260930.json`. Same conventions as
above; created directly as **ACTIVE + Online Store** because the migrated
catalogue is already live on the password-protected test store. Photographs
are the owner's own old-store images, imported unchanged (first image = main),
so `images-pending` stays until owned studio photography replaces them.

| Old handle | New handle | Ref/SKU | Price | Status | Images |
| --- | --- | --- | --- | --- | --- |
| louis-vuitton-looping-gm-monogram-canvas | louis-vuitton-looping-gm-03 | VP-B019 | €650 | available, new-arrival | 9 |
| louis-vuitton-neverfull | louis-vuitton-neverfull | VP-B020 | €850 | available, new-arrival; size MM (owner confirmation 2026-09-30; title and model updated) | 5 |
| saddle-triple-zip-pouch | dior-saddle-triple-zip-pouch | VP-B021 | €750 | available, new-arrival; strap is blue leather (owner confirmation 2026-09-30; body updated in six languages) | 12 |
| louis-vuitton-looping | louis-vuitton-looping-pm-02 | VP-B022 | €640 | sold-archive (sold on the old store before migration) | 8 |

Status change: **VP-B001 `louis-vuitton-looping-pm`** is listed as sold on the
old store (`available: false`) and was moved to `sold-archive` here, inventory
set to 0, note appended to `internal.migration_note`; the owner confirmed the
sale on 2026-09-30. VP-B022 may be the
"second Looping PM" seed item that was unresolved in September; not merged,
treated as its own physical piece.

New house: **Dior** (vendor `Dior`, tag `designer-dior`). Created the smart
collection `dior` (`VENDOR = Dior AND TAG = available`, sort newest first,
published, description translated nl/de/fr/it/es) and added "Dior" under
Designers in the main menu, preserving every existing menu-item id so link
translations stay intact. The Designers page copy ("we begin with Louis
Vuitton and Gucci, and the circle will widen") still holds and was not edited.
No collection image yet (the image register governs non-product imagery).

Translations registered per new product: `body_html` and `product_type` in
nl/de/fr/it/es, `title` in it/es (identical), matching the existing catalogue.
Bodies contain only source-supported facts (materials, hardware, pockets,
condition remarks from the old listing) plus the standard closing sentence.

Catalogue after this delta: 25 migrated products (24 published, VP-A002 still
draft); 16 available bags + 1 accessory; 8 archived pieces.

### Galleries and the Dior banner (same day)

Owner-instructed: the remaining old-store photographs were added to the
migrated products that still carried only their main image (owner's own
photos, imported unchanged, appended after the existing media so the main
image stays first). The image already used as main, per
`docs/photography/main-image-after.json`, was skipped. Result: 122 gallery
images added across 19 products, all READY, none failed; the catalogue now
holds 180 product images. Skipped: `gucci-gg-marmont-shoulder-bag` (gallery
already rebuilt with six media on 27 September), `louis-vuitton-shoulder-strap`
and `louis-vuitton-accessory-unidentified` (one source image each).
`images-pending` stays on every product until owned studio photography lands.

The Dior collection received an owner-supplied banner
(`owner-dior-vibe-bowling-white.jpg`, see image register batch 6) and Dior was
added to the Designers page as a fourth house (`templates/page.designers.json`,
two columns).

