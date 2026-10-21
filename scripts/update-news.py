"""Collect dated headlines and links from publisher feeds, without inventing summaries."""
import concurrent.futures
import datetime as dt
import email.utils
import html
from html.parser import HTMLParser
import json
import os
import re
import unicodedata
from pathlib import Path
import ssl
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
PARIS = ZoneInfo('Europe/Paris')
CONTEXT = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
CONTEXT.load_default_certs()
HEADERS = {'User-Agent': 'Radar/1.0 (+https://oustryilan63-blip.github.io/ligne-de-veille/)', 'Accept': 'application/rss+xml, application/atom+xml, text/xml, text/html;q=0.8'}
sys.path.insert(0,str(ROOT/'scripts'))
from news_images import find_article_image, POLICY
from news_http import NewsHTTP

HTTP = NewsHTTP(HEADERS, CONTEXT)
WORKERS = 5

class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden = max(0, self.hidden - 1)
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)

def clean(value):
    parser = PlainText(); parser.feed(html.unescape(value or ''))
    return ' '.join(' '.join(parser.parts).split())

def clip(value, limit=140):
    return value if len(value) <= limit else value[:limit-1].rsplit(' ', 1)[0] + '…'

def headline_key(value):
    plain=''.join(c for c in unicodedata.normalize('NFKD',value.casefold()) if not unicodedata.combining(c))
    return re.sub(r'[\W_]+','',plain)

def relevant_entry(title, categories, source):
    """Select the configured international sections before applying source quotas."""
    if any(headline_key(term) in headline_key(title) for term in source.get('excludeTitleTerms', [])):
        return False
    required = source.get('categoryTermsAny', [])
    return not required or any(headline_key(term) in headline_key(category) for term in required for category in categories)

def fresh_candidates(items,urls,headlines,limit):
    selected=[];duplicates=0
    for item in items:
        if item['url'].rstrip('/') in urls:continue
        key=headline_key(item['title'])
        if key in headlines:duplicates+=1;continue
        headlines.add(key);selected.append(item)
        if len(selected)>=limit:break
    return selected,duplicates

def canonical(raw, source):
    p = urllib.parse.urlsplit(raw.strip())
    if p.scheme not in ('http', 'https') or p.username or p.password: raise ValueError('URL non admissible')
    host = (p.hostname or '').lower()
    if not any(host == domain or host.endswith('.'+domain) for domain in source['domains']): raise ValueError('Domaine inattendu')
    query = [(k,v) for k,v in urllib.parse.parse_qsl(p.query) if not k.lower().startswith('utm_') and k not in ('fbclid','gclid')]
    return urllib.parse.urlunsplit(('https',p.netloc,p.path,urllib.parse.urlencode(query),''))

def request(url, max_bytes=2_000_000):
    return HTTP.request(url, max_bytes=max_bytes)

def local_name(tag): return tag.rsplit('}',1)[-1]
def child_text(element, names):
    for name in names:
        for child in element:
            if local_name(child.tag) == name and child.text: return child.text.strip()
    return ''

def source_excerpt(entry):
    """Use a short, attributed feed excerpt; never fetch or republish article bodies."""
    value = clean(child_text(entry, ('summary', 'description')))
    words = value.split()
    if len(words) < 8: return None
    excerpt = ' '.join(words[:20])
    if len(excerpt) > 280: excerpt = clip(excerpt, 280)
    if len(words) > 20: excerpt += '…'
    return {'text': excerpt, 'kind': 'feed-excerpt'}

def parse_feed(data, source, now):
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper(): raise ValueError('XML avec déclaration externe refusé')
    tree = ET.fromstring(data)
    if local_name(tree.tag) not in ('rss','feed','RDF'): raise ValueError('La réponse ne contient pas de flux RSS/Atom')
    result = []
    for entry in tree.iter():
        if local_name(entry.tag) not in ('item','entry'): continue
        title = clip(clean(child_text(entry, ('title',))))
        categories = [clip(clean(child.text), 100) for child in entry if local_name(child.tag) == 'category' and child.text]
        if not relevant_entry(title, categories, source): continue
        raw_date = child_text(entry, ('published','pubDate','date','updated'))
        try:
            try: published = dt.datetime.fromisoformat(raw_date.replace('Z','+00:00'))
            except ValueError: published = email.utils.parsedate_to_datetime(raw_date)
            if published.tzinfo is None: published = published.replace(tzinfo=dt.timezone.utc)
        except (ValueError, TypeError, OverflowError): continue
        if not title or published > now + dt.timedelta(minutes=5) or published < now - dt.timedelta(days=7): continue
        raw_url = child_text(entry, ('link',))
        for link in entry:
            if local_name(link.tag) == 'link' and link.get('href') and link.get('rel','alternate') == 'alternate': raw_url = link.get('href'); break
        try: url = canonical(raw_url, source)
        except ValueError: continue
        if source.get('pathPrefix') and not urllib.parse.urlsplit(url).path.startswith(source['pathPrefix']): continue
        item = {'date':published.astimezone(PARIS).date().isoformat(),'publishedAt':published.isoformat(),'source':source['name'],'sourceType':source['type'],'title':title,'url':url,'language':source['language'],'autoCollected':True,'summary':'Publication repérée dans le flux de '+source['name']+'. Consultez le site d’origine pour lire le contenu complet.','why':'Document original accessible chez son éditeur ; titre et date transmis par son flux.'}
        if categories: item['publisherCategories'] = categories[:12]
        if source.get('topics'): item['themes'] = source['topics']
        excerpt = source_excerpt(entry) if 'conflits' not in source['name'].casefold() else None
        if excerpt: item['sourceExcerpt'] = excerpt
        result.append(item)
    return sorted(result,key=lambda item:item['publishedAt'],reverse=True)

def collect(source, now):
    try: return source, parse_feed(request(source['url']),source,now), None
    except Exception as exc: return source, [], str(exc)[:180]

def verify_link(item):
    return HTTP.verify_article(item['url'])

def article_image(item):
    try:
        return find_article_image(item,request,clean,clip)
    except Exception as exc:
        print('Image officielle non disponible : '+str(exc)[:100], file=sys.stderr)
        return None

def enrich_images(items):
    hosts=set(POLICY['individualLicenseHosts'])|{h for p in POLICY['providers'].values() for h in p['articleHosts']}
    hosts.update(h for p in POLICY.get('explicitPermissions',{}).values() for h in p['articleHosts'])
    hosts.update(h for p in POLICY.get('verifiedLicensedAssets',{}).values() for h in p['articleHosts'])
    hosts.update(POLICY.get('publisherPermission',{}).get('articleHosts',[]))
    now=dt.datetime.now(dt.timezone.utc);retry_before=(now-dt.timedelta(hours=24)).isoformat()
    eligible = sorted([i for i in items if urllib.parse.urlsplit(i['url']).hostname in hosts and (not i.get('image') or not i['image'].get('provider') or (i['image'].get('provider')=='specific-permission' and (not i['image'].get('assetUrl') or not i['image'].get('sha256')))) and i.get('imageCheckedAt','')<retry_before], key=lambda i:(not bool(i.get('imageCheckedAt')),i['date'],i.get('publishedAt','')), reverse=True)[:48]
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for item, image in zip(eligible, pool.map(article_image, eligible)):
            item['imageCheckedAt']=now.isoformat()
            if image: item['image'] = image
    for item in items:
        if 'conflits' in item['source'].casefold(): item.pop('sourceExcerpt', None)

def main():
    now = dt.datetime.now(dt.timezone.utc)
    sources = json.loads((ROOT/'scripts/news-sources.json').read_text(encoding='utf-8'))
    stored = json.loads((ROOT/'actualites.json').read_text(encoding='utf-8'))
    urls = {item['url'].rstrip('/') for item in stored['items']}
    statuses, additions, types_ok = [], [], set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = list(pool.map(lambda source:collect(source,now),sources))
    candidates = [];duplicates_skipped=0
    recent_after=(now.astimezone(PARIS)-dt.timedelta(days=7)).date().isoformat()
    headlines={headline_key(i['title']) for i in stored['items'] if i['date']>=recent_after}
    existing = {item['url'].rstrip('/'): item for item in stored['items']}
    for source, items, error in results:
        statuses.append({'source':source['name'],'ok':not error,'recentItems':len(items),'error':error})
        if error:
            print('Flux indisponible : '+source['name']+' — '+error, file=sys.stderr); continue
        types_ok.add(source['type'])
        for item in items:
            saved = existing.get(item['url'].rstrip('/'))
            if saved and saved.get('autoCollected') and item.get('sourceExcerpt'):
                saved['sourceExcerpt'] = item['sourceExcerpt']
            if saved and saved.get('autoCollected'):
                for field in ('themes', 'publisherCategories'):
                    if item.get(field): saved[field] = item[field]
        # Keep sources balanced and omit identical headlines from the recent week.
        selected,duplicates=fresh_candidates(items,urls,headlines,min(5,max(1,int(source.get('maxItems',2)))))
        candidates.extend(selected);duplicates_skipped+=duplicates
    if not {'Source officielle','Presse spécialisée'}.issubset(types_ok):
        raise RuntimeError('La collecte doit réussir pour au moins une source officielle et une source spécialisée. Les actualités existantes sont conservées.')
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        verified = list(pool.map(verify_link,candidates))
    for item, valid in zip(candidates,verified):
        if valid and item['url'].rstrip('/') not in urls:
            additions.append(item); urls.add(item['url'].rstrip('/'))
        elif not valid: print('Lien non vérifié, publication ignorée : '+item['url'],file=sys.stderr)
    if candidates and not additions:
        print('::warning::Aucun nouveau lien vérifiable : les articles existants sont conservés. La collecte et les dossiers peuvent continuer.', file=sys.stderr)
    stored['items'].extend(additions)
    enrich_images(stored['items'])
    stored['items'].sort(key=lambda item:(item['date'],item.get('publishedAt','')),reverse=True)
    stored['updatedAt'] = now.astimezone(PARIS).date().isoformat()
    stored['checkedAt'] = now.isoformat()
    stored['automation'] = {'schedule':'08:00 et 18:00','schedules':['08:00','18:00'],'timezone':'Europe/Paris','method':'RSS/Atom : titres, dates, liens vérifiés, courts extraits attribués et images principales avec crédits et autorisations confirmées','sources':statuses,'newItems':len(additions),'articleImages':sum(bool(i.get('image')) for i in stored['items']),'duplicateHeadlinesSkipped':duplicates_skipped}
    output = ROOT/'actualites.json'
    temporary = output.with_suffix('.json.tmp'); temporary.write_text(json.dumps(stored,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); temporary.replace(output)
    summary = f"{len(additions)} nouveautés ; {sum(s['ok'] for s in statuses)}/{len(statuses)} flux consultés ; {len(stored['items'])} publications conservées."
    print(summary)
    http = HTTP.stats()
    print(f"HTTP : {http['requests']} requêtes ; {http['cacheHits']} réutilisations de réponses ; {http['sharedRequests']} requêtes simultanées regroupées.")
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'],'a',encoding='utf-8') as report: report.write('## Veille quotidienne\n\n'+summary+'\n\nContrôle : '+now.astimezone(PARIS).isoformat()+'\n')

if __name__ == '__main__': main()
