/* Sprites originaux Radar, dessinés sur une grille de pixels. Aucune image externe. */
window.QG_ART=(()=>{
 const colors={grass:'#88947a',edge:'#596d61',road:'#777c74',ink:'#243b41',light:'#e1dfc6',roof:'#b9bbaa',sea:'#284c59',foam:'#537b80',orange:'#cc7049'};
 const positions={atelier:[8,5],hangar:[3,3],port:[10,7],ecole:[5,7],radar:[8,1]};
 function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
 function sprite(c,id,x,y,scale=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  if(id==='rafale'){poly(c,[[-24,3],[-4,-3],[12,-17],[16,-17],[9,-2],[30,6],[28,9],[5,7],[-5,16],[-10,16],[-9,6],[-25,7]],'#c3ccc5');rect(c,-3,1,17,3,'#738c91');rect(c,7,0,7,3,'#203d50');rect(c,-16,5,6,2,'#cc7049');}
  if(id==='caracal'){poly(c,[[-15,-2],[7,-7],[18,-2],[20,7],[10,11],[-9,9],[-16,3]],'#788e72');rect(c,-30,0,18,3,'#647b68');rect(c,-32,-5,4,12,'#c5c7af');rect(c,7,-3,8,6,'#254a59');rect(c,-2,-11,3,8,'#d5dbc7');rect(c,-24,-12,51,2,'#e1dfc6');rect(c,-11,12,25,2,'#243b41');rect(c,-8,8,2,4,'#243b41');rect(c,9,8,2,4,'#243b41');}
  if(id==='leclerc'){rect(c,-23,5,42,9,'#263b3e');rect(c,-21,8,38,3,'#99a899');poly(c,[[-23,1],[-11,-8],[18,-4],[24,3],[13,10],[-20,5]],'#8b9a76');poly(c,[[-8,-8],[5,-11],[16,-5],[11,1],[-9,-1]],'#b6bb94');rect(c,7,-7,28,3,'#738967');rect(c,1,-9,5,3,'#344e48');}
  if(id==='caesar'){rect(c,-26,1,47,11,'#728969');rect(c,-24,-10,13,13,'#9da888');rect(c,-22,-8,8,6,'#244d5c');rect(c,-23,10,8,7,'#263b3e');rect(c,0,10,7,7,'#263b3e');rect(c,12,10,7,7,'#263b3e');poly(c,[[-4,2],[32,-22],[35,-19],[1,7]],'#b1bb98');rect(c,-5,-1,15,5,'#a1b18c');}
  if(id==='fremm'){poly(c,[[-36,5],[-25,-4],[25,-4],[42,2],[21,12],[-22,12]],'#95b0ad');poly(c,[[-27,5],[35,3],[21,12],[-22,12]],'#5e858a');rect(c,-15,-12,26,14,'#b1c4b9');rect(c,-5,-18,12,8,'#d2dac3');rect(c,-3,-15,7,3,'#284754');rect(c,1,-30,2,13,'#dce0cd');rect(c,-7,-27,18,2,'#bac9b8');rect(c,17,-3,6,4,'#dddcc1');}
  if(id==='suffren'){poly(c,[[-37,2],[-27,-5],[28,-5],[40,1],[29,8],[-27,8]],'#314a50');rect(c,-26,-3,52,4,'#64838a');rect(c,-4,-15,11,11,'#8ca4a2');rect(c,-1,-22,2,8,'#b7c7b8');rect(c,-33,-9,3,20,'#486b70');}
  c.restore();
 }
 function building(c,id,x,y,level,t){
  c.save();c.translate(x,y);poly(c,[[-29,8],[12,-10],[45,8],[4,30]],'#5b7261');
  const width=id==='hangar'?54:id==='port'?44:40,h=id==='radar'?42:16+level*4;
  poly(c,[[-width/2,0],[0,12],[0,12-h],[-width/2,-h]],'#647b76');poly(c,[[0,12],[width/2,0],[width/2,-h],[0,12-h]],'#879a8c');poly(c,[[-width/2,-h],[0,-h-12],[width/2,-h],[0,12-h]],id==='atelier'?'#c98861':'#d0d0b5');
  rect(c,-width/2+4,-h+9,10,10,'#304b50');rect(c,6,-h+13,10,6,'#b8d5c7');
  if(id==='hangar'){rect(c,-22,-9,20,19,'#233d46');rect(c,-20,-7,16,2,'#71918a');}
  if(id==='port'){rect(c,24,-35,4,44,'#d5af6d');rect(c,3,-35,37,4,'#d5af6d');rect(c,4,-32,1,17,'#d4d4bc');}
  if(id==='radar'){rect(c,-2,-h-26,3,20,'#ced7c1');c.save();c.translate(0,-h-25);c.scale(Math.cos(t/1300)*.7+.3,1);poly(c,[[-16,-9],[17,-9],[9,4],[-6,4]],'#c5d8bf');rect(c,-12,-5,25,2,'#74968b');c.restore();}
  if(id==='ecole'){rect(c,-11,-h+3,10,4,'#cc7049');rect(c,25,-30,2,35,'#d2d9be');rect(c,27,-30,13,7,'#cc7049');}
  for(let i=0;i<level;i++)rect(c,-10+i*8,15,5,3,'#edbf78');c.restore();
 }
 function scene(c,state,time=0){
  c.clearRect(0,0,720,440);rect(c,0,0,720,440,colors.sea);
  for(let y=18;y<440;y+=21)for(let x=(y%3)*29;x<720;x+=77)rect(c,x+Math.round(Math.sin(time/2200+y)*3),y,20,1,colors.foam);
  const project=(x,y)=>[350+(x-y)*26,74+(x+y)*14];
  for(let sum=0;sum<23;sum++)for(let x=0;x<13;x++){const y=sum-x;if(y<0||y>10||x+y<2||(x>10&&y>8))continue;const [px,py]=project(x,y);poly(c,[[px-26,py],[px,py+14],[px+26,py],[px,py-14]],(x===6||y===5)?colors.road:(x+y)%3===0?'#929d7e':colors.grass);if(x===12||y===10)poly(c,[[px-26,py],[px,py+14],[px+26,py],[px+26,py+7],[px,py+21],[px-26,py+7]],colors.edge);}
  // Runway, quay and gardens follow the same isometric grid.
  for(let x=1;x<=6;x++){const [px,py]=project(x,1);poly(c,[[px-24,py],[px,py+12],[px+24,py],[px,py-12]],'#405254');rect(c,px-5,py-1,10,2,'#e3ddbb');}
  for(let i=0;i<4;i++){const [x,y]=project(11,i+5);poly(c,[[x-13,y],[x+1,y+8],[x+57,y-21],[x+43,y-29]],'#b2ac8b');}
  for(const [x,y] of [[1,4],[1,7],[2,8],[3,9],[9,0],[10,1],[11,2],[7,9],[8,9]]){const [px,py]=project(x,y);rect(c,px,py-9,3,10,'#586553');poly(c,[[px-11,py-5],[px+1,py-27],[px+13,py-5]],'#496f5c');rect(c,px-6,py-12,9,4,'#628466');}
  Object.entries(positions).sort((a,b)=>a[1][0]+a[1][1]-b[1][0]-b[1][1]).forEach(([id,p])=>{const [x,y]=project(...p);building(c,id,x,y,state.buildings[id],time);});
  const float=Math.sin(time/1600)*2;
  sprite(c,'rafale',...project(3,1),.8);sprite(c,'caracal',...project(3,5),.75);sprite(c,'leclerc',...project(7,6),.75);sprite(c,'caesar',...project(6,8),.75);sprite(c,'fremm',604,310+float,.95);sprite(c,'suffren',541,369+float,.85);
  // A small support vehicle travels along the central road.
  const progress=(time/1400)%9,[vx,vy]=project(6,progress);rect(c,vx-6,vy-7,12,7,'#e0c891');rect(c,vx-5,vy-6,4,3,'#496975');rect(c,vx-6,vy,3,3,'#203d41');rect(c,vx+3,vy,3,3,'#203d41');
 }
 return {sprite,scene};
})();
