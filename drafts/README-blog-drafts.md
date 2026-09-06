# Blog drafts — Louis Vuitton & Gucci guides

Four publication-ready drafts, **not** committed and **not** published. Blog articles are
Shopify store data: they cannot be published through the GitHub theme sync and must be
added in Shopify Admin.

## Files

| File | Language | Role |
|---|---|---|
| `blog-louis-vuitton-most-popular-bags.en.html` | English | Source article 1 |
| `blog-louis-vuitton-most-popular-bags.nl.html` | Dutch | Localisation of article 1 |
| `blog-gucci-most-popular-bags.en.html` | English | Source article 2 |
| `blog-gucci-most-popular-bags.nl.html` | Dutch | Localisation of article 2 |

Each file starts with an HTML comment containing the SEO title, meta description,
URL slug and article title (H1), plus editor notes. The body below the comment is
Shopify-compatible HTML for the article content field.

## Before publishing — prerequisites

1. Create the pages with handles `authenticity`, `condition-guide` and
   `shipping-returns`, and the collections `louis-vuitton` and `gucci`
   (see the storefront PR checklist). The articles link to these routes;
   remove the links if you publish earlier.
2. Prepare your own product photography for the featured images (no brand imagery).

## Adding the English articles (Shopify Admin)

1. **Online Store → Blog posts → Add blog post.**
2. Title: use the *Article title/H1* from the file header.
3. Content: open the `.en.html` file, copy everything **below** the comment block,
   and paste it into the content editor via the **`<>` (Show HTML)** view.
4. **Search engine listing → Edit**: set the *SEO title*, *meta description* and
   *URL handle (slug)* from the file header.
5. Excerpt (optional): use the first paragraph.
6. Set a featured image (own photography), assign the blog (e.g. “Journal”), save as **draft**.

## Adding the Dutch versions

Preferred (one URL per article, correct hreflang): install Shopify **Translate & Adapt**,
open the article, choose Dutch, and paste the corresponding `.nl.html` body, title and
meta fields as the translation.

Alternative (separate NL articles): only if you deliberately want separate posts per
language — this creates separate URLs and is usually worse for SEO on Shopify Markets.

## Verification before publishing

See the session report: web access was unavailable in the drafting environment, so the
flagged historical facts should be double-checked against brand archives (louisvuitton.com,
gucci.com) or established auction houses (Sotheby's, Christie's) before going live.
