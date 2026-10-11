(()=>{
 'use strict';
 const E=window.QG,KEY='radar-qg-campaign-v1',$=id=>document.getElementById(id);
 let state,stored=false,storageOK=true,selected={},pending=null,zoom=1,pan={x:0,y:0};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let moving=!reduced.matches;
 try{const raw=localStorage.getItem(KEY);state=E.restore(raw);stored=!!state;if(raw&&!state)$('qg-status').textContent='L’ancienne sauvegarde est illisible. Une nouvelle campagne a été préparée.';}catch{storageOK=false;}
 state=state||E.fresh();
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}$('qg-save').textContent=storageOK?'✓ Campagne sauvegardée sur ce navigateur':'Sauvegarde indisponible : garde cette page ouverte.';}
 function text(id,value){$(id).textContent=value;}
 function disabled(a){return !E.action(state,a).ok;}
 function reason(a){const r=E.action(state,a);return r.ok?'Prêt pour cette décision.':r.message;}
 function markComplete(){if(state.ended&&window.LDV_PROGRESS)window.LDV_PROGRESS.complete('qg',E.score(state),1000,'Campagne · 12 semaines',state.id);}
 function act(a){const r=E.action(state,a);text('qg-status',r.message);if(!r.ok)return;state=r.state;save();if(state.ended)markComplete();render();if(state.ended)$('qg-end').focus();}
 function confirm(title,copy,callback){text('qg-confirm-title',title);text('qg-confirm-copy',copy);pending=callback;$('qg-confirm').showModal();$('qg-cancel').focus();}
 $('qg-cancel').addEventListener('click',()=>{$('qg-confirm').close();pending=null;});
 $('qg-confirm').addEventListener('cancel',()=>{pending=null;});
 $('qg-accept').addEventListener('click',()=>{const callback=pending;pending=null;$('qg-confirm').close();callback?.();});
 function restart(){confirm('Recommencer la campagne ?','La campagne sauvegardée sera remplacée. Tes records et les autres jeux sont conservés.',()=>{state=E.fresh();selected={};save();text('qg-status','Nouvelle équipe, nouvelle campagne. À toi de jouer !');render();$('qg-next').focus();});}
 $('qg-reset').addEventListener('click',restart);$('qg-replay').addEventListener('click',restart);
 $('qg-next').addEventListener('click',()=>{if(state.ended)return;const next=()=>act({type:'next'});if(state.actions>0)confirm(state.week===12?'Clore la campagne ?':'Terminer la semaine ?',`Il te reste ${state.actions} décision${state.actions>1?'s':''} disponible${state.actions>1?'s':''}. Elles ne sont pas reportées.`,next);else next();});
 function missionAction(m){return {type:'mission',id:m.id,unit:selected[m.id]};}
 function renderMissions(){
  $('qg-missions').innerHTML=E.offers(state).map(m=>{
   const options=E.units.filter(u=>u.type===m.type);if(!options.some(u=>u.id===selected[m.id]))selected[m.id]=(options.find(u=>!state.units[u.id].used&&state.units[u.id].condition>=45)||options[0]).id;
   const a=missionAction(m),done=state.done.includes(m.id);
   return `<article class="qg-card"><span class="qg-tag">${m.type.toUpperCase()} / ${done?'ACCOMPLIE':'MISSION PROPOSÉE'}</span><h3>${m.title}</h3><dl><dt>Coût du départ</dt><dd>${m.cost} cr.</dd><dt>Récompense</dt><dd>${m.reward} cr.</dd><dt>Gain net</dt><dd>+${m.reward-m.cost} cr.</dd><dt>Usure de l’engin</dt><dd>−${m.wear} pts</dd><dt>Compétence requise</dt><dd>${m.need} / 6</dd></dl><label for="mission-${m.id}">Engin à déployer · état minimum 45</label><select id="mission-${m.id}" data-mission-select="${m.id}" ${state.ended||done?'disabled':''}>${options.map(u=>`<option value="${u.id}" ${selected[m.id]===u.id?'selected':''}>${u.name} · ${state.units[u.id].condition}/100${state.units[u.id].used?' · déjà déployé':''}</option>`).join('')}</select><button type="button" data-action="mission" data-id="${m.id}" ${disabled(a)?'disabled':''}>${done?'✓ Mission accomplie':'Lancer la mission · 1 décision'}</button><span class="qg-reason" id="reason-${m.id}">${reason(a)}</span></article>`;
  }).join('');
 }
 function atlasIndex(name){return (window.LDV_ENGINS||[]).findIndex(u=>u.name===name);}
 function renderFleet(){
  $('qg-fleet').innerHTML=E.units.map(u=>{const v=state.units[u.id],a={type:'repair',id:u.id},i=atlasIndex(u.name);return `<article class="qg-card"><canvas class="qg-sprite" data-sprite="${u.id}" width="240" height="94" role="img" aria-label="Sprite de ${u.name}"></canvas><span class="qg-tag">${u.type.toUpperCase()} / ${v.used?'DÉPLOYÉ CETTE SEMAINE':'DISPONIBLE'}</span><h3>${u.name}</h3><p>${u.role}</p><span>État : <strong>${v.condition} / 100</strong></span><div class="qg-meter ${v.condition<45?'low':''}"><i style="width:${v.condition}%"></i></div><p>Réparation : +${Math.min(E.repair(state),100-v.condition)} points, dans la limite de 100.</p><button type="button" data-action="repair" data-id="${u.id}" ${disabled(a)?'disabled':''}>Réparer · 18 cr. · 1 décision</button><span class="qg-reason">${reason(a)}</span>${i>=0?`<a href="histoire.html?engin=${i}" target="_blank" rel="noopener">Histoire de l’engin ↗</a>`:''}</article>`;}).join('');
  document.querySelectorAll('[data-sprite]').forEach(canvas=>{const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;window.QG_ART.sprite(ctx,canvas.dataset.sprite,120,58,1.6);});
 }
 function renderBase(){
  $('qg-team').innerHTML=[['train','Former l’équipe',`Compétence ${state.skill}/6. +${Math.min(state.buildings.ecole,6-state.skill)} après une formation, et +4 de moral.`,'Former · 25 cr. · 1 décision'],['rest','Prendre soin du collectif',`Moral ${state.morale}/100. Une journée de repos rend jusqu’à 18 points de moral, sans dépenser de crédits.`,'Repos · 1 décision']].map(([id,title,desc,button])=>`<div><h3>${title}</h3><p>${desc}</p><button type="button" data-action="${id}" ${disabled({type:id})?'disabled':''}>${button}</button><div class="qg-reason">${reason({type:id})}</div></div>`).join('');
  $('qg-buildings').innerHTML=E.buildings.map(b=>{const l=state.buildings[b.id],a={type:'upgrade',id:b.id};return `<article class="qg-card"><span class="qg-tag">INSTALLATION / NIVEAU ${l}</span><h3>${b.name}</h3><div class="qg-levels" aria-label="Niveau ${l} sur 3">${[1,2,3].map(n=>`<i class="${n<=l?'on':''}"></i>`).join('')}</div><p>${b.effect}</p><button type="button" data-action="upgrade" data-id="${b.id}" ${disabled(a)?'disabled':''}>${l===3?'Niveau maximum':`Améliorer · ${l*35} cr. · 1 décision`}</button><span class="qg-reason">${reason(a)}</span></article>`;}).join('');
 }
 function render(){
  text('qg-week',String(state.week).padStart(2,'0')+' / 12');text('qg-cash',state.cash+' cr.');text('qg-actions',state.actions+' / 2');text('qg-morale',state.morale+' / 100');text('qg-skill',state.skill+' / 6');
  const e=E.events[state.deck[state.week-1]];text('qg-event-title',e[0]);text('qg-event-copy',e[1]+' Effet déjà appliqué.');text('qg-income','+'+E.income(state)+' cr.');text('qg-upkeep','−'+E.upkeep(state)+' cr.');const net=E.income(state)-E.upkeep(state);text('qg-net',(net>=0?'+':'')+net+' cr.');text('qg-map-level','NIVEAUX / '+Object.values(state.buildings).reduce((a,b)=>a+b,0));
  $('qg-next').disabled=state.ended;text('qg-next',state.ended?'Campagne terminée':state.week===12?'Terminer la campagne →':'Terminer la semaine →');
  renderMissions();renderFleet();renderBase();$('qg-log').replaceChildren(...state.log.map(line=>{const li=document.createElement('li');li.textContent=line;return li;}));
  $('qg-end').hidden=!state.ended;if(state.ended){const sc=E.score(state);text('qg-end-title',sc>=650?'Une base qui tient le cap.':sc>=400?'Une équipe sur la bonne voie.':'Une première campagne pour apprendre.');text('qg-end-copy',`${sc} / 1 000 points · ${state.completed} missions accomplies. Repars avec une nouvelle série d’événements pour essayer une autre stratégie.`);$('qg-score-details').innerHTML='<dl>'+E.tally(state).map(([name,n,max])=>`<div><dt>${name}</dt><dd>${n} / ${max}</dd></div>`).join('')+'</dl>';}
  draw(performance.now());
 }
 document.querySelector('.qg-shell').addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const a={type:b.dataset.action,id:b.dataset.id};if(a.type==='mission')a.unit=selected[a.id];act(a);});
 $('qg-missions').addEventListener('change',event=>{const id=event.target.dataset.missionSelect;if(!id)return;selected[id]=event.target.value;const a={type:'mission',id,unit:selected[id]},b=document.querySelector(`[data-action="mission"][data-id="${id}"]`);b.disabled=disabled(a);text('reason-'+id,reason(a));});
 const tabs=[...document.querySelectorAll('[role="tab"]')];
 function showTab(tab){tabs.forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;$(t.getAttribute('aria-controls')).hidden=!on;});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showTab(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();showTab(tabs[n]);tabs[n].focus();}});});
 const canvas=$('qg-map'),ctx=canvas.getContext('2d'),viewport=$('qg-map-viewport');ctx.imageSmoothingEnabled=false;
 function draw(t){window.QG_ART.scene(ctx,state,moving?t:0);}
 let raf,last=0;function animate(t){if(t-last>65){draw(t);last=t;}if(moving&&!document.hidden)raf=requestAnimationFrame(animate);}
 function motion(){cancelAnimationFrame(raf);$('qg-motion').setAttribute('aria-pressed',String(!moving));text('qg-motion',moving?'Pause animation':'Animer la base');if(moving&&!document.hidden)raf=requestAnimationFrame(animate);else draw(0);}
 $('qg-motion').addEventListener('click',()=>{moving=!moving;motion();});document.addEventListener('visibilitychange',motion);reduced.addEventListener('change',()=>{moving=!reduced.matches;motion();});
 function transform(){const r=viewport.getBoundingClientRect(),maxX=r.width*(zoom-1)/2,maxY=r.height*(zoom-1)/2;pan.x=Math.max(-maxX,Math.min(maxX,pan.x));pan.y=Math.max(-maxY,Math.min(maxY,pan.y));canvas.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;text('qg-zoom-label',Math.round(zoom*100)+' %');viewport.classList.toggle('is-zoomed',zoom>1);$('qg-zoom-out').disabled=zoom<=1;$('qg-zoom-in').disabled=zoom>=2.5;}
 function setZoom(n){zoom=Math.max(1,Math.min(2.5,n));transform();}
 $('qg-zoom-in').addEventListener('click',()=>setZoom(zoom+.25));$('qg-zoom-out').addEventListener('click',()=>setZoom(zoom-.25));$('qg-center').addEventListener('click',()=>{pan={x:0,y:0};setZoom(1);});window.addEventListener('resize',transform);
 viewport.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.15:-.15));},{passive:false});
 const pointers=new Map();let lastDistance=0;
 viewport.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});viewport.setPointerCapture(e.pointerId);lastDistance=0;});
 viewport.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)setZoom(zoom*dist/lastDistance);lastDistance=dist;}else if(pointers.size===1){pan.x+=e.clientX-old.x;pan.y+=e.clientY-old.y;transform();}});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,e=>{pointers.delete(e.pointerId);lastDistance=0;});
 window.addEventListener('storage',e=>{if(e.key!==KEY)return;const incoming=E.restore(e.newValue);if(incoming){state=incoming;selected={};text('qg-status','Campagne synchronisée avec un autre onglet.');render();}});
 if(!$('qg-status').textContent)text('qg-status',stored?'Ta campagne reprend là où tu l’as laissée.':'Bienvenue aux Aigrettes ! Choisis tes deux premières décisions.');
 save();markComplete();render();transform();motion();window.LDV_PROGRESS?.mount('qg');
})();
