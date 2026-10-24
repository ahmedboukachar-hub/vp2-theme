# Overstap naar een nieuwe, echte Shopify-winkel (samenvatting voor ChatGPT/Codex)

Status (2026-10-24): nieuwe winkel aangemaakt (`ozayrp-60.myshopify.com`),
thema via GitHub gekoppeld (branch `main`, niet gepubliceerd), app "La
Retrouvée Migratie" geïnstalleerd; omgevingsvariabelen `*_NEW` toegevoegd.
Een volledige export van de oude winkel is gemaakt en getest (26 producten,
273 bestanden, 9 collecties, 14 pagina's, 18 artikelen, 7 menu's, 5 beleidsteksten,
alle vertalingen). Scripts: `tools/migration/` (zie README daar). Volgende stap:
in een nieuwe sessie de import bouwen en testen tegen de nieuwe winkel.

## Waarom

De huidige winkel (vp2-dev.myshopify.com, domein laretrouvee.com, organisatie
BKCHR Holding B.V.) is een **Development store** uit het Shopify Dev Dashboard.
Die kan volgens Shopify Support niet naar een betaald abonnement worden omgezet
en kan dus nooit echte bestellingen verwerken. Alles moet naar een nieuwe winkel.

## Besluit van de eigenaar

- Een **nieuw, apart Shopify-account** met **info@laretrouvee.com** (de mailbox
  moet eerst bestaan), met daarin één winkel: **La Retrouvée**.
- **Juridisch en financieel is Vintage Pareltje de verkoper**: winkelgegevens
  (bedrijfsnaam, adres, KvK, btw), betalingen/uitbetalingen en de facturering
  van het abonnement staan op Vintage Pareltje. Dat staat los van het
  e-mailadres van het account.
- De nieuwe winkel is volledig onafhankelijk van vintagepareltje.com. Voorraad
  wordt niet gedeeld: een uniek stuk staat maar in één winkel te koop.

## Taakverdeling (afgesproken 2026-10-24, PR #97)

- **Claude Code**: technische migratie: volledige export/back-up van de oude
  winkel (afbeeldingen, handles, ID's, metavelden, vertalingen, aantallen),
  herhaalbare scripts met logging en een oud→nieuw ID-mapping, en de migratie
  in de volgorde hieronder; themacontrole via GitHub.
- **ChatGPT** (Shopify-connector): controle van de nieuwe winkel en aanvullende
  Admin-configuratie waar de connector dat toestaat; meldt expliciet welke
  handmatige stappen overblijven. Scopes op de nieuwe winkel eerst verifiëren.
- **Eigenaar**: mailbox, account/winkel, app-toegang, betalingen, bank,
  abonnement, belastingen en de domeinwissel.
- **Geen domeinwissel of livegang zonder akkoord van de eigenaar** na geslaagde
  controles. De oude dev-winkel blijft testomgeving.

## Wat de eigenaar zelf doet (Admin, niet via API)

1. Mailbox info@laretrouvee.com aanmaken.
2. Shopify-account + winkel "La Retrouvée" aanmaken, abonnement Basic.
3. In het Dev Dashboard van dat account een app aanmaken (opvolger van
   "VP2.0 Content") met de rechten hieronder, installeren op de nieuwe winkel,
   client ID/secret aan de agent geven via de omgevingsinstellingen
   (`SHOPIFY_STORE_DOMAIN_NEW` enz.; de oude waarden blijven staan tot de
   overstap klaar is).
4. Thema koppelen: Online Store → Thema's → Toevoegen → Verbinden met GitHub →
   repo `ahmedboukachar-hub/vp2-theme`, branch `main`. Daarna dit thema
   publiceren.
5. Winkelgegevens (Vintage Pareltje), betalingen (Shopify Payments of Mollie),
   verzending, belastingen, afzender-e-mail, klantaccounts.
6. Na de controle: domein laretrouvee.com verhuizen naar de nieuwe winkel,
   wachtwoord weghalen, testbestelling + terugbetaling.

## App-rechten die nodig zijn (Admin API)

`read_products, write_products` · `read_inventory, write_inventory` ·
`read_files, write_files` · `read_content, write_content` (pagina's, blog,
artikelen) · `read_online_store_navigation, write_online_store_navigation`
(menu's, redirects) · `read_translations, write_translations` ·
`read_locales, write_locales` · `read_markets, write_markets` ·
`read_publications, write_publications` · `read_legal_policies,
write_legal_policies` · `read_metaobject_definitions,
write_metaobject_definitions` · `read_metaobjects, write_metaobjects` ·
`read_themes` (om de thema-inhoud-vertalingen te registreren).
Dezelfde app (of de oude VP2.0 Content) moet tijdens de overstap ook nog
**lezen** uit de oude winkel.

## Wat via de app overgezet kan worden (oude → nieuwe winkel)

Volgorde is belangrijk:

1. **Talen en markten**: nl, de, fr, it, es inschakelen en publiceren; markt
   Europa met laretrouvee.com (pas na de domeinwissel).
2. **Metaveld-definities** (eerst!): product `custom.*` (designer, model,
   product_type, year_or_era, condition, material, color, dimensions,
   serial_or_date_code, inclusions, condition_notes, condition_summary,
   provenance, authentication_notes, accessory_type, compatible_models,
   vat_scheme), artikel `custom.models` (lijst tekst, storefront-leesbaar),
   collectie `seo.hidden` waar gebruikt.
3. **Bestanden**: alle afbeeldingen die het thema gebruikt (`shopify://shop_images/...`
   in `config/settings_data.json` en templates, zoals het logo, favicon, hero-
   en merkfoto's) met **exact dezelfde bestandsnaam** uploaden, anders laadt
   het thema ze niet.
4. **Producten**: titels, beschrijvingen, productType, vendor, tags (o.a.
   `bag`, `accessory`, `available`, `sold-archive`, `new-arrival`,
   `designer-*`), prijzen, voorraad, SEO-titels/-omschrijvingen, foto's met
   alt-teksten (in volgorde), metavelden. Publiceren op Online Store.
5. **Collecties**: handmatige en slimme collecties met dezelfde handles en
   regels (all-bags, new-arrivals, archive, accessories, louis-vuitton, gucci,
   dior, jacquemus, …), sorteervolgorde, SEO, afbeelding.
6. **Pagina's** (zelfde handles: about, authenticity, condition-guide,
   bag-size-guide, bag-care-guide, faq, shipping-returns, contact, find-a-bag,
   sell-to-us, our-curation, designers, wishlist, …) met de juiste
   `templateSuffix`.
7. **Blog "journal" + 16 artikelen**: inhoud, samenvatting, afbeelding met alt,
   tags (onderwerp-tag eerst, zie `docs/taxonomy.md`), auteur, publicatiedatum,
   SEO, metaveld `custom.models`.
8. **Beleid**: retour, verzending, voorwaarden, juridische informatie (met
   Vintage Pareltje-gegevens). Het privacybeleid wordt door Shopify
   automatisch beheerd en moet in de nieuwe winkel opnieuw worden aangezet.
9. **Menu's**: main-menu, footer-menu's (o.a. footer-care), met dezelfde
   handles; items verwijzen naar de **nieuwe** product-/collectie-/pagina-ID's.
10. **Redirects** (URL-omleidingen).
11. **Vertalingen** van alles hierboven in 5 talen: opnieuw registreren met
    `translationsRegister` in de nieuwe winkel. Digests zijn per winkel, dus
    altijd eerst de nieuwe `translatableContent` ophalen.
12. **Thema-inhoud-vertalingen** (koppen, knoppen in templates/section groups):
    pas registreren nadat het thema via GitHub in de nieuwe winkel staat; de
    resource-ID's bevatten het nieuwe thema-ID.

## Wat NIET via de app gaat

- Het thema zelf (gaat via de GitHub-koppeling).
- Betalingen, uitbetalingen, facturering, belastingregistratie, verzendtarieven,
  afzender-e-mail, domein, Search & Discovery-filters: de eigenaar in Admin.
- Bestellingen en klanten: er zijn nog geen echte, dus niets over te zetten.

## Controle na de overstap

- Aantallen gelijk: producten, collecties (met productaantallen), pagina's,
  artikelen, menu-items, vertalingen (geen `outdated`).
- Steekproef live in EN en NL: homepage, collectie, productpagina (beschikbaar en
  verkocht), artikel, Over ons, zoekpagina, winkelwagen.
- Na een merge op `main`: JSON-templates teruglezen via de Admin REST
  `assets.json` (zie de sync-valkuilen in `CLAUDE.md`).
- Pas daarna het domein verhuizen en de oude dev-winkel als testomgeving laten
  staan.
