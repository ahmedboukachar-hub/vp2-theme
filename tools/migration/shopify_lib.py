#!/usr/bin/env python3
"""Shared helpers: GraphQL call + translation registration."""
import json, os, subprocess, sys
SCRATCH = os.path.dirname(os.path.abspath(__file__))
def gql(query, variables=None, target=None, retries=6):
    """target: None uses $SHOPIFY_TARGET (default old store); 'old' or 'new' overrides it for this call.
    A THROTTLED response is retried with backoff; any other GraphQL error exits."""
    import tempfile, time
    fd, qf = tempfile.mkstemp(prefix=".q_", suffix=".graphql")
    with os.fdopen(fd, "w") as fh: fh.write(query)
    try:
        for attempt in range(retries + 1):
            out = subprocess.run([os.path.join(os.path.dirname(os.path.abspath(__file__)), "shopify_query.sh"), qf, json.dumps(variables or {})], capture_output=True, text=True, env=dict(os.environ, **({"SHOPIFY_TARGET": target} if target else {})))
            if out.returncode != 0: print(out.stderr); sys.exit(1)
            r = json.loads(out.stdout)
            throttled = any((e.get("extensions") or {}).get("code") == "THROTTLED" for e in r.get("errors") or [])
            if not throttled or attempt == retries: break
            time.sleep(2 ** attempt)
    finally:
        os.unlink(qf)
    if "errors" in r: print("GRAPHQL ERRORS:", json.dumps(r["errors"])[:3000]); sys.exit(1)
    return r
Q_TRANSLATABLE = "query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key value digest locale } } }"
M_REGISTER = "mutation($id: ID!, $translations: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $translations) { translations { key locale } userErrors { field message } } }"
def register_translations(resource_id, per_locale):
    """per_locale: {"nl": {"title": "..."}, ...}; fetches digests, registers; returns {"registered": n, "errors": [...]}"""
    content = gql(Q_TRANSLATABLE, {"id": resource_id})["data"]["translatableResource"]["translatableContent"]
    digests = {c["key"]: c["digest"] for c in content}
    inputs = []
    for loc, kv in per_locale.items():
        for k, v in kv.items():
            if k not in digests: continue
            inputs.append({"key": k, "locale": loc, "value": v, "translatableContentDigest": digests[k]})
    if not inputs: return {"registered": 0, "errors": ["no matching keys"]}
    r = gql(M_REGISTER, {"id": resource_id, "translations": inputs})["data"]["translationsRegister"]
    return {"registered": len(r["translations"]), "errors": r["userErrors"]}
