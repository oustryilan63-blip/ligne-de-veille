const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{createDOM}=require('./feature-test-dom.cjs');
const root=path.resolve(__dirname,'..'),document=createDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')),c={window:{},document,URL,Intl,console};
for(const file of ['engins-data.js','catalogue-tools.js','actualites.js','news-tools.js','news-view.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const tools=c.window.RADAR_NEWS_TOOLS;
assert.equal(tools.image({title:'Rafale français',url:'https://example.org'}).kind,'illustration');assert.match(tools.image({title:'Rafale français'}).src,/rafale/);
assert.equal(tools.image({title:'Diplomatie au sommet'}).src,'assets/actualites/terre.webp');
assert.equal(c.window.LDV_NEWS.items.filter(i=>/conflits/i.test(i.source)&&i.sourceExcerpt).length,0);
for(const item of c.window.LDV_NEWS.items.filter(i=>i.image)){assert.equal(item.image.kind,'article');assert.equal(new URL(item.image.src).hostname,'assets.publishing.service.gov.uk');assert.equal(item.image.sourceUrl,item.url);assert.equal(item.image.license,'OGL v3')}
const params={dateLabel:d=>d,monthFormatter:new Intl.DateTimeFormat('fr',{month:'long'}),shortDateFormatter:new Intl.DateTimeFormat('fr'),parsedDate:d=>new Date(d)};
c.window.RADAR_NEWS_VIEW.mount(c.window.LDV_NEWS,params);
async function test(){
 const grid=document.getElementById('news-grid'),archive=document.getElementById('archive-list'),details=document.getElementById('archive-details');
 assert.equal(grid.children.length,4);assert.equal(archive.children.length,0,'Archives non construites avant ouverture');
 for(const entry of grid.children){const image=entry.querySelector('img');assert.equal(image.width,300);assert.equal(image.height,190);assert.equal(image.loading,'lazy');assert.equal(image.decoding,'async');assert.ok(entry.querySelector('.news-image-credit'));}
 const first=grid.children[0];await first.querySelector('img').fire('error');assert.equal(first.querySelector('img').hidden,true);assert.equal(first.querySelector('.news-image-credit').hidden,true);assert.equal(first.querySelector('.news-image-label').textContent,'Visuel indisponible');
 details.open=true;await details.fire('toggle');assert.ok(archive.children.length>0);
 document.getElementById('news-search').value='introuvable-z999';await document.getElementById('news-search').fire('input');assert.equal(grid.children.length,0);assert.equal(archive.children.length,0);
 await document.getElementById('news-reset').click();assert.equal(grid.children.length,4);assert.ok(archive.children.length>0);
 console.log('Photos officielles et illustrations distinctes, crédits, dimensions, erreurs d’image, archives différées et filtres : OK.');
}test().catch(e=>{console.error(e);process.exitCode=1});
