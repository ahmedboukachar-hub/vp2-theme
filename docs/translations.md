# Translations — where each kind of text lives

| Kind of text | Where it is translated | How |
| --- | --- | --- |
| Theme strings (buttons, labels, messages) | `locales/<lang>.json` | six files kept in key parity (en, nl, de, fr, it, es) |
| Theme Editor labels | `locales/<lang>.schema.json` | same parity rule |
| Section copy in JSON templates and section groups (hero headings, intros, CTA labels, footer group headings) | Shopify theme-content translations | `translationsRegister` on `ONLINE_STORE_THEME_JSON_TEMPLATE` and `ONLINE_STORE_THEME_SECTION_GROUP` resources; the Theme Editor's "Translate" view edits the same data |
| Products, collections, pages, articles, menus, policies | Shopify resource translations | `translationsRegister` on the resource; see the migration scripts' `register_translations` helper |
| Catalogue values (designer, model, type, colour, material, condition, inclusions) | `snippets/product-value.liquid` + `products.values.*` locale keys | controlled vocabulary from `docs/taxonomy.md`. Lists (`Padlock, Dust bag`) and combined colours (`Blue/beige`) are translated per part; an unknown value is shown unchanged. A new value needs its handle (`Dust bag` → `dust_bag`) in `known_values` and a key in all six locale files. Model names (Speedy 30, Jackie) stay as they are |

## Rules

1. Liquid outputs the setting; it never guesses the language. No `request.locale` branches, no comparisons with English defaults.
2. A changed English setting value invalidates its translations (digest mismatch). Re-register after copy edits and check the NL page.
3. Section settings that drive translation-dependent copy should have no `default` equal to the live value, or the GitHub sync drops them (see the sync pitfalls in `CLAUDE.md`).
4. Coverage check (read-only): list `translatableResources` for both theme resource types and flag text keys without a translation in any of the five secondary locales. As of 2026-10-21 every text key is covered.
