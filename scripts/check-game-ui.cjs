const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createDOM}=require('./feature-test-dom.cjs'),root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const doc=createDOM(''),events={};doc.addEventListener=(type,fn)=>(events[type]||=[]).push(fn);
const make=(tag,id)=>{const n=doc.createElement(tag);if(id)n.id=id;doc.body.append(n);return n;};
const choices=make('div','recognition-choices');let answered=0;
for(let i=0;i<4;i++){const button=doc.createElement('button');button.addEventListener('click',()=>answered=i+1);choices.append(button);}
const input=make('input'),modal=make('dialog'),next=make('button','recognition-next'),prompt=make('h2','recognition-prompt');
const frames=[],context={document:doc,requestAnimationFrame:fn=>frames.push(fn)};vm.runInNewContext(read('assets/game-ui.js'),context);
const key=(value,target=doc.body,extra={})=>events.keydown.forEach(fn=>fn({key:value,target,preventDefault(){},...extra}));
key('3');assert.equal(answered,3);answered=0;key('2',input);key('2',doc.body,{repeat:true});key('2',doc.body,{ctrlKey:true});assert.equal(answered,0);
choices.hidden=true;key('1');assert.equal(answered,0);choices.hidden=false;choices.children[0].disabled=true;key('1');assert.equal(answered,0);
modal.open=true;key('4');assert.equal(answered,0);modal.open=false;key('4');assert.equal(answered,4);
next.click();frames.forEach(fn=>fn());assert.equal(doc.activeElement,prompt);
const pages=['jeux.html','devine-engin.html','zoom-mystere.html','chrono-defense.html','vrai-ou-faux.html','defi-du-jour.html','alerte-radar.html','qg-radar.html'];
for(const page of pages){const html=read(page);assert.match(html,/class="play-page"/);assert.match(html,/aria-label="Navigation des jeux"/);for(const target of pages)assert.ok(html.includes('href="'+target+'"'),page+' vers '+target);assert.match(html,/game-ui\.js\?v=1/);assert.match(html,/href="assets\/game-ui\.css\?v=[1-9]\d*"/);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,page+' identifiants doublés');}
const recognition=read('devine-engin.html');assert.ok(recognition.indexOf('recognition-answering')>recognition.indexOf('class="recognition-copy"'));assert.ok(recognition.indexOf('recognition-answering')<recognition.indexOf('id="recognition-answer"'));
const qs=read('qg-radar.js'),qBlock=qs.slice(qs.indexOf('let raf=null'),qs.indexOf('function motion()'));
let callbacks=[],draws=0,elapsed=0;const q={document:{hidden:false},moving:true,sceneTime:0,departures:{active:false,tick:d=>elapsed+=d},draw:()=>draws++,requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length}};vm.createContext(q);vm.runInContext(qBlock,q);vm.runInContext('wakeAnimation()',q);
for(let i=0;i<121;i++){const pending=callbacks;callbacks=[];pending.forEach(fn=>fn(1000+i*1000/120));}assert.ok(draws>=25&&draws<=35,'QG : cadence de dessin bornée');assert.ok(Math.abs(elapsed-1000)<1,'QG : temps d’animation conservé');assert.ok(Math.abs(q.sceneTime-1000)<1,'QG : horloge visuelle conservée');q.moving=false;const frozenScene=q.sceneTime;vm.runInContext('animate(2100)',q);assert.equal(q.sceneTime,frozenScene,'QG en pause : scène figée');q.document.hidden=true;callbacks.splice(0).forEach(fn=>fn(2100));assert.equal(callbacks.length,0,'QG caché : boucle arrêtée');
const rs=read('alerte-radar.js'),rBlock=rs.slice(rs.indexOf('function tick(now)'),rs.indexOf('function startWave(index)'));callbacks=[];draws=0;
const radar={E:{tick(s,delta){s.elapsed+=delta}},contacts(){},records(){},state:{phase:'active',last:1000,elapsed:0,lastPaint:0},hud:()=>draws++,position(){},duration:()=>30000,endWave(){throw Error('Manche terminée trop tôt')},requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length}};vm.createContext(radar);vm.runInContext(rBlock,radar);vm.runInContext('tick(1000)',radar);
for(let i=1;i<=120;i++){const pending=callbacks;callbacks=[];pending.forEach(fn=>fn(1000+i*1000/120));}assert.ok(draws>=25&&draws<=35,'Radar : rafraîchissement borné');assert.ok(Math.abs(radar.state.elapsed-1000)<1,'Radar : durée réelle conservée');
console.log('Jeux : raccourcis clavier sans saisie ni double réponse, focus suivant, 8 menus cohérents, cadence graphique bornée et durées conservées : OK.');

for(const file of ['assets/game-ui.js','jeux.js','devine-engin.js','arcade.js']){const source=read(file),helper=source.match(/const scrollBehavior=([^;]+);/)[0];for(const reduced of [true,false]){const c={matchMedia:()=>({matches:reduced})};vm.createContext(c);vm.runInContext(helper+'result=scrollBehavior()',c);assert.equal(c.result,reduced?'auto':'smooth',file);}}

// The dashboard offers a useful first action, then shows only actual records.
function progressScene(saved){
 const document=createDOM(''),host=document.createElement('section');host.id='progression';document.body.append(host);
 const store=new Map([['foreign','preserved']]);if(saved)store.set('ldv-progression-v1',saved);
 const context={document,window:{addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},location:{reload(){}}};
 vm.runInNewContext(read('progression.js'),context);return {document,host,store,api:context.window.LDV_PROGRESS};
}
(async()=>{
 const fresh=progressScene();assert.ok(fresh.host.querySelector('.progress-empty'));assert.equal(fresh.host.querySelectorAll('.progress-records').length,0);assert.equal(fresh.host.querySelectorAll('.progress-summary').length,0);assert.equal(fresh.host.querySelector('a').href,'revision.html');assert.equal(fresh.host.querySelector('.progress-tools').children.length,2);assert.ok(fresh.host.querySelector('.progress-settings').querySelector('a').href==='sauvegarde.html');assert.ok(!fresh.host.querySelector('.progress-settings').open);assert.equal(fresh.store.has('ldv-progression-v1'),false,'Consultation seule : aucune écriture');
 fresh.api.answer('recognition','Rafale',false,'Rafale');assert.equal(fresh.host.querySelectorAll('.progress-records').length,0,'Une réponse isolée ne crée pas un faux record');fresh.api.complete('recognition',4,5,'Facile');
 assert.equal(fresh.host.querySelectorAll('.progress-empty').length,0);assert.equal(fresh.host.querySelector('.progress-records').children.length,1);assert.ok(fresh.host.querySelector('.progress-records').textContent.includes('4/5'));assert.equal(fresh.host.querySelectorAll('.progress-achievements').length,0);assert.equal(fresh.host.querySelectorAll('.progress-badges').length,0);assert.equal(fresh.api.missed().length,1);
 const snapshot=JSON.stringify(fresh.api.snapshot()),restored=progressScene(snapshot);assert.equal(JSON.stringify(restored.api.snapshot()),snapshot);assert.equal(restored.host.querySelector('.progress-records').children.length,1);assert.equal(restored.store.get('foreign'),'preserved');
 restored.api.complete('pays',5,5,'Normal');assert.equal(restored.host.querySelector('.progress-records').children.length,2);assert.equal(restored.api.snapshot().games.recognition.best.score,4);
 await restored.host.querySelector('.progress-reset').querySelector('button').click();assert.equal(restored.api.snapshot().missed.length,0);assert.ok(restored.host.querySelector('.progress-empty'));assert.equal(restored.store.get('foreign'),'preserved');
 const hub=read('tous-les-jeux.html');assert.equal((hub.match(/class="game-tile"/g)||[]).length,8);assert.equal((hub.match(/href="devine-engin.html\?niveau=beginner"/g)||[]).length,1);assert.ok(!hub.includes('id="games-filters"'));assert.ok(!hub.includes('class="games-personal"'));assert.ok(hub.indexOf('href="devine-engin.html"')<hub.indexOf('data-game-family="decouverte"'));assert.match(hub,/<details class="games-extra">/);console.log('Carnet : accueil utile sans faux records, scores réels, aucun badge, restauration inchangée et remise à zéro limitée : OK.');
})().catch(e=>{console.error(e);process.exitCode=1});

// Le nouvel habillage est limité aux huit pages de jeu.
const built=path.resolve(process.env.RADAR_DISCOVERY_TEST_OUTPUT||path.join(root,'_site-decouverte'));
if(fs.existsSync(path.join(built,'qg-radar.html'))){
 for(const page of pages){const html=fs.readFileSync(path.join(built,page),'utf8');assert.match(html,/<body[^>]*class="[^"]*\bradar-play\b/);assert.equal((html.match(/href="assets\/play-visual\.css\?v=2026102601"/g)||[]).length,1);}
 for(const page of fs.readdirSync(built).filter(f=>f.endsWith('.html')&&!pages.includes(f))){assert.ok(!fs.readFileSync(path.join(built,page),'utf8').includes('play-visual.css'),'Habillage de jeu hors périmètre : '+page);}
}

const qgHelp=read('qg-radar.html');assert.equal((qgHelp.match(/<summary>Aide<\/summary>/g)||[]).length,1);assert.ok(!qgHelp.includes('class="qg-guide"'));assert.ok(!qgHelp.includes('<summary>Règles rapides</summary>'));assert.equal((qgHelp.match(/id="qg-tutorial-open"/g)||[]).length,1);assert.ok(!read('index.html').includes('news-photo-count'));assert.ok(!read('news-view.js').includes('news-photo-count'));

const homeMethod=read('index.html'),aboutMethod=read('a-propos.html'),qgSummary=read('qg-radar.html');assert.equal((homeMethod.match(/id="methode"/g)||[]).length,1);assert.ok(homeMethod.includes('href="a-propos.html#methode"'));assert.ok(!homeMethod.includes('Radar : le site et sa méthode'));assert.ok(aboutMethod.includes('sans relecture')||aboutMethod.includes('ne correspond pas à une relecture humaine'));assert.ok(aboutMethod.includes('Un repère pour comprendre'));assert.ok(!qgSummary.includes('data-qg-brief'));assert.equal((qgSummary.match(/<summary>Bilan de la semaine<\/summary>/g)||[]).length,1);assert.ok(qgSummary.indexOf('id="qg-week-brief"')<qgSummary.indexOf('class="qg-scene-frame"'));
