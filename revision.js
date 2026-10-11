(() => {
 'use strict';
 const P=window.LDV_PROGRESS,E=window.LDV_ENGINS,F=window.LDV_FACTS,C=window.LDV_CHRONO,$=id=>document.getElementById(id);
 const filter=new URLSearchParams(location.search).get('jeu');
 const valid=x=>x.game==='radar'?['air','missile','naval'].includes(x.payload.kind)&&typeof x.payload.friend==='boolean':x.game==='vrai-faux'?F.some(f=>f.claim===x.id):x.game==='chrono'?Array.isArray(x.payload.names)&&x.payload.names.length===4&&x.payload.names.every(n=>C.some(c=>c.name===n)):E.some(e=>e.name===x.id);
 const deck=P.missed(P.games[filter]?filter:undefined).filter(valid);let index=0,corrected=0,resolved=false;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 function source(label,url){const a=el('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
 function finish(){ $('revision-play').hidden=true;$('revision-end').hidden=false;$('revision-retry').hidden=corrected>=deck.length;$('revision-end-copy').textContent=deck.length?`${corrected} question${corrected>1?'s':''} corrigée${corrected>1?'s':''} sur ${deck.length}. `+(corrected===deck.length?'Toutes ces questions sont désormais corrigées.':'Les questions à revoir restent dans ton carnet.'):'Aucune erreur à réviser ici. Joue une partie : les questions ratées apparaîtront automatiquement dans ton carnet.';}
 function reveal(ok,explanation,refs){if(resolved)return;resolved=true;if(ok){corrected++;P.review(deck[index].key,true)}$('revision-choices').querySelectorAll('button').forEach(b=>b.disabled=true);$('revision-order').querySelectorAll('button').forEach(b=>b.disabled=true);$('revision-check').hidden=true;const box=$('revision-feedback');box.replaceChildren(el('strong','',ok?'Bien retenu !':'Encore à réviser.'),el('p','',explanation));for(const r of refs)box.append(source(r.label,r.url));box.hidden=false;$('revision-next').hidden=false;$('revision-next').textContent=index+1===deck.length?'Voir mon bilan →':'Question suivante →';}
 function choices(values,answer,explanation,refs){const host=$('revision-choices');host.replaceChildren(...values.map(value=>{const b=el('button','',value);b.type='button';b.addEventListener('click',()=>{if(resolved)return;host.querySelectorAll('button').forEach(x=>{if(x.textContent===answer)x.classList.add('correct');else if(x===b)x.classList.add('wrong')});reveal(value===answer,explanation,refs)});return b}));}
 function round(){
  if(index>=deck.length){finish();return}resolved=false;const x=deck[index];$('revision-progress').textContent=`RÉVISION ${index+1} / ${deck.length} · ${P.games[x.game][0]}`;
  $('revision-feedback').hidden=true;$('revision-next').hidden=true;$('revision-check').hidden=true;$('revision-order').replaceChildren();$('revision-choices').replaceChildren();$('revision-photo').hidden=true;$('revision-credit').replaceChildren();
  if(x.game==='chrono'){
   const target=x.payload.names.map(n=>C.find(c=>c.name===n)).sort((a,b)=>a.year-b.year);let order=shuffle(target);if(order.every((v,i)=>v===target[i]))[order[0],order[1]]=[order[1],order[0]];
   $('revision-question').textContent='Replace ces premiers vols du plus ancien au plus récent.';
   function list(){const host=$('revision-order');host.replaceChildren(...order.map((c,i)=>{const li=el('li');li.append(el('strong','',c.name));for(const [delta,label] of [[-1,'Monter'],[1,'Descendre']]){const b=el('button','',delta<0?'↑':'↓');b.type='button';b.setAttribute('aria-label',label+' '+c.name);b.disabled=i+delta<0||i+delta>=order.length;b.addEventListener('click',()=>{[order[i],order[i+delta]]=[order[i+delta],order[i]];list();const buttons=$('revision-order').children[i+delta].querySelectorAll('button');(buttons[delta<0?0:1].disabled?[...buttons].find(b=>!b.disabled):buttons[delta<0?0:1])?.focus()});li.append(b)}return li}));}list();$('revision-check').hidden=false;$('revision-check').onclick=()=>reveal(order.every((c,i)=>c===target[i]),target.map(c=>`${c.date} : ${c.name}`).join(' · '),target.map(c=>({label:c.name+' — source',url:c.source})));return;
  }
  if(x.game==='radar'){
   const kind=x.payload.kind,friend=x.payload.friend;
   const names={air:'avion',missile:'missile',naval:'navire'},defenses={air:'Patrouille aérienne',missile:'Bouclier anti-missile',naval:'Patrouille maritime'};
   $('revision-question').textContent=`Dans Alerte radar, une piste ${names[kind]} est identifiée comme ${friend?'amie':'hostile fictive'}. Que fais-tu ?`;
   const answer=friend?'Je la laisse passer':defenses[kind];
   choices(shuffle(['Je la laisse passer',...Object.values(defenses)]),answer,friend?'Une piste amie peut continuer sans tir.':'Dans ce jeu fictif, chaque type de piste correspond au moyen de défense indiqué dans les règles. Elles ne représentent aucune procédure réelle.',[]);return;
  }
  const fact=x.game==='vrai-faux'?F.find(f=>f.claim===x.id):null,item=E.find(e=>e.name===(fact?fact.ref:x.id));
  if(!fact){const img=$('revision-photo');img.src='assets/jeu/'+item.photo;img.alt='Engin à identifier';img.hidden=false;}
  const credit=$('revision-credit');if(item)credit.append(source(item.photoAuthor+' · '+item.photoLicense,'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(item.photoFile)));
  if(fact){$('revision-question').textContent=fact.claim;choices(['Vrai','Faux'],fact.answer?'Vrai':'Faux',fact.reason,[{label:'Source documentaire ↗',url:fact.source||item.source}]);return}
  const isCountry=x.game==='pays';$('revision-question').textContent=isCountry?'Dans quel pays cet engin a-t-il été conçu ?':'Quel est cet engin ?';
  const answer=isCountry?item.country:item.name;
  const pool=isCountry?[...new Set(E.filter(e=>e.code!==item.code&&!(item.originCodes||[]).includes(e.code)).map(e=>e.country))]:E.filter(e=>e.name!==item.name&&e.category===item.category).map(e=>e.name);
  const distractors=shuffle(pool.filter(v=>v!==answer)).slice(0,3);
  choices(shuffle([answer,...distractors]),answer,item.explanation,[{label:'Source documentaire ↗',url:item.source}]);
 }
 $('revision-next').addEventListener('click',()=>{if(!resolved)return;index++;round()});
 round();
})();
