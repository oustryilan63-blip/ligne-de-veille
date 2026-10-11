import json
import hashlib
from pathlib import Path
from news_images import find_article_image,POLICY
import importlib.util
spec=importlib.util.spec_from_file_location('news',Path(__file__).with_name('update-news.py'));news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
publisher_permission=POLICY.pop('publisherPermission',None)
photo='https://s7g10.scene7.com/is/image/ncia/test-photo'
item={'url':'https://www.nato.int/en/news-and-events/articles/news/test'}
def request_for(html):
    return lambda url,**kw: b'\xff\xd8\xfftest' if 'scene7.com' in url else html.encode()
html=f'<meta property="og:image" content="{photo}"><img src="{photo}" data-credit="NATO" data-right="NATO has the sole copyright for these photos and a credit mention is required.">'
assert find_article_image(item,request_for(html),news.clean,news.clip)['credit']=='© NATO'
assert find_article_image(item,request_for(html.replace('data-credit="NATO"','data-credit="Ukraine Ministry of Defence"')),news.clean,news.clip) is None
assert find_article_image(item,request_for(html.replace('og:image" content="'+photo,'og:image" content="https://s7g10.scene7.com/is/image/ncia/different-main')),news.clean,news.clip) is None,'Une photo secondaire ne remplace pas la principale'
asset,grant=next(iter(POLICY['explicitPermissions'].items()))
original_hash=grant['sha256'];grant['sha256']=hashlib.sha256(b'\xff\xd8\xfftest').hexdigest()
allowed={'url':grant['firstArticleUrl']}
get=lambda url,**kw: b'\xff\xd8\xfftest' if url==asset else f'<meta property="og:image" content="{asset}">'.encode()
assert find_article_image(allowed,get,news.clean,news.clip)['provider']=='specific-permission'
wrong=lambda url,**kw: b'\xff\xd8\xfftest' if url==asset else b'<meta property="og:image" content="https://www.opex360.com/wp-content/uploads/another-photo.jpg">'
assert find_article_image(allowed,wrong,news.clean,news.clip) is None,'La permission ne couvre pas les autres images de cet éditeur'
modified=lambda url,**kw: b'\xff\xd8\xffCHANGED' if url==asset else f'<meta property="og:image" content="{asset}">'.encode()
assert find_article_image(allowed,modified,news.clean,news.clip) is None,'Un fichier changé n’est pas une photo autorisée automatiquement'
grant['sha256']=original_hash
lead='https://www.opex360.com/wp-content/uploads/example.jpg';i={'url':'https://www.opex360.com/example/'}
obj={'@type':'ImageObject','contentUrl':lead,'license':'https://creativecommons.org/licenses/by/4.0/','creator':{'name':'Photographe exemple'}}
def cc_request(o):
    body=f'<meta property="og:image" content="{lead}"><script type="application/ld+json">'+json.dumps(o)+'</script>'
    return lambda url,**kw: b'\xff\xd8\xfftest' if url==lead else body.encode()
assert find_article_image(i,cc_request(obj),news.clean,news.clip)['provider']=='individual-cc'
assert find_article_image(i,cc_request({**obj,'@type':'Article'}),news.clean,news.clip) is None
assert find_article_image(i,cc_request({**obj,'contentUrl':'https://www.opex360.com/unrelated.jpg'}),news.clean,news.clip) is None
assert find_article_image(i,cc_request({**obj,'license':'https://creativecommons.org/licenses/by-nc/4.0/'}),news.clean,news.clip) is None
POLICY['publisherPermission']=publisher_permission
allowed={'url':'https://www.opex360.com/2026/10/11/example/','title':'Exemple'}
main='https://www.opex360.com/wp-content/uploads/reactor.jpg'
body=f'<meta property="og:image" content="{main}"><img src="{main}" width="600" height="400"><p>Photo : General Atomics</p>'
def permitted_request(url,**kw):return b'\xff\xd8\xfftest' if url==main else body.encode()
image=find_article_image(allowed,permitted_request,news.clean,news.clip)
assert image['provider']=='publisher-permission' and image['credit']=='General Atomics'
assert image['assetUrl']==main and image['permissionConfirmedAt']==publisher_permission['confirmedAt']
for unwanted in ['https://www.opex360.com/logo.jpg','https://unrelated.example/photo.jpg']:
    get=lambda url,**kw: f'<meta property="og:image" content="{unwanted}"><img src="{main}">'.encode()
    assert find_article_image(allowed,get,news.clean,news.clip) is None
no_main=lambda url,**kw:f'<img src="{main}"><footer>© Éditeur</footer>'.encode()
assert find_article_image(allowed,no_main,news.clean,news.clip) is None,'Pas de remplacement par une image secondaire'
unknown={'url':'https://unknown.example/article','title':'Source non configurée'}
assert find_article_image(unknown,permitted_request,news.clean,news.clip) is None
print('Licences individuelles, autorisations confirmées, crédits conservés, logos et images secondaires exclus : OK')
