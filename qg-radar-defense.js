/* Interception arcade : coordonnées normalisées, aucune performance réelle. */
(function(root){
 'use strict';
 function create(seed=1,level=1){return {seed:seed>>>0,level:Math.max(1,Math.min(3,level)),elapsed:0,shots:3+Math.max(1,Math.min(3,level)),status:'ready',hit:false,aim:{x:.5,y:.3},flash:null};}
 function target(s){const p=Math.min(1,s.elapsed/22000),direction=(s.seed%2?1:-1);return {x:.5+direction*.26*(1-p)+Math.sin(p*Math.PI*2)*.075,y:.07+p*.62};}
 function radius(s){return .045+s.level*.012;}
 function start(s){if(s.status==='ready'||s.status==='paused')s.status='running';}
 function pause(s){if(s.status==='running')s.status='paused';}
 function tick(s,delta){if(s.status!=='running'||!Number.isFinite(delta))return;s.elapsed+=Math.max(0,Math.min(120,delta));if(s.elapsed>=22000){s.elapsed=22000;s.status='finished';s.hit=false;}}
 function aim(s,x,y){if(Number.isFinite(x)&&Number.isFinite(y))s.aim={x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))};}
 function fire(s,x=s.aim.x,y=s.aim.y){if(s.status!=='running'||s.shots<=0)return false;aim(s,x,y);s.shots--;const p=target(s),hit=Math.hypot(s.aim.x-p.x,(s.aim.y-p.y)*440/720)<=radius(s);s.flash={...s.aim,at:s.elapsed,hit};if(hit||s.shots===0){s.status='finished';s.hit=hit;}return true;}
 const api={create,target,radius,start,pause,tick,aim,fire};root.QG_DEFENSE=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
