/* QG Radar — économie et sauvegarde, indépendantes de l’affichage. */
(function(root){
 'use strict';
 const units=[
  {id:'rafale',name:'Rafale',type:'air',role:'Combat aérien & frappe fictive'},
  {id:'caracal',name:'H225M Caracal',type:'air',role:'Secours & transport'},
  {id:'leclerc',name:'Leclerc',type:'terre',role:'Assaut blindé'},
  {id:'caesar',name:'CAESAR',type:'terre',role:'Appui d’artillerie'},
  {id:'fremm',name:'FREMM Aquitaine',type:'mer',role:'Combat naval & escorte'},
  {id:'suffren',name:'Classe Suffren',type:'mer',role:'Combat sous-marin'},
  {id:'griffon',name:'VBMR Griffon',type:'terre',role:'Transport protégé',unlock:{building:'atelier',level:2,skill:2,cost:65}},
  {id:'nh90',name:'NH90',type:'air',role:'Transport & évacuation',unlock:{building:'hangar',level:2,skill:3,cost:85}},
  {id:'a400m',name:'A400M Atlas',type:'air',role:'Transport logistique',unlock:{building:'hangar',level:3,skill:4,cost:120}}
 ];
 const buildings=[
  {id:'atelier',name:'Atelier',effect:'Réparations : +10 points par niveau supplémentaire.'},
  {id:'hangar',name:'Hangar',effect:'Avions : +5 points d’état chaque semaine par niveau supplémentaire.'},
  {id:'port',name:'Port',effect:'Navires : +5 points d’état chaque semaine par niveau supplémentaire.'},
  {id:'ecole',name:'École',effect:'Formation : +1 point de compétence par niveau supplémentaire.'},
  {id:'radar',name:'Centre radar',effect:'Dotation : +8 crédits par semaine par niveau supplémentaire.'},
  {id:'defense',name:'Batterie antiaérienne',effect:'Interception arcade : chaque niveau agrandit la cible et donne un tir supplémentaire.'}
 ];
 const events=[
  ['Mer agitée','Les navires perdent 8 points d’état.','mer',-8],
  ['Fenêtre météo','Une opération d’entretien offerte : +8 d’état aux avions.','air',8],
  ['Livraison anticipée','Le budget reçoit 15 crédits.','cash',15],
  ['Pièces retardées','L’équipe réorganise l’atelier : −5 de moral.','morale',-5],
  ['Visite des écoles','L’accueil du public apporte +8 de moral.','morale',8],
  ['Exercice sur terrain humide','Les véhicules terrestres perdent 8 points d’état.','terre',-8],
  ['Énergie plus chère','La facture exceptionnelle coûte 12 crédits.','cash',-12],
  ['Coup de main du chantier','Les navires gagnent 10 points d’état.','mer',10],
  ['Équipe récompensée','La reconnaissance du travail apporte +10 de moral.','morale',10],
  ['Inventaire réussi','Des pièces réutilisées économisent 12 crédits.','cash',12],
  ['Vent chargé de sable','Les avions perdent 10 points d’état.','air',-10],
  ['Atelier bien organisé','Les véhicules terrestres gagnent 10 points d’état.','terre',10],
  ['Semaine chargée','La fatigue coûte 7 points de moral.','morale',-7],
  ['Soutien de la région','Une dotation exceptionnelle de 20 crédits arrive.','cash',20],
  ['Révision des amarres','L’entretien du quai coûte 10 crédits.','cash',-10],
  ['Relève reposée','La nouvelle relève apporte +7 de moral.','morale',7],
  ['Contrôle des pistes','Les équipes soignent les avions : +6 points d’état.','air',6],
  ['Transport de pièces','La logistique consomme 8 crédits.','cash',-8],
  ['Journée de cohésion','Le moral gagne 6 points.','morale',6],
  ['Nettoyage des moteurs','Les véhicules terrestres gagnent 8 points d’état.','terre',8]
 ];
 const profiles={
  rafale:{combat:true,titles:["Attaquer un dépôt adverse","Intercepter une escadrille","Frapper une base fictive"],copy:"Le Rafale attaque une cible adverse dans une zone fictive.",cost:12,reward:34,wear:18},
  caracal:{titles:['Secourir une équipe isolée','Transporter une équipe médicale','Exercice de recherche et sauvetage'],copy:'Le Caracal transporte les équipes et rejoint les zones difficiles d’accès.',cost:10,reward:30,wear:14},
  leclerc:{combat:true,titles:["Prendre une position adverse","Repousser une colonne blindée","Percer une ligne de défense"],copy:"Le Leclerc engage les blindés adverses et soutient l’assaut.",cost:15,reward:39,wear:20},
  caesar:{combat:true,titles:["Appuyer un assaut par des tirs","Neutraliser une position adverse","Défendre un passage stratégique"],copy:"Le CAESAR fournit un appui d’artillerie à l’équipe engagée.",cost:13,reward:36,wear:17},
  fremm:{combat:true,titles:["Engager une frégate adverse","Défendre un convoi maritime","Repousser une attaque en mer"],copy:"La FREMM affronte les navires adverses et protège le convoi.",cost:18,reward:44,wear:22},
  suffren:{combat:true,titles:["Intercepter un sous-marin adverse","Attaquer un navire fictif","Protéger les approches maritimes"],copy:"Le Suffren engage une cible navale dans un scénario fictif.",cost:20,reward:48,wear:24},
  griffon:{titles:['Transporter une équipe de secours','Convoyer des fournitures protégées','Exercice de transport du Griffon'],copy:'Le Griffon transporte personnes et matériel avec son équipage.',cost:12,reward:38,wear:16},
  nh90:{titles:['Évacuer une équipe en exercice','Acheminer du matériel médical','Transporter une équipe vers la côte'],copy:'Le NH90 apporte des renforts sur une zone d’entraînement éloignée.',cost:15,reward:43,wear:18},
  a400m:{titles:['Acheminer du matériel humanitaire','Ravitaillement logistique de la base','Transport longue distance d’exercice'],copy:'L’A400M achemine une cargaison volumineuse pour le soutien logistique.',cost:24,reward:60,wear:24}
 };
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
 function roll(seed){const r=random(seed);r();r();return r();}
 function deck(seed){const a=events.map((_,i)=>i),r=random(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function owned(s){return units.filter(u=>s.units[u.id]?.owned!==false);}
 function event(s){return events[s.deck[(s.week-1)%20]];}
 function applyEvent(s){const e=event(s);if(e[2]==='cash')s.cash=clamp(s.cash+e[3],0,9999);else if(e[2]==='morale')s.morale=clamp(s.morale+e[3],0,100);else for(const u of owned(s))if(u.type===e[2])s.units[u.id].condition=clamp(s.units[u.id].condition+e[3],0,100);s.log.unshift('Semaine '+s.week+' — '+e[0]+' : '+e[1]);}
 function fresh(seed=Date.now()>>>0){const s={v:3,alert:null,integrity:Object.fromEntries(buildings.map(b=>[b.id,100])),id:'qg-'+Date.now()+'-'+(seed>>>0),seed:seed>>>0,week:1,actions:2,cash:150,morale:75,skill:1,completed:0,buildings:Object.fromEntries(buildings.map(b=>[b.id,1])),units:Object.fromEntries(units.map((u,i)=>[u.id,{condition:u.unlock?0:90-i*4,used:false,owned:!u.unlock}])),done:[],deck:deck(seed),log:[],ended:false,free:false,report:null};applyEvent(s);return s;}
 function mission(s,id,unit){const u=units.find(u=>u.id===unit),index=[0,1,2].find(i=>id===s.week+'-'+i);if(!u||index===undefined)return null;const p=profiles[u.id],r=random(s.seed+s.week*139+units.indexOf(u)*71);const difficulty=1+Math.floor(r()*3),combat=!!p.combat,chance=combat?Math.round(clamp(68+s.skill*3+ s.units[u.id].condition*.16-difficulty*5,55,96)):100;return {combat,difficulty,chance,maxDamage:p.wear+(combat?12:0),id,type:['air','terre','mer'][index],title:p.titles[Math.floor(r()*p.titles.length)],copy:p.copy,cost:p.cost,reward:p.reward+Math.floor((Math.min(s.week,12)-1)/4)*4,wear:p.wear,need:s.week>=9?3:s.week>=5?2:1,unit:u.id};}
 function offers(s){return ['air','terre','mer'].map((type,i)=>mission(s,s.week+'-'+i,owned(s).find(u=>u.type===type).id));}
 function upkeep(s){return 16+Object.values(s.buildings).reduce((a,b)=>a+b,0)*2+owned(s).filter(u=>u.unlock).length*3;}
 function effective(s,id){return s.integrity[id]<50?1:s.buildings[id];}
 function income(s){return 46+(effective(s,'radar')-1)*8;}
 function repair(s){return 38+(effective(s,'atelier')-1)*10;}
 function goals(s){const fleet=owned(s);return [
  {name:'Missions',value:s.completed,target:12,max:400,unit:''},
  {name:'Améliorations',value:Object.values(s.buildings).reduce((n,l)=>n+l-1,0),target:5,max:200,unit:''},
  {name:'État moyen',value:Math.round(fleet.reduce((n,u)=>n+s.units[u.id].condition,0)/fleet.length),target:75,max:150,unit:' %'},
  {name:'Moral',value:s.morale,target:90,max:150,unit:''},
  {name:'Réserve',value:s.cash,target:200,max:100,unit:' cr.'}
 ];}
 function liveTally(s){return [
  ['Missions',Math.min(400,Math.round(s.completed*400/12)),400],
  ['Améliorations',Math.min(200,Object.values(s.buildings).reduce((n,l)=>n+(l-1)*40,0)),200],
  ['État moyen',Math.min(150,Math.round(owned(s).reduce((n,u)=>n+s.units[u.id].condition,0)/owned(s).length*2)),150],
  ['Moral',Math.min(150,Math.round(s.morale*150/90)),150],
  ['Réserve',Math.min(100,Math.floor(s.cash/2)),100]
 ];}
 function tally(s){return s.report?s.report.tally:liveTally(s);}
 function unlockReason(s,id){const u=units.find(u=>u.id===id);if(!u?.unlock)return 'Cet engin fait déjà partie de la flotte.';const a=u.unlock,b=buildings.find(b=>b.id===a.building);if(s.units[id].owned)return 'Cet engin est déjà dans la flotte.';if(s.buildings[a.building]<a.level)return b.name+' niveau '+a.level+' requis.';if(s.skill<a.skill)return 'Compétence '+a.skill+'/6 requise.';if(s.cash<a.cost)return 'Il faut '+a.cost+' crédits pour accueillir cet engin.';return '';}
 function advance(s){const net=income(s)-upkeep(s);s.cash=clamp(s.cash+net,0,9999);s.week++;s.actions=2;s.done=[];if((s.week-1)%20===0)s.deck=deck(s.seed+Math.floor((s.week-1)/20)*1777);for(const u of owned(s)){const v=s.units[u.id];v.used=false;const bonus=u.type==='air'?(effective(s,'hangar')-1)*5:u.type==='mer'?(effective(s,'port')-1)*5:0;v.condition=clamp(v.condition+bonus,0,100);}s.log.unshift('Dotation − entretien : '+(net>=0?'+':'')+net+' crédits.');applyEvent(s);if(s.week>=3&&(s.week%3===0||random(s.seed+s.week*811)()<.23))s.alert={id:'alerte-'+s.week,pending:true,result:null};else s.alert=null;}
 function score(s){return tally(s).reduce((n,row)=>n+row[1],0);}
 function action(state,a){
  const fail=message=>({ok:false,state,message});
  if(!a||typeof a!=='object')return fail('Action inconnue.');
  if(a.type==='continue'&&(!state.ended||state.free))return fail('Le mode libre se débloque au bilan de campagne.');
  if(a.type==='next'&&state.alert?.pending)return fail('Intercepte le projectile ou accepte les dégâts avant de terminer la semaine.');
  if(state.ended&&a.type!=='continue')return fail('La campagne est terminée. Tu peux poursuivre en mode libre.');
  if(!['next','continue','intercept'].includes(a.type)&&state.actions<1)return fail('Tu as utilisé tes deux décisions de la semaine.');
  const s=JSON.parse(JSON.stringify(state));let message='',battle=null;
  const spend=cost=>s.cash>=cost;
  if(a.type==='intercept'){
   if(!s.alert?.pending||a.id!==s.alert.id||typeof a.hit!=='boolean')return fail('Cette alerte est déjà résolue ou inconnue.');s.alert.pending=false;s.alert.result=a.hit?'intercepte':'impact';
   if(a.hit){s.morale=Math.min(100,s.morale+2);message='Projectile intercepté ! La base est protégée. +2 de moral.';}
   else{const candidates=buildings.filter(b=>b.id!=='defense'),index=Math.floor(random(s.seed+s.week*61)()*candidates.length),ids=[candidates[index].id,candidates[(index+1)%candidates.length].id];for(const id of ids)s.integrity[id]=Math.max(0,s.integrity[id]-35);for(const u of owned(s))s.units[u.id].condition=Math.max(0,s.units[u.id].condition-8);s.morale=Math.max(0,s.morale-6);message='Impact sur la base : '+ids.map(id=>buildings.find(b=>b.id===id).name).join(' et ')+' −35 d’intégrité, flotte −8 d’état, moral −6. Répare les installations dans Base.';}
  }else if(a.type==='repairBuilding'){
   const b=buildings.find(b=>b.id===a.id);if(!b)return fail('Installation inconnue.');if(s.integrity[a.id]===100)return fail('Cette installation est intacte.');if(!spend(20))return fail('Il faut 20 crédits pour réparer cette installation.');s.cash-=20;s.integrity[a.id]=Math.min(100,s.integrity[a.id]+45);message=b.name+' : +45 d’intégrité, dans la limite de 100.';
  }else if(a.type==='repair'){
   const u=s.units[a.id];if(!u||!u.owned)return fail('Cet engin ne fait pas partie de la flotte.');if(u.condition===100)return fail('Cet engin est déjà en parfait état.');if(!spend(18))return fail('Il faut 18 crédits pour réparer.');s.cash-=18;const gain=Math.min(repair(s),100-u.condition);u.condition+=gain;message=units.find(u=>u.id===a.id).name+' réparé : +'+gain+' points d’état.';
  }else if(a.type==='unlock'){
   const why=unlockReason(s,a.id);if(why)return fail(why);const u=units.find(u=>u.id===a.id);s.cash-=u.unlock.cost;s.units[u.id]={condition:100,used:false,owned:true};message=u.name+' rejoint la flotte : état 100/100. Entretien : +3 crédits par semaine.';
  }else if(a.type==='upgrade'){
   const b=buildings.find(b=>b.id===a.id);if(!b)return fail('Bâtiment inconnu.');const l=s.buildings[a.id];if(l>=3)return fail('Ce bâtiment est au niveau maximal.');if(!spend(l*35))return fail('Budget insuffisant pour cette amélioration.');s.cash-=l*35;s.buildings[a.id]++;message=b.name+' passe au niveau '+(l+1)+'.';
  }else if(a.type==='train'){
   if(s.skill>=6)return fail('Ton équipe a atteint la compétence maximale.');if(!spend(25))return fail('Il faut 25 crédits pour former l’équipe.');s.cash-=25;s.skill=Math.min(6,s.skill+effective(s,'ecole'));s.morale=Math.min(100,s.morale+4);message='Formation terminée : compétence '+s.skill+'/6, +4 de moral.';
  }else if(a.type==='rest'){
   if(s.morale===100)return fail('Le moral est déjà au maximum.');s.morale=Math.min(100,s.morale+18);message='Journée de repos : +18 de moral, dans la limite de 100.';
  }else if(a.type==='mission'){
   const m=mission(s,a.id,a.unit),u=units.find(u=>u.id===a.unit);if(!m||!u)return fail('Mission ou engin inconnu.');
   if(s.done.includes(m.id))return fail('Cette mission est déjà accomplie.');if(u.type!==m.type)return fail('Ce type d’engin ne convient pas à la mission.');
   const v=s.units[u.id];if(!v.owned)return fail('Cet engin doit d’abord être débloqué.');if(v.used)return fail('Cet engin a déjà été déployé cette semaine.');if(v.condition<45)return fail('Un état de 45 minimum est requis.');if(s.skill<m.need)return fail('La compétence de l’équipe est insuffisante.');if(!spend(m.cost))return fail('Le budget ne couvre pas le départ.');
   const success=!m.combat||roll(s.seed+s.week*977+units.indexOf(u)*137)*100<m.chance,reward=success?m.reward:Math.floor(m.reward*.25),damage=success?m.wear:m.maxDamage;
   s.cash=clamp(s.cash-m.cost+reward,0,9999);v.condition=Math.max(0,v.condition-damage);v.used=true;s.done.push(m.id);if(success)s.completed++;s.morale=clamp(s.morale+(success?3:-5),0,100);message=m.title+' : '+(success?'réussite':'repli')+', '+(reward-m.cost>=0?'+':'')+(reward-m.cost)+' crédits nets, '+(success?'+3':'−5')+' de moral. '+u.name+' : −'+damage+' d’état.';if(m.combat)battle={unit:u.id,success,message};
  }else if(a.type==='continue'){
   s.free=true;s.ended=false;advance(s);message='Mode libre : ta base continue en semaine 13. Le bilan des 12 semaines est conservé.';
  }else if(a.type==='next'){
   if(s.week===12&&!s.free){s.report={tally:liveTally(s),completed:s.completed};s.ended=true;s.actions=0;message='Campagne terminée : '+score(s)+' / 1 000 points.';}else{
    if(s.week>=1000000)return fail('La limite de sauvegarde est atteinte. Tu peux recommencer une campagne.');advance(s);message='Semaine '+s.week+' : deux nouvelles décisions. '+event(s)[1];
   }
  }else return fail('Action inconnue.');
  if(!['next','continue','intercept'].includes(a.type))s.actions--;s.log.unshift(message);s.log=s.log.slice(0,16);return {ok:true,state:s,message,battle};
 }
 function restore(raw){try{
  const input=typeof raw==='string'?JSON.parse(raw):raw;if(!input)return null;const s=JSON.parse(JSON.stringify(input));
  const integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
  if(![1,2,3].includes(s.v))return null;const legacy=s.v===1;
  if(legacy){if(!integer(s.week,1,12)||!integer(s.completed,0,24)||typeof s.ended!=='boolean'||(s.ended&&(s.week!==12||s.actions!==0))||!s.units||Object.keys(s.units).length!==6||units.slice(0,6).some(u=>!s.units[u.id]))return null;for(const u of units){if(u.unlock)s.units[u.id]={condition:0,used:false,owned:false};else s.units[u.id].owned=true;}s.free=false;s.report=null;s.v=2;}
  if(s.v===2){if(!s.buildings||Object.keys(s.buildings).length!==5)return null;s.buildings.defense=1;s.integrity=Object.fromEntries(buildings.map(b=>[b.id,100]));s.alert=null;s.v=3;}
  if(typeof s.id!=='string'||!/^qg-\d+-\d+$/.test(s.id)||!integer(s.seed,0,4294967295)||!integer(s.week,1,1000000)||!integer(s.actions,0,2)||!integer(s.cash,0,9999)||!integer(s.morale,0,100)||!integer(s.skill,1,6)||!integer(s.completed,0,s.week*2)||typeof s.ended!=='boolean'||typeof s.free!=='boolean'||(!s.free&&s.week>12)||(s.free&&s.week<13)||(s.ended&&(s.week!==12||s.actions!==0||s.free)))return null;
  if(!s.buildings||buildings.some(b=>!integer(s.buildings[b.id],1,3))||Object.keys(s.buildings).length!==6)return null;
  if(!s.integrity||Object.keys(s.integrity).length!==6||buildings.some(b=>!integer(s.integrity[b.id],0,100)))return null;
  if(s.alert!==null&&(!s.alert||s.alert.id!=='alerte-'+s.week||typeof s.alert.pending!=='boolean'||(s.alert.pending?s.alert.result!==null:!['intercepte','impact'].includes(s.alert.result))))return null;
  if(!s.units||units.some(u=>!s.units[u.id]||!integer(s.units[u.id].condition,0,100)||typeof s.units[u.id].used!=='boolean'||typeof s.units[u.id].owned!=='boolean'||(!u.unlock&&!s.units[u.id].owned)||(!s.units[u.id].owned&&(s.units[u.id].condition!==0||s.units[u.id].used)))||Object.keys(s.units).length!==units.length)return null;
  if(!Array.isArray(s.deck)||s.deck.length!==20||new Set(s.deck).size!==20||s.deck.some(n=>!integer(n,0,19)))return null;
  if(!Array.isArray(s.done)||s.done.length>2||new Set(s.done).size!==s.done.length||s.done.some(id=>!offers(s).some(m=>m.id===id)))return null;
  if(!Array.isArray(s.log)||s.log.length>16||s.log.some(x=>typeof x!=='string'||x.length>350))return null;
  if(legacy&&s.ended)s.report={tally:liveTally(s),completed:s.completed};
  if(s.ended||s.free){const expected=liveTally(s);if(!s.report||!integer(s.report.completed,0,24)||!Array.isArray(s.report.tally)||s.report.tally.length!==5||s.report.tally.some((row,i)=>!Array.isArray(row)||row.length!==3||row[0]!==expected[i][0]||row[2]!==expected[i][2]||!integer(row[1],0,row[2])))return null;}else if(s.report!==null)return null;
  return s;
 }catch{return null;}}
 const api={units,buildings,events,profiles,fresh,offers,mission,action,restore,score,tally,goals,owned,event,unlockReason,upkeep,income,repair,effective};root.QG=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
