#!/usr/bin/env bash
# Shopify Admin GraphQL helper. Usage: shopify_query.sh <query-file> [variables-json]
# Token cached in a chmod-600 file, never printed.
set -euo pipefail
# Tokens and payloads live outside the repo (never commit them).
SCRATCH="${SHOPIFY_TOKEN_DIR:-$HOME/.shopify-migration}"; mkdir -p "$SCRATCH"; chmod 700 "$SCRATCH"; API_VERSION="2025-07"
# SHOPIFY_TARGET=new uses the *_NEW variables (new store); default is the old store.
if [ "${SHOPIFY_TARGET:-old}" = "new" ]; then
  DOMAIN="${SHOPIFY_STORE_DOMAIN_NEW}"; CLIENT_ID="${SHOPIFY_CLIENT_ID_NEW}"; CLIENT_SECRET="${SHOPIFY_CLIENT_SECRET_NEW}"; TOKEN_FILE="$SCRATCH/.shopify_token_new"
else
  DOMAIN="${SHOPIFY_STORE_DOMAIN}"; CLIENT_ID="${SHOPIFY_CLIENT_ID}"; CLIENT_SECRET="${SHOPIFY_CLIENT_SECRET}"; TOKEN_FILE="$SCRATCH/.shopify_token"
fi
get_token() {
  curl -sS -X POST "https://${DOMAIN}/admin/oauth/access_token" -H "Content-Type: application/json" \
    -d "{\"client_id\":\"${CLIENT_ID}\",\"client_secret\":\"${CLIENT_SECRET}\",\"grant_type\":\"client_credentials\"}" \
    | python3 -c 'import sys,json;d=json.load(sys.stdin);print(d.get("access_token",""))' > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
}
[ -s "$TOKEN_FILE" ] || get_token
run_query() {
  python3 - "$1" "${2:-{\}}" <<'PY' > "$SCRATCH/.payload.$$.json"
import json,sys
print(json.dumps({"query":open(sys.argv[1]).read(),"variables":json.loads(sys.argv[2] or "{}")}))
PY
  curl -sS -X POST "https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json" -H "Content-Type: application/json" \
    -H "X-Shopify-Access-Token: $(cat "$TOKEN_FILE")" -d @"$SCRATCH/.payload.$$.json"
}
OUT="$(run_query "$1" "${2:-}")"
if echo "$OUT" | grep -q 'Invalid API key or access token'; then get_token; OUT="$(run_query "$1" "${2:-}")"; fi
rm -f "$SCRATCH/.payload.$$.json"
echo "$OUT"
