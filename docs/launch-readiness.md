# Launch readiness

The development store `vp2-dev.myshopify.com` is deliberately used as a **live
test environment** during this phase: test content is visible on the published
development theme, by explicit owner decision. The store sits behind the
Shopify development-store password and runs on a partner development plan, so
it cannot process genuine customer transactions.

Everything below must be resolved **before** any commercial launch, transfer
to a client, or upgrade to a paid Shopify plan.

## Launch blockers

1. **Remove or draft the test products.** The six `[TEST ONLY]` products
   (tag `vp2-test-data`) are ACTIVE and published to the Online Store channel
   for template and checkout testing. Before a paid plan or transfer they must
   be set to DRAFT or deleted. They are fully identifiable by title prefix,
   tag, test description, fictional `TEST-*` SKUs and labelled placeholder
   images.
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
3. **Currency, address, Markets, shipping.** Still US/USD defaults. Required
   target state: Dutch business address, EUR store currency, English as source
   language with nl/de/fr translations, international selling via Shopify
   Markets. Requires the owner's real business address and decisions on
   shipping countries and rates first. Shipping rates currently visible are
   unreviewed Shopify defaults.

   **Currency gate (redesign §36.8), verified 2026-09-06:** shop currency is
   `USD` with **zero orders**, so the base currency can still be changed
   safely. The change is an Admin-only action (no supported API mutation);
   the theme must not fake it with Liquid/JS. Owner click path:
   **Shopify admin → Settings → General → Store defaults → Currency
   display → change store currency to EUR → Save.** After changing:
   review each migrated product's price (values were EUR-intended, no
   conversion needed — verify per product), then check Markets, shipping
   rates, taxes and a test checkout. The 20 published migrated products
   currently display EUR-intended numbers as USD; they were published on
   the owner's explicit earlier instruction and remain published, but this
   is the top presentation blocker: either apply the two-click currency
   change above or ask for the products to be set back to draft.
4. **Legal & policies.** Only a Privacy Policy exists. Terms, refund policy,
   company details, cookie/consent setup and other legal texts must be added
   before launch (footer intentionally does not link to missing policies).
5. **Payments.** No real payment providers are configured; checkout works in
   test mode only. Configure providers only after the plan/transfer decision.
6. **Real content.** Replace placeholder imagery with owned photography, add
   genuine inventory with real prices, and finalise brand name, domain, logo
   and definitive colours/typography.
7. **Dutch migration drafts.** The two unpublished Dutch draft articles
   (`populairste-louis-vuitton-tassen`, `populairste-gucci-tassen`) are kept
   as migration backups; delete them only with explicit owner approval.
