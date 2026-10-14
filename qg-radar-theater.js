/* Campagne fictive : ordres, initiative adverse et ravitaillement au tour par tour. */
(function(root){
 'use strict';
 const Q=root.QG,clone=s=>JSON.parse(JSON.stringify(s)),clamp=(n,max=100)=>Math.max(0,Math.min(max,n));
 const sectors=[
  {id:'air',name:'Couloir du Phare',route:'la liaison aérienne',place:'Phare du Nord',enemy:'Patrouille aérienne',cargo:{fuel:12,parts:0,ammo:0}},
  {id:'terre',name:'Route de Val-Cèdre',route:'la route terrestre',place:'Val-Cèdre',enemy:'Barrage mobile',cargo:{fuel:0,parts:5,ammo:0}},
  {id:'mer',name:'Détroit d’Ambre',route:'la voie maritime',place:'Port-Ambre',enemy:'Vedettes de blocus',cargo:{fuel:10,parts:0,ammo:8}}
 ];
 const orders=[
  {id:'strike',name:'Neutraliser',description:'Réduire le risque de 18 et annuler l’offensive annoncée si elle vise cette liaison.',mechanics:['identify','engage','escape'],stages:['Identifier la menace','Neutraliser le groupe adverse','Replier l’équipe']},
  {id:'escort',name:'Escorter',description:'Réduire le risque et garantir la prochaine livraison complète sur cette liaison.',mechanics:['route','escort','dock'],stages:['Choisir le passage','Protéger le convoi','Réceptionner la cargaison']},
  {id:'recon',name:'Reconnaître',description:'Réduire le risque de 6 et obtenir du renseignement pour les deux semaines suivantes : pression adverse atténuée et une étape manquée couverte.',mechanics:['scan','identify','escape'],stages:['Balayer la zone','Identifier le groupe adverse','Ramener le renseignement']}
 ];
 const legacyStages={air:['Repérer la patrouille adverse','Repousser l’appareil hostile','Sécuriser le retour'],terre:['Localiser le barrage adverse','Neutraliser le véhicule hostile','Rouvrir la route'],mer:['Identifier la vedette adverse','Repousser le raid maritime','Escorter le convoi']};
 const sector=id=>sectors.find(x=>x.id===id),getOrder=id=>orders.find(x=>x.id===id);
 function newIntent(s){const scores=sectors.map((x,i)=>({id:x.id,n:s.content.theater.risk[x.id]+((s.seed+s.week*7+i*11)%17)}));scores.sort((a,b)=>b.n-a.n);return {sector:scores[0].id,disrupted:false};}
 function addEntry(s,label,amount){s.content.theater.ledger.unshift({week:s.week,label,amount,balance:s.cash});s.content.theater.ledger=s.content.theater.ledger.slice(0,18);}
 function enrich(s){
  if(!s)return null;
  if(s.content.theater===undefined)s.content.theater={version:1,startWeek:s.week,risk:{air:38,terre:44,mer:50},ledger:[{week:s.week,label:'Solde à la reprise du suivi',amount:0,balance:s.cash}],lastReport:null,outcome:null};
  const t=s.content.theater;
  if(t?.version===1){t.version=2;t.routes=Object.fromEntries(sectors.map(x=>[x.id,{escorted:false,intelUntil:0}]));t.intent=newIntent(s);t.delivery=null;t.resolved={};}
  s.content.incidentDone=true;
  if(s.content.operation&&t?.version===2){const op=s.content.operation;if(op.rules===undefined)op.rules=1;if(!op.order)op.order=Q.mission(s,op.id,op.unit).combat?'strike':'escort';const m=mission(s,op.id,op.unit,op.order);op.scenario=scenario(s,m,op.rules===1,op.intel===true);}
  return s;
 }
 function fresh(seed){const s=enrich(Q.fresh(seed));s.content.theater.ledger[0].label='Budget initial disponible après l’événement';return s;}
 function restore(raw){try{
  const s=enrich(Q.restore(raw));if(!s)return null;const t=s.content.theater,int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
  if(!t||t.version!==2||!int(t.startWeek,1,s.week)||!t.risk||Object.keys(t.risk).length!==3||sectors.some(x=>!int(t.risk[x.id],0,100))||!Array.isArray(t.ledger)||t.ledger.length>18||t.ledger.some(e=>!e||!int(e.week,1,s.week)||typeof e.label!=='string'||e.label.length>160||!int(e.amount,-9999,9999)||!int(e.balance,0,9999))||![null,'secured','partial','contested'].includes(t.outcome))return null;
  if(!t.routes||Object.keys(t.routes).length!==3||sectors.some(x=>{const r=t.routes[x.id];return !r||typeof r.escorted!=='boolean'||!int(r.intelUntil,0,1000002);})||!t.intent||!sector(t.intent.sector)||typeof t.intent.disrupted!=='boolean'||!t.resolved||Object.keys(t.resolved).length>2||Object.entries(t.resolved).some(([id,r])=>!sector(id)||!r||!Q.units.some(u=>u.id===r.unit&&u.type===id)||!getOrder(r.order)||typeof r.success!=='boolean'))return null;
  if(t.delivery!==null){const d=t.delivery;if(!d||!int(d.week,1,s.week)||!Array.isArray(d.rows)||d.rows.length!==3||new Set(d.rows.map(r=>r.sector)).size!==3||d.rows.some(r=>!sector(r.sector)||!['complete','partial','blocked'].includes(r.status)||!r.cargo||['fuel','parts','ammo'].some(k=>!int(r.cargo[k],0,sector(r.sector).cargo[k]))))return null;}
  if(t.lastReport!==null){const r=t.lastReport;if(!r||typeof r.title!=='string'||r.title.length>140||typeof r.success!=='boolean'||!sector(r.sector)||![r.before,r.after].every(n=>int(n,0,100))||!int(r.funding,0,9999)||(r.order!==undefined&&!getOrder(r.order)))return null;}
  const op=s.content.operation;if(op&&(![1,2].includes(op.rules)||!getOrder(op.order)||(op.rules===2&&!availableOrders(s,op.unit).some(o=>o.id===op.order))||(op.intel!==undefined&&typeof op.intel!=='boolean')))return null;
  return s;
 }catch{return null;}}
 function availableOrders(s,unit){return orders.filter(o=>o.id!=='strike'||Q.profiles[unit]?.combat);}
 function mission(s,id,unit,order){const base=Q.mission(s,id,unit);if(!base)return null;const x=sector(base.type),o=getOrder(order||(base.combat?'strike':'escort'));if(!x||!o)return null;const combat=base.combat&&o.id!=='recon',name=Q.units.find(u=>u.id===unit).name;
  const titles={strike:{air:'Repousser le raid du Phare',terre:'Lever le barrage de Val-Cèdre',mer:'Briser le blocus de Port-Ambre'},escort:{air:'Escorter la rotation du Phare',terre:'Protéger le convoi de Val-Cèdre',mer:'Escorter le ravitaillement maritime'},recon:{air:'Observer le Couloir du Phare',terre:'Reconnaître la route de Val-Cèdre',mer:'Repérer les vedettes du Détroit'}};
  const wear=o.id==='recon'?Math.max(8,Math.floor(base.wear*.55)):base.wear,reduction=o.id==='strike'?18:o.id==='recon'?6:base.combat?12:14;
  return {...base,title:titles[o.id][x.id],copy:'Déploie l’unité « '+name+' » sur '+x.name+'. '+o.description,combat,order:o.id,sector:x.id,objective:o.id==='escort'?'Faire parvenir la cargaison à la base.':o.id==='recon'?'Observer le Front de Silex et préparer les prochains départs.':'Rouvrir le passage et contrer l’initiative adverse.',riskReduction:reduction,stages:o.stages,mechanics:o.mechanics,wear,maxDamage:wear+(o.id==='strike'?12:6),reward:o.id==='recon'?Math.max(18,Math.round(base.reward*.65)):base.reward};
 }
 function scenario(s,m,legacy,intel){return {title:m.title,sector:m.type,objective:m.objective,stages:legacy?legacyStages[m.type]:m.stages,mechanics:legacy?['legacy','legacy','legacy']:m.mechanics,order:m.order,combat:m.combat,intel};}
 function offers(s){return Q.offers(s).map(m=>mission(s,m.id,m.unit));}
 function resourceCost(s,m,mode='normal'){const costs=Q.resourceCost(s,m,mode);if(m.order==='recon'){costs.ammo=0;costs.fuel=Math.max(1,costs.fuel-2);}else if(m.order==='escort'&&m.combat)costs.ammo=3;return costs;}
 function supportAllowed(m,id){const u=Q.units.find(u=>u.id===id);return !!u&&(u.type===m.type||id==='drone'||m.type==='terre'&&['caracal','nh90'].includes(id));}
 function funding(s){const risk=s.content?.theater?.risk.mer??50,convoy=risk<40?8:risk>=68?-8:0;return {allocation:46,network:Q.income(s)-46,convoy,total:Q.income(s)+convoy,upkeep:Q.upkeep(s)};}
 function income(s){return funding(s).total;}
 function overview(s){const t=s.content.theater,ordered=sectors.map(x=>({...x,risk:t.risk[x.id],status:t.risk[x.id]>=68?'Bloquée':t.risk[x.id]>50?'Perturbée':'Ouverte'})).sort((a,b)=>b.risk-a.risk);return {sectors:ordered,worst:ordered[0],secured:ordered.filter(x=>x.risk<=50).length,baseSafe:Math.min(...Object.values(s.integrity))>=35};}
 function forecast(s){const t=s.content.theater,risk={...t.risk},target=t.intent.sector,intel=t.routes[target].intelUntil>=s.week,extra=t.intent.disrupted?0:intel?4:8;
  for(const x of sectors)risk[x.id]=clamp(risk[x.id]+4+(x.id===target?extra:0));
  const rows=sectors.map(x=>{const ratio=t.routes[x.id].escorted||risk[x.id]<=50?1:risk[x.id]<68?.5:0;return {sector:x.id,status:ratio===1?'complete':ratio===0?'blocked':'partial',cargo:Object.fromEntries(Object.entries(x.cargo).map(([k,n])=>[k,Math.floor(n*ratio)]))};});
  const gains=Object.fromEntries(['fuel','parts','ammo'].map(k=>[k,rows.reduce((n,r)=>n+r.cargo[k],0)]));return {risk,rows,gains,extra,target};
 }
 // Appelé avant les bonus de développement : les pièces réellement livrées financent la maintenance.
 function weeklySupply(before,after){enrich(after);const f=forecast(before),t=after.content.theater;t.risk=f.risk;t.delivery={week:after.week,rows:f.rows};for(const x of sectors)t.routes[x.id].escorted=false;t.resolved={};t.intent=newIntent(after);after.alert=after.week>=3&&overview(after).worst.risk>=68?{id:'alerte-'+after.week,pending:true,result:null,sector:overview(after).worst.id}:null;return f.gains;}
 function effectText(order,success,countered=false){if(!success)return 'Le groupe adverse tient toujours le passage.';return order==='escort'?'Une livraison complète a été garantie sur cette liaison.':order==='recon'?'Renseignement obtenu pour les deux semaines suivantes : pression adverse atténuée et une étape manquée couverte.':countered?'L’offensive annoncée est neutralisée pour cette semaine.':'Le groupe adverse est repoussé sur cette liaison.';}
 function action(state,a){
  if(!a||typeof a!=='object')return {ok:false,state,message:'Action inconnue.'};const source=enrich(clone(state));
  if(a.type==='mission'){const m=mission(source,a.id,a.unit,a.order);if(!m||!availableOrders(source,a.unit).some(o=>o.id===m.order))return {ok:false,state,message:'Cet ordre ne convient pas à l’engin.'};if(a.support&&!supportAllowed(m,a.support))return {ok:false,state,message:'Choisis un soutien adapté à cette liaison.'};a={...a,order:m.order};}
  const op=source.content.operation?clone(source.content.operation):null,r=Q.action(source,a);if(!r.ok)return {...r,state};const s=enrich(r.state),t=s.content.theater;s.cash=clamp(s.cash,9999);
  let label={repair:'Entretien d’un engin',repairBuilding:'Réparation d’une installation',upgrade:'Amélioration de la base',train:'Formation de l’équipe',resupply:'Transport urgent de ravitaillement',unlock:'Accueil d’un renfort',project:'Projet de développement',claimMilestone:'Soutien du commandement : objectif atteint',incident:'Décision logistique'}[a.type];
  if(a.type==='mission'){const m=mission(s,a.id,a.unit,a.order);Object.assign(s.content.operation,{rules:2,order:m.order,intel:source.content.theater.routes[m.type].intelUntil>=source.week});s.content.operation.scenario=scenario(s,m,false,s.content.operation.intel);r.message=m.title+' : départ confirmé. '+m.objective;s.log[0]=r.message;label='Préparation : '+m.title;}
  if(r.operationResult&&op){const m=mission(source,op.id,op.unit,op.order),before=t.risk[m.type],success=r.operationResult.success;t.risk[m.type]=clamp(before+(success?-m.riskReduction:6));if(success){if(m.order==='escort')t.routes[m.type].escorted=true;if(m.order==='recon')t.routes[m.type].intelUntil=s.week+2;if(m.order==='strike'&&t.intent.sector===m.type)t.intent.disrupted=true;}const received=Math.max(0,s.cash-source.cash);t.lastReport={title:m.title,sector:m.type,success,before,after:t.risk[m.type],funding:received,order:m.order,countered:m.order==='strike'&&t.intent.sector===m.type};t.resolved[m.type]={unit:op.unit,order:m.order,success};r.message=(success?'Objectif atteint':'Repli')+' · '+sector(m.type).name+' : risque '+before+' → '+t.risk[m.type]+'/100. '+received+' cr. de financement. '+effectText(m.order,success,t.lastReport.countered);s.log[0]=r.message;label='Financement : '+m.title;}
  if(a.type==='intercept'){const x=sector(s.alert?.sector)||overview(s).worst,before=t.risk[x.id];t.risk[x.id]=clamp(before+(a.hit?-8:6));r.message+=' '+x.name+' : risque '+before+' → '+t.risk[x.id]+'.';s.log[0]=r.message;}
  if(s.week!==source.week){const f=funding(source),e=Q.event(s),ec=e[2]==='cash'?e[3]:0;s.cash=clamp(clamp(source.cash+f.total-f.upkeep,9999)+ec,9999);label='Dotation '+f.total+' − entretien '+f.upkeep+' ; événement inclus';const p=forecast(source);s.log.unshift('Mouvement adverse : '+sector(p.target).enemy+(p.extra?' ; risque +'+p.extra+' sur ce secteur.':' neutralisé.'));const c=t.delivery.rows.map(row=>sector(row.sector).name+' : '+({complete:'livraison complète',partial:'livraison partielle',blocked:'livraison bloquée'}[row.status])).join(' ; ');s.log.unshift(c);s.log=s.log.slice(0,16);r.message+=' Les livraisons et le mouvement adverse sont dans le journal.';}
  if(s.ended&&!source.ended){const o=overview(s);t.outcome=o.secured===3&&o.baseSafe?'secured':o.secured>=1&&o.baseSafe?'partial':'contested';}
  const delta=s.cash-state.cash;if(delta!==0)addEntry(s,label||'Ajustement du budget',delta);return {...r,state:s};
 }
 root.QG={...Q,fresh,restore,action,mission,offers,income,resourceCost,supportAllowed,theater:{sectors,orders,availableOrders,funding,overview,forecast,weeklySupply,effectText}};
})(typeof window!=='undefined'?window:globalThis);
