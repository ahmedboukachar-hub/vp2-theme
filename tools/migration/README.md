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

- `import.py`: writes the export into the **new** store, step by step in the
  order of the doc (`locales defs files products collections pages blog policies
  menus redirects translations`, or `all`; `--dry-run` logs without writing).
  Idempotent: the old→new ID mapping is kept in `$MIGRATION_EXPORT_DIR/id-map.json`
  and every write is logged to `import-log.jsonl` there. The translations step
  refuses to run until English is the new store's default language. Run it the
  same way: `python3 -I /path/to/tools/migration/import.py products`.

Usage from Python:

```python
import sys; sys.path.insert(0, 'tools/migration')
from shopify_lib import gql, register_translations
gql('{ shop { name } }')
```
