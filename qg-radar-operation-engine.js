/* Épreuves d’opération : logique indépendante du dessin et du navigateur. */
(function(root){
 'use strict';
 const bounds=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
 function create(op,seed){const r=random((seed+op.stage*149+op.unit.length*71)>>>0),mechanic=op.scenario?.mechanics?.[op.stage]||'legacy',risks=[20,48,76],names=['Passage côtier','Itinéraire central','Détour extérieur'];for(let i=2;i>0;i--){const j=Math.floor(r()*(i+1));[risks[i],risks[j]]=[risks[j],risks[i]];}
  const roles=['ally','hostile','civil'];for(let i=2;i>0;i--){const j=Math.floor(r()*(i+1));[roles[i],roles[j]]=[roles[j],roles[i]];}return {roles,mechanic,kind:op.scenario?.sector||op.kind,stage:op.stage,mode:op.mode,intel:!!op.intel,status:'ready',elapsed:0,duration:mechanic==='route'||mechanic==='escape'?null:mechanic==='escort'?18000:16000,shots:mechanic==='dock'?3:mechanic==='engage'?5:4,aim:{x:.5,y:.5},hits:[],damage:[],hit:null,feedback:'',routes:names.map((name,i)=>({id:i,name,risk:risks[i]})),window:{center:.3+r()*.4,width:op.mode==='prudent'?.28:op.mode==='rapide'?.16:.22}};
 }
 function start(s){if(['ready','paused'].includes(s.status))s.status='running';}
 function pause(s){if(s.status==='running')s.status='paused';}
 function aim(s,x,y){s.aim={x:bounds(x),y:bounds(y)};}
 function radius(s){return (s.mode==='prudent'?.072:s.mode==='rapide'?.046:.058)*(s.intel?1.12:1);}
 function finish(s,hit){if(s.status==='finished')return;s.status='finished';s.hit=!!hit;}
 function targets(s){const p=s.elapsed/(s.duration||16000),items=[];
  if(s.mechanic==='legacy')return [{id:0,x:.22+p*.55,y:s.kind==='air'?.42+Math.sin(p*6+s.stage)*.16:s.kind==='mer'?.48+Math.sin(p*4+s.stage)*.12:.35+(s.stage%2)*.2+Math.sin(p*3)*.07,role:'hostile'}];
  if(s.mechanic==='identify')return [{id:0,x:.28,y:.35,role:s.roles[0]},{id:1,x:.68,y:.3,role:s.roles[1]},{id:2,x:.45,y:.7,role:s.roles[2]}];
  if(s.mechanic==='scan')return [{id:0,x:.24,y:.34,role:'echo'},{id:1,x:.69,y:.29,role:'echo'},{id:2,x:.58,y:.69,role:'echo'}].filter(x=>!s.hits.includes(x.id));
  if(s.mechanic==='engage'){for(let i=0;i<3;i++)if(!s.hits.includes(i))items.push({id:i,x:.23+i*.24+Math.sin(p*4+i)*.07,y:.3+(i%2)*.28+Math.sin(p*5+i)*.07,role:'hostile'});items.push({id:10,x:.5+Math.sin(p*2)*.12,y:.82,role:'ally'});}
  if(s.mechanic==='escort'){for(let i=0;i<3;i++){const age=s.elapsed-(1000+i*4200);if(age>=0&&age<6000&&!s.hits.includes(i)&&!s.damage.includes(i))items.push({id:i,x:.85-(age/6000)*.37,y:.2+(i%2)*.18+age/6000*.2,role:'hostile'});}items.push({id:10,x:.15+Math.min(1,p)*.66,y:.76,role:'convoy'});}
  return items;
 }
 function tick(s,ms){if(s.status!=='running'||s.duration===null)return;s.elapsed=Math.min(s.duration,s.elapsed+bounds(ms,0,1000));if(s.mechanic==='escort'){for(let i=0;i<3;i++)if(s.elapsed>=7000+i*4200&&!s.hits.includes(i)&&!s.damage.includes(i))s.damage.push(i);if(s.damage.length>=2)finish(s,false);}
  if(s.elapsed>=s.duration)finish(s,s.mechanic==='escort'&&s.damage.length<=1);
 }
 function cursor(s){return (s.elapsed%2800)/2800;}
 function fire(s){if(s.status!=='running')return false;
  if(s.mechanic==='dock'){s.shots--;const good=Math.abs(cursor(s)-s.window.center)<=s.window.width/2;s.feedback=good?'Cargaison réceptionnée.':'Trop tôt ou trop tard. Attends la zone verte.';if(good||s.shots===0)finish(s,good);return true;}
  if(['route','escape'].includes(s.mechanic))return false;
  const item=targets(s).find(p=>Math.hypot(s.aim.x-p.x,(s.aim.y-p.y)*400/720)<=radius(s));
  if(s.mechanic!=='scan')s.shots--;
  if(item){if(['ally','civil','convoy'].includes(item.role)){s.feedback='Contact allié ou civil : identification incorrecte.';finish(s,false);return true;}s.hits.push(item.id);s.feedback=s.mechanic==='scan'?'Écho relevé.':'Menace neutralisée.';const needed=s.mechanic==='scan'?3:['engage','escort'].includes(s.mechanic)?2:1;if(s.hits.length>=needed)finish(s,true);}else s.feedback='Repère manqué. Replace le viseur.';
  if(s.shots===0&&s.status!=='finished')finish(s,false);return true;
 }
 function choose(s,id){if(!['route','escape'].includes(s.mechanic)||!['ready','running','paused'].includes(s.status))return false;const option=s.routes.find(x=>x.id===id);if(!option)return false;finish(s,option.risk===Math.min(...s.routes.map(x=>x.risk)));return true;}
 const api={create,start,pause,aim,radius,targets,tick,cursor,fire,choose};root.QG_OPERATION_ENGINE=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
