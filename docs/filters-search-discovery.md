# Filters — Shopify Search & Discovery configuration

Dawn's native faceted filtering (storefront filters) is used — no custom
filter system was built. Collection templates have `enable_filtering: true`
with the horizontal layout (Dawn automatically presents filters in an
accessible drawer on mobile); active filters are individually removable and
result counts and sorting are Shopify-native. The Archive template disables
filtering/sorting on purpose (small, sold-only collection).

## Manual configuration required (not reliably automatable via Admin API)

Storefront filter *sources* are managed by the **Shopify Search & Discovery**
app (free, first-party). The Admin API does not reliably manage this app's
filter configuration, so after installing/opening the app
(Admin → Apps → Search & Discovery → Filters), enable these sources:

| Filter | Source |
| --- | --- |
| Availability | Native availability filter |
| Designer | Vendor |
| Model | Product metafield `custom.model` |
| Bag type | Product type (or metafield `custom.product_type`) |
| Price | Native price filter |
| Colour | Product metafield `custom.color` |
| Material | Product metafield `custom.material` |
| Condition | Product metafield `custom.condition` |
| Year or era | Product metafield `custom.year_or_era` |
| Size category | Product metafield `custom.size_category` |

Notes:

- Metafield filters require the definitions to have storefront access
  (all listed definitions have it) and values on published products; Shopify
  only shows a filter when current products carry values, so empty filters
  hide automatically.
- Keep filter labels translated in the app's own settings where offered;
  the theme renders whatever the Storefront API returns.
- Do not create indexable filter-combination landing pages; filtered URLs
  stay parameterised and are not added to navigation or sitemaps.
