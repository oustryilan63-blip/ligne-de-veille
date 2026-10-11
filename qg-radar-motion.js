/* File de courtes animations : aucune donnée de campagne ni minuterie de mission. */
window.QG_MOTION={create(){
 const queue=[],ids=new Set(['rafale','caracal','leclerc','caesar','fremm','suffren']);let serial=0;
 return {
  add(id,kind='mission',demo=false){if(!ids.has(id)||!['mission','repair'].includes(kind))return false;if(queue.length>=4)queue.shift();queue.push({id,kind,demo,elapsed:0,duration:kind==='repair'?2800:4200,key:++serial});return true;},
  tick(delta){const a=queue[0];if(!a)return;if(Number.isFinite(delta))a.elapsed+=Math.max(0,Math.min(120,delta));if(a.elapsed>=a.duration)queue.shift();},
  peek(){const a=queue[0];return a?{id:a.id,kind:a.kind,demo:a.demo,progress:a.elapsed/a.duration,key:a.key}:null;},
  clear(){queue.length=0;},
  get active(){return queue.length>0;}
 };
}};
