"""Collect dated headlines and links from publisher feeds, without inventing summaries."""
import concurrent.futures
import datetime as dt
import email.utils
import html
from html.parser import HTMLParser
import json
import os
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

def canonical(raw, source):
    p = urllib.parse.urlsplit(raw.strip())
    if p.scheme not in ('http', 'https') or p.username or p.password: raise ValueError('URL non admissible')
    host = (p.hostname or '').lower()
    if not any(host == domain or host.endswith('.'+domain) for domain in source['domains']): raise ValueError('Domaine inattendu')
    query = [(k,v) for k,v in urllib.parse.parse_qsl(p.query) if not k.lower().startswith('utm_') and k not in ('fbclid','gclid')]
    return urllib.parse.urlunsplit(('https',p.netloc,p.path,urllib.parse.urlencode(query),''))

def request(url, max_bytes=2_000_000):
    with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=25,context=CONTEXT) as response:
        if urllib.parse.urlsplit(response.url).scheme != 'https': raise ValueError('Redirection non HTTPS')
        data = response.read(max_bytes + 1)
        if len(data) > max_bytes: raise ValueError('Flux trop volumineux')
        return data

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
        excerpt = source_excerpt(entry) if 'conflits' not in source['name'].casefold() else None
        if excerpt: item['sourceExcerpt'] = excerpt
        result.append(item)
    return sorted(result,key=lambda item:item['publishedAt'],reverse=True)

def collect(source, now):
    try: return source, parse_feed(request(source['url']),source,now), None
    except Exception as exc: return source, [], str(exc)[:180]

def verify_link(item):
    try:
        with urllib.request.urlopen(urllib.request.Request(item['url'],headers=HEADERS),timeout=20,context=CONTEXT) as response:
            if urllib.parse.urlsplit(response.url).scheme != 'https' or 'text/html' not in response.headers.get('Content-Type',''): return False
            response.read(1024)
            return response.status == 200
    except Exception: return False

def article_image(item):
    """Only GOV.UK editorial lead images under OGL; never an OG site logo."""
    p = urllib.parse.urlsplit(item['url'])
    if p.hostname != 'www.gov.uk' or not p.path.startswith('/government/news/'): return None
    try:
        data = json.loads(request('https://www.gov.uk/api/content'+p.path))
        details = data.get('details', {})
        lead = next((i for i in details.get('images', []) if i.get('type') == 'lead' and i.get('content_type') == 'image/jpeg'), None)
        if not lead: return None
        rights = clean(str(details.get('body', ''))+' '+str(lead.get('caption', ''))).lower()
        # Reject explicit third-party notices. A missing or ambiguous lead uses the local illustration.
        neutral = rights.replace('crown copyright', '').replace('© crown', '')
        if any(mark in neutral for mark in ('copyright', '©', 'getty', 'reuters', 'associated press', 'all rights reserved', 'shutterstock', 'adobe stock', 'photo: ap')): return None
        src = lead.get('sources', {}).get('s300', '')
        q = urllib.parse.urlsplit(src)
        if q.scheme != 'https' or q.hostname != 'assets.publishing.service.gov.uk' or not q.path.startswith('/media/') or q.username or q.password: return None
        # Small JPEG derivative only; an HTML error page cannot become a thumbnail.
        if not request(src, max_bytes=300_000).startswith(b'\xff\xd8\xff'): return None
        return {'src': src, 'kind': 'article', 'alt': clip(clean(lead.get('caption')) or 'Image fournie avec cette publication par le ministère britannique de la Défense.', 240), 'credit': 'Ministry of Defence / Crown copyright', 'license': 'OGL v3', 'licenseUrl': 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/', 'sourceUrl': item['url']}
    except Exception as exc:
        print('Image officielle non disponible : '+str(exc)[:100], file=sys.stderr)
        return None

def enrich_images(items):
    eligible = sorted([i for i in items if i['url'].startswith('https://www.gov.uk/government/news/') and not i.get('image')], key=lambda i:(i['date'],i.get('publishedAt','')), reverse=True)[:12]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for item, image in zip(eligible, pool.map(article_image, eligible)):
            if image: item['image'] = image
    for item in items:
        if 'conflits' in item['source'].casefold(): item.pop('sourceExcerpt', None)

def main():
    now = dt.datetime.now(dt.timezone.utc)
    sources = json.loads((ROOT/'scripts/news-sources.json').read_text(encoding='utf-8'))
    stored = json.loads((ROOT/'actualites.json').read_text(encoding='utf-8'))
    urls = {item['url'].rstrip('/') for item in stored['items']}
    statuses, additions, types_ok = [], [], set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda source:collect(source,now),sources))
    candidates = []
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
        # At most two recent headlines per source; no article bodies are republished.
        candidates.extend([item for item in items if item['url'].rstrip('/') not in urls][:2])
    if not {'Source officielle','Presse spécialisée'}.issubset(types_ok):
        raise RuntimeError('La collecte doit réussir pour au moins une source officielle et une source spécialisée. Les actualités existantes sont conservées.')
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        verified = list(pool.map(verify_link,candidates))
    for item, valid in zip(candidates,verified):
        if valid and item['url'].rstrip('/') not in urls:
            additions.append(item); urls.add(item['url'].rstrip('/'))
        elif not valid: print('Lien non vérifié, publication ignorée : '+item['url'],file=sys.stderr)
    if candidates and not additions: raise RuntimeError('Aucun nouveau lien vérifiable : conservation de la dernière version.')
    stored['items'].extend(additions)
    enrich_images(stored['items'])
    stored['items'].sort(key=lambda item:(item['date'],item.get('publishedAt','')),reverse=True)
    stored['updatedAt'] = now.astimezone(PARIS).date().isoformat()
    stored['checkedAt'] = now.isoformat()
    stored['automation'] = {'schedule':'08:00 et 18:00','schedules':['08:00','18:00'],'timezone':'Europe/Paris','method':'RSS/Atom : titres, dates, liens vérifiés et courts extraits attribués lorsqu’ils sont disponibles','sources':statuses,'newItems':len(additions)}
    output = ROOT/'actualites.json'
    temporary = output.with_suffix('.json.tmp'); temporary.write_text(json.dumps(stored,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); temporary.replace(output)
    summary = f"{len(additions)} nouveautés ; {sum(s['ok'] for s in statuses)}/{len(statuses)} flux consultés ; {len(stored['items'])} publications conservées."
    print(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'],'a',encoding='utf-8') as report: report.write('## Veille quotidienne\n\n'+summary+'\n\nContrôle : '+now.astimezone(PARIS).isoformat()+'\n')

if __name__ == '__main__': main()
