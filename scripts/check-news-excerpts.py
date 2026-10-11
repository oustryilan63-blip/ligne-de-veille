import importlib.util
from pathlib import Path
import xml.etree.ElementTree as ET
import datetime as dt
spec=importlib.util.spec_from_file_location('news',Path(__file__).with_name('update-news.py'))
news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
entry=ET.fromstring('<item><description>&lt;p&gt;'+ ' '.join('mot'+str(i) for i in range(40))+'&lt;/p&gt;&lt;script&gt;secret&lt;/script&gt;</description></item>')
excerpt=news.source_excerpt(entry)
assert len(excerpt['text'].split())==20
assert 'secret' not in excerpt['text'] and '<' not in excerpt['text']
assert news.source_excerpt(ET.fromstring('<item><description>Très court</description></item>')) is None
source={'name':'Exemple','type':'Source officielle','language':'fr','domains':['example.org']}
rss=b'<rss><channel><item><title>Exemple valide</title><link>https://example.org/texte</link><pubDate>Sun, 11 Oct 2026 10:00:00 GMT</pubDate><description>Un extrait fourni directement par son editeur dans le flux officiel.</description></item><item><title>Hors domaine</title><link>https://foreign.org/texte</link><pubDate>Sun, 11 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>'
rows=news.parse_feed(rss,source,dt.datetime(2026,10,11,12,tzinfo=dt.timezone.utc))
assert len(rows)==1 and rows[0]['sourceExcerpt']['kind']=='feed-excerpt'
print('Extraits RSS courts et attribues, HTML neutralise, absence de texte geree, domaines verifies : OK')
