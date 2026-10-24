"""Read-only export of the current (dev) store for the migration. Writes JSON to migration/export/."""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shopify_lib import gql
OUT = os.environ.get('MIGRATION_EXPORT_DIR', os.path.join(os.getcwd(), 'migration-export')); os.makedirs(OUT, exist_ok=True)
LOCALES = ['nl', 'de', 'fr', 'it', 'es']
def save(name, data): json.dump(data, open(os.path.join(OUT, name + '.json'), 'w'), ensure_ascii=False, indent=1); print(name, len(data) if isinstance(data, list) else 'ok')
def pages(query, path, vars=None, first=50):
    out, cur = [], None
    while True:
        v = dict(vars or {}); v['after'] = cur; v['first'] = first
        r = gql(query, v)['data']
        for k in path: r = r[k]
        out += r['nodes']
        if not r['pageInfo']['hasNextPage']: return out
        cur = r['pageInfo']['endCursor']
PI = 'pageInfo{hasNextPage endCursor}'
MF = 'metafields(first:50){nodes{namespace key type value}}'
save('shop', gql('{shop{name email contactEmail myshopifyDomain primaryDomain{host} currencyCode billingAddress{company address1 zip city countryCodeV2} currencyFormats{moneyFormat moneyWithCurrencyFormat}}}')['data']['shop'])
save('locales', gql('{shopLocales{locale primary published}}')['data']['shopLocales'])
save('markets', pages('query($first:Int,$after:String){markets(first:$first,after:$after){'+PI+' nodes{id name handle enabled primary webPresences(first:10){nodes{domain{host} defaultLocale{locale} alternateLocales{locale} subfolderSuffix}} regions(first:100){nodes{name ... on MarketRegionCountry{code}}}}}}', ['markets']))
defs = []
for ot in ['PRODUCT','PRODUCTVARIANT','COLLECTION','PAGE','ARTICLE','BLOG','SHOP']:
    defs += [dict(d, ownerType=ot) for d in pages('query($first:Int,$after:String,$ot:MetafieldOwnerType!){metafieldDefinitions(first:$first,after:$after,ownerType:$ot){'+PI+' nodes{name namespace key description type{name} access{storefront admin} validations{name value} pinnedPosition}}}', ['metafieldDefinitions'], {'ot': ot})]
save('metafield_definitions', defs)
save('files', pages('query($first:Int,$after:String){files(first:$first,after:$after){'+PI+' nodes{id alt fileStatus createdAt ... on MediaImage{image{url width height} originalSource{url}} ... on GenericFile{url mimeType}}}}', ['files'], first=100))
save('products', pages('query($first:Int,$after:String){products(first:$first,after:$after){'+PI+' nodes{id handle title status vendor productType tags descriptionHtml templateSuffix seo{title description} options{name values} '+MF+' media(first:50){nodes{alt mediaContentType ... on MediaImage{image{url width height}}}} variants(first:20){nodes{id title sku price compareAtPrice barcode taxable inventoryPolicy inventoryQuantity inventoryItem{tracked requiresShipping measurement{weight{unit value}}} selectedOptions{name value}}} publishedAt}}}', ['products'], first=25))
save('collections', pages('query($first:Int,$after:String){collections(first:$first,after:$after){'+PI+' nodes{id handle title descriptionHtml sortOrder templateSuffix seo{title description} image{url altText} ruleSet{appliedDisjunctively rules{column relation condition}} '+MF+' products(first:100){nodes{handle}}}}}', ['collections']))
save('pages', pages('query($first:Int,$after:String){pages(first:$first,after:$after){'+PI+' nodes{id handle title body bodySummary isPublished templateSuffix '+MF+'}}}', ['pages']))
save('blogs', pages('query($first:Int,$after:String){blogs(first:$first,after:$after){'+PI+' nodes{id handle title templateSuffix commentPolicy '+MF+'}}}', ['blogs']))
save('articles', pages('query($first:Int,$after:String){articles(first:$first,after:$after){'+PI+' nodes{id handle title body summary tags isPublished publishedAt templateSuffix author{name} blog{handle} image{url altText} '+MF+'}}}', ['articles']))
save('menus', pages('query($first:Int,$after:String){menus(first:$first,after:$after){'+PI+' nodes{id handle title items{id title type url resourceId tags items{id title type url resourceId tags items{id title type url resourceId tags}}}}}}', ['menus']))
save('redirects', pages('query($first:Int,$after:String){urlRedirects(first:$first,after:$after){'+PI+' nodes{path target}}}', ['urlRedirects'], first=250))
save('policies', gql('{shop{shopPolicies{id type title body url}}}')['data']['shop']['shopPolicies'])
tr = {}
TYPES = ['PRODUCT','COLLECTION','PAGE','BLOG','ARTICLE','LINK','MENU','SHOP_POLICY','MEDIA_IMAGE','METAFIELD','ONLINE_STORE_THEME_JSON_TEMPLATE','ONLINE_STORE_THEME_SECTION_GROUP','ONLINE_STORE_THEME_LOCALE_CONTENT','SHOP','FILTER','METAOBJECT']
for t in TYPES:
    q = 'query($first:Int,$after:String,$t:TranslatableResourceType!){translatableResources(first:$first,after:$after,resourceType:$t){'+PI+' nodes{resourceId translatableContent{key value locale} ' + ' '.join(f'{l}:translations(locale:"{l}"){{key value outdated}}' for l in LOCALES) + '}}}'
    try:
        nodes = pages(q, ['translatableResources'], {'t': t}, first=50)
    except SystemExit:
        print('skip', t); continue
    tr[t] = [n for n in nodes if any(n[l] for l in LOCALES)]
    print(' translations', t, len(nodes), 'resources,', len(tr[t]), 'translated')
save('translations', tr)
