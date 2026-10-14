const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),c={window:{},Intl};
for(const f of ['engins-data.js','histoire-data.js','histoire-technique.js','discovery-tools.js','catalogue-tools.js','news-tools.js','decouverte-data.js'])vm.runInNewContext(read(f),c,{filename:f});
const {LDV_ENGINS:E,LDV_HISTOIRE:H,LDV_TECHNIQUE:T,RADAR_DISCOVERY:D,RADAR_DISCOVERY_CONTENT:C,RADAR_NEWS_TOOLS:N}=c.window;
assert.equal(new Set(E.map(D.profileURL)).size,E.length);
for(const [i,item]of E.entries()){
 assert.match(D.profileURL(item),/^fiche-[a-z0-9-]+\.html$/);assert.ok(D.description(item).length<=165);
 const questions=D.essentials(item,H[i],T[i]);assert.equal(questions.length,4);assert.ok(questions.every(q=>q.answer&&!q.answer.includes('undefined')));
 for(const q of questions)if(q.source)assert.equal(new URL(q.source).protocol,'https:');
}
const fakeDrone={title:'Drone Volt présente le drone logistique Hercules 100',sourceExcerpt:{text:'Un drone de transport de charges.'}};
assert.ok(!N.related(fakeDrone).some(x=>x.e.name==='C-130 Hercules'));
assert.ok(N.related({title:'Les C-130 Hercules de Lockheed'}).some(x=>x.e.name==='C-130 Hercules'));
assert.ok(!N.related({title:'Atlas géopolitique des crises'}).some(x=>x.e.name==='A400M Atlas'));
const items=[{type:'engin',title:'Rafale',description:'Avion français',keywords:'France Dassault'},{type:'dossier',title:'Reconnaître les avions',description:'Mirage et Rafale'},{type:'actualite',title:'Une livraison',description:'France'}];
assert.equal(D.rank(items,'rafale')[0].title,'Rafale');assert.equal(D.rank(items,'francais').length,1);assert.equal(D.rank(items,'Rafale','dossier').length,1);assert.equal(D.rank(items,'<script>').length,0);assert.equal(D.rank(items,'introuvable').length,0);
assert.equal(D.rank([{type:'engin',title:'F-35 Lightning II'}],'F35')[0].title,'F-35 Lightning II');
assert.equal(D.rank(items,'---').length,0);
for(const g of C.guides){assert.ok(g.sources.length>=2);assert.ok(g.sections.every(s=>s.sources.length&&s.sources.every(i=>g.sources[i])));assert.ok(g.engins.every(i=>E[i]));}
for(const p of C.comparisons){assert.notEqual(p.a,p.b);assert.equal(E[p.a].category,E[p.b].category);assert.ok(T[p.a].variant&&T[p.b].variant);assert.ok(p.sources.length>=2)}
const output=path.join(root,'_site-decouverte');
if(fs.existsSync(path.join(output,'sitemap.xml'))){
 const index=JSON.parse(fs.readFileSync(path.join(output,'recherche-index.json'),'utf8'));
 for(const file of ['comprendre.html','comprendre-sna-snle.html','recherche.html']){
  const html=fs.readFileSync(path.join(output,file),'utf8');
  assert.ok(!/href="#(?:actualites|archives|methode)"/.test(html),'Lien de pied de page local invalide : '+file);
 }
 assert.equal(index.items.filter(i=>i.type==='engin').length,E.length);assert.equal(index.items.filter(i=>i.type==='dossier').length,4);assert.equal(index.items.filter(i=>i.type==='jeu').length,8);
 for(const [i,e]of E.entries()){
  const html=fs.readFileSync(path.join(output,D.profileURL(e)),'utf8');
  assert.ok(html.includes('data-engine-index="'+i+'"'));assert.ok(html.includes('Repères en bref'));assert.ok(html.includes('class="history-story-copy"'));assert.ok(!html.includes('class="history-story-chapter"'));assert.ok(html.includes('class="history-story-sources"'));assert.ok(html.includes('<h1 class="history-name">'));
  assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('name="twitter:card"'));
  assert.ok(html.includes('href="recherche.html"'));assert.ok(html.includes('href="comprendre.html"'));
 }
 for(const p of C.comparisons){const html=fs.readFileSync(path.join(output,'comparatif-'+p.slug+'.html'),'utf8');assert.ok(html.includes('data-compare-a="'+p.a+'"'));assert.ok(html.includes(T[p.a].variant));assert.ok(html.includes(T[p.b].variant));}
 const sitemap=fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');assert.ok(sitemap.includes('fiche-rafale.html'));assert.ok(sitemap.includes('comprendre-sna-snle.html'));assert.ok(!sitemap.includes('recherche.html'));
}
console.log('162 adresses et encadrés, index multi-rubriques, recherche accentuée et vide, 4 dossiers sourcés, 3 comparaisons et régression Hercules : OK.');
if(fs.existsSync(path.join(output,'recherche.html')))(async()=>{
 const {createDOM}=require('./feature-test-dom.cjs');
 const document=createDOM(fs.readFileSync(path.join(output,'recherche.html'),'utf8'));
 const buttons=['all','engin','dossier','actualite','jeu','comparatif'].map(type=>{const b=document.createElement('button');b.dataset.searchType=type;document.body.append(b);return b});
 let fail=false;const search={window:{RADAR_DISCOVERY:D},document,URLSearchParams,Object,console,setTimeout,clearTimeout,location:{search:'?q=rafale',href:'https://example.test/recherche.html'},history:{replaceState(){}},fetch:async()=>{if(fail)throw Error('Réseau');return {ok:true,json:async()=>({items})}}};
 vm.runInNewContext(read('recherche.js'),search);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(document.getElementById('global-search-results').children.length,2);
 await buttons.find(b=>b.dataset.searchType==='dossier').click();assert.equal(document.getElementById('global-search-results').children.length,1);
 const field=document.getElementById('global-query');field.value='<script>alert(1)</script>';await document.getElementById('global-search-form').fire('submit');assert.equal(document.getElementById('global-search-results').children.length,0);
 fail=true;await document.getElementById('global-search-retry').click();assert.equal(document.getElementById('global-search-retry').hidden,false);
 fail=false;field.value='';await document.getElementById('global-search-retry').click();assert.equal(document.getElementById('global-search-retry').hidden,true);
 const compareDoc=createDOM(fs.readFileSync(path.join(output,'comparatif-rafale-f35.html'),'utf8'));compareDoc.body.dataset.compareA='9';compareDoc.body.dataset.compareB='3';
 const compare={window:{...c.window},document:compareDoc,URL,URLSearchParams,location:{search:'',href:'https://example.test/comparatif-rafale-f35.html'},history:{replaceState(){}},navigator:{clipboard:{writeText:async()=>{}}},console};
 vm.runInNewContext(read('comparateur.js'),compare);assert.match(compareDoc.getElementById('compare-editorial').textContent,/Rafale et F-35/);assert.equal(compareDoc.getElementById('compare-a').value,'9');assert.equal(compareDoc.getElementById('compare-b').value,'3');
 compareDoc.getElementById('compare-b').value='30';await compareDoc.getElementById('compare-b').fire('change');assert.equal(compareDoc.getElementById('compare-editorial').hidden,true);
 console.log('Recherche exécutée : requête, filtre, absence, panne et reprise ; comparatif préparé et changement de sélection : OK.');
})().catch(e=>{console.error(e);process.exitCode=1});
