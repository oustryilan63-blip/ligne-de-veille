(()=>{
 'use strict';
 const E=window.QG,KEY='radar-qg-campaign-v1',$=id=>document.getElementById(id);
 let state,stored=false,storageOK=true,selected={},pending=null,zoom=1,pan={x:0,y:0};
 const departures=window.QG_MOTION.create();let lastNotice=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let moving=!reduced.matches;
 try{const raw=localStorage.getItem(KEY);state=E.restore(raw);stored=!!state;if(raw&&!state)$('qg-status').textContent='L’ancienne sauvegarde est illisible. Une nouvelle campagne a été préparée.';}catch{storageOK=false;}
 state=state||E.fresh();
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('qg-save').textContent=storageOK?'✓ Campagne sauvegardée sur ce navigateur':'Sauvegarde indisponible : garde cette page ouverte.';}
 function text(id,value){$(id).textContent=value;}
 function disabled(a){return !E.action(state,a).ok;}
 function reason(a){const r=E.action(state,a);return r.ok?'Prêt pour cette décision.':r.message;}
 function markComplete(){if(state.report&&window.LDV_PROGRESS)window.LDV_PROGRESS.complete('qg',E.score(state),1000,'Campagne · 12 semaines',state.id);}
 function act(a){const r=E.action(state,a);text('qg-status',r.message);if(!r.ok)return;state=r.state;if(a.type==='mission'||a.type==='repair')departures.add(a.unit||a.id,a.type);else if(['next','continue'].includes(a.type)){departures.clear();selected={};}save();if(state.ended)markComplete();render();wakeAnimation();if(state.ended)$('qg-end').focus();}
 function confirm(title,copy,callback){text('qg-confirm-title',title);text('qg-confirm-copy',copy);pending=callback;$('qg-confirm').showModal();$('qg-cancel').focus();}
 $('qg-cancel').addEventListener('click',()=>{$('qg-confirm').close();pending=null;});
 $('qg-confirm').addEventListener('cancel',()=>{pending=null;});
 $('qg-accept').addEventListener('click',()=>{const callback=pending;pending=null;$('qg-confirm').close();callback?.();});
 function restart(){confirm('Recommencer la campagne ?','La campagne sauvegardée sera remplacée. Tes records et les autres jeux sont conservés.',()=>{state=E.fresh();selected={};departures.clear();save();text('qg-status','Nouvelle équipe, nouvelle campagne. À toi de jouer !');render();$('qg-next').focus();});}
 $('qg-reset').addEventListener('click',restart);$('qg-replay').addEventListener('click',restart);$('qg-continue').addEventListener('click',()=>act({type:'continue'}));
 $('qg-next').addEventListener('click',()=>{if(state.ended)return;const next=()=>act({type:'next'});if(state.actions>0)confirm(state.week===12&&!state.free?'Clore la campagne ?':'Terminer la semaine ?',`Il te reste ${state.actions} décision${state.actions>1?'s':''} disponible${state.actions>1?'s':''}. Elles ne sont pas reportées.`,next);else next();});
 function missionAction(m){return {type:'mission',id:m.id,unit:selected[m.id]};}
 function renderMissions(){
  $('qg-missions').innerHTML=E.offers(state).map(offer=>{let m=offer;
   const options=E.owned(state).filter(u=>u.type===m.type);if(!options.some(u=>u.id===selected[m.id]))selected[m.id]=(options.find(u=>!state.units[u.id].used&&state.units[u.id].condition>=45)||options[0]).id;
   m=E.mission(state,m.id,selected[m.id]);const a=missionAction(m),done=state.done.includes(m.id);
   return `<article class="qg-card"><span class="qg-tag">${m.type.toUpperCase()} / ${done?'ACCOMPLIE':'MISSION PROPOSÉE'}</span><h3>${m.title}</h3><p>${m.copy}</p><dl><dt>Coût du départ</dt><dd>${m.cost} cr.</dd><dt>Récompense</dt><dd>${m.reward} cr.</dd><dt>Gain net</dt><dd>+${m.reward-m.cost} cr.</dd><dt>Usure de l’engin</dt><dd>−${m.wear} pts</dd><dt>Compétence requise</dt><dd>${m.need} / 6</dd></dl><label for="mission-${m.id}">Engin à déployer · état minimum 45</label><select id="mission-${m.id}" data-mission-select="${m.id}" ${state.ended||done?'disabled':''}>${options.map(u=>`<option value="${u.id}" ${selected[m.id]===u.id?'selected':''}>${u.name} · ${state.units[u.id].condition}/100${state.units[u.id].used?' · déjà déployé':''}</option>`).join('')}</select><button type="button" data-action="mission" data-id="${m.id}" ${disabled(a)?'disabled':''}>${done?'✓ Mission accomplie':'Lancer la mission · 1 décision'}</button><span class="qg-reason" id="reason-${m.id}">${reason(a)}</span></article>`;
  }).join('');
 }
 function atlasIndex(name){return (window.LDV_ENGINS||[]).findIndex(u=>u.name===name);}
 function renderFleet(){
  $('qg-fleet-count').textContent=String(E.owned(state).length).padStart(2,'0');$('qg-fleet').innerHTML=E.owned(state).map(u=>{const v=state.units[u.id],a={type:'repair',id:u.id},i=atlasIndex(u.name);return `<article class="qg-card"><canvas class="qg-sprite" data-sprite="${u.id}" width="320" height="160" role="img" aria-label="Sprite de ${u.name}"></canvas><button type="button" class="qg-preview-action" data-departure="${u.id}">▷ Voir le départ</button><span class="qg-tag">${u.type.toUpperCase()} / ${v.used?'DÉPLOYÉ CETTE SEMAINE':'DISPONIBLE'}</span><h3>${u.name}</h3><p>${u.role}</p><span>État : <strong>${v.condition} / 100</strong></span><div class="qg-meter ${v.condition<45?'low':''}"><i style="width:${v.condition}%"></i></div><p>Réparation : +${Math.min(E.repair(state),100-v.condition)} points, dans la limite de 100.</p><button type="button" data-action="repair" data-id="${u.id}" ${disabled(a)?'disabled':''}>Réparer · 18 cr. · 1 décision</button><span class="qg-reason">${reason(a)}</span>${i>=0?`<a href="histoire.html?engin=${i}" target="_blank" rel="noopener">Histoire de l’engin ↗</a>`:''}</article>`;}).join('');
  $('qg-reinforcements').innerHTML=E.units.filter(u=>u.unlock).map(u=>{const a=u.unlock,owned=state.units[u.id].owned,b=E.buildings.find(b=>b.id===a.building),action={type:'unlock',id:u.id};return `<article class="qg-card qg-renfort"><canvas class="qg-sprite" data-sprite="${u.id}" width="320" height="160" role="img" aria-label="Sprite de ${u.name}"></canvas><span class="qg-tag">${owned?'DANS TA FLOTTE':'RENFORT À DÉBLOQUER'}</span><h3>${u.name}</h3><p>${u.role}</p><ul><li>${b.name} niveau ${a.level} ${state.buildings[a.building]>=a.level?'✓':''}</li><li>Compétence ${a.skill}/6 ${state.skill>=a.skill?'✓':''}</li><li>Accueil : ${a.cost} cr. et 1 décision</li><li>Entretien : +3 cr. par semaine</li></ul><button type="button" data-action="unlock" data-id="${u.id}" ${disabled(action)?'disabled':''}>${owned?'✓ Engin débloqué':'Accueillir · '+a.cost+' cr.'}</button><span class="qg-reason">${owned?'Disponible dans la flotte et les missions.':reason(action)}</span></article>`;}).join('');
  paintFleet();
 }
 function paintFleet(){document.querySelectorAll('[data-sprite]').forEach(canvas=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,320,160);ctx.imageSmoothingEnabled=false;window.QG_ART.sprite(ctx,canvas.dataset.sprite,160,100,1.65);});}
 function renderBase(){
  $('qg-team').innerHTML=[['train','Former l’équipe',`Compétence ${state.skill}/6. +${Math.min(state.buildings.ecole,6-state.skill)} après une formation, et +4 de moral.`,'Former · 25 cr. · 1 décision'],['rest','Prendre soin du collectif',`Moral ${state.morale}/100. Une journée de repos rend jusqu’à 18 points de moral, sans dépenser de crédits.`,'Repos · 1 décision']].map(([id,title,desc,button])=>`<div><h3>${title}</h3><p>${desc}</p><button type="button" data-action="${id}" ${disabled({type:id})?'disabled':''}>${button}</button><div class="qg-reason">${reason({type:id})}</div></div>`).join('');
  $('qg-buildings').innerHTML=E.buildings.map(b=>{const l=state.buildings[b.id],a={type:'upgrade',id:b.id};return `<article class="qg-card"><canvas class="qg-sprite qg-building-sprite" data-building="${b.id}" width="320" height="160" role="img" aria-label="${b.name}, niveau ${l}"></canvas><span class="qg-tag">INSTALLATION / NIVEAU ${l}</span><h3>${b.name}</h3><div class="qg-levels" aria-label="Niveau ${l} sur 3">${[1,2,3].map(n=>`<i class="${n<=l?'on':''}"></i>`).join('')}</div><p>${b.effect}</p><button type="button" data-action="upgrade" data-id="${b.id}" ${disabled(a)?'disabled':''}>${l===3?'Niveau maximum':`Améliorer · ${l*35} cr. · 1 décision`}</button><span class="qg-reason">${reason(a)}</span></article>`;}).join('');
  paintBase();
 }
 function paintBase(){document.querySelectorAll('[data-building]').forEach(canvas=>{const c=canvas.getContext('2d');c.clearRect(0,0,320,160);c.imageSmoothingEnabled=false;window.QG_ART.building(c,canvas.dataset.building,160,116,state.buildings[canvas.dataset.building],0,1.2,true);});}
 function render(){
  text('qg-week',state.free?'S'+state.week+' · LIBRE':String(state.week).padStart(2,'0')+' / 12');text('qg-cash',state.cash+' cr.');text('qg-actions',state.actions+' / 2');text('qg-morale',state.morale+' / 100');text('qg-skill',state.skill+' / 6');
  const e=E.event(state);text('qg-event-title',e[0]);text('qg-event-copy',e[1]+' Effet déjà appliqué.');text('qg-income','+'+E.income(state)+' cr.');text('qg-upkeep','−'+E.upkeep(state)+' cr.');const net=E.income(state)-E.upkeep(state);text('qg-net',(net>=0?'+':'')+net+' cr.');text('qg-map-level','NIVEAUX / '+Object.values(state.buildings).reduce((a,b)=>a+b,0));
  $('qg-next').disabled=state.ended;text('qg-next',state.ended?'Campagne terminée':state.week===12&&!state.free?'Terminer la campagne →':'Terminer la semaine →');
  renderMissions();renderFleet();renderBase();$('qg-log').replaceChildren(...state.log.map(line=>{const li=document.createElement('li');li.textContent=line;return li;}));
  $('qg-objectives').innerHTML=E.goals(state).map(g=>`<div class="qg-goal"><div><strong>${g.name}</strong><span>${g.value}${g.unit} / ${g.target}${g.unit}</span></div><progress max="${g.target}" value="${Math.min(g.value,g.target)}" aria-label="${g.name} : ${g.value} sur ${g.target}"></progress><small>${g.value>=g.target?'✓ Objectif atteint':'Objectif en cours'}${state.free?'':' · '+g.max+' points maximum'}</small></div>`).join('');
  text('qg-goal-title',state.free?'Les repères de ta base':'Objectifs de campagne');text('qg-goal-score',state.report?'Bilan conservé : '+E.score(state)+' / 1 000':E.score(state)+' / 1 000 points actuellement');
  text('qg-balance-note',state.free?'Le mode libre renouvelle la dotation et les événements chaque semaine.':'Avant l’événement suivant. Aucun versement à la clôture de la semaine 12.');
  $('qg-end').hidden=!state.report;$('qg-continue').hidden=!state.ended;
  if(state.report){const sc=E.score(state);text('qg-end-title',state.free?'La base poursuit son histoire.':sc>=650?'Une base qui tient le cap.':sc>=400?'Une équipe sur la bonne voie.':'Une première campagne pour apprendre.');text('qg-end-copy',`${sc} / 1 000 points · ${state.report.completed} missions pendant les douze semaines. ${state.free?'Ton bilan reste fixe ; les nouvelles missions comptent dans la vie de ta base.':'Continue avec ta base en mode libre, ou recommence une campagne.'}`);$('qg-score-details').innerHTML='<dl>'+E.tally(state).map(([name,n,max])=>`<div><dt>${name}</dt><dd>${n} / ${max}</dd></div>`).join('')+'</dl>';}
  refreshInstallation();
  draw(performance.now());
 }
 document.querySelector('.qg-shell').addEventListener('click',event=>{const preview=event.target.closest('[data-departure]');if(preview){departures.clear();departures.add(preview.dataset.departure,'mission',true);draw(performance.now());wakeAnimation();return;}const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const a={type:b.dataset.action,id:b.dataset.id};if(a.type==='mission')a.unit=selected[a.id];act(a);});
 $('qg-missions').addEventListener('change',event=>{const id=event.target.dataset.missionSelect;if(!id)return;selected[id]=event.target.value;renderMissions();document.getElementById('mission-'+id)?.focus();});
 const tabs=[...document.querySelectorAll('[role="tab"]')];
 function showTab(tab){tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;$(t.getAttribute('aria-controls')).hidden=!on;});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showTab(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();showTab(tabs[n]);tabs[n].focus();}});});
 const canvas=$('qg-map'),ctx=canvas.getContext('2d'),viewport=$('qg-map-viewport');ctx.imageSmoothingEnabled=false;
 function draw(t){
  const a=departures.peek();window.QG_ART.scene(ctx,state,moving?t:0,moving&&a?[a]:[]);
  const notice=$('qg-departure');notice.hidden=!a;if(!a)return;
  const u=E.units.find(u=>u.id===a.id);
  if(lastNotice!==a.key){lastNotice=a.key;text('qg-departure-name',u.name);text('qg-departure-copy',a.demo?'Aperçu · aucune décision utilisée':a.kind==='repair'?'Réparation enregistrée':'Mission enregistrée');}
  text('qg-departure-label',a.kind==='repair'?'À L’ATELIER':moving?'ANIMATION DU DÉPART':'DÉPART ENREGISTRÉ');
  const pc=$('qg-departure-art').getContext('2d');pc.clearRect(0,0,320,160);
  if(moving)window.QG_ART.activity(pc,a.id,a.progress,a.kind,true,t);else window.QG_ART.sprite(pc,a.id,160,100,1.7);
 }
 $('qg-departure-close').addEventListener('click',()=>{departures.clear();draw(performance.now());});
 window.QG_ART.ready?.then(()=>{paintFleet();paintBase();draw(performance.now());});
 let raf=null,last=0;
 function animate(t){raf=null;if(document.hidden){last=0;return;}const delta=last?Math.min(120,t-last):0;last=t;departures.tick(delta);draw(t);if(moving||departures.active)raf=requestAnimationFrame(animate);else last=0;}
 function wakeAnimation(){if(raf===null&&!document.hidden&&(moving||departures.active)){last=0;raf=requestAnimationFrame(animate);}}
 function motion(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=0;$('qg-motion').setAttribute('aria-pressed',String(!moving));text('qg-motion',moving?'Pause animation':'Animer la base');draw(performance.now());wakeAnimation();}
 $('qg-motion').addEventListener('click',()=>{moving=!moving;motion();});document.addEventListener('visibilitychange',motion);reduced.addEventListener('change',()=>{moving=!reduced.matches;motion();});
 function transform(){const r=viewport.getBoundingClientRect(),maxX=r.width*(zoom-1)/2,maxY=r.height*(zoom-1)/2;pan.x=Math.max(-maxX,Math.min(maxX,pan.x));pan.y=Math.max(-maxY,Math.min(maxY,pan.y));$('qg-map-content').style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;text('qg-zoom-label',Math.round(zoom*100)+' %');viewport.classList.toggle('is-zoomed',zoom>1);$('qg-zoom-out').disabled=zoom<=1;$('qg-zoom-in').disabled=zoom>=2.5;}
 function setZoom(n){zoom=Math.max(1,Math.min(2.5,n));transform();}
 $('qg-zoom-in').addEventListener('click',()=>setZoom(zoom+.25));$('qg-zoom-out').addEventListener('click',()=>setZoom(zoom-.25));$('qg-center').addEventListener('click',()=>{pan={x:0,y:0};setZoom(1);});window.addEventListener('resize',transform);
 viewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.15:-.15));},{passive:false});
 const pointers=new Map();let lastDistance=0,dragged=false;
 viewport.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});e.target.setPointerCapture(e.pointerId);lastDistance=0;dragged=false;});
 viewport.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;if(Math.hypot(e.clientX-old.startX,e.clientY-old.startY)>8||pointers.size===2)dragged=true;pointers.set(e.pointerId,{...old,x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)setZoom(zoom*dist/lastDistance);lastDistance=dist;}else if(pointers.size===1){pan.x+=e.clientX-old.x;pan.y+=e.clientY-old.y;transform();}});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,e=>{pointers.delete(e.pointerId);lastDistance=0;});
 let installation=null,installationOpener=null;
 function refreshInstallation(){if(!installation)return;const b=E.buildings.find(b=>b.id===installation),l=state.buildings[b.id],a={type:'upgrade',id:b.id};text('qg-installation-title',b.name+' · niveau '+l);text('qg-installation-copy',b.effect);text('qg-installation-reason',reason(a));const button=$('qg-installation-upgrade');button.disabled=disabled(a);button.textContent=l===3?'Niveau maximum':'Améliorer · '+l*35+' cr. · 1 décision';const c=$('qg-installation-art').getContext('2d');c.clearRect(0,0,320,160);window.QG_ART.building(c,b.id,160,116,l,0,1.2,true);}
 function openInstallation(id,opener){installation=id;installationOpener=opener;refreshInstallation();$('qg-installation').showModal();$('qg-installation-close').focus();}
 $('qg-map-targets').innerHTML=E.buildings.map(b=>{const [x,y]=window.QG_LAYOUT.project(...window.QG_LAYOUT.buildings[b.id]);return `<button type="button" data-installation="${b.id}" aria-label="Gérer ${b.name}" title="${b.name}" style="left:${(x-48)/720*100}%;top:${(y-80)/440*100}%"><span>${b.name}</span></button>`;}).join('');
 $('qg-map-targets').addEventListener('click',e=>{const button=e.target.closest('[data-installation]');if(!button)return;if(dragged&&e.detail!==0){dragged=false;return;}openInstallation(button.dataset.installation,button);});
 $('qg-installation-upgrade').addEventListener('click',()=>{act({type:'upgrade',id:installation});refreshInstallation();});
 $('qg-installation-close').addEventListener('click',()=>{$('qg-installation').close();installationOpener?.focus();});
 $('qg-installation-base').addEventListener('click',()=>{$('qg-installation').close();showTab($('tab-base'));$('tab-base').focus();});
 $('qg-installation').addEventListener('cancel',()=>{installationOpener?.focus();});
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;const incoming=E.restore(e.newValue);if(incoming){state=incoming;selected={};departures.clear();text('qg-status','Campagne synchronisée avec un autre onglet.');render();}});
 if(!$('qg-status').textContent)text('qg-status',stored?'Ta campagne reprend là où tu l’as laissée.':'Bienvenue aux Aigrettes ! Choisis tes deux premières décisions.');
 save();markComplete();render();transform();motion();window.LDV_PROGRESS?.mount('qg');
})();
