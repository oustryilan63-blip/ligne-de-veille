/* Développement de la base : extension compatible avec les campagnes existantes. */
(function(root){
 'use strict';
 const Q=root.QG,clone=s=>JSON.parse(JSON.stringify(s));
 const projects=[
  {id:'logistics',name:'Chaîne logistique',cost:45,building:'radar',skill:2,missions:1,description:'+10 carburant et +2 pièces chaque semaine. Les ravitaillements apportent aussi +10 carburant, +4 pièces et +4 munitions.'},
  {id:'maintenance',name:'Maintenance préventive',cost:55,building:'atelier',skill:2,missions:2,description:'+4 d’état à tous les engins chaque semaine, contre 2 pièces si les réserves le permettent.'},
  {id:'coordination',name:'Coordination du QG',cost:70,building:'ecole',skill:3,missions:4,description:'Un ordre de gestion supplémentaire par semaine pour réparer, améliorer, former, ravitailler ou reposer l’équipe. Il ne permet pas une mission supplémentaire.'}
 ];
 const milestones=[
  {id:'first',name:'Prendre ses marques',goals:s=>[{label:'Mission réussie',value:s.completed,target:1},{label:'Installation améliorée',value:upgrades(s),target:1}],reward:{cash:20,parts:5}},
  {id:'team',name:'Former une équipe autonome',goals:s=>[{label:'Compétence',value:s.skill,target:3},{label:'Installations améliorées',value:upgrades(s),target:2}],reward:{cash:25,fuel:15}},
  {id:'fleet',name:'Une flotte polyvalente',goals:s=>[{label:'Engins possédés',value:Q.owned(s).length,target:8},{label:'Missions réussies',value:s.completed,target:6}],reward:{cash:35,ammo:8}},
  {id:'base',name:'Une base qui tient le cap',goals:s=>[{label:'Missions réussies',value:s.completed,target:10},{label:'Améliorations',value:upgrades(s),target:5},{label:'Intégrité minimale',value:Math.min(...Object.values(s.integrity)),target:50}],reward:{cash:40,parts:8}}
 ];
 const managementActions=new Set(['repair','repairBuilding','upgrade','train','rest','resupply']);
 function upgrades(s){return Object.values(s.buildings).reduce((n,l)=>n+l-1,0);}
 function enrich(s){if(!s)return null;if(s.content.development===undefined)s.content.development={version:1,projects:Object.fromEntries(projects.map(p=>[p.id,false])),claimed:[],orderUsed:false};return s;}
 function fresh(seed){return enrich(Q.fresh(seed));}
 function restore(raw){try{const s=Q.restore(raw);if(!s)return null;enrich(s);const d=s.content.development;if(!d||d.version!==1||!d.projects||Object.keys(d.projects).length!==projects.length||projects.some(p=>typeof d.projects[p.id]!=='boolean')||typeof d.orderUsed!=='boolean'||!Array.isArray(d.claimed)||d.claimed.length>milestones.length||new Set(d.claimed).size!==d.claimed.length||d.claimed.some(id=>!milestones.some(m=>m.id===id)))return null;return s;}catch{return null;}}
 function has(s,id){return !!s.content?.development?.projects[id];}
 function reserve(s){return !s.ended&&has(s,'coordination')&&!s.content.development.orderUsed;}
 function decisionCost(s,a){return s.actions>0?1:reserve(s)&&managementActions.has(a.type)?0:1;}
 function supplyGains(s){return has(s,'logistics')?{fuel:55,parts:18,ammo:22}:{fuel:45,parts:14,ammo:18};}
 function rank(s){const points=s.completed*35+upgrades(s)*20+Math.max(0,Q.owned(s).length-6)*30+(s.skill-1)*15+projects.filter(p=>has(s,p.id)).length*35,levels=[['Avant-poste',0],['Base organisée',100],['Base autonome',250],['Base confirmée',450],['QG de référence',750]];let index=0;while(index<levels.length-1&&points>=levels[index+1][1])index++;return {level:index+1,name:levels[index][0],points,from:levels[index][1],next:levels[index+1]?.[1]||null};}
 function projectReason(s,id){const p=projects.find(p=>p.id===id);if(!p)return 'Projet inconnu.';if(has(s,id))return 'Déjà installé.';if(s.ended)return 'Poursuis en mode libre pour développer la base.';if(s.content.operation)return 'Termine l’opération en cours.';if(s.actions<1)return 'Une décision disponible est nécessaire.';if(s.buildings[p.building]<2)return Q.buildings.find(b=>b.id===p.building).name+' niveau 2 requis.';if(s.skill<p.skill)return 'Compétence '+p.skill+'/6 requise.';if(s.completed<p.missions)return p.missions+' mission(s) réussie(s) requise(s).';if(s.cash<p.cost)return 'Il faut '+p.cost+' crédits.';return '';}
 function milestoneStatus(s,m){return m.goals(s).every(g=>g.value>=g.target);}
 function log(s,message){s.log.unshift(message);s.log=s.log.slice(0,16);}
 function action(state,a){
  const fail=message=>({ok:false,state,message});if(!a||typeof a!=='object')return fail('Action inconnue.');const s=enrich(clone(state)),d=s.content.development;
  if(a.type==='project'){
   const why=projectReason(s,a.id);if(why)return fail(why);const p=projects.find(p=>p.id===a.id);s.cash-=p.cost;s.actions--;d.projects[p.id]=true;if(p.id==='coordination')d.orderUsed=false;const message=p.name+' installée : '+p.description;log(s,message);return {ok:true,state:s,message};
  }
  if(a.type==='claimMilestone'){
   const m=milestones.find(m=>m.id===a.id);if(!m)return fail('Objectif inconnu.');if(s.ended||s.content.operation)return fail('Termine l’opération ou poursuis en mode libre avant de réclamer une récompense.');if(d.claimed.includes(m.id))return fail('Cette récompense a déjà été reçue.');if(!milestoneStatus(s,m))return fail('Les conditions ne sont pas encore remplies.');d.claimed.push(m.id);s.cash=Math.min(9999,s.cash+(m.reward.cash||0));for(const k of ['fuel','parts','ammo'])s.content.resources[k]=Math.min(Q.resourceCaps[k],s.content.resources[k]+(m.reward[k]||0));const message='Objectif atteint : '+m.name+' · '+m.reward.cash+' crédits et des réserves reçus.';log(s,message);return {ok:true,state:s,message};
  }
  const useReserve=s.actions===0&&reserve(s)&&managementActions.has(a.type),eligible=useReserve?{...s,actions:1}:s,result=Q.action(eligible,a);if(!result.ok)return fail(result.message);const next=enrich(result.state),nd=next.content.development;
  if(useReserve){next.actions=0;nd.orderUsed=true;result.message+=' Ordre de gestion supplémentaire utilisé.';next.log[0]=result.message;}
  if(a.type==='resupply'&&has(s,'logistics')){for(const [k,gain]of Object.entries({fuel:10,parts:4,ammo:4}))next.content.resources[k]=Math.min(Q.resourceCaps[k],next.content.resources[k]+gain);result.message='Ravitaillement renforcé : +55 carburant, +18 pièces, +22 munitions (limités aux capacités).'+(useReserve?' Ordre de gestion supplémentaire utilisé.':'');next.log[0]=result.message;}
  if(next.week!==s.week){
   nd.orderUsed=false;const notes=[];
   if(has(next,'logistics')){for(const[k,gain]of Object.entries({fuel:10,parts:2}))next.content.resources[k]=Math.min(Q.resourceCaps[k],next.content.resources[k]+gain);notes.push('logistique +10 carburant, +2 pièces');}
   if(has(next,'maintenance')){if(next.content.resources.parts>=2){next.content.resources.parts-=2;for(const u of Q.owned(next))next.units[u.id].condition=Math.min(100,next.units[u.id].condition+4);notes.push('maintenance −2 pièces, flotte +4 d’état');}else notes.push('maintenance suspendue : moins de 2 pièces');}
   if(notes.length)log(next,'Développement — '+notes.join(' ; ')+'.');
  }
  return {...result,state:next};
 }
 root.QG={...Q,fresh,restore,action,projects,milestones,projectReason,milestoneStatus,rank,reserve,decisionCost,supplyGains};
})(typeof window!=='undefined'?window:globalThis);
