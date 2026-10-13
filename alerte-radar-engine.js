/* Règles d'arcade. Toutes les durées et ressources sont des paramètres de jeu. */
(function(root){
 'use strict';
 const scenarios=[{id:'civil',title:'Trafic civil dense',copy:'Identifie les appareils et distingue les intrus du trafic autorisé.'},{id:'convoy',title:'Convoi maritime',copy:'Escorte le navire de tête et protège ses approches.'},{id:'drones',title:'Essaim de drones',copy:'Plusieurs petits contacts arrivent à des moments différents.'},{id:'mixed',title:'Alerte sur plusieurs secteurs',copy:'Priorise les contacts rapides et répartis tes moyens.'}];
 const profiles={civil:{kind:'air',name:'avion civil',friend:true,clue:'Transpondeur actif, route annoncée.'},ally:{kind:'air',name:'avion allié',friend:true,clue:'Liaison radio avec un service partenaire.'},fighter:{kind:'air',name:'avion hostile',friend:false,clue:'Route non annoncée, identification nécessaire.'},drone:{kind:'air',name:'drone hostile',friend:false,clue:'Petit contact, déplacement irrégulier.'},missile:{kind:'missile',name:'missile fictif',friend:false,clue:'Signal rapide sans échange radio.'},merchant:{kind:'naval',name:'navire civil',friend:true,clue:'Route commerciale déclarée.'},warship:{kind:'naval',name:'navire hostile',friend:false,clue:'Déviation de route, identité à confirmer.'},echo:{kind:'air',name:'faux écho',friend:true,clue:'Signal intermittent : vérifie avant d’intervenir.'}};
 const routes={air:[[[568,109],[607,121]],[[642,91],[616,116]],[[645,99],[612,119]],[[570,98],[600,117]]],missile:[[[653,95],[609,120]],[[569,94],[604,120]]],naval:[[[568,119],[591,128]],[[605,153],[618,143]],[[619,150],[621,140]]]};
 function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
 function create(seed=1,level='standard'){
  if(!['beginner','standard','expert'].includes(level))level='standard';const r=random(seed),waves=[];
  for(let w=0;w<10;w++){const scenario=scenarios[w%4],count=(level==='beginner'?2:level==='expert'?4:3)+(w>=6&&level!=='beginner'?1:0),tracks=[];
   for(let i=0;i<count;i++){let list=scenario.id==='civil'?['civil','ally','fighter','echo']:scenario.id==='convoy'?['merchant','warship','fighter']:scenario.id==='drones'?['drone','drone','ally','echo']:['fighter','missile','warship','civil'];let key=i===0&&scenario.id==='convoy'?'merchant':list[Math.floor(r()*list.length)];const p=profiles[key],route=routes[p.kind][Math.floor(r()*routes[p.kind].length)],spawn=i*2500+Math.floor(r()*1600),life=(p.kind==='missile'?13000:p.kind==='naval'?24500:18000)+(level==='beginner'?6500:level==='expert'?-2500:0);
    tracks.push({...p,profile:key,id:String(i+1).padStart(2,'0'),start:[...route[0]],end:[...route[1]],spawn,life,stage:0,resolved:false,escortNeeded:scenario.id==='convoy'&&i===0});}
   waves.push({scenario,tracks,duration:Math.max(...tracks.map(t=>t.spawn+t.life))+500});
  }
  return {seed:seed>>>0,level,waves,wave:0,phase:'intro',elapsed:0,score:0,integrity:5,ammo:{air:8,missile:8,naval:8},ready:{air:0,missile:0,naval:0},boost:false,records:[],maxScore:waves.reduce((n,w)=>n+w.tracks.length*10,0)};
 }
 const tracks=s=>s.waves[s.wave].tracks;
 const visible=(s,t)=>s.elapsed>=t.spawn;
 function resolve(s,t,ok,damage=false){if(t.resolved)return;t.resolved=true;s.score+=ok?10:0;if(damage)s.integrity=Math.max(0,s.integrity-1);s.records.push({key:s.wave+'-'+t.id,kind:t.kind,friend:t.friend,ok,label:t.name});}
 function check(s){if(s.integrity<=0||tracks(s).every(t=>t.resolved)||s.elapsed>=s.waves[s.wave].duration){for(const t of tracks(s))if(!t.resolved)resolve(s,t,t.friend&&t.stage===2&&!t.escortNeeded,!t.friend);s.phase='between';}}
 function start(s){s.phase='active';s.elapsed=0;s.ready={air:0,missile:0,naval:0};}
 function inspect(s,id){const t=tracks(s).find(t=>t.id===id);if(s.phase!=='active'||!t||t.resolved||!visible(s,t))return 'Cette piste n’est pas disponible.';t.stage=Math.max(t.stage,s.boost?2:1);return t.stage===2?t.name+' · '+(t.friend?'amie':'hostile')+'.':t.clue+' Confirme son identité.';}
 function action(s,id,choice){const t=tracks(s).find(t=>t.id===id);if(s.phase!=='active'||!t||t.resolved||!visible(s,t))return {ok:false,message:'Choisis une piste active.'};
  if(choice==='identify'){t.stage=2;return {ok:true,message:t.name+' : '+(t.friend?'amie confirmée':'hostile confirmé')+(t.escortNeeded?' · escorte requise.':'.')};}
  if(t.stage!==2)return {ok:false,message:'Confirme l’identité avant de décider.'};
  if(choice==='watch'){if(!t.friend)return {ok:false,message:'Une piste hostile nécessite une intervention.'};if(t.escortNeeded)return {ok:false,message:'Ce navire est l’objectif de la manche : escorte-le.'};resolve(s,t,true);check(s);return {ok:true,message:t.name+' suivie sans tir. +10 points.'};}
  const kind=choice==='escort'?t.kind:choice;if(!Object.hasOwn(s.ammo,kind))return {ok:false,message:'Moyen inconnu.'};if(s.ammo[kind]<=0)return {ok:false,message:'Ce moyen doit être ravitaillé.'};if(s.elapsed<s.ready[kind])return {ok:false,message:'Ce moyen se prépare : attends '+Math.ceil((s.ready[kind]-s.elapsed)/1000)+' s.'};
  if(choice==='escort'&&!t.friend)return {ok:false,message:'L’escorte est réservée aux pistes amies.'};s.ammo[kind]--;s.ready[kind]=s.elapsed+4200;
  let message;if(choice==='escort'){resolve(s,t,true);message='Escorte assurée. +10 points.';}else if(t.friend){resolve(s,t,false,true);message='Erreur sur une piste amie : intégrité −1.';}else if(kind===t.kind){resolve(s,t,true);message='Interception réussie. +10 points.';}else message='Moyen inadapté : la piste reste à traiter.';check(s);return {ok:true,message};
 }
 function tick(s,delta){if(s.phase!=='active'||!Number.isFinite(delta))return;s.elapsed+=Math.max(0,Math.min(1000,delta));for(const t of tracks(s))if(!t.resolved&&s.elapsed>=t.spawn+t.life)resolve(s,t,t.friend&&t.stage===2&&!t.escortNeeded,!t.friend);check(s);}
 function next(s,upgrade='supplies'){if(s.phase!=='between')return false;if(s.integrity<=0||s.wave===9){s.phase='ended';return true;}s.boost=upgrade==='detection';if(upgrade==='repair')s.integrity=Math.min(5,s.integrity+1);else if(upgrade==='detection')s.boost=true;else{for(const k of Object.keys(s.ammo))s.ammo[k]+=3;s.boost=false;}s.wave++;start(s);return true;}
 function position(s,t){const p=Math.max(0,Math.min(1,(s.elapsed-t.spawn)/t.life));return [t.start[0]+(t.end[0]-t.start[0])*p,t.start[1]+(t.end[1]-t.start[1])*p];}
 root.RADAR_SIM={create,tracks,visible,start,inspect,action,tick,next,position,scenarios,profiles};
})(typeof window!=='undefined'?window:globalThis);
