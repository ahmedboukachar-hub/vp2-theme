# Storefront refinement — 13 September 2026

Base: `2c768e8e4473d70c3f6177d8914ee50a942f4ce4`. Branch: `codex/audit-refinement-designer-20260913`.
User authorised implementation and publishing to the existing development storefront. No open PRs or changes to main were found before the work. `config/settings_data.json` is unchanged.

## Changes

- Journal and footer use existing light stone scheme 2. Product presentation stays light; the former dark editorial statement uses the white scheme. All colour values remain merchant-controlled.
- Shorter hero and image panels; images have explicit containing geometry, preventing intrinsic image heights from inflating flex sections.
- Compact introductory strip, earlier arrivals, hidden homepage archive teaser (archive collection/navigation retained), Journal before the search-service panel.
- Merchant-selectable Journal articles: Speedy guide, Gucci guide and condition guide. Wider secondary text columns; no decorative counters; landscape index images.
- Shared translated Journal topic renderer avoids double escaping. Common factual product values are translated in all four locales without changing stored product facts.
- Server-side designer tag filter on collection listings, with reset, current selection and existing facet/sort query preservation. Native vendor facet takes precedence when enabled in Search & Discovery.
- Designer links on product pages; unique single-variant bags no longer show a quantity selector.
- Duplicate footer policy links omitted; redundant page headings removed when an earlier hero provides the heading. Extra Find a Bag preferences are optional and collapsed.
- Correct Dutch filtered result count (previously “korting op”), contact labels and newsletter wording. Theme translation registration plan is in `refinement-copy.json`.

## Designer tag maintenance

The current Search & Discovery configuration exposes availability and price only. Native vendor URL parameters were verified to have no filtering effect. Shopify collection tag URLs are used instead; this is server-side filtering of the collection, not client-side hiding of cards.

19 active, branded migrated products received their designer tag, derived from their existing vendor: `designer-louis-vuitton`, `designer-gucci`, or `designer-jacquemus`. Existing tags were preserved. Draft unidentified accessories and the unbranded organizer were excluded. Before-state is in `designer-tags-before.json`.

When importing a new branded product, include `designer-<handleized vendor>` and keep it in sync when changing its vendor. Enabling the native Vendor filter in Search & Discovery removes this maintenance requirement for collection filtering; the theme hides the fallback automatically. The fallback selects one designer at a time. It does not add search-page facets.

Filtered collection URLs have a base-collection canonical and `noindex,follow`. Product lists and native counts were verified to return exactly the two available-collection Gucci records, preserving the collection scope.

## Validation

All theme JSON parses; new locale keys exist in EN/NL/DE/FR; JavaScript syntax and git whitespace checks pass. Shopify's packaged validator uses its bundled documentation because the online reference download is unavailable. Its existing main baseline flags `standard_event_data`, Dawn's `offset: continue`, and the existing `scheme_classes` accumulation. These baseline findings are not suppressed or “fixed” by deleting valid existing functionality. Candidate checks are compared with the same baseline. See final execution report for storefront verification.

## Unresolved business data

The active Market contains the Netherlands only. The sole shipping profile still contains only the United States/Domestic zone with three existing methods. This mismatch needs shipping configuration, and can contribute to the observed unavailable storefront products despite inventory. No shipping prices, countries, market settings, stock quantities or payment settings were invented or changed. A complete testcheckout has not passed.

Individual condition reports, dimensions, inclusions and extra photography still need owner input. This task does not fabricate those facts or assert that the existing legal or authenticity wording is approved. No new stock photography was sourced.

## Rollback

Revert the theme merge through a new PR. For tags, remove only the newly added `designer-*` values listed above from the exact product IDs in the before-state file; do not replace entire tag lists. Restore only affected theme translation values if reverting the copy. Do not reset store settings or overwrite concurrent Claude/Theme Editor work.
