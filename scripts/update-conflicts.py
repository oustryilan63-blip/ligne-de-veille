"""Refresh dossier reading lists from the already verified news collection.

No extra requests, generated claims, article bodies or credentials. The historical
explanations keep their editorial verification date. An invalid/stale collection
raises before the atomic write, leaving the last published version intact.
"""
import argparse
import datetime as dt
import json
from pathlib import Path
import re
import unicodedata
import urllib.parse

ROOT = Path(__file__).resolve().parent.parent
TOPICS = {
    'ukraine-guerre-enjeux': r'\bukrain\w*\b',
    'taiwan-detroit-tensions': r'\b(?:taiwan\w*|pratas|kinmen|pescadores)\b',
    'moyen-orient-conflits': r'\b(?:iran\w*|israel\w*|palestin\w*|gaza|liban\w*|leban\w*|yemen\w*|houth\w*|hezbollah|hamas|ormuz|hormuz)\b|\bbab[ -]+el[ -]+mandeb\b',
}


def folded(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.casefold())
                   if not unicodedata.combining(c))


def timestamp(value):
    parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('Date sans fuseau horaire')
    return parsed


def refresh(news, sources, previous, now):
    checked = timestamp(news['checkedAt'])
    if not -dt.timedelta(minutes=5) <= now - checked <= dt.timedelta(minutes=90):
        raise ValueError('Collecte des actualités trop ancienne ou datée dans le futur')
    configured = {s['name']: s for s in sources}
    statuses = news['automation']['sources']
    successful = {s['source'] for s in statuses if s.get('ok') is True and s['source'] in configured}
    if not {'Source officielle', 'Presse spécialisée'}.issubset({configured[s]['type'] for s in successful}):
        raise ValueError('Collecte insuffisante : conservation du dernier suivi')
    candidates = []
    for item in news['items']:
        source = configured.get(item.get('source'))
        if not source or not item.get('autoCollected'):
            continue
        try:
            published = timestamp(item['publishedAt'])
            url = urllib.parse.urlsplit(item['url'])
            if (url.scheme != 'https' or url.username or url.password or
                not any(url.hostname == domain or (url.hostname or '').endswith('.' + domain)
                        for domain in source['domains'])):
                continue
            if not checked - dt.timedelta(days=14) <= published <= checked + dt.timedelta(minutes=5):
                continue
            title = ' '.join(item['title'].split())
            if not title or len(title) > 300:
                continue
            candidates.append({'title': title, 'url': item['url'],
                               'source': item['source'], 'sourceType': source['type'],
                               'publishedAt': item['publishedAt'],
                               'language': item.get('language', 'fr')})
        except (KeyError, ValueError, TypeError):
            continue
    candidates.sort(key=lambda i: timestamp(i['publishedAt']), reverse=True)
    topics = {}
    for slug, pattern in TOPICS.items():
        items, seen, counts = [], set(), {}
        for item in candidates:
            title_key = re.sub(r'\W+', '', folded(item['title']))
            if not re.search(pattern, folded(item['title'])) or item['url'] in seen or title_key in seen:
                continue
            if counts.get(item['source'], 0) >= 2:
                continue
            seen.update((item['url'], title_key))
            counts[item['source']] = counts.get(item['source'], 0) + 1
            items.append(item)
            if len(items) == 4:
                break
        old = previous.get('topics', {}).get(slug, {})
        topics[slug] = {'changedAt': old.get('changedAt') if old.get('items') == items
                       else checked.isoformat(), 'items': items}
    return {'version': 1, 'checkedAt': checked.isoformat(), 'windowDays': 14,
            'schedule': {'times': ['08:00', '18:00'], 'timezone': 'Europe/Paris'},
            'coverage': {'ok': len(successful), 'total': len(configured),
                         'unavailable': [s['source'] for s in statuses
                                         if s.get('ok') is not True and s['source'] in configured]},
            'topics': topics}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--news', type=Path, default=ROOT / 'actualites.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'conflits-actualites.json')
    args = parser.parse_args()
    previous = json.loads(args.output.read_text(encoding='utf-8')) if args.output.exists() else {}
    result = refresh(json.loads(args.news.read_text(encoding='utf-8')),
                     json.loads((ROOT / 'scripts/news-sources.json').read_text(encoding='utf-8')),
                     previous, dt.datetime.now(dt.timezone.utc))
    temporary = args.output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(args.output)
    print('Dossiers actualisés : ' + ', '.join(f'{slug} ({len(t["items"])} articles)'
                                               for slug, t in result['topics'].items()))


if __name__ == '__main__':
    main()
