# Primary product photography — exact-item standard

Date: 2026-09-12. Scope: only the first image of the 21 migrated products.
Source: the matching product's first image in the public old-store catalogue.
Never substitute another physical item of the same model.

## Professional working prompt

Prepare a truthful primary ecommerce photograph of this exact pre-owned item.
Use a calm, product-first luxury composition, not an advertising illustration.
Target a portrait 4:5 frame with the entire item visible, optically centred,
comfortable margins and a clean neutral-white background. For future original
photography, aim for approximately 80% of frame width, or 80% of frame height
for taller silhouettes; never stretch the item to fit. Keep the lighting soft,
neutral and repeatable, with a subtle real contact shadow. Use the same camera
height and lens setup within each product category, while allowing a different
angle when a particular bag genuinely requires it.

Preserve the exact silhouette, camera perspective, monogram placement, lettering,
stitching, hardware, handles, straps, leather colour, patina, scuffs, creases and
all visible wear. Do not mirror, reshape, restore, recolour, smooth, sharpen
invented detail or reconstruct missing portions. Do not add accessories, props,
people, text overlays, watermarks or brand marks. Existing product labels and
included accessories must not be removed by generative reconstruction.

Treat truthfulness as a hard acceptance criterion. Compare source and output at
detail level. Reject any transformation that changes the merchandise. If the
source is already cropped, low-resolution, obstructed or inconsistently lit,
retain the source and flag it for reshooting; never fabricate a better item.
Preserve the original and record source product ID, image ID, URL, SKU and
destination media ID. Do not touch gallery images, variants, inventory, prices,
publication state or theme settings. A main photo does not replace condition
photography or prove authenticity.

## Implementation decision

An image-generation pilot on VP-B001 changed fine product details despite strict
preservation instructions. It was REJECTED and was not uploaded to Shopify.
The production method therefore imports the original main images unchanged and
standardises their presentation in the existing portrait product-card, wishlist
and archive-teaser frames:
white surround, object-fit: contain, equal responsive padding, no hover zoom
that could crop an edge. Existing template ratio settings remain editable.
No raster background removal, retouching or colour alteration was applied.
Original background differences and relative product-scale differences remain;
this is safe presentation consistency, not a claim of fully uniform studio shots.

## Source-photo review / reshoot queue

- VP-B003 / VP-B004: Jacquemus photos include dust bags, straps and tags; edges
  are close to or outside the frame. Photograph the full bag alone for the main
  view; photograph inclusions separately. Do not reconstruct cropped edges.
- VP-B005: Saumur strap is cut by the source frame; retain, then reshoot.
- VP-B007: Marmont is relatively small in the frame beside packaging. Reshoot
  bag-only for a consistent apparent scale; verify included packaging separately.
- VP-B012: original merchant tag remains visible; do not erase product-adjacent
  details using AI. Remove physical tag for the next photograph if appropriate.
- VP-A001: shoulder strap is already cut at the bottom; reshoot the complete item.
- VP-A002: source image visibly depicts a padlock and keys, but the product
  remains identification-blocked and DRAFT. Owner must confirm its identity;
  this image import does not rename or publish the product.
- VP-B014 / VP-A003: source filenames contain 'ChatGPTImage'. This suggests
  possible prior AI editing, not proof. They are migrated as existing source
  assets, not certified as unedited photography; compare with originals before
  commercial launch. Do not infer provenance from visual appearance alone.
- Other items: different orientations, exposure and whitespace remain visible.
  A future controlled reshoot is preferable to generative harmonisation.

## Coordination and rollback

Claude and Codex: fetch current main and read AGENTS.md / CLAUDE.md before further
work. Re-query live product media before edits. The import is not rerunnable by
blindly appending images: if media exist, compare IDs and stop on a mismatch.
Keep images-pending and migration-review tags: detail/condition shots are still
missing. Keep all statuses, prices, inventory and descriptions unchanged.
Rollback only the exact newly attached media IDs recorded in the after manifest;
never delete products, unrelated media, source-store files or shared Shopify Files.
Theme rollback should revert only this task's card-CSS changes, preserving later
edits. config/settings_data.json must remain untouched.
