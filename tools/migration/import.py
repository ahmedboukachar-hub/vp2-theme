"""Import the export (see export.py) into the NEW store, in the order of docs/migration-new-store.md.

Usage: python3 -I tools/migration/import.py <step> [<step> ...] [--dry-run]
Steps: locales defs files products originals collections pages blog policies menus redirects translations (or: all)
Idempotent: every created resource is recorded in $MIGRATION_EXPORT_DIR/id-map.json (old gid -> new gid) and
existing handles in the new store are reused, so a step can be re-run safely. Every write goes to import-log.jsonl.
"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ['SHOPIFY_TARGET'] = 'new'
from shopify_lib import gql
EXP = os.environ.get('MIGRATION_EXPORT_DIR', os.path.join(os.getcwd(), 'migration-export'))
LOCALES = ['nl', 'de', 'fr', 'it', 'es']
DRY = '--dry-run' in sys.argv
MAP_FILE, LOG_FILE = os.path.join(EXP, 'id-map.json'), os.path.join(EXP, 'import-log.jsonl')
IDMAP = json.load(open(MAP_FILE)) if os.path.exists(MAP_FILE) else {}
def load(name): return json.load(open(os.path.join(EXP, name + '.json')))
def save_map(): json.dump(IDMAP, open(MAP_FILE, 'w'), indent=1, sort_keys=True)
def log(step, action, key, result):
    with open(LOG_FILE, 'a') as fh: fh.write(json.dumps({'t': time.strftime('%Y-%m-%dT%H:%M:%S'), 'step': step, 'action': action, 'key': key, 'result': result}, ensure_ascii=False) + '\n')
    print(f'  {step}: {action} {key} -> {result}')
def mutate(step, key, query, variables, path):
    """Runs a mutation, logs userErrors, returns the payload under `path` (or None on error / dry run)."""
    if DRY: log(step, 'dry-run', key, 'skipped'); return None
    r = gql(query, variables)['data'][path]
    errs = r.get('userErrors') or []
    if errs: log(step, 'ERROR', key, errs); return None
    return r
def mapped(old_id): return IDMAP.get(old_id)
def remember(step, old_id, new_id, key):
    IDMAP[old_id] = new_id; save_map(); log(step, 'mapped', key, new_id)
def find(kind, handle):
    """Looks up an existing resource in the new store by handle."""
    q = {'product': '{productByIdentifier(identifier:{handle:%s}){id}}', 'collection': '{collectionByIdentifier(identifier:{handle:%s}){id}}'}
    if kind in q:
        r = gql(q[kind] % json.dumps(handle))['data']; return (list(r.values())[0] or {}).get('id')
    field = {'page': 'pages', 'blog': 'blogs', 'article': 'articles'}[kind]
    r = gql('query($q:String){%s(first:5,query:$q){nodes{id handle}}}' % field, {'q': f'handle:{handle}'})['data'][field]['nodes']
    return next((n['id'] for n in r if n['handle'] == handle), None)
def seo_metafields(mfs): return [m for m in mfs if m['namespace'] != 'global']
def online_store_publication():
    pubs = gql('{publications(first:20){nodes{id name catalog{title}}}}')['data']['publications']['nodes']
    return next(p['id'] for p in pubs if p['name'] in ('Online Store', 'Onlinewinkel') or 'Online Store' in ((p.get('catalog') or {}).get('title') or ''))
def publish(step, new_id, key):
    mutate(step, key, 'mutation($id:ID!,$p:ID!){publishablePublish(id:$id,input:[{publicationId:$p}]){userErrors{field message}}}', {'id': new_id, 'p': PUB()}, 'publishablePublish')
_pub = []
def PUB():
    if not _pub: _pub.append(online_store_publication())
    return _pub[0]

# 1. Languages (markets wait for the domain switch, see the doc)
def step_locales():
    have = {l['locale']: l for l in gql('{shopLocales{locale primary published}}')['data']['shopLocales']}
    for loc in ['en'] + LOCALES:
        if loc not in have:
            mutate('locales', loc, 'mutation($l:String!){shopLocaleEnable(locale:$l){shopLocale{locale} userErrors{field message}}}', {'l': loc}, 'shopLocaleEnable') and log('locales', 'enabled', loc, 'ok')
        if not have.get(loc, {}).get('published') and not have.get(loc, {}).get('primary'):
            mutate('locales', loc, 'mutation($l:String!){shopLocaleUpdate(locale:$l,shopLocale:{published:true}){shopLocale{locale published} userErrors{field message}}}', {'l': loc}, 'shopLocaleUpdate') and log('locales', 'published', loc, 'ok')
    # A published language is only reachable (/nl, /de, ...) once it is an alternate locale of the web presence.
    for wp in gql('{webPresences(first:10){nodes{id alternateLocales{locale}}}}')['data']['webPresences']['nodes']:
        alt = [l['locale'] for l in wp['alternateLocales']]
        missing = [l for l in LOCALES if l not in alt]
        if missing and mutate('locales', wp['id'], 'mutation($id:ID!,$l:[String!]){webPresenceUpdate(id:$id,input:{alternateLocales:$l}){webPresence{id} userErrors{field message}}}', {'id': wp['id'], 'l': alt + missing}, 'webPresenceUpdate'):
            log('locales', 'web presence', wp['id'], f'added {missing}')
    primary = next(l for l, v in have.items() if v['primary'])
    if primary != 'en': print(f'  NOTE: primary language is {primary!r}; the owner must make English the default (Settings > Languages) before the translations step.')

# 2. Metaobject + metafield definitions
def step_defs():
    for d in load('metaobject_definitions'):
        if mapped(d['id']): continue
        ex = gql('query($t:String!){metaobjectDefinitionByType(type:$t){id}}', {'t': d['type']})['data']['metaobjectDefinitionByType']
        if ex: remember('defs', d['id'], ex['id'], d['type']); continue
        inp = {'type': d['type'], 'name': d['name'], 'description': d.get('description'), 'displayNameKey': d.get('displayNameKey'), 'access': {'storefront': d['access']['storefront']},
               'capabilities': {'publishable': d['capabilities']['publishable'], 'translatable': d['capabilities']['translatable']},
               'fieldDefinitions': [{'key': f['key'], 'name': f['name'], 'description': f.get('description'), 'required': f['required'], 'type': f['type']['name'], 'validations': f['validations']} for f in d['fieldDefinitions']]}
        r = mutate('defs', d['type'], 'mutation($d:MetaobjectDefinitionCreateInput!){metaobjectDefinitionCreate(definition:$d){metaobjectDefinition{id} userErrors{field message}}}', {'d': inp}, 'metaobjectDefinitionCreate')
        if r: remember('defs', d['id'], r['metaobjectDefinition']['id'], d['type'])
    defs = sorted(load('metafield_definitions'), key=lambda d: (d['pinnedPosition'] is None, d['pinnedPosition'] or 0))
    for d in defs:
        key = f"{d['ownerType']}.{d['namespace']}.{d['key']}"
        ex = gql('query($o:MetafieldOwnerType!,$n:String!,$k:String!){metafieldDefinitions(first:1,ownerType:$o,namespace:$n,key:$k){nodes{id}}}', {'o': d['ownerType'], 'n': d['namespace'], 'k': d['key']})['data']['metafieldDefinitions']['nodes']
        if ex: IDMAP.setdefault('def:' + key, ex[0]['id']); continue
        vals = [{'name': v['name'], 'value': mapped(v['value']) or v['value']} if v['name'] == 'metaobject_definition_id' else v for v in d['validations']]
        inp = {'name': d['name'], 'namespace': d['namespace'], 'key': d['key'], 'description': d.get('description'), 'type': d['type']['name'], 'ownerType': d['ownerType'],
               'access': {'storefront': d['access']['storefront']}, 'validations': vals, 'pin': d['pinnedPosition'] is not None}
        r = mutate('defs', key, 'mutation($d:MetafieldDefinitionInput!){metafieldDefinitionCreate(definition:$d){createdDefinition{id} userErrors{field message}}}', {'d': inp}, 'metafieldDefinitionCreate')
        if r: remember('defs', 'def:' + key, r['createdDefinition']['id'], key)

# 3. Files not used as product media (theme images, banners, journal images), same filename so shopify://shop_images/... resolves
def basename(url): return os.path.basename((url or '').split('?')[0])
def original_urls(old_ids):
    """Fresh (signed, short-lived) URLs of the old store's original files; image.url on the CDN is a re-encoded copy."""
    out = {}
    for i in range(0, len(old_ids), 50):
        for n in gql('query($ids:[ID!]!){nodes(ids:$ids){id ... on MediaImage{originalSource{url}}}}', {'ids': old_ids[i:i + 50]}, target='old')['data']['nodes']:
            if n and n.get('originalSource'): out[n['id']] = n['originalSource']['url']
    return out
def step_files():
    product_media = {basename(m['image']['url']) for p in load('products') for m in p['media']['nodes'] if m.get('image')}
    todo = []
    for f in load('files'):
        url = ((f.get('image') or {}).get('url')) or f.get('url'); name = basename(url)
        if name in product_media or mapped(f['id']): continue
        ex = gql('query($q:String){files(first:5,query:$q){nodes{id ... on MediaImage{image{url}} ... on GenericFile{url}}}}', {'q': f'filename:{name}'})['data']['files']['nodes']
        hit = next((n['id'] for n in ex if basename(((n.get('image') or {}).get('url')) or n.get('url')) == name), None)
        if hit: remember('files', f['id'], hit, name); continue
        todo.append((f, url, name))
    for i in range(0, len(todo), 20):
        batch = todo[i:i + 20]
        orig = original_urls([f['id'] for f, _, _ in batch])
        inp = [{'originalSource': orig.get(f['id'], url), 'filename': name, 'alt': f.get('alt') or '', 'contentType': 'IMAGE' if f.get('image') else 'FILE', 'duplicateResolutionMode': 'RAISE_ERROR'} for f, url, name in batch]
        r = mutate('files', f'batch {i // 20 + 1} ({len(batch)})', 'mutation($f:[FileCreateInput!]!){fileCreate(files:$f){files{id} userErrors{field message}}}', {'f': inp}, 'fileCreate')
        if r:
            for (f, url, name), nf in zip(batch, r['files']): remember('files', f['id'], nf['id'], name)
    wait_files()
def wait_files(rounds=20):
    for _ in range(rounds):
        r = gql('{files(first:250,query:"status:processing OR status:uploaded OR status:failed"){nodes{id fileStatus fileErrors{message}}}}')['data']['files']['nodes']
        failed = [n for n in r if n['fileStatus'] == 'FAILED']
        if failed: log('files', 'FAILED', len(failed), failed[:5])
        if all(n['fileStatus'] == 'FAILED' for n in r): print('  files ready'); return
        time.sleep(10)

# 4. Products (productSet = one call per product incl. variant, inventory, metafields and media in order)
def step_products():
    loc = gql('{locations(first:1){nodes{id}}}')['data']['locations']['nodes'][0]['id']
    for p in load('products'):
        if mapped(p['id']): continue
        v = p['variants']['nodes'][0]; inv = v['inventoryItem']
        old_media = gql('query($id:ID!){product(id:$id){media(first:50){nodes{id}}}}', {'id': p['id']}, target='old')['data']['product']['media']['nodes']
        orig = original_urls([m['id'] for m in old_media])
        sources = [orig.get(o['id'], m['image']['url']) for o, m in zip(old_media, [m for m in p['media']['nodes'] if m.get('image')])]
        variant = {'optionValues': [{'optionName': o['name'], 'name': o['value']} for o in v['selectedOptions']], 'price': v['price'], 'compareAtPrice': v['compareAtPrice'], 'sku': v['sku'], 'barcode': v['barcode'],
                   'taxable': v['taxable'], 'inventoryPolicy': v['inventoryPolicy'], 'inventoryItem': {'tracked': inv['tracked'], 'requiresShipping': inv['requiresShipping'], 'measurement': inv['measurement']},
                   'inventoryQuantities': [{'locationId': loc, 'name': 'available', 'quantity': v['inventoryQuantity'] or 0}]}
        inp = {'handle': p['handle'], 'title': p['title'], 'descriptionHtml': p['descriptionHtml'], 'vendor': p['vendor'], 'productType': p['productType'], 'tags': p['tags'], 'status': p['status'],
               'templateSuffix': p['templateSuffix'], 'seo': p['seo'], 'productOptions': [{'name': o['name'], 'values': [{'name': x} for x in o['values']]} for o in p['options']], 'variants': [variant],
               'metafields': [{'namespace': m['namespace'], 'key': m['key'], 'type': m['type'], 'value': m['value']} for m in seo_metafields(p['metafields']['nodes'])],
               'files': [{'originalSource': src, 'filename': basename(m['image']['url']), 'alt': m['alt'] or '', 'contentType': 'IMAGE'} for src, m in zip(sources, [m for m in p['media']['nodes'] if m.get('image')])]}
        r = mutate('products', p['handle'], 'mutation($p:ProductSetInput!,$i:ProductSetIdentifiers){productSet(synchronous:true,input:$p,identifier:$i){product{id variants(first:1){nodes{id}}} userErrors{field message code}}}',
                   {'p': inp, 'i': {'handle': p['handle']}}, 'productSet')
        if not r: continue
        remember('products', p['id'], r['product']['id'], p['handle']); IDMAP[v['id']] = r['product']['variants']['nodes'][0]['id']; save_map()
        if p['publishedAt']: publish('products', r['product']['id'], p['handle'])
    map_product_media()
def map_product_media():
    """old MediaImage id -> new, by position; the export has no media ids, so they come from the old store."""
    for p in load('products'):
        new = mapped(p['id'])
        if not new or IDMAP.get('media-done:' + p['id']): continue
        old = gql('query($id:ID!){product(id:$id){media(first:50){nodes{id}}}}', {'id': p['id']}, target='old')['data']['product']['media']['nodes']
        for _ in range(12):
            nn = gql('query($id:ID!){product(id:$id){media(first:50){nodes{id status}}}}', {'id': new})['data']['product']['media']['nodes']
            if len(nn) >= len(old) and all(n['status'] in ('READY', 'FAILED') for n in nn): break
            time.sleep(5)
        failed = [n['id'] for n in nn if n['status'] == 'FAILED']
        if failed: log('products', 'MEDIA FAILED', p['handle'], failed)
        for o, n in zip(old, nn): IDMAP[o['id']] = n['id']
        IDMAP['media-done:' + p['id']] = len(nn); save_map(); log('products', 'media', p['handle'], f'{len(nn)}/{len(old)}')

# 4b. Originals: safety net (and the repair for the first import, which used the re-encoded CDN copy). Swaps any
# image whose size differs for the old store's original file; same media id, so alt texts, order and translations stay.
Q_ORIG = 'query($ids:[ID!]!){nodes(ids:$ids){id ... on MediaImage{originalSource{url fileSize} image{url}}}}'
def step_originals(only=None):
    pairs = [(o, n) for o, n in IDMAP.items() if o.startswith('gid://shopify/MediaImage/') and n and (not only or o in only)]
    for i in range(0, len(pairs), 25):
        chunk = pairs[i:i + 25]
        old = {x['id']: x for x in gql(Q_ORIG, {'ids': [o for o, _ in chunk]}, target='old')['data']['nodes'] if x}
        new = {x['id']: x for x in gql(Q_ORIG, {'ids': [n for _, n in chunk]})['data']['nodes'] if x}
        todo = [(o, n) for o, n in chunk if o in old and n in new and old[o].get('originalSource') and (new[n].get('originalSource') or {}).get('fileSize') != old[o]['originalSource']['fileSize']]
        if not todo: continue
        inp = [{'id': n, 'originalSource': old[o]['originalSource']['url']} for o, n in todo]
        r = mutate('originals', f'batch {i // 25 + 1} ({len(todo)})', 'mutation($f:[FileUpdateInput!]!){fileUpdate(files:$f){files{id} userErrors{field message code}}}', {'f': inp}, 'fileUpdate')
        if r: log('originals', 'replaced', f'batch {i // 25 + 1}', f'{len(todo)} images')
    wait_files()

# 5. Collections (all smart except frontpage, which every store already has)
def step_collections():
    for c in load('collections'):
        if mapped(c['id']): continue
        ex = find('collection', c['handle'])
        inp = {'handle': c['handle'], 'title': c['title'], 'descriptionHtml': c['descriptionHtml'], 'sortOrder': c['sortOrder'], 'templateSuffix': c['templateSuffix'], 'seo': c['seo'],
               'metafields': [{'namespace': m['namespace'], 'key': m['key'], 'type': m['type'], 'value': m['value']} for m in seo_metafields(c['metafields']['nodes'])]}
        if c['image']: inp['image'] = {'src': c['image']['url'], 'altText': c['image']['altText']}
        if ex:
            inp['id'] = ex
            r = mutate('collections', c['handle'], 'mutation($c:CollectionInput!){collectionUpdate(input:$c){collection{id} userErrors{field message}}}', {'c': inp}, 'collectionUpdate')
        else:
            if c['ruleSet']: inp['ruleSet'] = c['ruleSet']
            r = mutate('collections', c['handle'], 'mutation($c:CollectionInput!){collectionCreate(input:$c){collection{id} userErrors{field message}}}', {'c': inp}, 'collectionCreate')
        if not r: continue
        new = r['collection']['id']; remember('collections', c['id'], new, c['handle'])
        by_handle = {p['handle']: mapped(p['id']) for p in load('products')}  # the export lists collection products by handle
        manual = [by_handle.get(x['handle']) for x in c['products']['nodes']] if not c['ruleSet'] else []
        if manual: mutate('collections', c['handle'], 'mutation($id:ID!,$p:[ID!]!){collectionAddProducts(id:$id,productIds:$p){userErrors{field message}}}', {'id': new, 'p': [m for m in manual if m]}, 'collectionAddProducts')
        if not ex: publish('collections', new, c['handle'])

# 6. Pages (data-sharing-opt-out is created by Shopify's privacy settings)
def step_pages():
    for pg in load('pages'):
        if mapped(pg['id']) or pg['handle'] == 'data-sharing-opt-out': continue
        inp = {'handle': pg['handle'], 'title': pg['title'], 'body': pg['body'], 'isPublished': pg['isPublished'], 'templateSuffix': pg['templateSuffix'],
               'metafields': [{'namespace': m['namespace'], 'key': m['key'], 'type': m['type'], 'value': m['value']} for m in pg['metafields']['nodes']]}
        ex = find('page', pg['handle'])
        if ex: r = mutate('pages', pg['handle'], 'mutation($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){page{id} userErrors{field message}}}', {'id': ex, 'p': inp}, 'pageUpdate')
        else: r = mutate('pages', pg['handle'], 'mutation($p:PageCreateInput!){pageCreate(page:$p){page{id} userErrors{field message}}}', {'p': inp}, 'pageCreate')
        if r: remember('pages', pg['id'], r['page']['id'], pg['handle'])

# 7. Blog "journal" + articles
def step_blog():
    for b in load('blogs'):
        if not mapped(b['id']):
            ex = find('blog', b['handle'])
            if ex: remember('blog', b['id'], ex, b['handle'])
            else:
                r = mutate('blog', b['handle'], 'mutation($b:BlogCreateInput!){blogCreate(blog:$b){blog{id} userErrors{field message}}}', {'b': {'handle': b['handle'], 'title': b['title'], 'commentPolicy': b['commentPolicy'], 'templateSuffix': b['templateSuffix']}}, 'blogCreate')
                if r: remember('blog', b['id'], r['blog']['id'], b['handle'])
    blog_ids = {b['handle']: mapped(b['id']) for b in load('blogs')}
    for a in load('articles'):
        if mapped(a['id']): continue
        inp = {'blogId': blog_ids[a['blog']['handle']], 'handle': a['handle'], 'title': a['title'], 'body': a['body'], 'summary': a['summary'], 'tags': a['tags'], 'isPublished': a['isPublished'],
               'publishDate': a['publishedAt'], 'author': {'name': a['author']['name']}, 'templateSuffix': a['templateSuffix'],
               'metafields': [{'namespace': m['namespace'], 'key': m['key'], 'type': m['type'], 'value': m['value']} for m in a['metafields']['nodes']]}
        if a['image']: inp['image'] = {'url': a['image']['url'], 'altText': a['image']['altText']}
        r = mutate('blog', a['handle'], 'mutation($a:ArticleCreateInput!){articleCreate(article:$a){article{id} userErrors{field message}}}', {'a': inp}, 'articleCreate')
        if r: remember('blog', a['id'], r['article']['id'], a['handle'])

# 8. Policies (the privacy policy is managed automatically by Shopify; the owner switches it on)
def step_policies():
    for p in load('policies'):
        if p['type'] == 'PRIVACY_POLICY': continue
        r = mutate('policies', p['type'], 'mutation($p:ShopPolicyInput!){shopPolicyUpdate(shopPolicy:$p){shopPolicy{id} userErrors{field message}}}', {'p': {'type': p['type'], 'body': p['body']}}, 'shopPolicyUpdate')
        if r: remember('policies', p['id'], r['shopPolicy']['id'], p['type'])

# 9. Menus (items point at the new ids, policies by type; customer-account-main-menu is store-specific and left alone)
def step_menus():
    existing = {m['handle']: m['id'] for m in gql('{menus(first:50){nodes{id handle}}}')['data']['menus']['nodes']}
    new_policies = {p['type']: p['id'] for p in gql('{shop{shopPolicies{id type}}}')['data']['shop']['shopPolicies']}
    for p in load('policies'): IDMAP.setdefault(p['id'], new_policies.get(p['type']))  # incl. the Shopify-managed privacy policy
    def items(its):
        out = []
        for i in its:
            it = {'title': i['title'], 'type': i['type'], 'url': i['url'], 'tags': i['tags'], 'items': items(i.get('items') or [])}
            if i['resourceId']:
                it['resourceId'] = mapped(i['resourceId'])
                if not it['resourceId']: log('menus', 'ERROR', i['title'], f"no mapping for {i['resourceId']}")
            out.append(it)
        return out
    def flat(its): return [x for i in its for x in [i] + flat(i.get('items') or [])]
    for m in load('menus'):
        if m['handle'] == 'customer-account-main-menu' or mapped(m['id']): continue  # re-writing a menu gives its items new ids and drops their translations
        vars = {'title': m['title'], 'items': items(m['items'])}
        if m['handle'] in existing:
            r = mutate('menus', m['handle'], 'mutation($id:ID!,$title:String!,$items:[MenuItemUpdateInput!]!){menuUpdate(id:$id,title:$title,items:$items){menu{id items{id items{id items{id}}}} userErrors{field message}}}', dict(vars, id=existing[m['handle']]), 'menuUpdate')
        else:
            r = mutate('menus', m['handle'], 'mutation($title:String!,$handle:String!,$items:[MenuItemCreateInput!]!){menuCreate(title:$title,handle:$handle,items:$items){menu{id items{id items{id items{id}}}} userErrors{field message}}}', dict(vars, handle=m['handle']), 'menuCreate')
        if not r: continue
        remember('menus', m['id'], r['menu']['id'], m['handle'])
        for o, n in zip(flat(m['items']), flat(r['menu']['items'])): IDMAP[o['id']] = n['id']
        save_map()

# 10. Redirects
def step_redirects():
    have = {r['path'] for r in gql('{urlRedirects(first:250){nodes{path}}}')['data']['urlRedirects']['nodes']}
    for rd in load('redirects'):
        if rd['path'] in have: continue
        mutate('redirects', rd['path'], 'mutation($r:UrlRedirectInput!){urlRedirectCreate(urlRedirect:$r){urlRedirect{id} userErrors{field message}}}', {'r': rd}, 'urlRedirectCreate') and log('redirects', 'created', rd['path'], rd['target'])

# 11 + 12. Translations: digests belong to the new store, so translatableContent is always fetched there first
def new_resource_id(t, old):
    if t.startswith('ONLINE_STORE_THEME'):
        theme = gql('{themes(first:5,roles:[MAIN]){nodes{id}}}')['data']['themes']['nodes'][0]['id'].split('/')[-1]
        if t == 'ONLINE_STORE_THEME_LOCALE_CONTENT': return f'gid://shopify/OnlineStoreThemeLocaleContent/{theme}'
        return old.split('?theme_id=')[0] + '?theme_id=' + theme
    if t == 'METAFIELD':
        mf = gql('query($id:ID!){node(id:$id){... on Metafield{namespace key owner{... on Node{id}}}}}', {'id': old}, target='old')['data']['node']
        owner = mapped(mf['owner']['id']) if mf else None
        if not owner: return None
        r = gql('query($id:ID!,$n:String!,$k:String!){node(id:$id){... on HasMetafields{metafield(namespace:$n,key:$k){id}}}}', {'id': owner, 'n': mf['namespace'], 'k': mf['key']})['data']['node']
        return ((r or {}).get('metafield') or {}).get('id')
    if t == 'LINK':  # translations address menu items as Link/<id>, the map holds MenuItem/<id>
        n = mapped(old.replace('/Link/', '/MenuItem/'))
        return n and n.replace('/MenuItem/', '/Link/')
    return mapped(old)
def step_translations():
    primary = next(l['locale'] for l in gql('{shopLocales{locale primary}}')['data']['shopLocales'] if l['primary'])
    if primary != 'en': print(f'  STOP: primary language of the new store is {primary!r}, not en. The owner must switch the default language to English first.'); return
    done = set(IDMAP.get('translations-done', []))
    for t, nodes in load('translations').items():
        if t in ('FILTER', 'SHOP'): continue  # Search & Discovery filters are set up by the owner
        for n in nodes:
            if n['resourceId'] in done: continue
            new = new_resource_id(t, n['resourceId'])
            if not new: log('translations', 'SKIP', n['resourceId'], 'no new resource'); continue
            content = gql('query($id:ID!){translatableResource(resourceId:$id){translatableContent{key value digest}}}', {'id': new})['data']['translatableResource']
            if not content: log('translations', 'SKIP', new, 'not translatable'); continue
            dig = {c['key']: (c['digest'], c['value']) for c in content['translatableContent']}
            src = {c['key']: c['value'] for c in n['translatableContent']}
            inputs, stale = [], 0
            for loc in LOCALES:
                for x in n[loc]:
                    if x['key'] not in dig: continue
                    if dig[x['key']][1] != src.get(x['key']): stale += 1; continue  # source text differs: would be outdated
                    inputs.append({'key': x['key'], 'locale': loc, 'value': x['value'], 'translatableContentDigest': dig[x['key']][0]})
            ok = True
            for i in range(0, len(inputs), 100):
                r = mutate('translations', new, 'mutation($id:ID!,$t:[TranslationInput!]!){translationsRegister(resourceId:$id,translations:$t){translations{key} userErrors{field message}}}', {'id': new, 't': inputs[i:i + 100]}, 'translationsRegister')
                ok = ok and bool(r)
            log('translations', 'registered' if ok else 'PARTIAL', f'{t} {new}', f'{len(inputs)} values, {stale} skipped (source changed)')
            if ok and not DRY: done.add(n['resourceId']); IDMAP['translations-done'] = sorted(done); save_map()

STEPS = ['locales', 'defs', 'files', 'products', 'originals', 'collections', 'pages', 'blog', 'policies', 'menus', 'redirects', 'translations']
if __name__ == '__main__':
    want = [a for a in sys.argv[1:] if not a.startswith('--')]
    if want == ['all']: want = STEPS
    bad = [w for w in want if w not in STEPS]
    if not want or bad: print(__doc__); sys.exit(1)
    for s in STEPS:
        if s in want: print(f'== {s}' + (' (dry run)' if DRY else '')); globals()['step_' + s]()
