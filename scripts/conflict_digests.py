"""Compile short, attributed French feed summaries into dated dossier paragraphs.

Extractive only: no generated analysis, translation, article-body scraping or
credentials. Publisher wording and uncertainty markers stay intact. Dates in the
source are anchored by the publication date, never silently changed to today.
"""
import concurrent.futures
import datetime as dt
import email.utils
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import ssl
import unicodedata
import urllib.parse
import xml.etree.ElementTree as ET
from news_http import NewsHTTP

ROOT = Path(__file__).resolve().parent.parent
PATTERNS = {
    'ukraine-guerre-enjeux': r'\bukrain\w*\b',
    'taiwan-detroit-tensions': r'\b(?:taiwan\w*|pratas|kinmen|pescadores)\b',
    'moyen-orient-conflits': r'\b(?:iran\w*|israel\w*|palestin\w*|gaza|liban\w*|leban\w*|yemen\w*|houth\w*|hezbollah|hamas|ormuz|hormuz)\b|\bbab[ -]+el[ -]+mandeb\b',
}
CONTEXT = r'\b(?:guerre|conflit\w*|militair\w*|arme\w*|diplomati\w*|sanction\w*|securite|defense|cessez.le.feu|paix|pourparler\w*|civil\w*|humanitair\w*|aide|faim|deplace\w*|dissuasion|attaque\w*|frappe\w*|tension\w*|front\w*|ravitail\w*|approvisionn\w*|souverain\w*|beijing|pekin)\b'


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
        if tag in ('p', 'br', 'div'): self.parts.append(' ')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden = max(0, self.hidden - 1)
        if tag in ('p', 'div'): self.parts.append(' ')
    def handle_data(self, value):
        if not self.hidden: self.parts.append(value)


def clean(value):
    parser = PlainText(); parser.feed(html.unescape(value or '').replace('\\"','"'))
    return ' '.join(''.join(parser.parts).split())


def folded(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.casefold()) if not unicodedata.combining(c))


def timestamp(value):
    try: result = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError: result = email.utils.parsedate_to_datetime(value)
    if result.tzinfo is None: raise ValueError('Date sans fuseau')
    return result


def excerpt(summary):
    """Prefer a complete lead sentence; keep at most 25 source words per article."""
    summary = clean(summary)
    if len(summary.split()) < 12 or summary.rstrip().endswith(('…', '...')):
        return None
    first = re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ý«])', summary)[0]
    words = first.split()
    if len(words) <= 25:
        return first, False
    words = words[:25]
    # Do not leave a dangling conjunction/preposition immediately before the ellipsis.
    while words and folded(words[-1].strip(',;:')) in {'de','du','des','la','le','les','un','une','a','au','aux','en','et','ou','pour','par','avec','que','qui','ce','cette','son','sa','ses','avoir'}:
        words.pop()
    prefix = ' '.join(words).rstrip(',;:')
    reservations = r'\b(?:selon|d.apres|aurait\w*|pourrait\w*|serait\w*|revendiqu\w*|accus\w*|non confirm\w*|probabl\w*|presum\w*)\b'
    if any(match.end() > len(folded(prefix)) for match in re.finditer(reservations, folded(first))):
        return None  # Never detach a statement from a reservation at the end.
    return prefix + '…', True


def safe_url(value, source):
    url = urllib.parse.urlsplit(value.strip())
    if url.scheme != 'https' or url.username or url.password or not any(
        url.hostname == d or (url.hostname or '').endswith('.' + d) for d in source['domains']):
        raise ValueError('Lien extérieur à la source')
    return urllib.parse.urlunsplit((url.scheme, url.netloc, url.path, url.query, ''))


def parse_feed(data, source, now):
    if b'<!DOCTYPE' in data.upper() or b'<!ENTITY' in data.upper(): raise ValueError('Déclaration XML refusée')
    tree = ET.fromstring(data)
    if tree.tag.rsplit('}', 1)[-1] not in ('rss','feed','RDF'): raise ValueError('Flux non RSS/Atom')
    result = []
    for entry in tree.iter():
        if entry.tag.rsplit('}', 1)[-1] not in ('item', 'entry'): continue
        fields = {}
        for child in entry:
            name = child.tag.rsplit('}', 1)[-1]
            if child.text: fields.setdefault(name, child.text)
            if name == 'link' and child.get('href') and child.get('rel', 'alternate') == 'alternate': fields['link'] = child.get('href')
        try:
            published = timestamp(fields.get('pubDate') or fields.get('published') or fields.get('updated') or '')
            if not now - dt.timedelta(days=14) <= published <= now + dt.timedelta(minutes=5): continue
            title = clean(fields.get('title'))
            summary = clean(fields.get('description') or fields.get('summary'))
            lead = excerpt(summary)
            if not title or not lead: continue
            subject = folded(title + ' ' + summary)
            if not re.search(CONTEXT, subject): continue
            topics = [slug for slug in source['topics'] if re.search(PATTERNS[slug], subject)]
            if not topics: continue
            result.append({'title': title, 'text': lead[0], 'truncated': lead[1],
                           'source': source['name'], 'sourceId': source['id'],
                           'url': safe_url(fields.get('link', ''), source),
                           'publishedAt': published.isoformat(), 'topics': topics})
        except (ValueError, TypeError, OverflowError): continue
    return result


def compose(previous, results, now, verify):
    """Keep the last good text on a failed/empty collection, with its real date."""
    stamp = now.isoformat(); output = {}; verified = {}
    for slug in PATTERNS:
        relevant = [(source, items, error) for source, items, error in results if slug in source['topics']]
        statuses = [{'source': s['name'], 'ok': not error} for s, _, error in relevant]
        candidates = sorted([i for _, items, _ in relevant for i in items if slug in i['topics']], key=lambda i: timestamp(i['publishedAt']), reverse=True)
        paragraphs = []; urls = set(); titles = set(); per_publisher = {}
        for item in candidates:
            key = re.sub(r'\W+', '', folded(item['title']))
            if item['url'] in urls or key in titles or per_publisher.get(item['source'], 0) >= 2: continue
            if item['url'] not in verified: verified[item['url']] = verify(item['url'])
            if not verified[item['url']]: continue
            urls.add(item['url']); titles.add(key); per_publisher[item['source']] = per_publisher.get(item['source'], 0) + 1
            paragraphs.append({k: item[k] for k in ('title','text','truncated','source','url','publishedAt')})
            if len(paragraphs) == 3: break
        old = previous.get(slug, {}).get('digest', {})
        if paragraphs:
            same = old.get('paragraphs') == paragraphs
            output[slug] = {'method':'publisher-excerpts', 'checkedAt':stamp,
                            'updatedAt':old['updatedAt'] if same else stamp,
                            'status':'unchanged' if same else 'updated',
                            'paragraphs':paragraphs, 'sources':statuses}
        else:
            output[slug] = {'method':'publisher-excerpts', 'checkedAt':stamp,
                            'updatedAt':old.get('updatedAt'),
                            'status':'retained' if old.get('paragraphs') else 'empty',
                            'paragraphs':old.get('paragraphs', []), 'sources':statuses}
    return output


def collect_digests(previous, now):
    sources = json.loads((ROOT / 'scripts/conflict-digest-sources.json').read_text(encoding='utf-8'))
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    context.load_default_certs()
    http = NewsHTTP({'User-Agent':'Radar/1.0 (+https://oustryilan63-blip.github.io/ligne-de-veille/)', 'Accept':'application/rss+xml,application/atom+xml'}, context)
    def collect(source):
        try: return source, parse_feed(http.request(source['url']), source, now), None
        except Exception as exc: return source, [], type(exc).__name__
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(collect, sources))
    return compose(previous, results, now, http.verify_article)
