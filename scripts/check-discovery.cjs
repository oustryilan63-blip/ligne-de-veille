const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),c={window:{},Intl};
for(const f of ['engins-data.js','histoire-data.js','histoire-technique.js','histoire-chiffres.js','histoire-frises.js','histoire-photos-data.js','histoire-3d-data.js','discovery-tools.js','catalogue-tools.js','news-tools.js','decouverte-data.js'])vm.runInNewContext(read(f),c,{filename:f});
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
assert.equal(N.context({title:'Rafale F4 : une livraison'}).url,'variantes-rafale.html');
assert.equal(N.context({title:'Nouveaux drones de transport'}).url,'comprendre-familles-drones.html');
assert.equal(N.context({title:'Un sommet diplomatique sans thème documenté'}),null);
assert.equal(N.context({title:'Le transport commercial',publisherCategories:['Détroit d’Ormuz']}).url,'comprendre-detroits-routes-maritimes.html');
assert.equal(C.guides.length,21);assert.equal(new Set(C.guides.map(g=>g.slug)).size,C.guides.length);
for(const g of C.guides){
 assert.ok(g.sources.length>=2);assert.ok(g.sections.every(s=>s.sources.length&&s.sources.every(i=>g.sources[i])));assert.ok(g.engins.every(i=>E[i]));
 assert.ok(g.categories.length&&g.categories.every(tag=>C.categories.some(([id])=>tag===id)));
 assert.equal(g.quiz.length,3);for(const q of g.quiz){assert.equal(q.choices.length,3);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<3);assert.ok(q.explanation.length>30);}
 for(const source of g.sources)assert.equal(new URL(source.url).protocol,'https:');
 assert.ok(g.history?.paragraphs.length>=2);for(const p of g.history.paragraphs)assert.ok(p.text&&p.sources.length&&p.sources.every(i=>g.sources[i]));
 assert.equal(g.milestones.length,3);for(const m of g.milestones)assert.ok(m.date&&m.title&&m.text&&g.sources[m.source]);
 const prose=[...g.sections.map(s=>s.text),...g.history.paragraphs.map(p=>p.text)].join(' ');assert.ok(prose.split(/\s+/).length>=350,'Dossier trop peu développé : '+g.slug);
}
for(const e of E)for(const link of D.guideLinks(e))assert.ok(['variantes-rafale.html','variantes-leopard-2.html'].includes(link.url)||C.guides.some(g=>'comprendre-'+g.slug+'.html'===link.url),'Dossier associé absent : '+e.name);
assert.equal(C.glossary.length,12);for(const [term,definition,slug] of C.glossary){assert.ok(term&&definition);assert.ok(C.guides.some(g=>g.slug===slug));}
for(const p of C.comparisons){assert.notEqual(p.a,p.b);assert.equal(E[p.a].category,E[p.b].category);assert.ok(T[p.a].variant&&T[p.b].variant);assert.ok(p.sources.length>=2)}
const output=path.resolve(process.env.RADAR_DISCOVERY_TEST_OUTPUT||path.join(root,'_site-decouverte'));
if(fs.existsSync(path.join(output,'sitemap.xml'))){
 const index=JSON.parse(fs.readFileSync(path.join(output,'recherche-index.json'),'utf8'));
 for(const file of ['comprendre.html','comprendre-sna-snle.html','recherche.html']){
  const html=fs.readFileSync(path.join(output,file),'utf8');
  assert.ok(!/href="#(?:actualites|archives|methode)"/.test(html),'Lien de pied de page local invalide : '+file);
 }
 assert.equal(index.items.filter(i=>i.type==='engin').length,E.length);assert.equal(index.items.filter(i=>i.type==='dossier').length,C.guides.length+5);assert.equal(index.items.filter(i=>i.type==='jeu').length,8);
 const hub=fs.readFileSync(path.join(output,'comprendre.html'),'utf8');assert.ok(hub.includes('id="learning-filters"'));assert.ok(hub.includes('id="glossaire"'));assert.equal((hub.match(/data-guide-categories=/g)||[]).length,C.guides.length);assert.equal((hub.match(/data-glossary-term=/g)||[]).length,12);
 for(const g of C.guides){const html=fs.readFileSync(path.join(output,'comprendre-'+g.slug+'.html'),'utf8');assert.ok(html.includes('aria-label="Sommaire du dossier"'));assert.equal((html.match(/<fieldset data-answer=/g)||[]).length,3);assert.ok(html.includes('Références consultées le '+new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date((g.checkedAt||C.checkedAt)+'T12:00:00Z'))));assert.ok(html.includes('id="contexte-historique"'));assert.ok(html.includes('class="learning-timeline"'));assert.ok(!html.includes('undefined'));if(g.visual)assert.ok(html.includes('class="learning-svg"'));}
 for(const [i,e]of E.entries()){
  const html=fs.readFileSync(path.join(output,D.profileURL(e)),'utf8');
  const bundleFile=html.match(/data-profile-data="([^"]+)"/)?.[1];assert.ok(bundleFile,'Données dédiées absentes : '+e.name);assert.ok(bundleFile.startsWith('profile-data/'+i+'-'));const profileContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(output,bundleFile),'utf8'),profileContext);assert.equal(Object.keys(profileContext.window).length,6);
  for(const [name,key]of [['LDV_HISTOIRE',i],['LDV_TECHNIQUE',i],['LDV_CHIFFRES',i],['LDV_TIMELINES',i],['RADAR_HISTORY_PHOTOS',e.name],['RADAR_3D_MODELS',e.name]]){assert.equal(JSON.stringify(profileContext.window[name][key]),JSON.stringify(c.window[name]?.[key]),e.name+' '+name);assert.ok(Object.values(profileContext.window[name]).filter(value=>value!==null).length<=1,'Autres engins inclus dans '+bundleFile);}
  assert.ok(html.includes('data-engine-index="'+i+'"'));assert.ok(html.includes('Repères en bref'));assert.ok(html.includes('class="history-story-copy"'));assert.ok(!html.includes('class="history-story-chapter"'));assert.ok(html.includes('class="history-story-sources"'));assert.ok(html.includes('<h1 class="history-name">'));
  assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('name="twitter:card"'));
  assert.ok(html.includes('href="recherche.html"'));assert.ok(html.includes('href="comprendre.html"'));
  assert.ok(html.includes('class="learning-profile-reading"'));assert.ok(H[i].storyExpansion,'Récit non approfondi : '+e.name);
 }
 for(const p of C.comparisons){const html=fs.readFileSync(path.join(output,'comparatif-'+p.slug+'.html'),'utf8');assert.ok(html.includes('data-compare-a="'+p.a+'"'));assert.ok(html.includes(T[p.a].variant));assert.ok(html.includes(T[p.b].variant));}
 const sitemap=fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');assert.ok(sitemap.includes('fiche-rafale.html'));assert.ok(sitemap.includes('comprendre-sna-snle.html'));assert.ok(!sitemap.includes('recherche.html'));
}
console.log(E.length+' adresses et encadrés, index multi-rubriques, recherche accentuée et vide, '+C.guides.length+' dossiers sourcés, '+C.guides.reduce((sum,g)=>sum+g.quiz.length,0)+' questions, 12 définitions, 3 comparaisons et régression Hercules : OK.');
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
 {
 const learn=createDOM(''),make=(tag,parent,attrs={})=>{const el=learn.createElement(tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);parent.append(el);return el;};
 const filters=make('div',learn.body,{id:'learning-filters'}),filterStatus=make('p',learn.body,{id:'learning-filter-status'});
 const themeButtons=C.categories.map(([id,label])=>{const b=make('button',filters,{'data-guide-filter':id});b.textContent=label;return b});
 const cards=C.guides.map(g=>make('article',learn.body,{'data-guide-categories':g.categories.join(' ')}));
 const wrap=make('div',learn.body,{id:'glossary-search-wrap'}),field=make('input',wrap,{id:'glossary-search'}),count=make('p',wrap,{id:'glossary-count'});
 const terms=C.glossary.map(([term,definition])=>make('details',learn.body,{'data-glossary-term':term+' '+definition}));
 const form=make('form',learn.body,{class:'learning-quiz-form'}),questions=C.guides.find(g=>g.fresh).quiz;
 const quizFields=questions.map(q=>{const f=make('fieldset',form,{'data-answer':String(q.answer)});q.choices.forEach((_,i)=>{const input=make('input',f);input.value=String(i);input.checked=false});make('p',f,{class:'learning-quiz-feedback','data-correct':q.choices[q.answer],'data-explanation':q.explanation});return f;});
 const score=make('p',form,{class:'learning-quiz-score'});vm.runInNewContext(read('discovery-tools.js'),{window:{},document:learn,Intl});
 await themeButtons.find(b=>b.dataset.guideFilter==='geopolitique').click();const geopolitiqueCount=C.guides.filter(g=>g.categories.includes('geopolitique')).length;assert.equal(cards.filter(c=>!c.hidden).length,geopolitiqueCount);assert.ok(filterStatus.textContent.includes(geopolitiqueCount+' dossiers'));
 await themeButtons.find(b=>b.dataset.guideFilter==='crises').click();assert.equal(cards.filter(c=>!c.hidden).length,3);assert.ok(filterStatus.textContent.includes('3 dossiers'));
 await themeButtons.find(b=>b.dataset.guideFilter==='all').click();assert.equal(cards.filter(c=>!c.hidden).length,C.guides.length);
 field.value='DETROIT';await field.fire('input');assert.equal(terms.filter(t=>!t.hidden).length,1);field.value='<script>';await field.fire('input');assert.equal(terms.filter(t=>!t.hidden).length,0);assert.match(count.textContent,/Aucun/);field.value='';await field.fire('input');assert.equal(terms.filter(t=>!t.hidden).length,12);
 await form.fire('submit');assert.match(score.textContent,/Choisis une réponse/);
 quizFields.forEach((f,i)=>f.querySelectorAll('input').forEach(input=>input.checked=Number(input.value)===questions[i].answer));await form.fire('submit');assert.match(score.textContent,/3 \/ 3/);assert.ok(quizFields.every(f=>!f.querySelector('.learning-quiz-feedback').hidden));
 quizFields[0].querySelectorAll('input').forEach(input=>input.checked=Number(input.value)===(questions[0].answer+1)%3);await form.fire('submit');assert.match(score.textContent,/2 \/ 3/);assert.match(quizFields[0].querySelector('.learning-quiz-feedback').textContent,/À retenir/);
 await form.fire('reset');assert.equal(score.textContent,'');assert.ok(quizFields.every(f=>f.querySelector('.learning-quiz-feedback').hidden));
 console.log('Comprendre exécuté : thèmes, réinitialisation, lexique sans accents, absence, quiz incomplet/correct/incorrect et remise à zéro : OK.');
 }
})().catch(e=>{console.error(e);process.exitCode=1});

(async()=>{
 const {editorial:C2}=await import('./editorial-data.mjs');
 const {editorialFiles}=await import('./build-editorial.mjs');
 assert.equal(C2.histories.length,2);assert.equal(C2.variants.length,2);assert.equal(C2.paths.length,3);
 for(const h of C2.histories){assert.equal(h.timeline.length,6);assert.ok(h.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>550);for(const s of h.sections)assert.ok(s.sources.length&&s.sources.every(i=>h.sources[i]));for(const e of h.timeline)assert.ok(h.sources[e[3]]);for(const name of h.engins)assert.ok(E.some(e=>e.name===name));}
 for(const v of C2.variants){assert.equal(v.columns.length,3);assert.ok(v.rows.every(row=>row.length===4));for(const s of v.sections)assert.ok(s.sources.length&&s.sources.every(i=>v.sources[i]));}
 for(const x of [...C2.histories,...C2.variants])for(const source of x.sources)assert.equal(new URL(source.url).protocol,'https:');
 if(fs.existsSync(path.join(output,'parcours.html'))){
  for(const file of editorialFiles){const html=fs.readFileSync(path.join(output,file),'utf8');assert.ok(html.includes('<h1>'));assert.ok(!html.includes('undefined'));assert.ok(html.includes('rel="canonical"'));}
  const search=JSON.parse(fs.readFileSync(path.join(output,'recherche-index.json'),'utf8'));for(const file of editorialFiles)assert.ok(search.items.some(i=>i.url===file));
  for(const p of C2.paths)for(const [, ,url]of p.steps){const [file,anchor]=url.split('#'),html=fs.readFileSync(path.join(output,file),'utf8');if(anchor)assert.ok(html.includes('id="'+anchor+'"'),'Ancre de parcours absente : '+url);}
 }
 const {createDOM}=require('./feature-test-dom.cjs'),doc=createDOM('');
 const pathEl=doc.createElement('section');pathEl.setAttribute('data-reading-path','');doc.body.append(pathEl);
 const status=doc.createElement('p');status.className='reading-path-status';pathEl.append(status);
 const controls=doc.createElement('div');controls.className='reading-path-controls';pathEl.append(controls);
 const reset=doc.createElement('button');reset.setAttribute('data-reading-reset','');pathEl.append(reset);
 const steps=Array.from({length:4},()=>{const label=doc.createElement('label');label.className='reading-step-check';label.hidden=true;const input=doc.createElement('input');input.setAttribute('data-reading-step','');input.checked=false;label.append(input);pathEl.append(label);return input});
 vm.runInNewContext(read('discovery-tools.js'),{window:{},document:doc,Intl});assert.match(status.textContent,/0 \/ 4/);assert.equal(pathEl.querySelector('.reading-step-check').hidden,false);
 steps[0].checked=true;await steps[0].fire('change');assert.match(status.textContent,/1 \/ 4/);
 for(const step of steps)step.checked=true;await steps[3].fire('change');assert.match(status.textContent,/Parcours terminé/);
 await reset.click();assert.ok(steps.every(step=>!step.checked));assert.match(status.textContent,/0 \/ 4/);
 console.log('Nouveaux dossiers et sources, variantes, liens des parcours, repères d’actualité ciblés et progression sans stockage : OK.');
})().catch(e=>{console.error(e);process.exitCode=1});

const guideIndex=C.guides.map(g=>({type:'dossier',title:g.title,description:g.description,keywords:D.guideKeywords(g)}));
for(const query of ['Namibie','Mulberry','Queen Bee','Berlin Plus','pergélisol'])assert.ok(D.rank(guideIndex,query,'dossier').length,'Contexte introuvable : '+query);

if(fs.existsSync(path.join(output,'404.html'))){const html=fs.readFileSync(path.join(output,'404.html'),'utf8');assert.match(html,/noindex,follow/);assert.match(html,/On a perdu le signal/);for(const [,url]of html.matchAll(/(?:href|src)="([^"#]+)"/g))assert.ok(/^https:\/\//.test(url),'404 : ressource relative '+url);assert.ok(!fs.readFileSync(path.join(output,'sitemap.xml'),'utf8').includes('/404.html'));}

if(fs.existsSync(path.join(output,'comprendre.html')))for(const guide of C.guides){const html=fs.readFileSync(path.join(output,'comprendre-'+guide.slug+'.html'),'utf8');assert.ok(html.includes('<details class="learning-toc"><summary>Sommaire du dossier</summary>'));assert.ok(!html.includes('class="discovery-diagram"'));for(let n=0;n<guide.sections.length;n++)assert.ok(html.includes('id="repere-'+(n+1)+'"'),'Le texte reste présent : '+guide.slug);assert.ok(html.includes('id="contexte-historique"'));assert.ok(html.includes('id="quiz-title"'));}

// La nouvelle présentation ne doit jamais entrer dans l'atlas, ses fiches ou le QG.
if(fs.existsSync(path.join(output,'comprendre.html'))){
 const styled=['index.html','comprendre.html','tous-les-jeux.html','recherche.html',...C.guides.map(g=>'comprendre-'+g.slug+'.html')];
 for(const file of styled){const html=fs.readFileSync(path.join(output,file),'utf8');assert.match(html,/<body[^>]*class="[^"]*\bradar-visual\b/);assert.match(html,/href="assets\/radar-visual\.css\?v=2026102601"/);}
 for(const file of fs.readdirSync(output).filter(f=>/^(fiche-|comparatif-|variantes-)/.test(f)||['histoire.html','collection.html','comparateur.html','qg-radar.html'].includes(f))){const html=fs.readFileSync(path.join(output,file),'utf8');assert.ok(!html.includes('radar-visual'),'Style hors périmètre : '+file);}
}
