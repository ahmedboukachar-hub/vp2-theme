# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Shopify Online Store 2.0 theme based on Shopify's Dawn (currently at Dawn 16.0.0). There is no build step, bundler, or package.json — the theme is plain Liquid, CSS, and JavaScript served as-is by Shopify. Dawn changes can be pulled in from the `upstream` remote (`https://github.com/Shopify/dawn.git`).

## Commands

Development requires the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) and a development store:

```sh
shopify theme dev      # local development server against a store
shopify theme check    # lint/validate Liquid (Theme Check)
shopify theme push     # upload the theme to a store
```

There are no unit tests. CI (`.github/workflows/ci.yml`) runs on every push: Theme Check and Lighthouse audits (performance regressions fail CI). Theme Check config is in `.theme-check.yml` (`MatchingTranslations` and `TemplateLength` checks are disabled).

## Architecture

Standard Shopify theme layout — the directory names are fixed by the platform:

- `layout/theme.liquid` — the HTML shell for every page; loads `base.css`, `global.js`, `constants.js`, `pubsub.js`, and settings-driven CSS variables.
- `templates/*.json` — JSON templates that compose sections per page type (`product.json`, `collection.json`, …). Only `gift_card.liquid` is a Liquid template.
- `sections/` — merchant-configurable building blocks. Each `.liquid` file ends with a `{% schema %}` JSON block defining its settings, blocks, and presets shown in the theme editor.
- `snippets/` — reusable partials included with `{% render %}`; parameters are documented in a comment header at the top of each snippet (see `snippets/card-product.liquid` for the convention).
- `config/settings_schema.json` — global theme settings; `config/settings_data.json` — the merchant's current values.
- `assets/` — flat directory of all CSS/JS. CSS is split per component (`component-*.css`) and per section, loaded with `{{ 'component-x.css' | asset_url | stylesheet_tag }}` only where used — not bundled.
- `locales/` — translations. `*.json` files are storefront strings (used via `{{ 'key' | t }}`); `*.schema.json` files are theme-editor strings referenced from section schemas as `"t:..."` keys. New user-facing strings must be added to `locales/en.default.json` (and `en.default.schema.json` for editor strings).

### JavaScript patterns

- No frameworks, libraries, or dependencies — bespoke web-native code only (a hard rule from Dawn's principles, see below). Interactive behavior is implemented as **custom elements** (`customElements.define`), mostly in `assets/global.js` plus per-feature files (`cart.js`, `product-form.js`, `facets.js`, …). Scripts are loaded with `defer`.
- Cross-component communication uses the tiny pub/sub in `assets/pubsub.js` with event names from `PUB_SUB_EVENTS` in `assets/constants.js` (e.g. `cartUpdate`, `variantChange`, `quantityUpdate`).
- Dynamic page updates fetch server-rendered HTML via Section Rendering API (`?section_id=` / `sections=` params) and swap it into the DOM — state and markup stay server-rendered, not client-templated.

### Theme code principles (from Dawn, enforced in review)

- **Server-rendered:** HTML comes from Liquid on Shopify's servers. Business logic, translations, and money formatting don't belong on the client. Async re-rendering of page parts is a sparing progressive enhancement.
- **Web-native, no abstractions:** progressive enhancement over polyfills; repetition is preferred over abstraction layers ("DRY is an anti-pattern" here).
- **Lean and fast:** zero Cumulative Layout Shift, no DOM manipulation before user input, no render-blocking JavaScript. Lighthouse CI guards this.
