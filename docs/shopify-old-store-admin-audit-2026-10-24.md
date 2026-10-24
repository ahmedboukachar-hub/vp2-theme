# Shopify old-store audit — La Retrouvée

Snapshot: 2026-10-24. Source: Shopify Admin GraphQL, connected store `vp2-dev.myshopify.com` (Basic App Development). Read-only audit; do not treat as new-store state.

## Confirmed configuration

- Shop name: La Retrouvée; domain configured: laretrouvee.com; currency EUR; presentment currencies EUR only; timezone Europe/Amsterdam.
- Contact and shop email: ahmed.boukachar@bkchr.nl; address: Joke Smitlaan 44, 2104 TG Heemstede, NL; company field empty. Confirm desired production email/legal identity separately.
- Shop locales: en primary; nl, de, fr, it, es all published.
- Markets: Europe (handle `europe`, ACTIVE, default locale en, localCurrencies false, rounding false); NL (handle `us`, ACTIVE). **Production requirement: NL handle `nl`, not `us`.**
- Shipping: one default general delivery profile, with zones Domestic, Netherlands, Rest of world; each has active method named Free shipping. Shopify market eligibility may restrict checkout. **Production requirement: free shipping to supported European countries only; no shipping outside Europe.** Configure country coverage and verify checkout; do not copy Rest of world zone.
- Shop taxesIncluded false; taxShipping false. These are shop-level API fields, not a complete tax-registration/VAT configuration. Review tax registration, margin scheme and cross-border VAT manually.
- Customer accounts OPTIONAL; checkout-specific configuration inaccessible via connector (access denied).
- Order number prefix #; suffix empty. Unit system METRIC_SYSTEM; weight unit KILOGRAMS.
- Marketing SMS consent at checkout false; transactional SMS not disabled.
- One active location named Shop location, fulfillsOnlineOrders true, shipsInventory true.
- Five policy types present with content: LEGAL_NOTICE, PRIVACY_POLICY, REFUND_POLICY, SHIPPING_POLICY, TERMS_OF_SERVICE. Legal notice identifies Vintage Pareltje as legal seller, includes KvK and VAT IDs. Copy/verify policy bodies separately; privacy policy is Shopify-generated.
- Installed apps: VP2.0 Content and Shopify ChatGPT MCP App. Connector scopes exist but some queries can still be denied.

## Counts read live from old store

- Products: **26** (all retrieved, no next page).
- Collections: **9**.
- Pages: **14**.
- Blogs: **1**, handle `journal`.
- Articles: **18** (all retrieved, no next page). **Note:** migration plan mentioned 16 articles; use current actual count of 18 or investigate exclusions.
- URL redirects: **1**, `/blogs/news` → `/blogs/journal`.

## Metafield definitions

Product owner type (24):

| Namespace | Key | Type |
|---|---|---|
| custom | designer | single_line_text_field |
| custom | model | single_line_text_field |
| custom | product_type | single_line_text_field |
| custom | year_or_era | single_line_text_field |
| custom | condition | single_line_text_field |
| custom | condition_notes | multi_line_text_field |
| custom | material | single_line_text_field |
| custom | color | single_line_text_field |
| custom | dimensions | single_line_text_field |
| custom | inclusions | list.single_line_text_field |
| custom | serial_or_date_code | single_line_text_field |
| custom | provenance | multi_line_text_field |
| custom | authentication_notes | multi_line_text_field |
| internal | serial_reference | single_line_text_field |
| custom | condition_summary | multi_line_text_field |
| custom | size_category | single_line_text_field |
| custom | what_fits | rich_text_field |
| custom | care_notes | rich_text_field |
| custom | condition_issues | list.metaobject_reference |
| custom | accessory_type | single_line_text_field |
| custom | compatible_models | list.single_line_text_field |
| internal | migration_note | multi_line_text_field |
| custom | curators_note | multi_line_text_field |
| custom | vat_scheme | single_line_text_field |

Article: `custom.models` = `list.single_line_text_field`.
Collection: no custom definitions returned.

## To check or configure separately

- Full tax registration, EU VAT/OSS and secondhand margin-scheme settings.
- Payment providers, payout/bank settings, Shopify plan/billing.
- Checkout customization, customer-account specifics, order and shipping notification templates, sender domain authentication.
- Detailed shipping country coverage and checkout testing, especially excluding non-European countries.
- Product inventory/SEO/media, theme files, navigation, translations and policy bodies: migrate and QA per main migration plan; this document is a settings snapshot, not a full content backup.
- **Do not switch domain or publish without owner approval.**

## Migration coordination

Claude Code handles technical migration; ChatGPT can compare Admin settings after new-shop authorization. This audit does not modify Shopify. User explicitly confirmed free shipping within Europe only, and correcting NL handle to `nl` on new store.
