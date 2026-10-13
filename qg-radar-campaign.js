/* Extension de campagne : ressources de jeu, décisions et opérations interactives. */
(function(root){
 'use strict';
 const L=root.QG,clone=s=>JSON.parse(JSON.stringify(s)),caps={fuel:200,parts:80,ammo:100};
 for(const extra of [{id:'drone',name:'Drone de reconnaissance',type:'air',role:'Repérage et soutien des opérations',unlock:{building:'radar',level:2,skill:2,cost:55}},
 {id:'depanneur',name:'Véhicule de dépannage',type:'terre',role:'Assistance technique et récupération',unlock:{building:'atelier',level:2,skill:2,cost:45}}])if(!L.units.some(u=>u.id===extra.id))L.units.push(extra);
 L.profiles.drone={titles:['Repérer un itinéraire','Observer une zone','Guider une équipe'],copy:'Le drone prépare le passage de l’équipe dans un secteur de jeu.',cost:8,reward:30,wear:12};
 L.profiles.depanneur={titles:['Récupérer un véhicule immobilisé','Remettre une équipe en mouvement','Soutenir un convoi'],copy:'Le dépanneur aide les véhicules immobilisés à rejoindre la base.',cost:9,reward:33,wear:12};
 const incidentTypes=[
 {title:'Livraison retardée',copy:'Un camion de ravitaillement est bloqué. Choisis comment préserver tes stocks.',options:[{label:'Transport urgent · 18 cr.',cash:-18,fuel:30,ammo:15},{label:'Réorganiser les réserves',fuel:10,parts:3,morale:-3}]},
 {title:'Panne sur un groupe électrogène',copy:'L’équipe peut réparer tout de suite ou maintenir une installation au ralenti.',options:[{label:'Utiliser 6 pièces · moral +4',parts:-6,morale:4},{label:'Commander une réparation · 14 cr.',cash:-14,parts:4},{label:'Maintenir au ralenti · moral −4',morale:-4}]},
 {title:'Fenêtre météo courte',copy:'Une rotation logistique est possible avant le changement de météo.',options:[{label:'Envoyer une rotation · 12 carburant',fuel:-12,parts:12,ammo:10},{label:'Préserver le carburant · moral +2',morale:2}]},
 {title:'Un convoi demande de l’aide',copy:'Une équipe voisine manque de matériel. Aider ou préserver la réserve ?',options:[{label:'Céder 8 pièces · 20 cr. et moral +6',parts:-8,cash:20,morale:6},{label:'Garder les stocks',morale:-2,fuel:6}]}
 ];
 function incident(s){const n=(s.seed+s.week*3)%incidentTypes.length;return {...incidentTypes[n],index:n};}
 function enrich(s){if(!s)return null;s.content=s.content||{version:1,resources:{fuel:100,parts:30,ammo:40},incidentDone:s.week===1,operation:null};return s;}
 function fresh(seed){return enrich(L.fresh(seed));}
 function restore(raw){try{const input=typeof raw==='string'?JSON.parse(raw):clone(raw);if(!input)return null;
  if(input.v===2||input.v===3)for(const id of ['drone','depanneur'])if(input.units&&!input.units[id])input.units[id]={condition:0,used:false,owned:false};
  const s=enrich(L.restore(input));if(!s)return null;const c=s.content;
  if(c.version!==1||typeof c.incidentDone!=='boolean'||!c.resources||Object.keys(c.resources).length!==3||Object.entries(caps).some(([k,max])=>!Number.isInteger(c.resources[k])||c.resources[k]<0||c.resources[k]>max))return null;
  if(c.operation!==null){const o=c.operation;if(!o||!L.units.some(u=>u.id===o.unit)||!s.units[o.unit].owned||!s.units[o.unit].used||!L.mission(s,o.id,o.unit)||!['normal','prudent','rapide'].includes(o.mode)||!Number.isInteger(o.stage)||o.stage<0||o.stage>2||!Number.isInteger(o.hits)||o.hits<0||o.hits>o.stage||!['air','terre','mer','soutien'].includes(o.kind)||typeof o.support!=='string'||(o.support&&(!L.units.some(u=>u.id===o.support)||o.support===o.unit||!s.units[o.support].owned||!s.units[o.support].used))||s.done.includes(o.id)||s.ended)return null;}
  return s;
 }catch{return null;}}
 function resourceCost(s,m,mode='normal'){return {fuel:(m.type==='mer'?18:m.type==='air'?14:10)+(mode==='prudent'?6:mode==='rapide'?-3:0),parts:2,ammo:m.combat?6:0};}
 function supportLabel(id){return id==='drone'?'repérage':id==='depanneur'?'assistance technique':'couverture de l’équipe';}
 function action(state,a){
  const fail=message=>({ok:false,state,message});if(!a||typeof a!=='object')return fail('Action inconnue.');
  const current=enrich(clone(state));
  if(current.content.operation&&!['operationStep','intercept'].includes(a.type))return fail('Termine ou reprends l’opération en cours avant une nouvelle décision.');
  if(a.type==='next'&&!current.content.incidentDone)return fail('Choisis une réponse à l’événement de la semaine.');
  if(a.type==='incident'){
   if(current.ended||current.content.incidentDone)return fail('Cet événement est déjà résolu.');const option=incident(current).options[a.choice];if(!option)return fail('Choix inconnu.');
   if(current.cash+(option.cash||0)<0||Object.keys(caps).some(k=>current.content.resources[k]+(option[k]||0)<0))return fail('Les réserves ne couvrent pas ce choix.');
   current.cash+=option.cash||0;for(const k of Object.keys(caps))current.content.resources[k]=Math.min(caps[k],current.content.resources[k]+(option[k]||0));current.morale=Math.max(0,Math.min(100,current.morale+(option.morale||0)));current.content.incidentDone=true;const message=incident(current).title+' : '+option.label+'.';current.log.unshift(message);current.log=current.log.slice(0,16);return {ok:true,state:current,message};
  }
  if(a.type==='resupply'){
   if(current.ended||current.actions<1)return fail('Une décision disponible est nécessaire.');if(current.cash<24)return fail('Il faut 24 crédits.');if(Object.keys(caps).every(k=>current.content.resources[k]===caps[k]))return fail('Les stocks sont déjà pleins.');current.cash-=24;current.actions--;for(const [k,gain] of Object.entries({fuel:45,parts:14,ammo:18}))current.content.resources[k]=Math.min(caps[k],current.content.resources[k]+gain);const message='Ravitaillement reçu : +45 carburant, +14 pièces, +18 munitions (limités à la capacité des réserves).';current.log.unshift(message);current.log=current.log.slice(0,16);return {ok:true,state:current,message};
  }
  if(a.type==='mission'){
   const eligible=L.action(current,a);if(!eligible.ok)return fail(eligible.message);const m=L.mission(current,a.id,a.unit),mode=a.mode||'normal',support=a.support||'';
   if(!['normal','prudent','rapide'].includes(mode))return fail('Préparation inconnue.');
   if(support&&(!current.units[support]?.owned||current.units[support].used||current.units[support].condition<45||support===a.unit))return fail('Choisis un soutien disponible, en état de partir.');
   const costs=resourceCost(current,m,mode);if(support)costs.fuel+=5;for(const k of Object.keys(caps))if(current.content.resources[k]<costs[k])return fail('Stock insuffisant : '+({fuel:'carburant',parts:'pièces',ammo:'munitions'}[k])+'. Ravitaille la base.');
   current.cash-=m.cost;current.actions--;for(const k of Object.keys(caps))current.content.resources[k]-=costs[k];current.units[a.unit].used=true;if(support)current.units[support].used=true;
   current.content.operation={id:a.id,unit:a.unit,support,mode,stage:0,hits:0,kind:m.combat?m.type:'soutien'};
   const message=m.title+' : préparation terminée. Réussis les trois étapes interactives'+(support?' avec '+supportLabel(support):'')+'.';current.log.unshift(message);current.log=current.log.slice(0,16);return {ok:true,state:current,message,operation:true};
  }
  if(a.type==='operationStep'){
   const op=current.content.operation;if(!op||a.id!==op.id||a.stage!==op.stage||typeof a.hit!=='boolean')return fail('Cette étape est déjà résolue ou inconnue.');op.hits+=a.hit?1:0;op.stage++;
   if(op.stage<3)return {ok:true,state:current,message:'Étape '+op.stage+'/3 : '+(a.hit?'objectif atteint.':'difficulté rencontrée.')};
   const m=L.mission(current,op.id,op.unit),success=op.hits+(op.support?1:0)>=2,reward=success?m.reward:Math.floor(m.reward*.25),wear=success?m.wear:m.maxDamage;
   current.cash=Math.min(9999,current.cash+reward);current.units[op.unit].condition=Math.max(0,current.units[op.unit].condition-wear);if(op.support)current.units[op.support].condition=Math.max(0,current.units[op.support].condition-8);current.done.push(op.id);if(success)current.completed++;current.morale=Math.max(0,Math.min(100,current.morale+(success?3:-5)));current.content.operation=null;
   const message=m.title+' : '+(success?'réussite':'repli')+' · '+op.hits+'/3 étapes réussies'+(op.support?' + soutien':'')+' · '+reward+' crédits reçus · usure −'+wear+'.';current.log.unshift(message);current.log=current.log.slice(0,16);return {ok:true,state:current,message,operationResult:{success,hits:op.hits}};
  }
  if(a.type==='repair'&&current.content.resources.parts<6)return fail('Il faut 6 pièces pour réparer cet engin.');
  const result=L.action(current,a);if(!result.ok)return fail(result.message);const s=enrich(result.state);
  if(a.type==='repair')s.content.resources.parts-=6;
  if((a.type==='next'||a.type==='continue')&&s.week!==current.week){for(const [k,gain] of Object.entries({fuel:22,parts:5,ammo:8}))s.content.resources[k]=Math.min(caps[k],s.content.resources[k]+gain);s.content.incidentDone=false;}
  if(a.type==='intercept')s.content.resources.ammo=Math.max(0,s.content.resources.ammo-2);
  return {...result,state:s};
 }
 root.QG={...L,fresh,restore,action,incident,resourceCost,resourceCaps:caps};
})(typeof window!=='undefined'?window:globalThis);
