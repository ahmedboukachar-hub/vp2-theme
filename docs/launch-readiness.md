# Launch readiness

The development store `vp2-dev.myshopify.com` (primary domain `laretrouvee.com`
since 2026-10-23) is deliberately used as a **live
test environment** during this phase: test content is visible on the published
development theme, by explicit owner decision. The store sits behind the
Shopify development-store password and runs on a partner development plan, so
it cannot process genuine customer transactions.

Everything below must be resolved **before** any commercial launch, transfer
to a client, or upgrade to a paid Shopify plan.

## Launch blockers

1. **Test products.** Resolved: the `[TEST ONLY]` products are gone. The
   catalogue holds the 21 migrated items (20 published, 1 draft), all still
   tagged `images-pending` and `migration-review` until owned photography and
   condition reports land.
2. **Staging workflow.** During this phase `main` syncs directly to the
   published theme. Before commercial launch a release workflow must exist:
   - a `staging` branch created from `main`;
   - a separate, **unpublished** Shopify theme connected to `staging` via the
     GitHub integration (admin action: Online Store → Themes → Add theme →
     Connect from GitHub);
   - all theme changes QA'd visually on the staging theme first;
   - explicit human approval before release;
   - release = merge `staging` → `main` (never direct pushes to `main`);
   - rollback = revert the release commit on `main` (the GitHub sync restores
     the previous theme state) or republish the previous theme.
3. **Currency, Markets, shipping.** Verified 2026-09-26: store currency is
   EUR, Markets are NL (primary) and Europe, and the general shipping profile
   has three zones (Netherlands, Rest of World and a leftover US "Domestic"
   zone), each with a single "Free shipping" method at €0. The theme states
   "Free shipping" on product pages and on Shipping & Returns, which matches
   this configuration. Still open: confirm free worldwide shipping as a
   commercial decision, remove the US zone if unintended, set the business
   address and taxes, and pass a complete test checkout.
4. **Legal & policies.** Made official 2026-10-23 by owner instruction after the
   owner's own review: the "OPERATIONAL DRAFT" headings, status notes and all
   placeholders are removed from the legal notice, terms, refund and shipping
   policies in all six languages (each body now starts at H2, so the page has
   one H1). Business identity: La Retrouvée as part of Vintage Pareltje (legal
   notice and terms only, never on storefront pages), KvK 42004969, VAT
   NL005427896B52, info@laretrouvee.com, +31 6 4371 5013, Mon–Sat 09:00–17:00,
   Joke Smitlaan 44, 2104 TG Heemstede (the Shopify store address;
   vintagepareltje.com publishes none). Terms: returns within the statutory
   14 days, return costs for the customer, free shipping, dispatch as soon as
   possible after payment (no fixed number of days), non-EU duties payable by
   the recipient unless checkout states otherwise, a neutral margin-scheme
   sentence in the terms. The legal notice also carries an owner-approved
   "Use of artificial intelligence" section. Open: the mailbox
   info@laretrouvee.com must exist before launch (the policies already point
   to it); the Shopify-managed privacy policy still names `vp2-dev` and the
   old store email until item 9 is done.
5. **Payments.** No real payment providers are configured; checkout works in
   test mode only. Configure providers only after the plan/transfer decision.
6. **Real content.** The brand name (La Retrouvée) is chosen and lives in the
   theme setting `brand_display_name`. Still open: owned photography for the
   available pieces (announced), condition reports, dimensions and inclusions
   per product, logo, domain and definitive colours/typography.
8. **VAT and the margin scheme.** Classified 2026-10-22 from the owner's bookkeeping sheet: 11 pieces sold with VAT (`btw`, taxable), 7 under the margin scheme (`marge`, not taxable). By owner decision the storefront shows no VAT or margin wording, only the total price. Eight pieces are not in the sheet and keep the default (taxable) until the owner classifies them: Looping GM ×3 (VP-B016/017/019), Gucci GG shoulder bag (VP-B018), Neverfull MM (VP-B020), Dior Saddle pouch (VP-B021), shoulder strap (VP-A001), unidentified accessory (VP-A002). Still Admin-side: Settings → Taxes (prices include tax, NL VAT number, EU/OSS threshold for VAT pieces) and an invoicing app or bookkeeping link that prints the margin-scheme wording ("bijzondere regeling – gebruikte goederen") for `marge` pieces and no VAT line; confirm with the accountant that margin goods are taxed in NL regardless of the buyer's country.
9. **Store name and password page.** `shop.name` is still `vp2-dev`. The
   theme substitutes the brand name in the header, footer, document titles
   and social previews, but Shopify uses the store name in checkout,
   notification emails and on the platform password page. While the store is
   a development store, Shopify serves its own password page instead of the
   theme's `password` template, so the theme's password design is not visible
   yet. Admin action: Settings → General → Store details → Store name.
   Also set the store contact and sender email to info@laretrouvee.com once
   the mailbox exists (Settings → General and Settings → Notifications); the
   privacy policy, checkout and order emails take both values from there.
   The Europe market was moved to the `laretrouvee.com` web presence on
   2026-10-23 (owner approval): every hreflang now points to the new domain
   and `vp2-dev.myshopify.com` redirects there with a 301.
7. **Dutch migration drafts.** The two unpublished Dutch draft articles
   (`populairste-louis-vuitton-tassen`, `populairste-gucci-tassen`) are kept
   as migration backups; delete them only with explicit owner approval.
