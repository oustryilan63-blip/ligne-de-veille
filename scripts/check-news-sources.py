import datetime as dt,json,importlib.util
from pathlib import Path
spec=importlib.util.spec_from_file_location('news',Path(__file__).with_name('update-news.py'));news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
sources=json.loads(Path(__file__).with_name('news-sources.json').read_text(encoding='utf-8'))
assert len({s['id'] for s in sources})==len(sources)
assert {'opexnews','blablachars','fob','navalnews','forum-militaire'}<={s['id'] for s in sources}
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
 assert news.canonical(source['url'],source).startswith('https://')
 assert source['language'] in ('fr','en') and 1<=source.get('maxItems',2)<=5

# Following a feed does not by itself grant permission to republish its photos.
forum=next(s for s in sources if s['id']=='forum-militaire')
assert forum['url']=='https://www.forum-militaire.fr/feed/' and forum['maxItems']==2
rss=b'''<rss><channel>
<item><title>Defense &amp; industrie</title><link>https://www.forum-militaire.fr/2026/10/10/defense/?utm_source=rss</link><pubDate>Sat, 10 Oct 2026 10:00:00 +0200</pubDate><category>Marine</category><description>Un court extrait de l'editeur presente le programme et son contexte industriel.</description></item>
<item><title>Lien externe</title><link>https://autre-domaine.test/article/</link><pubDate>Sat, 10 Oct 2026 10:00:00 +0200</pubDate></item>
</channel></rss>'''
rows=news.parse_feed(rss,forum,dt.datetime(2026,10,11,tzinfo=dt.timezone.utc))
assert len(rows)==1 and rows[0]['source']=='Forum Militaire'
assert rows[0]['title']=='Defense & industrie' and rows[0]['publisherCategories']==['Marine']
assert rows[0]['url']=='https://www.forum-militaire.fr/2026/10/10/defense/'
attempted=[];original_image=news.article_image
try:
 news.article_image=lambda item:attempted.append(item['url'])
 news.enrich_images(rows)
finally:
 news.article_image=original_image
assert not attempted and 'image' not in rows[0]
eu=next(s for s in sources if s['id']=='consilium')
rss=b'''<rss xmlns:a="http://www.w3.org/2005/Atom"><channel>
<item><title>EU-UK summit</title><link>https://www.consilium.europa.eu/en/press/press-releases/test-summit/</link><a:updated>2026-10-10T16:30:00Z</a:updated><category>Non-EU Western Europe</category></item>
<item><title>Sanctions</title><link>https://www.consilium.europa.eu/en/press/press-releases/test-sanctions/</link><a:updated>2026-10-10T15:30:00Z</a:updated><category>Sanctions</category></item>
<item><title>Local budget</title><link>https://www.consilium.europa.eu/en/press/press-releases/test-budget/</link><a:updated>2026-10-10T14:30:00Z</a:updated><category>Budget</category></item>
<item><title>Media advisory - summit</title><link>https://www.consilium.europa.eu/en/press/press-releases/test-advisory/</link><a:updated>2026-10-10T13:30:00Z</a:updated><category>Non-EU Western Europe</category></item>
</channel></rss>'''
rows=news.parse_feed(rss,eu,dt.datetime(2026,10,11,tzinfo=dt.timezone.utc))
assert len(rows)==2 and all(r['themes']==['Géopolitique'] and r['language']=='en' for r in rows)
areion=next(s for s in sources if s['id']=='areion')
assert news.relevant_entry('Ormuz', ['Magazine Les Grands Dossiers de Diplomatie'],areion)
assert not news.relevant_entry('Technique', ['Magazine DSI'],areion)
print('Sources uniques, Atom Blogger, titres identiques filtrés, angles différents conservés et URL d’image accentuée : OK')
print('Géopolitique : catégories internationales, dates Atom, quotas après sélection et annonces hors sujet exclues : OK')
print('Forum Militaire : flux configuré, dates RSS, catégories, domaines, quota et droits des photos préservés : OK')
