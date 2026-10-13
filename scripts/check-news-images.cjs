const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{createDOM}=require('./feature-test-dom.cjs');
const root=path.resolve(__dirname,'..'),document=createDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')),c={window:{},document,URL,Intl,console};
for(const file of ['engins-data.js','catalogue-tools.js','actualites.js','news-tools.js','news-view.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const tools=c.window.RADAR_NEWS_TOOLS,items=c.window.LDV_NEWS.items,photos=items.filter(i=>i.image?.kind==='article');
assert.equal(tools.image({title:'Rafale français'}),null,'Aucun remplacement par une photo du jeu');
assert.equal(tools.image({title:'Diplomatie au sommet'}),null,'Aucune illustration générique');
assert.equal(tools.image({image:{kind:'illustration',src:'assets/actualites/terre.webp'}}),null);
assert.equal(items.filter(i=>/conflits/i.test(i.source)&&i.sourceExcerpt).length,0);
assert.ok(tools.themes({title:'Sommet et sanctions commerciales'}).includes('Géopolitique'));
assert.ok(tools.themes({title:'Ormuz, du baril à l’assiette',themes:['Géopolitique']}).includes('Géopolitique'));
assert.ok(tools.themes({title:'Relations',publisherCategories:['Moyen-Orient']}).includes('Géopolitique'));
assert.ok(!tools.themes({title:'Nouveau char de combat'}).includes('Géopolitique'));
for(const item of photos){assert.equal(item.image.sourceUrl,item.url);assert.ok(item.image.credit);assert.ok(item.image.licenseUrl)}
const rafale=items.find(i=>i.url.includes('confirme-larrive-du-rafale')),xi=items.find(i=>i.url.includes('xi-jinping-un-costume'));
assert.match(rafale.image.src,/chammal-20200625\.jpg$/);assert.match(xi.image.src,/SIPA_00679789_000002/);assert.equal(xi.image.credit,'© Robin Utrecht / SIPA');
c.window.RADAR_NEWS_VIEW.mount(c.window.LDV_NEWS,{dateLabel:d=>d,monthFormatter:new Intl.DateTimeFormat('fr',{month:'long'}),shortDateFormatter:new Intl.DateTimeFormat('fr'),parsedDate:d=>new Date(d)});
async function test(){
 const grid=document.getElementById('news-grid'),archive=document.getElementById('archive-list'),details=document.getElementById('archive-details'),filter=document.getElementById('news-photos-only');
 assert.equal(grid.children.length,4);assert.equal(archive.children.length,0);
 const geo=document.getElementById('news-geopolitics'),all=document.getElementById('news-all-themes'),theme=document.getElementById('news-theme-filter');
 await geo.click();assert.equal(theme.value,'Géopolitique');assert.equal(geo.getAttribute('aria-pressed'),'true');assert.ok(grid.children.length>0);
 for(const entry of grid.children)assert.equal(entry.querySelector('.news-theme-tag').textContent,'Géopolitique');
 await all.click();assert.equal(theme.value,'');assert.equal(grid.children.length,4);
 for(const entry of grid.children)if(!entry.querySelector('img'))assert.ok(entry.querySelector('.news-card').classList.contains('news-card-text-only'));
 filter.checked=true;await filter.fire('change');assert.equal(grid.children.length,Math.min(12,photos.length));
 for(const entry of grid.children){const image=entry.querySelector('img');assert.ok(image);assert.equal(image.width,300);assert.equal(image.height,190);assert.equal(image.loading,'lazy');assert.equal(image.decoding,'async');assert.equal(entry.querySelector('.news-image-label').textContent,'Image de l’article');assert.ok(entry.querySelector('.news-image-credit'))}
 const first=grid.children[0],title=first.querySelector('strong').textContent;await first.querySelector('img').fire('error');assert.equal(first.querySelector('img'),null);assert.equal(first.querySelector('.news-image-credit'),null);assert.equal(first.querySelector('strong').textContent,title);assert.ok(first.querySelector('.news-card').classList.contains('news-card-text-only'));
 details.open=true;await details.fire('toggle');assert.ok(archive.children.length>0);
 document.getElementById('news-search').value='introuvable-z999';await document.getElementById('news-search').fire('input');assert.equal(grid.children.length,0);assert.equal(archive.children.length,0);
 await document.getElementById('news-reset').click();assert.equal(filter.checked,false);assert.equal(grid.children.length,4);assert.ok(archive.children.length>0);
 const sample=createDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'));c.document=sample;
 c.window.RADAR_NEWS_VIEW.mount({items:[
  {title:'Un extrait disponible',date:'2026-10-13',source:'Source officielle',sourceType:'Officiel',url:'https://example.org/extrait',autoCollected:true,sourceExcerpt:{text:'Le texte court transmis par la source décrit directement cette publication.'}},
  {title:'Un résumé éditorial',date:'2026-10-13',source:'Source officielle',sourceType:'Officiel',url:'https://example.org/resume',summary:'Un résumé déjà rédigé et vérifié.'},
  {title:'Une publication sans extrait',date:'2026-10-13',source:'Source officielle',sourceType:'Officiel',url:'https://example.org/sans-extrait',autoCollected:true,summary:'Publication repérée dans le flux.'}
 ]},{dateLabel:d=>d,monthFormatter:new Intl.DateTimeFormat('fr',{month:'long'}),shortDateFormatter:new Intl.DateTimeFormat('fr'),parsedDate:d=>new Date(d)});
 const samples=sample.getElementById('news-grid').children;
 assert.match(samples[0].querySelector('small').textContent,/texte court transmis/);
 assert.equal(samples[1].querySelector('small').textContent,'Un résumé déjà rédigé et vérifié.');
 assert.equal(samples[2].querySelector('small'),null,'Aucun faux résumé quand le flux ne fournit pas de texte');
 assert.match(samples[2].querySelector('.news-read').textContent,/Lire l’article chez Source officielle/);
 console.log(`${photos.length} photos d’origine, deux exemples exacts, aucun visuel de substitution, filtre photo, erreurs et archives : OK.`);
}test().catch(e=>{console.error(e);process.exitCode=1});
