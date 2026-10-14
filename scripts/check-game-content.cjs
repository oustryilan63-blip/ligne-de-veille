const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),root=path.resolve(__dirname,'..');
const ctx={window:{},Intl,Date,console};function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file})}
for(const f of ['engins-data.js','difficulty-data.js','catalogue-tools.js','quiz-data.js'])load(f);
const tiers=ctx.window.RADAR_DIFFICULTY_TIERS,C=ctx.window.RADAR_CATALOGUE,E=ctx.window.LDV_ENGINS,all=Object.values(tiers).flat();
assert.equal(all.length,E.length);assert.equal(new Set(all).size,E.length);for(const e of E)assert.ok(all.includes(e.name));
assert.equal(C.difficulty(E.find(e=>e.name==='Rafale')),'beginner');assert.equal(C.difficulty(E.find(e=>e.name==='Classe Gotland')),'expert');
for(const level of ['beginner','standard','expert']){const pool=C.levelPool(E,level);assert.ok(pool.every(e=>tiers[level].includes(e.name)));for(const category of ['air','terre','mer','missiles'])assert.ok(pool.filter(e=>e.category===category).length>=6);for(const e of pool)assert.equal(C.options(e,pool,level).length,4,e.name);assert.ok(new Set(C.levelPool(ctx.window.LDV_CHRONO,level).map(e=>e.year)).size>=4);assert.ok(C.levelPool(ctx.window.LDV_FACTS,level).length>=10);}
load('qg-radar-engine.js');const legacy=ctx.window.QG.fresh(73);assert.equal(Object.keys(legacy.units).length,9);load('qg-radar-campaign.js');const Q=ctx.window.QG;
let s=Q.restore(JSON.stringify(legacy));assert.ok(s);assert.equal(s.week,legacy.week);assert.equal(s.cash,legacy.cash);assert.equal(Object.keys(s.units).length,11);assert.equal(s.units.drone.owned,false);assert.equal(s.content.resources.fuel,100);
function step(a){const r=Q.action(s,a);assert.ok(r.ok,r.message);s=r.state;assert.ok(Q.restore(JSON.stringify(s)),'Sauvegarde après '+a.type);return r}
let m=Q.offers(s)[0];assert.ok(step({type:'mission',id:m.id,unit:m.unit,support:'leclerc',mode:'prudent'}).operation);assert.equal(s.completed,0,'Aucune victoire déterminée avant de jouer');assert.ok(!Q.action(s,{type:'next'}).ok);assert.ok(!Q.action(s,{type:'train'}).ok);
step({type:'operationStep',id:m.id,stage:0,hit:false});assert.ok(!Q.action(s,{type:'operationStep',id:m.id,stage:0,hit:true}).ok);step({type:'operationStep',id:m.id,stage:1,hit:true});step({type:'operationStep',id:m.id,stage:2,hit:false});assert.equal(s.completed,1);assert.equal(s.content.operation,null);assert.ok(s.units.leclerc.used);
const bad=JSON.parse(JSON.stringify(s));bad.content.resources.parts=-1;assert.equal(Q.restore(bad),null);
for(let seed=0;seed<4;seed++){const empty=Q.fresh(seed);empty.cash=0;empty.content.resources={fuel:0,parts:0,ammo:0};empty.content.incidentDone=false;assert.ok(Q.incident(empty).options.some((_,choice)=>Q.action(empty,{type:'incident',choice}).ok),'Un événement doit rester résoluble sans réserve');}
s=Q.fresh(3);let total=0;
for(let week=1;week<=12;week++){
 if(!s.content.incidentDone){const choice=Q.incident(s).options.findIndex((_,i)=>Q.action(s,{type:'incident',choice:i}).ok);assert.ok(choice>=0);step({type:'incident',choice});}
 while(s.actions>0){if(s.skill<(week>=9?3:week>=5?2:1)&&Q.action(s,{type:'train'}).ok){step({type:'train'});continue;}const fleet=Q.owned(s),ready=fleet.find(u=>!s.units[u.id].used&&s.units[u.id].condition>=45&&Q.action(s,{type:'mission',id:s.week+'-'+['air','terre','mer'].indexOf(u.type),unit:u.id}).ok);
  if(ready){const id=s.week+'-'+['air','terre','mer'].indexOf(ready.type);step({type:'mission',id,unit:ready.id});for(let stage=0;stage<3;stage++)step({type:'operationStep',id,stage,hit:true});total++;}
  else {const repair=fleet.find(u=>s.units[u.id].condition<75&&Q.action(s,{type:'repair',id:u.id}).ok);if(repair)step({type:'repair',id:repair.id});else if(Q.action(s,{type:'resupply'}).ok)step({type:'resupply'});else break;}
 }
 if(s.alert?.pending)step({type:'intercept',id:s.alert.id,hit:true});step({type:'next'});
}
assert.ok(s.ended);assert.ok(total>=12,'Campagne réalisable : '+total);step({type:'continue'});assert.equal(s.week,13);
console.log(E.length+' engins, sélections, migration QG, victoire différée, soutien, pas de double gain et campagne de 12 semaines réalisable : OK.');
const {createDOM}=require('./feature-test-dom.cjs'),doc=createDOM('<p id="qg-status"></p><section id="qg-events-under"></section>'),canvasContext=new Proxy({},{get:()=>()=>{}}),originalCreate=doc.createElement;
doc.createElement=tag=>{const n=originalCreate(tag);if(tag==='canvas'){n.getContext=()=>canvasContext;n.getBoundingClientRect=()=>({left:0,top:0,width:720,height:400});}return n};
const events={};doc.addEventListener=(k,fn)=>{events[k]=fn};doc.hidden=false;
const command=doc.createElement('aside');command.className='qg-command';doc.body.append(command);
let callbacks=[],gameState=Q.fresh(9),updates=0;gameState=Q.action(gameState,{type:'mission',id:'1-0',unit:'rafale'}).state;
gameState.content.operation.scenario={title:'Opération héritée',sector:'air',stages:['Départ','Objectif','Retour'],mechanics:['legacy','legacy','legacy']};
const ui={window:{QG:Q,QG_ART:{sprite(){}}},document:doc,requestAnimationFrame:fn=>{callbacks.push(fn);return callbacks.length},cancelAnimationFrame:()=>{callbacks=[]}};
vm.runInNewContext(fs.readFileSync(path.join(root,'qg-radar-operation-engine.js'),'utf8'),ui);
vm.runInNewContext(fs.readFileSync(path.join(root,'qg-radar-operations.js'),'utf8'),ui);
const send=a=>{const r=Q.action(gameState,a);if(r.ok){gameState=r.state;updates++}return r};ui.window.QG_OPERATIONS.render(gameState,send);assert.match(doc.getElementById('qg-resources').textContent,/Phase 1\/3/);ui.window.QG_OPERATIONS.open(gameState,send);
async function operationUI(){const dialog=doc.getElementById('qg-operation'),start=doc.getElementById('qg-operation-start'),pause=doc.getElementById('qg-operation-pause'),canvas=dialog.querySelector('canvas');
 await start.click();await pause.click();assert.equal(callbacks.length,0,'Pause : animation arrêtée');
 for(let stage=0;stage<3;stage++){await start.click();const engine=ui.window.QG_OPERATION_ENGINE,p=engine.targets(engine.create(gameState.content.operation,gameState.seed+gameState.week*97))[0];await canvas.fire('pointerdown',{clientX:p.x*720,clientY:p.y*400});}
 assert.equal(updates,3);assert.equal(gameState.completed,1);assert.equal(dialog.open,false);await canvas.fire('pointerdown',{clientX:100,clientY:100});assert.equal(updates,3,'Pas de double victoire après fermeture');
 console.log('Opération héritée : reprise visible, pause, trois étapes jouées à la souris et clôture sans double gain : OK.');
}operationUI().catch(e=>{console.error(e);process.exitCode=1});
