# Wishlist & Recently viewed — behaviour and storage

Both features are progressive enhancements: the site works fully without them
and without JavaScript. No account or login is required, and there is no
tracking and no request to any external service — product data comes only from
the shop's own `/products/<handle>.js` endpoints.

## Important limitation (first version)

Both features are **browser-bound**: data lives in the visitor's own browser
(`localStorage`) and does **not** sync between devices or browsers. Clearing
site data empties them. A future account-based wishlist can replace this
without changing the UI.

## Storage keys (for the cookie/privacy review)

| Key | Contents | Notes |
| --- | --- | --- |
| `wishlist-items` | `[{handle, id, title, url}]` | Product identifiers only; title/url kept so removed products can still be labelled "No longer available". |
| `recently-viewed-items` | `[handle, …]` (max 8) | Product handles only, newest first; max 4 shown. |
| `locale-preference` | language choice | See docs/localization-discovery.md. |

No personal data, no IP addresses, no analytics or marketing use.

## Sold / unavailable handling

- Wishlist entries whose product no longer resolves render with a
  "No longer available" label and a remove action.
- Recently-viewed entries that no longer resolve are silently skipped; the
  section removes itself entirely when nothing remains.

## Sold-archive taxonomy

A piece is "sold" only when it carries the explicit tag **`sold-archive`**
(inventory 0 alone means temporarily unavailable/reserved, not sold). Tagged
pieces: keep inventory at 0, stay published, appear in the `archive` smart
collection, show a "Sold" badge, lose quick-add, and the product page swaps
the buy buttons and sticky buy bar for the sold state with sourcing CTAs.
