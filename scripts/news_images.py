"""Real article images only. A publisher credit alone never becomes a licence."""
import datetime as dt
import json
import hashlib
import re
import urllib.parse
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path

POLICY = json.loads(Path(__file__).with_name('news-image-policy.json').read_text(encoding='utf-8'))
VOID = {'img','meta','link','source','br','hr','input','area','base','embed','param','track','wbr','col'}

class Node:
    def __init__(self, tag='', attrs=None, parent=None):
        self.tag=tag; self.attrs=attrs or {}; self.parent=parent; self.children=[]; self.parts=[]
    def text(self):
        return ' '.join(' '.join(self.parts).split())

class ArticleHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root=Node('root'); self.stack=[self.root]; self.images=[]; self.metas={}; self.structured=[]; self.script=None
    def handle_starttag(self,tag,attrs):
        values=dict(attrs)
        if tag=='script':
            self.script=[] if values.get('type')=='application/ld+json' else False
            return
        if tag=='style':self.script=False;return
        if self.script is not None:return
        n=Node(tag,values,self.stack[-1]);self.stack[-1].children.append(n)
        if tag=='img':self.images.append(n)
        if tag=='meta':self.metas[values.get('property') or values.get('name') or '']=values.get('content','')
        if tag not in VOID:self.stack.append(n)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        if tag in ('script','style'):
            if isinstance(self.script,list):
                try:self.structured.append(json.loads(''.join(self.script)))
                except (ValueError,TypeError):pass
            self.script=None;return
        if self.script is not None:return
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,text):
        if self.script is not None:
            if isinstance(self.script,list):self.script.append(text)
            return
        for n in self.stack:n.parts.append(text)

def page(data):
    parser=ArticleHTML();parser.feed(data.decode('utf-8',errors='replace'));return parser

def secure(url,hosts,prefixes=('/',)):
    try:
        p=urllib.parse.urlsplit(url)
        return p.scheme=='https' and p.hostname in hosts and not p.username and not p.password and p.port in (None,443) and any(p.path.startswith(s) for s in prefixes)
    except (ValueError,TypeError):return False

def base_asset(url):
    p=urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((p.scheme,p.netloc,p.path,'',''))

def wordpress_asset(url):
    p=urllib.parse.urlsplit(url)
    path=re.sub(r'-(?:\d+x\d+|scaled)(?=\.(?:jpg|jpeg|png|webp)$)','',p.path,flags=re.I)
    return urllib.parse.urlunsplit((p.scheme,p.netloc,path,'',''))

def cc_url(raw):
    if not isinstance(raw,str):return None
    p=urllib.parse.urlsplit(raw)
    if p.scheme not in ('http','https') or p.hostname!='creativecommons.org' or p.username or p.password:return None
    path=p.path if p.path.endswith('/') else p.path+'/'
    return 'https://creativecommons.org'+path if path in POLICY['creativeCommonsPaths'] else None

def record(item,src,alt,credit,license_label,license_url,provider,rights_url,evidence):
    return {'src':src,'kind':'article','alt':alt[:240] or 'Image publiée avec cet article.','credit':credit,'license':license_label,'licenseUrl':license_url,'sourceUrl':item['url'],'provider':provider,'rightsUrl':rights_url,'evidence':evidence,'checkedAt':dt.datetime.now(dt.timezone.utc).date().isoformat()}

def raster_bytes(data):
    return data.startswith(b'\xff\xd8\xff') or data.startswith(b'\x89PNG\r\n\x1a\n') or (data[:4]==b'RIFF' and data[8:12]==b'WEBP')

def jpeg_checked(src,request):
    return raster_bytes(request(src,max_bytes=2_000_000))

def gov_image(item,request,clean,clip):
    p=urllib.parse.urlsplit(item['url'])
    if not p.path.startswith('/government/news/'):return None
    details=json.loads(request('https://www.gov.uk/api/content'+p.path)).get('details',{})
    lead=next((i for i in details.get('images',[]) if i.get('type')=='lead' and i.get('content_type') in ('image/jpeg','image/png','image/webp')),None)
    if not lead:return None
    rights=clean(str(details.get('body',''))+' '+str(lead.get('caption',''))).lower()
    neutral=re.sub(r'(?:©\s*)?crown copyright|©\s*crown','',rights)
    if any(mark in neutral for mark in ('copyright','©','getty','reuters','associated press','all rights reserved','shutterstock','adobe stock','photo: ap')):return None
    src=lead.get('sources',{}).get('s300','');rule=POLICY['providers']['gov-uk']
    if not secure(src,rule['imageHosts'],rule['imagePathPrefixes']) or not jpeg_checked(src,request):return None
    return record(item,src,clip(clean(lead.get('caption')) or 'Image fournie avec cette publication par le ministère britannique de la Défense.',240),'Ministry of Defence / Crown copyright',rule['license'],rule['licenseUrl'],'gov-uk',item['url'],'official-editorial-lead')

def nato_image(item,request,clean,clip):
    if not urllib.parse.urlsplit(item['url']).path.startswith('/en/news-and-events/articles/'):return None
    article=page(request(item['url'],max_bytes=3_000_000));rule=POLICY['providers']['nato']
    primary=base_asset(article.metas.get('og:image',''))
    for node in article.images:
        a=node.attrs;src=a.get('src','');rights=clean(a.get('data-right','')).lower()
        if primary and base_asset(src)!=primary:continue
        if secure(src,rule['imageHosts'],rule['imagePathPrefixes']) and clean(a.get('data-credit','')).upper()=='NATO' and 'nato has the sole copyright' in rights:
            thumbnail=base_asset(src)+'?fmt=jpeg&wid=480&qlt=85'
            if jpeg_checked(thumbnail,request):return record(item,thumbnail,clip(clean(a.get('alt') or a.get('data-description')),240),'© NATO',rule['license'],rule['licenseUrl'],'nato',item['url'],'explicit-image-rights')
    # A verified individual asset may be reused by later articles. Confirm that the
    # exact image is still present in this article and in its official rights page.
    present={primary} if primary else {base_asset(n.attrs.get('src','')) for n in article.images if n.attrs.get('src')}
    for asset,proof in POLICY['knownNatoMedia'].items():
        if asset not in present:continue
        gallery=cached_page(proof['rightsUrl'],request)
        if asset not in {base_asset(n.attrs.get('src','')) for n in gallery.images if n.attrs.get('src')}:continue
        if 'NATO has the sole copyright' not in gallery.root.text() or not re.search(r'Credit:\s*NATO\b',gallery.root.text()):continue
        thumbnail=asset+'?fmt=jpeg&wid=480&qlt=85'
        if jpeg_checked(thumbnail,request):return record(item,thumbnail,proof['alt'],proof['credit'],rule['license'],rule['licenseUrl'],'nato',proof['rightsUrl'],'verified-individual-asset')
    return None

@lru_cache(maxsize=8)
def cached_page(url,request):
    return page(request(url,max_bytes=3_000_000))

def json_objects(value):
    if isinstance(value,dict):
        yield value
        for child in value.values():yield from json_objects(child)
    elif isinstance(value,list):
        for child in value:yield from json_objects(child)

def individual_image(item,request,clean,clip):
    host=urllib.parse.urlsplit(item['url']).hostname
    if host not in POLICY['individualLicenseHosts']:return None
    article=page(request(item['url'],max_bytes=3_000_000));lead=article.metas.get('og:image','')
    image_hosts=[host]+POLICY['individualImageHosts']
    if not secure(lead,image_hosts) or re.search(r'logo|avatar|placeholder|site-default',urllib.parse.urlsplit(lead).path,re.I):return None
    # Only a licence attached to this exact ImageObject is accepted. A footer,
    # article licence or credit such as Armée de Terre is insufficient.
    for value in article.structured:
        for obj in json_objects(value):
            types=obj.get('@type',[]);types=[types] if isinstance(types,str) else types
            if 'ImageObject' not in types or obj.get('contentUrl',obj.get('url'))!=lead:continue
            license_url=cc_url(obj.get('license'))
            owner=obj.get('creator') or obj.get('copyrightHolder')
            credit=obj.get('creditText') or (owner.get('name') if isinstance(owner,dict) else owner)
            if not license_url or not isinstance(credit,str) or not credit.strip():continue
            credit=clean(credit)
            if len(credit)>240 or any(s in credit.casefold() for s in ('getty','reuters','shutterstock','adobe stock','sipa')):continue
            if not jpeg_checked(lead,request):continue
            label='CC0' if '/zero/' in license_url else 'Domaine public' if '/mark/' in license_url else 'Creative Commons'
            return record(item,lead,clip(clean(obj.get('caption') or article.metas.get('og:image:alt')),240),credit,label,license_url,'individual-cc',item['url'],'image-specific-license')
    return None

def specific_permission_image(item,request,clean,clip):
    host=urllib.parse.urlsplit(item['url']).hostname
    permitted={src:grant for src,grant in POLICY.get('explicitPermissions',{}).items() if host in grant['articleHosts']}
    if not permitted:return None
    article=page(request(item['url'],max_bytes=3_000_000));primary=article.metas.get('og:image','')
    for src,grant in permitted.items():
        if wordpress_asset(src)!=wordpress_asset(primary):continue
        if not secure(primary,[host]):return None
        data=request(src,max_bytes=2_000_000)
        digest=hashlib.sha256(data).hexdigest()
        if not raster_bytes(data) or digest!=grant.get('sha256'):return None
        image=record(item,src,grant['alt'],grant['credit'],grant['license'],grant['licenseUrl'],'specific-permission',item['url'],'user-confirmed-specific-photo')
        image['assetUrl']=primary
        image['sha256']=digest
        return image
    return None

def verified_asset_image(item,request,clean,clip):
    host=urllib.parse.urlsplit(item['url']).hostname
    known={src:proof for src,proof in POLICY.get('verifiedLicensedAssets',{}).items() if host in proof['articleHosts']}
    if not known:return None
    article=page(request(item['url'],max_bytes=3_000_000));primary=article.metas.get('og:image','')
    for src,proof in known.items():
        if primary!=src or not secure(src,[host]):continue
        data=request(src,max_bytes=2_000_000)
        digest=hashlib.sha256(data).hexdigest()
        if not raster_bytes(data) or digest!=proof['sha256']:continue
        image=record(item,src,proof['alt'],proof['credit'],proof['license'],proof['licenseUrl'],'verified-asset',proof['rightsUrl'],'verified-source-license')
        image['assetUrl']=primary;image['sha256']=digest
        return image
    return None

def nodes(root):
    yield root
    for child in root.children:yield from nodes(child)

def absolute_image(raw,article_url):
    value=urllib.parse.urljoin(article_url,raw or '')
    p=urllib.parse.urlsplit(value)
    if p.scheme=='http':value=urllib.parse.urlunsplit(('https',p.netloc,p.path,p.query,p.fragment))
    return value

def publisher_permission_image(item,request,clean,clip):
    permission=POLICY.get('publisherPermission',{})
    host=urllib.parse.urlsplit(item['url']).hostname
    if host not in permission.get('articleHosts',[]):return None
    article=page(request(item['url'],max_bytes=3_000_000))
    primary=absolute_image(article.metas.get('og:image') or article.metas.get('twitter:image'),item['url'])
    # A sharing logo or arbitrary inline photo must not become the article image.
    if not secure(primary,permission['imageHosts']) or re.search(r'logo|avatar|placeholder|site-default|default[-_]image|social[-_]share',urllib.parse.urlsplit(primary).path,re.I):return None
    if primary==item['url']:return None
    matches=[n for n in article.images if wordpress_asset(absolute_image(n.attrs.get('src') or n.attrs.get('data-src'),item['url']))==wordpress_asset(primary)]
    image_node=next((n for n in matches if base_asset(absolute_image(n.attrs.get('src') or n.attrs.get('data-src'),item['url']))==base_asset(primary)),None)
    candidates=[]
    if image_node:
        for candidate in (image_node.attrs.get('srcset') or image_node.attrs.get('data-srcset') or '').split(','):
            parts=candidate.strip().rsplit(' ',1)
            if len(parts)!=2 or not re.fullmatch(r'\d+w',parts[1]):continue
            src=absolute_image(parts[0],item['url']);width=int(parts[1][:-1])
            # Keep the editor's exact framing, excluding square card thumbnails.
            dimensions=re.search(r'-(\d+)x(\d+)\.[a-z]+$',urllib.parse.urlsplit(src).path,re.I)
            try:ratio=int(image_node.attrs['width'])/int(image_node.attrs['height'])
            except (KeyError,ValueError,ZeroDivisionError):ratio=None
            if dimensions and ratio and abs(int(dimensions[1])/int(dimensions[2])-ratio)>0.04:continue
            if 450<=width<=1100 and wordpress_asset(src)==wordpress_asset(primary) and secure(src,permission['imageHosts']):candidates.append((width,src))
    src=min(candidates)[1] if candidates else primary
    if urllib.parse.urlsplit(src).hostname=='s7g10.scene7.com':src=base_asset(src)+'?fmt=jpeg&wid=600&qlt=85'
    if not jpeg_checked(src,request):return None
    credit=clean(image_node.attrs.get('data-credit','')) if image_node else ''
    if not credit:
        for n in nodes(article.root):
            text=n.text()
            if n.tag not in ('p','figcaption','small','span','em') or len(text)>300:continue
            found=re.match(r'^(?:Photo(?:graphie)?s?|Cr[ée]dits?)\s*(?::|©)\s*(.+)',text,re.I)
            if found and found[1].strip():credit=clean(found[1]);break
    if not credit:
        for value in article.structured:
            for obj in json_objects(value):
                if obj.get('@type')!='ImageObject' or absolute_image(obj.get('contentUrl') or obj.get('url'),item['url'])!=primary:continue
                owner=obj.get('creator') or obj.get('copyrightHolder')
                candidate=obj.get('creditText') or (owner.get('name') if isinstance(owner,dict) else owner)
                if isinstance(candidate,str):credit=clean(candidate);break
    credit=clip(credit or 'Crédit non indiqué par l’éditeur',240)
    alt=clean(image_node.attrs.get('alt') or image_node.attrs.get('title')) if image_node else ''
    image=record(item,src,clip(alt or 'Image principale de l’article « '+item['title']+' ».',240),credit,permission['license'],permission['licenseUrl'],'publisher-permission',item['url'],'user-confirmed-publisher-permission')
    image['assetUrl']=primary;image['permissionConfirmedAt']=permission['confirmedAt']
    return image

def find_article_image(item,request,clean,clip):
    host=urllib.parse.urlsplit(item['url']).hostname
    if not secure(item['url'],[host] if host else []):return None
    original_request=request
    @lru_cache(maxsize=8)
    def request(url,max_bytes=2_000_000):return original_request(url,max_bytes=max_bytes)
    if host in POLICY['providers']['gov-uk']['articleHosts']:
        image=gov_image(item,request,clean,clip)
        if image:return image
    if host in POLICY['providers']['nato']['articleHosts']:
        image=nato_image(item,request,clean,clip)
        if image:return image
    licensed=verified_asset_image(item,request,clean,clip)
    if licensed:return licensed
    if any(host in grant['articleHosts'] for grant in POLICY.get('explicitPermissions',{}).values()):
        permitted=specific_permission_image(item,request,clean,clip)
        if permitted:return permitted
    image=individual_image(item,request,clean,clip)
    return image or publisher_permission_image(item,request,clean,clip)
