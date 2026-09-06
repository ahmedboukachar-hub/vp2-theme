# Human visual review — 30-minute route

All URLs are behind the store password on `vp2-dev.myshopify.com`.
Prefix `/nl`, `/de` or `/fr` to any URL for that language. Automated
checks (Theme Check, JSON, translations, API state) are done; **this human
pass is required and has not been performed by code.**

## Mobile (~390px) — capture these

1. `/` top: announcement ("A considered collection…"), header, split hero —
   copy first, then the monogram flat-lay image; H1 + "Shop new arrivals"
   visible in first viewport.
2. Menu drawer open: New Arrivals, Bags, Designers, The Archive, Journal,
   Services + the language selector at the bottom (EN/NL/DE/FR).
   Switch EN → NL → DE → FR → EN; the same page should reopen each time,
   and the manual choice must persist on reload.
3. `/` scroll: proof strip → Recently found → curation statement →
   houses → Find a Bag panel → From the archive (Sold badges) → Journal →
   newsletter ("The next piece may not return.").
4. `/collections/louis-vuitton`: **only available pieces** (no Sold),
   filter/sort tappable, card = vendor / title / material · condition /
   price, readable at 2 columns. Placeholder tiles say "test product
   photography pending" style consistently.
5. `/collections/archive`: sold pieces with restrained Sold badges.
6. Any available PDP (`/products/louis-vuitton-speedy-30-01`): buy column
   order, condition report, enquiry; sticky buy bar appears only after the
   main CTA scrolls away.
7. A sold PDP (`/products/louis-vuitton-keepall-60`): Sold state, "Find
   something similar" → Find a Bag prefilled, no add-to-cart.
8. `/pages/find-a-bag`: text-led hero + form.
9. `/blogs/journal` + one article.

## Desktop (~1440px) — capture these

1. `/` full page.
2. Header: hover dropdowns; language selector visible right of nav.
3. `/collections/louis-vuitton` (3 columns).
4. Available PDP.
5. `/pages/designers` and `/pages/our-curation`.
6. `/blogs/journal`.

## Also verify

- `/404-test-nonexistent` → new 404 (search + two CTAs).
- Search overlay: popular searches chips; each returns results.
- Footer: 4 columns + newsletter + non-affiliation line + language
  selector; no payment icons.
- Wishlist heart on cards; `/pages/wishlist` states.
- No image with an identifiable face anywhere; no desk/coffee/lifestyle
  filler (see `docs/design/image-register.md`).
- Prices: still USD-labelled EUR values — known blocker, do not treat as a
  theme bug (see launch-readiness).

## Known visual limitations

- Product tiles are placeholders (no product photography yet) — accepted
  for this phase.
- Hero/editorial imagery is licensed stock pending owned photography.
- Jacquemus collection card in "Explore the houses" renders text-led (no
  collection image assigned — by design, no compliant image available).
- The visible shop name is the dev-store name `vp2-dev`; the theme uses
  `{{ shop.name }}` everywhere. Final brand name is a pending owner
  decision.
