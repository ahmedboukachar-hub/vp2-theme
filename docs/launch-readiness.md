# Launch readiness

The development store `vp2-dev.myshopify.com` is deliberately used as a **live
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
4. **Legal & policies.** Shipping, refund, terms of service and legal notice
   exist as published policies whose first heading reads "OPERATIONAL DRAFT
   (requires legal review before use)"; the privacy policy is Shopify-managed.
   All are linked from the footer, so the draft markers are visible to anyone
   with the storefront password. Legal review, then remove the markers.
5. **Payments.** No real payment providers are configured; checkout works in
   test mode only. Configure providers only after the plan/transfer decision.
6. **Real content.** The brand name (La Retrouvée) is chosen and lives in the
   theme setting `brand_display_name`. Still open: owned photography for the
   available pieces (announced), condition reports, dimensions and inclusions
   per product, logo, domain and definitive colours/typography.
8. **Store name and password page.** `shop.name` is still `vp2-dev`. The
   theme substitutes the brand name in the header, footer, document titles
   and social previews, but Shopify uses the store name in checkout,
   notification emails and on the platform password page. While the store is
   a development store, Shopify serves its own password page instead of the
   theme's `password` template, so the theme's password design is not visible
   yet. Admin action: Settings → General → Store details → Store name.
7. **Dutch migration drafts.** The two unpublished Dutch draft articles
   (`populairste-louis-vuitton-tassen`, `populairste-gucci-tassen`) are kept
   as migration backups; delete them only with explicit owner approval.
