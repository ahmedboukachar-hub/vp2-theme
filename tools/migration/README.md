# Migration helpers (old dev store → new store)

Secret-free helpers for the move described in `docs/migration-new-store.md`.

- `shopify_query.sh` / `shopify_lib.py`: Admin GraphQL (2025-07) with the
  client-credentials grant. Default target is the old store
  (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`);
  `SHOPIFY_TARGET=new` uses `SHOPIFY_STORE_DOMAIN_NEW`, `SHOPIFY_CLIENT_ID_NEW`,
  `SHOPIFY_CLIENT_SECRET_NEW`. Access tokens are cached outside the repo in
  `$SHOPIFY_TOKEN_DIR` (default `~/.shopify-migration`); never print or commit
  them.
- `export.py`: read-only export of the source store (shop, locales, markets,
  metafield definitions, files, products, collections, pages, blogs, articles,
  menus, redirects, policies, all translations). Output goes to
  `$MIGRATION_EXPORT_DIR` (default `./migration-export`, git-ignored). Run from a
  scratch directory: `python3 -I /path/to/tools/migration/export.py`.

Usage from Python:

```python
import sys; sys.path.insert(0, 'tools/migration')
from shopify_lib import gql, register_translations
gql('{ shop { name } }')
```
