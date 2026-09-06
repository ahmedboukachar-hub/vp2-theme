# Automatic language detection (localization discovery)

Client-side, one-time language detection for the four published locales
(`en` source, `nl`, `de`, `fr`). Built on Shopify's native localization
mechanisms — no external services, no external libraries, no server redirects.

## Decision order

1. **Stored visitor preference** — a manual choice always wins and is never
   overridden; a completed automatic choice never re-runs.
2. **Explicit locale in the URL** — an opened `/nl`, `/de` or `/fr` route is
   respected; detection does not interfere.
3. **Browser/device languages** — `navigator.languages` (fallback
   `navigator.language`), regional variants normalised (`de-AT → de`,
   `fr-CA → fr`, `nl-BE → nl`, `en-* → en`); the first published language wins.
4. **Location (cautious fallback only)** — Shopify's own
   `browsing_context_suggestions.json` endpoint; mapping NL→nl, DE→de, AT→de,
   FR→fr. Multilingual countries (BE, CH, LU, CA, …) are deliberately not
   mapped and resolve to English.
5. **English** as final fallback.

Only the language is changed. Country, Market, currency and tax context are
never touched.

## How switching works

The hidden native `{% form 'localization' %}` in
`snippets/localization-discovery.liquid` is submitted with the target
`locale_code` and a `return_to` of the current path + query string, so Shopify
itself resolves the correct locale route for the current resource (a product
stays the same product). No manual locale-URL rewriting, no 301s.

## Loop and repeat protection

- The preference is stored **before** the switch; any stored preference stops
  future automatic detection entirely.
- If `localStorage` is unavailable, no automatic switch happens at all.
- Detection never runs in the Theme Editor (`request.design_mode` +
  `Shopify.designMode`), in theme previews (`preview_theme_id`), on explicit
  locale routes, or when the current language is already the best match
  (then the preference is stored without any redirect).

## Preference storage (for the cookie/privacy review)

One neutral `localStorage` key: **`locale-preference`**

```json
{ "v": 1, "locale": "de", "source": "auto" | "manual", "via": "browser", "ts": 1757155200000, "noticePending": true }
```

Contains only the language code, the source of the decision, and a
version/timestamp. No personal data, no IP address, no tracking; not used for
analytics or marketing. Clearing site data resets the behaviour.

## Confirmation notice

After an actual automatic switch, a one-time dismissible notice appears
(locale keys `localization.auto_notice_*` in en/nl/de/fr): `role="status"`,
keyboard operable, non-modal, no animation (reduced-motion safe), with a
button that opens/focuses the native language selector. It never returns after
being shown once.

## Theme Editor settings ("Language detection")

- `enable_auto_language_detection` (default on)
- `enable_location_fallback` (default on)
- `show_language_notice` (default on)

Defaults apply to the existing theme through `settings_schema.json` defaults;
`config/settings_data.json` is untouched.

## SEO

No server-side or permanent redirects; canonicals, hreflang, locale URLs,
sitemap, structured data and HTML cacheability are unaffected. Crawlers
(no stored preference, no matching flow: detection is JS-only and single-shot)
can reach every language version through the crawlable selector links and
locale routes.

## Without JavaScript

The site renders normally in the current Shopify locale and the native
header/footer language selectors keep working (they are plain forms).
