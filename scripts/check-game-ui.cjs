const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createDOM}=require('./feature-test-dom.cjs'),root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const doc=createDOM(''),events={};doc.addEventListener=(type,fn)=>(events[type]||=[]).push(fn);
const make=(tag,id)=>{const n=doc.createElement(tag);if(id)n.id=id;doc.body.append(n);return n;};
const filters=make('div','games-filters'),count=make('p','games-count');
const groups=['decouverte','decouverte','decouverte','histoire','histoire','quotidien','strategie','strategie'];
const cards=groups.map(group=>{const n=make('a');n.dataset.gameFamily=group;return n;});
for(const group of ['all','decouverte','histoire','strategie','quotidien']){const b=doc.createElement('button');b.dataset.gamesFilter=group;filters.append(b);}
const choices=make('div','recognition-choices');let answered=0;
for(let i=0;i<4;i++){const button=doc.createElement('button');button.addEventListener('click',()=>answered=i+1);choices.append(button);}
const input=make('input'),modal=make('dialog'),next=make('button','recognition-next'),prompt=make('h2','recognition-prompt');
const frames=[],context={document:doc,requestAnimationFrame:fn=>frames.push(fn)};vm.runInNewContext(read('assets/game-ui.js'),context);
const key=(value,target=doc.body,extra={})=>events.keydown.forEach(fn=>fn({key:value,target,preventDefault(){},...extra}));
filters.fire('click',{target:filters.children[1]});assert.equal(cards.filter(n=>!n.hidden).length,3);assert.equal(count.textContent,'3 jeux affichés sur 8');
filters.fire('click',{target:filters.children[3]});assert.equal(cards.filter(n=>!n.hidden).length,2);filters.fire('click',{target:filters.children[0]});assert.ok(cards.every(n=>!n.hidden));
key('3');assert.equal(answered,3);answered=0;key('2',input);key('2',doc.body,{repeat:true});key('2',doc.body,{ctrlKey:true});assert.equal(answered,0);
choices.hidden=true;key('1');assert.equal(answered,0);choices.hidden=false;choices.children[0].disabled=true;key('1');assert.equal(answered,0);
modal.open=true;key('4');assert.equal(answered,0);modal.open=false;key('4');assert.equal(answered,4);
next.click();frames.forEach(fn=>fn());assert.equal(doc.activeElement,prompt);
const pages=['jeux.html','devine-engin.html','zoom-mystere.html','chrono-defense.html','vrai-ou-faux.html','defi-du-jour.html','alerte-radar.html','qg-radar.html'];
for(const page of pages){const html=read(page);assert.match(html,/class="play-page"/);assert.match(html,/aria-label="Navigation des jeux"/);for(const target of pages)assert.ok(html.includes('href="'+target+'"'),page+' vers '+target);assert.match(html,/game-ui\.js\?v=1/);assert.match(html,/game-ui\.css\?v=2/);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,page+' identifiants doublés');}
const recognition=read('devine-engin.html');assert.ok(recognition.indexOf('recognition-answering')>recognition.indexOf('class="recognition-copy"'));assert.ok(recognition.indexOf('recognition-answering')<recognition.indexOf('id="recognition-answer"'));
const qs=read('qg-radar.js'),qBlock=qs.slice(qs.indexOf('let raf=null'),qs.indexOf('function motion()'));
let callbacks=[],draws=0,elapsed=0;const q={document:{hidden:false},moving:true,departures:{active:false,tick:d=>elapsed+=d},draw:()=>draws++,requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length}};vm.createContext(q);vm.runInContext(qBlock,q);vm.runInContext('wakeAnimation()',q);
for(let i=0;i<121;i++){const pending=callbacks;callbacks=[];pending.forEach(fn=>fn(1000+i*1000/120));}assert.ok(draws>=25&&draws<=35,'QG : cadence de dessin bornée');assert.ok(Math.abs(elapsed-1000)<1,'QG : temps d’animation conservé');q.document.hidden=true;callbacks.splice(0).forEach(fn=>fn(2100));assert.equal(callbacks.length,0,'QG caché : boucle arrêtée');
const rs=read('alerte-radar.js'),rBlock=rs.slice(rs.indexOf('function tick(now)'),rs.indexOf('function startWave(index)'));callbacks=[];draws=0;
const radar={state:{phase:'active',last:1000,elapsed:0,lastPaint:0},hud:()=>draws++,position(){},duration:()=>30000,endWave(){throw Error('Manche terminée trop tôt')},requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length}};vm.createContext(radar);vm.runInContext(rBlock,radar);vm.runInContext('tick(1000)',radar);
for(let i=1;i<=120;i++){const pending=callbacks;callbacks=[];pending.forEach(fn=>fn(1000+i*1000/120));}assert.ok(draws>=25&&draws<=35,'Radar : rafraîchissement borné');assert.ok(Math.abs(radar.state.elapsed-1000)<1,'Radar : durée réelle conservée');
console.log('Jeux : filtres 8/3/2, raccourcis clavier sans saisie ni double réponse, focus suivant, 8 menus cohérents, cadence graphique bornée et durées conservées : OK.');
