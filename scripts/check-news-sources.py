import datetime as dt,json,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('news',Path(__file__).with_name('update-news.py'));news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
sources=json.loads(Path(__file__).with_name('news-sources.json').read_text(encoding='utf-8'))
assert len({s['id'] for s in sources})==len(sources)
assert {'opexnews','blablachars','fob','navalnews'}<={s['id'] for s in sources}
blog=next(s for s in sources if s['id']=='blablachars')
atom=b'''<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Blindes</title><published>2026-10-09T18:57:43Z</published><link rel="self" href="https://www.blogger.com/api/1"/><link rel="alternate" href="https://blablachars.blogspot.com/2026/10/example.html"/></entry></feed>'''
rows=news.parse_feed(atom,blog,dt.datetime(2026,10,11,tzinfo=dt.timezone.utc))
assert len(rows)==1 and rows[0]['url'].startswith('https://blablachars.blogspot.com/2026/')
assert news.headline_key('Le Rafale : arrivée à Djibouti')==news.headline_key('LE RAFALE — ARRIVEE A DJIBOUTI')
items=[{'url':'https://example.test/duplicate','title':'LE RAFALE — ARRIVEE A DJIBOUTI'},{'url':'https://example.test/second','title':'Le Rafale : entraînement à Djibouti'},{'url':'https://example.test/third','title':'Un nouveau sous-marin'}]
selected,skipped=news.fresh_candidates(items,set(),{news.headline_key('Le Rafale : arrivée à Djibouti')},2)
assert len(selected)==2 and skipped==1 and selected[0]['title'].endswith('entraînement à Djibouti')
from news_images import absolute_image,POLICY
encoded=absolute_image('/photo/Le\u0301ger 105mm.jpg','https://forcesoperations.com/article')
assert '%CC%81' in encoded and '%20' in encoded and encoded.isascii()
assert absolute_image(encoded,'https://forcesoperations.com/article')==encoded
for source in sources:
 assert any(host==domain or host.endswith('.'+domain) for host in POLICY['publisherPermission']['articleHosts'] for domain in source['domains'])
print('Sources uniques, Atom Blogger, titres identiques filtrés, angles différents conservés et URL d’image accentuée : OK')
