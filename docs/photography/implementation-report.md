# Main-image import and presentation

Task started 2026-09-12; completed verification dated 2026-09-13.
Target: vp2-dev.myshopify.com, confirmed through the connected Shopify tool.
Source: vintagepareltje.com public product catalogue, matched through the existing
migration log and each destination variant's VP-B/VP-A SKU.

## Scope and design

Import only the existing first photograph for each of the 18 migrated bags and
3 accessories. No gift cards or unresolved/unmigrated items. No additional gallery
images. Existing images-pending/migration-review tags remain deliberately intact.
Primary-image records are in main-image-before.json and main-image-after.json.

The professional prompt, acceptance criteria and per-source reshoot queue are
in main-image-standard.md. The generative pilot was rejected for changed fine
product details and was never uploaded. Production images are source copies,
with hosting/format conversion by Shopify where required (including HEIC).
This does not certify that source images had never previously been edited.

Product cards, wishlist cards and the archive teaser use white surrounds,
contain fitting and equal responsive padding. Product hover zoom is disabled
where it could crop the image. Existing 4:5 template settings remain intact.
The scope is presentation consistency: differences in lighting, background,
object size within the original frame and camera angle are not retouched away.

## Validation and limitations

- All three changed CSS files pass the Shopify Liquid skill validator / Theme
  Check integration, revision 3. Bundled documentation fallbacks were used when
  the upstream schema download timed out.
- git diff --check passes; config/settings_data.json has no changes.
- Source photos were visually inspected before import. Live API verification
  checks one image per product, first-image selection and unchanged commercial
  fields; exact results are recorded in main-image-after.json.
- Source/main mapping is per physical inventory SKU, not model-name matching.
- No authenticated storefront screenshot review was possible in this workspace;
  local Chromium was unavailable. Theme sync verification is a separate check
  and must not be described as full visual QA.

## Git handoff

Base: 32a59efc58f7dd31772670935222d64448546c53.
Branch: codex/product-main-photography-20260912.
No open PRs were present at the start or pre-commit overlap checks.
Changed theme files: assets/component-card.css, assets/component-wishlist.css,
assets/section-archive-feature.css. Other additions are this photography record.
The PR and commit history provide the final head/merge SHA; future agents must
fetch main and inspect the live product media before continuing.

## Rollback

Remove only the per-product attached media IDs recorded in the after manifest,
after re-querying each product and confirming no later work would be affected.
Do not remove products, original-store files or unrelated/shared Shopify Files.
Revert this task's three CSS diffs to undo presentation changes, preserving any
later edits. Prices, inventory, publication state and text were outside scope.
