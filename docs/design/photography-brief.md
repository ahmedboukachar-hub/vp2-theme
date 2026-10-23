# Photography brief

The storefront cannot become convincingly luxurious through code alone.
This brief specifies the owned photography the store needs. Until it
exists, product slots use the controlled "Photography pending" placeholder
and editorial slots use the licensed images in
`docs/design/image-register.md`.

## Minimum set per bag (catalogue)

1. Front, straight and level
2. Three-quarter angle
3. Back
4. Both sides/gussets
5. Base and corners
6. Top/opening and closure
7. Interior overview
8. Interior label/stamp where appropriate (never a full serial/date code)
9. Hardware details
10. Handles and strap
11. Every material sign of wear in close-up
12. Inclusions together
13. Scale/worn reference only with owned, consented imagery, cropped
    shoulders-down (no identifiable faces)

## Art direction

- Soft directional daylight or large diffused light.
- Neutral warm-white background, identical across the catalogue: about
  `#fcf9f5`, the photo ground the theme puts around every product photo
  (`--vp-media-ground` in `assets/vp-tokens.css`), so the photo and the
  frame read as one surface.
- Accurate colour and white balance; camera at product level.
- No props for catalogue views — no flowers, perfume bottles or staged
  "Paris" styling. Editorial heroes may use stone, dark wood, linen or
  brushed metal sparingly; one bag remains the subject.
- Preserve texture. Do not retouch wear away — wear belongs in the photos.
- Keep text out of the photograph; negative space per planned crop.
- Export high-resolution, catalogue photos at least 2048 × 2048 px (the
  gallery frame is up to about 740px wide, so sharp on 2x screens and in the
  zoom); Shopify CDN handles responsive formats.

## Ratios

- Catalogue (cards, product gallery, thumbnails, cart; owner decision
  2026-10-23): shoot and export square, 1:1, on the warm-white background.
  The theme shows every product photo whole in a square frame, so a square
  photo fills it edge to edge; any other shape is centred with warm-white
  bands and never cropped. Centre the bag with even margins, and frame
  detail shots so the wear point sits in the middle.
- Editorial: 3:2 landscape, 4:5 portrait, 1:1 detail — nothing else.

## File names and alt text

- Filename: `louis-vuitton-speedy-30-monogram-front.jpg`
- Alt: `Front view of the Louis Vuitton Speedy 30 in monogram canvas`
- Wear detail alt: `Close-up of corner wear on the Speedy 30`
- Alt text describes the actual image; decorative editorial images may use
  empty alt. No keyword stuffing.

## Priority order

1. The 13 available bags (three Speedy 30 examples first — they need
   verified visual differentiation on cards).
2. The available accessory (bag organizer — represent the third-party
   brand accurately).
3. One hero-grade editorial image of a real collection piece (replaces the
   licensed hero flat lay).
4. Archive pieces (sold) as time allows.
