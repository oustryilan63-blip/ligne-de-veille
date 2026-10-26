/* Illustrations Radar et animations décoratives, indépendantes des règles. */
window.QG_ART=(()=>{
 const illustrations={},sources={...window.QG_SPRITES,...(window.QG_TERRAIN?{terrain:window.QG_TERRAIN}:{})},requests=new Map(),listeners=new Set();
 const ready=Promise.resolve();let repaintQueued=false;
 function notify(){if(repaintQueued)return;repaintQueued=true;const paint=()=>{repaintQueued=false;for(const fn of listeners)fn();};if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(paint);else Promise.resolve().then(paint);}
 function imageFor(id){
  if(illustrations[id])return illustrations[id];
  if(!sources[id]||requests.has(id)||typeof window.Image!=='function')return null;
  const image=new window.Image();requests.set(id,image);image.decoding='async';
  image.onload=()=>{if(image.naturalWidth&&image.naturalHeight){illustrations[id]=image;notify();}};
  image.onerror=()=>{};image.src=sources[id];return null;
 }
 function onReady(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 const colors={grass:'#88947a',edge:'#596d61',road:'#777c74',ink:'#243b41',light:'#e1dfc6',roof:'#b9bbaa',sea:'#284c59',foam:'#537b80',orange:'#cc7049'};
 const positions=window.QG_LAYOUT.buildings;
 function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
 function decoration(c,id,x,y,maxW,maxH){
  const image=imageFor(id);if(!image)return false;
  const factor=Math.min(maxW/image.naturalWidth,maxH/image.naturalHeight),w=image.naturalWidth*factor,h=image.naturalHeight*factor;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(image,x-w/2,y-h,w,h);c.restore();return true;
 }
 function sprite(c,id,x,y,scale=1){if(window.QG_SUPPORT_ART?.sprite(c,id,x,y,scale))return;const loaded=imageFor(id);if(!loaded&&['griffon','nh90','a400m'].includes(id))return sprite(c,{griffon:'caesar',nh90:'caracal',a400m:'rafale'}[id],x,y,scale);c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  const image=loaded;
  if(image){
   const factor=Math.min(105/image.naturalWidth,68/image.naturalHeight),w=image.naturalWidth*factor,h=image.naturalHeight*factor;
   c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
   c.drawImage(image,-w/2,-h*.65,w,h);c.restore();return;
  }
  const p=(pts,col)=>poly(c,pts,col),r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  if(id==='rafale'){
   // Vue de dessus inclinée : aile delta, plans canards, deux tuyères, dérive unique.
   const air=(pts,col)=>p(pts.map(([u,v])=>[Math.round(u*.94+v*.64),Math.round(-u*.42+v*.58)]),col);
   air([[-33,-6],[-33,6],[-25,7],[-23,-7]],'#3c515d');
   air([[5,-4],[-22,-33],[-29,-31],[-25,-6],[-27,6],[-29,31],[-22,33],[5,4]],'#748b96');
   air([[6,-4],[-21,-30],[-25,-29],[-22,-7],[-24,7],[-25,29],[-21,30],[6,4]],'#a7b8bc');
   air([[-3,-6],[-22,-27],[-19,-10]],'#c8d1ce');air([[-3,6],[-22,27],[-19,10]],'#91a7af');
   air([[18,-3],[8,-15],[4,-14],[9,-3]],'#c9d1ce');air([[18,3],[8,15],[4,14],[9,3]],'#91a7af');
   air([[45,0],[25,-3],[10,-5],[-7,-7],[-28,-6],[-30,-3],[-30,3],[-28,6],[-7,7],[10,5],[25,3]],'#c4cece');
   air([[45,0],[18,1],[0,3],[-30,3],[-28,6],[-7,7],[10,5],[25,3]],'#899fa9');
   air([[24,-1],[17,-3],[9,-3],[6,0],[11,2],[20,1]],'#263e52');air([[20,-1],[14,-2],[9,-1],[12,0]],'#8fc4d0');
   air([[7,-5],[-5,-8],[-11,-7],[-8,-4]],'#3c5662');air([[7,5],[-5,8],[-11,7],[-8,4]],'#4f6974');
   air([[-10,0],[-24,-2],[-28,0],[-24,2]],'#627d8d');
   p([[-13,7],[-22,-11],[-27,-10],[-23,12]],'#c7d0cb');p([[-22,-11],[-27,-10],[-23,12],[-20,10]],'#748f9d');
   air([[-31,-6],[-26,-6],[-26,-1],[-31,-1]],'#33434d');air([[-31,1],[-26,1],[-26,6],[-31,6]],'#33434d');
   air([[-16,19],[-19,22],[-21,19],[-18,16]],'#bb674f');air([[-17,19],[-19,20],[-20,19],[-18,17]],'#e3dfc6');
  }
  if(id==='leclerc'){
   // Deux chenilles distinctes, galets, blindage incliné et tourelle à pans coupés.
   p([[-37,5],[-25,-3],[28,7],[36,16],[26,25],[-29,17]],'#283c39');
   p([[-36,8],[-27,5],[26,14],[29,20],[24,23],[-29,14]],'#151f24');
   for(let i=0;i<7;i++){const xx=-29+i*8,yy=9+i*1.25;r(xx,yy,6,6,'#6c7965');r(xx+2,yy+1,2,3,'#b1b7a0');}
   p([[-33,-5],[-13,-16],[36,-7],[39,3],[23,11],[-36,1]],'#32473e');
   for(let i=0;i<6;i++)r(-19+i*8,-10+i,5,4,'#7c8b70');
   p([[-39,-1],[-18,-17],[33,-9],[41,4],[23,16],[-36,6]],'#84916b');
   p([[-39,-1],[-36,6],[23,16],[24,9]],'#52684e');p([[24,9],[41,4],[33,-9],[26,0]],'#6f805e');
   p([[-31,-3],[-18,-13],[-4,-11],[-12,-4]],'#b0af85');p([[-11,-10],[2,-8],[11,1],[-2,1]],'#4c6754');p([[12,-6],[29,-5],[33,1],[23,6],[15,1]],'#b0af85');
   for(let i=0;i<6;i++)r(-30+i*8,3+i,6,3,'#9aa17d');
   p([[-19,-11],[-7,-24],[15,-25],[28,-15],[19,-3],[-9,-4]],'#a3aa7e');
   p([[-19,-11],[-9,-4],[19,-3],[21,-10],[-9,-12]],'#657a54');
   p([[-7,-24],[15,-25],[25,-17],[9,-13],[-14,-15]],'#bac19a');
   p([[5,-23],[15,-25],[25,-17],[16,-14],[9,-17]],'#58705a');
   p([[17,-15],[53,-26],[55,-22],[20,-10]],'#3f5a49');p([[17,-16],[53,-27],[54,-25],[19,-13]],'#a1ae89');r(52,-27,5,5,'#566c51');
   r(-2,-23,8,4,'#405c50');r(0,-24,4,2,'#d3d1a6');r(8,-27,5,3,'#243e40');r(-9,-34,1,13,'#4b6557');
   r(-35,3,4,2,'#e7d7a5');r(27,5,4,2,'#ddcd9b');
  }
  if(id==='caracal'){
   p([[-27,-1],[-11,-12],[16,-12],[31,-4],[34,4],[26,12],[2,14],[-18,8]],'#6e846b');
   p([[-16,-9],[14,-10],[24,-6],[2,-2],[-20,0]],'#a4b195');p([[-17,5],[25,7],[31,4],[26,12],[2,14]],'#415f52');
   p([[15,-10],[26,-5],[31,1],[18,2]],'#243e4b');p([[3,-10],[12,-10],[15,2],[3,1]],'#345662');r(6,-8,4,2,'#91bbc2');
   p([[-23,1],[-56,-8],[-59,-5],[-28,7]],'#7c9675');p([[-55,-8],[-52,-22],[-58,-24],[-60,-5]],'#9eb090');
   r(-59,-12,12,2,'#334c4d');r(-54,-17,2,14,'#334c4d');
   r(-10,-16,23,5,'#4c6556');r(-1,-24,3,9,'#48594e');r(-49,-25,98,2,'#d2d5bc');p([[-20,-34],[23,-15],[21,-13],[-22,-32]],'#647f72');
   r(-13,-3,12,8,'#57765c');r(-11,-2,8,4,'#293f45');r(-12,12,3,6,'#233b3e');r(22,10,3,8,'#233b3e');r(-16,16,10,4,'#263739');r(19,16,10,4,'#263739');r(30,2,3,3,'#d7c695');
  }
  if(id==='caesar'){
   p([[-40,-3],[-24,-10],[33,0],[39,6],[22,14],[-40,5]],'#566d53');
   for(const [xx,yy] of [[-31,10],[9,16],[26,19]]){r(xx-5,yy-5,11,11,'#21322f');r(xx-2,yy-2,5,5,'#a8ac8d');}
   p([[-42,-18],[-28,-25],[-13,-21],[-11,0],[-24,10],[-43,5]],'#91a079');
   p([[-42,-18],[-28,-25],[-13,-21],[-26,-13]],'#bdbe99');p([[-42,-16],[-28,-11],[-28,-1],[-42,-5]],'#263f48');p([[-25,-12],[-15,-17],[-14,-6],[-25,-1]],'#375c65');
   r(-42,0,7,3,'#dfd1a0');r(-40,6,16,3,'#3a4e40');r(-21,-1,2,4,'#344d40');
   p([[-7,-5],[10,-13],[22,-5],[7,4]],'#99a47b');p([[3,-10],[48,-39],[51,-35],[9,-6]],'#687f60');p([[3,-12],[48,-41],[50,-38],[7,-8]],'#b9bf94');p([[44,-40],[51,-44],[55,-38],[48,-34]],'#566f51');
   r(13,4,16,3,'#aab18a');r(31,8,3,12,'#708461');r(27,19,13,3,'#425840');
  }
  if(id==='fremm'){
   p([[-61,8],[-45,-1],[37,-2],[64,5],[39,20],[-41,19]],'#526f7a');p([[-61,7],[-45,-3],[36,-4],[64,3],[36,14],[-43,13]],'#a8b8b7');
   p([[-51,6],[-42,0],[32,-1],[52,3],[33,10],[-43,9]],'#788f95');
   p([[-12,-16],[3,-24],[28,-20],[34,2],[18,9],[-15,3]],'#c5cdc2');p([[-15,-15],[4,-8],[18,9],[-15,3]],'#8fa4a3');
   p([[3,-24],[28,-20],[25,-14],[0,-18]],'#e0e0ca');p([[3,-17],[26,-14],[28,-10],[4,-12]],'#294958');
   r(-3,-40,9,20,'#9fb6b4');p([[-7,-41],[8,-43],[13,-37],[-3,-34]],'#cbd7c6');r(0,-54,2,14,'#b8cdc3');r(-9,-51,22,2,'#b8cdc3');
   r(-17,-17,9,8,'#4e6f75');r(-28,-14,8,11,'#bdc9b9');r(-26,-15,5,2,'#2b454c');
   p([[35,2],[40,-5],[47,-2],[47,2],[42,5]],'#d5dbc9');r(45,-5,13,2,'#a3b7ad');
   p([[-47,3],[-41,1],[-27,3],[-32,8],[-47,7]],'#5f7c80');r(-40,3,2,4,'#d4d8bd');r(-44,4,10,1,'#d4d8bd');
   for(let i=0;i<5;i++)r(-48+i*19,11,3,2,'#dce1cb');
  }
  if(id==='suffren'){
   p([[-59,3],[-49,-5],[-24,-9],[32,-8],[53,-2],[61,4],[51,11],[28,14],[-34,12],[-51,8]],'#20373e');
   p([[-51,0],[-33,-6],[29,-6],[49,-1],[55,3],[31,6],[-33,5]],'#52727b');p([[-40,0],[31,0],[48,2],[28,4],[-33,3]],'#799497');
   p([[-8,-10],[-3,-26],[11,-26],[18,-21],[18,-5],[3,-2]],'#547780');p([[-3,-26],[11,-26],[18,-21],[3,-19]],'#9ab3ad');p([[3,-19],[18,-21],[18,-5],[3,-2]],'#3b5d68');
   r(4,-39,2,14,'#a4bcb5');r(10,-35,2,10,'#729992');r(3,-39,6,2,'#c3d0b8');
   p([[3,-12],[28,-7],[27,-3],[8,-5]],'#668b91');p([[-48,-2],[-55,-14],[-59,-13],[-55,3]],'#66868b');p([[-53,6],[-58,18],[-54,18],[-45,8]],'#3e616b');r(-63,0,5,6,'#a4986c');
   for(let i=0;i<8;i++)r(-31+i*9,7,2,1,'#91a8a4');
  }
  c.restore();
 }
 function building(c,id,x,y,level,t=0,scale=1,preview=false){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  const image=imageFor(id+'-'+level);
  if(image){
   const orientation=window.QG_LAYOUT.alignment?.[id]||{shear:0,vertical:1};
   const factor=Math.min((preview?160:110)/image.naturalWidth,(preview?112:100)/(image.naturalHeight*orientation.vertical+image.naturalWidth*Math.abs(orientation.shear))),w=image.naturalWidth*factor,h=image.naturalHeight*factor;
   c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
   const contact=window.QG_LAYOUT.buildingArt?.[id+'-'+level],baseFactor=Math.min(110/image.naturalWidth,100/(image.naturalHeight*orientation.vertical+image.naturalWidth*Math.abs(orientation.shear)));
   c.save();if(contact)c.translate(contact.offsetX*factor/baseFactor,contact.offsetY*factor/baseFactor);c.transform(1,orientation.shear,0,orientation.vertical,0,0);c.drawImage(image,-w/2,-h*.8,w,h);c.restore();
   for(let i=0;i<level;i++)rect(c,-9+i*8,preview?26:16,5,3,'#e9c382');
   c.restore();return;
  }
  const p=(pts,col)=>poly(c,pts,col),r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  const box=(x,y,w,d,h,roof='#b8c3aa')=>{p([[x-w,y],[x,y+d],[x,y+d-h],[x-w,y-h]],'#687e74');p([[x,y+d],[x+w,y],[x+w,y-h],[x,y+d-h]],'#8fa08c');p([[x-w,y-h],[x,y-h-d],[x+w,y-h],[x,y+d-h]],roof);};
  p([[-43,3],[5,-20],[55,8],[7,35]],'#60735e');
  if(id==='defense'){box(-12,3,24,13,20,'#6c7e66');box(27,10,15,8,12,'#5c715d');for(let n=0;n<4;n++)p([[18+n*5,-3],[22+n*5,-4],[33+n*5,-24],[29+n*5,-25]],'#82977a');r(-10,-30,2,12,'#617766');p([[-25,-36],[7,-36],[10,-28],[-20,-27]],'#a7b39a');}
  if(id==='hangar'){
   p([[-39,12],[-2,33],[40,10],[4,-11]],'#a0a590');box(0,0,36,19,23,'#aebaa7');
   p([[-36,-23],[-5,-48],[36,-23],[0,-4]],'#ced0b3');p([[-5,-48],[36,-23],[36,-19],[-5,-42]],'#879c8d');
   p([[-30,-17],[-3,-2],[-3,16],[-30,1]],'#243f46');for(let i=0;i<5;i++)p([[-28,-14+i*3],[-5,-1+i*3],[-5,i*3],[-28,-13+i*3]],'#517070');
   p([[-26,12],[-5,24],[-3,23],[-24,11]],'#dcc580');r(16,-15,10,4,'#375b63');
   if(level>=2){p([[-16,-32],[-4,-41],[14,-30],[1,-21]],'#789b9d');p([[-12,-31],[-4,-37],[8,-30],[0,-25]],'#aec8bd');}
   if(level>=3){box(39,3,11,6,13,'#6b8590');r(34,-11,11,2,'#c8d3bb');}
  }
  if(id==='atelier'){
   box(0,2,32,17,27,'#be8964');p([[-32,-25],[-6,-43],[32,-25],[0,-8]],'#d8aa78');p([[-6,-43],[32,-25],[32,-21],[-6,-38]],'#9f7358');
   for(let i=0;i<2;i++){const xx=-27+i*14;p([[xx,-13+i*7],[xx+11,-7+i*7],[xx+11,9+i*7],[xx,3+i*7]],'#2f4848');}
   r(10,-17,12,5,'#a9c6b9');r(13,-32,7,9,'#536e65');r(11,-33,11,3,'#dde0c5');r(-35,9,6,8,'#ab6b49');r(-34,11,4,2,'#dfb17a');
   if(level>=2){box(34,10,12,7,12,'#95a580');r(30,3,9,3,'#304c48');}if(level>=3){r(-12,-42,6,12,'#53695f');r(-14,-45,10,4,'#acbca6');}
  }
  if(id==='port'){
   box(-12,8,24,13,18,'#7e98a0');r(-31,-2,12,7,'#2c535f');r(-14,3,9,5,'#c6d7bb');
   p([[28,17],[32,17],[29,-53],[25,-53]],'#b99558');r(21,-56,44,4,'#ddb975');r(28,-53,3,73,'#e3c68a');
   for(let n=0;n<5;n++){p([[25,-47+n*12],[32,-36+n*12],[30,-34+n*12],[25,-44+n*12]],'#8f784e');}r(55,-53,1,27,'#c7cbb4');r(52,-27,4,3,'#3d5960');r(52,-24,7,2,'#3d5960');
   p([[29,-54],[57,-69],[59,-66],[34,-54]],'#caac69');p([[57,-69],[65,-56],[62,-55],[55,-66]],'#aa8d53');
   if(level>=2){box(-27,23,12,7,10,'#b66e4b');for(let i=0;i<3;i++)r(-36+i*4,17+i*2,1,6,'#d6a071');}if(level>=3)box(3,28,13,7,12,'#708f88');
  }
  if(id==='ecole'){
   box(0,2,35,18,29,'#637f8a');p([[-32,-27],[0,-44],[32,-27],[0,-10]],'#91a9a5');
   for(let row=0;row<2;row++)for(let n=0;n<4;n++){const xx=-29+n*7,yy=-20+n*3.6+row*10;p([[xx,yy],[xx+4,yy+2],[xx+4,yy+7],[xx,yy+5]],'#d2d9b6');}r(8,-10,8,7,'#244c5c');r(22,-17,7,6,'#244c5c');
   r(-3,-11,7,23,'#334f51');r(-1,-8,3,5,'#a0b9ac');r(41,-41,2,59,'#c3cdb6');p([[43,-41],[61,-38],[58,-31],[43,-33]],'#c27350');
   if(level>=2){box(-33,14,12,7,15,'#819f8d');}if(level>=3){p([[-11,-29],[1,-35],[16,-27],[4,-21]],'#315565');p([[-7,-28],[1,-32],[10,-27],[3,-24]],'#779caa');}
  }
  if(id==='radar'){
   box(0,10,28,15,18,'#adbda4');r(-23,0,17,4,'#304f57');r(8,1,10,6,'#2e555f');
   p([[-8,-9],[-2,-62],[5,-62],[12,-9]],'#516c65');r(0,-60,3,52,'#b6c4a9');for(let n=0;n<4;n++){p([[-4,-53+n*11],[8,-44+n*11],[7,-41+n*11],[-4,-50+n*11]],'#90a78f');}
   c.save();c.translate(2,-66);c.scale(.35+.65*Math.cos(t/1500),1);p([[-22,-14],[20,-14],[24,-9],[19,5],[-18,5],[-24,-9]],'#b9cbb3');p([[-20,-12],[18,-12],[20,-8],[16,2],[-16,2],[-20,-8]],'#6c938b');for(let n=0;n<5;n++)r(-17+n*8,-10,1,12,'#c6d3b6');r(-19,-5,38,1,'#c6d3b6');c.restore();
   if(level>=2){r(-27,-22,2,17,'#9baf9a');p([[-36,-30],[-17,-24],[-24,-16],[-31,-19]],'#d0d5b9');}if(level>=3){r(30,-44,2,52,'#9eb498');r(24,-40,14,2,'#bacbad');r(30,-47,3,3,'#cc7658');}
  }
  for(let i=0;i<level;i++)r(-9+i*8,26,5,3,'#e9c382');c.restore();
 }

 const locations=window.QG_LAYOUT.units;
 function pose(id,progress,kind='mission'){
  const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),returning=p>.82,fade=returning?Math.min(1,(p-.82)/.18):1;
  if(kind==='repair')return {x:0,y:0,lift:0,angle:0,alpha:1,scale:1};
  const q=Math.min(p/.82,1),ease=q*q*(3-2*q);
  let x=0,y=0,lift=0,angle=0,scale=1;
  if(id==='rafale'){const roll=Math.min(q/.4,1);x=45*roll*roll+155*Math.max(0,(q-.4)/.6);y=24*roll*roll+75*Math.max(0,(q-.4)/.6);lift=110*Math.max(0,(q-.4)/.6);scale=1-.18*ease;}
  else if(id==='caracal'||id==='nh90'||id==='drone'){x=60*ease;y=-18*ease;lift=45*Math.min(q*2,1);scale=1-.12*ease;}
  else if(id==='a400m'){const taxi=Math.min(q/.3,1),roll=Math.max(0,Math.min(1,(q-.3)/.25)),climb=Math.max(0,(q-.55)/.45);x=69*taxi+50*roll+100*climb;y=-37*taxi+27*roll+50*climb;lift=90*climb;scale=1-.18*ease;}
  else if(id==='griffon'){x=-42*Math.min(ease/.2,1)+112*Math.max(0,(ease-.2)/.8);y=-23*Math.min(ease/.2,1)-60*Math.max(0,(ease-.2)/.8);}
  else if(id==='leclerc'){const exit=Math.min(ease/.22,1),road=Math.max(0,(ease-.22)/.78);x=-55*exit+112*road;y=-15*exit-60*road;}
  else if(id==='caesar'){const exit=Math.min(ease/.22,1),road=Math.max(0,(ease-.22)/.78);x=39*exit+117*road;y=20*exit-63*road;}
  else {x=70*ease;y=-38*ease;}
  if(returning){x=0;y=0;lift=0;angle=0;scale=1;}
  return {x,y,lift,angle,alpha:returning?fade:Math.min(1,(1-q)/.15),scale};
 }
 function activity(c,id,progress,kind='mission',preview=false,time=0){
  const base=locations[id];if(!base)return;
  const a=pose(id,progress,kind),p=Math.max(0,Math.min(1,progress)),air=['rafale','caracal','nh90','a400m','drone'].includes(id),ship=id==='fremm'||id==='suffren';
  const x=preview?160+a.x*.28:base[0]+a.x,y=preview?103+a.y*.18:base[1]+a.y,scale=preview?1.7:base[2];
  c.save();c.globalAlpha=a.alpha;
  if(kind==='mission'&&p<.82){
   if(ship){c.save();c.globalAlpha=a.alpha*.55;c.strokeStyle='#aac5c2';c.lineWidth=1.2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(x-16-i*7,y+5+i*3);c.quadraticCurveTo(x-30-i*7,y+11+i*3,x-48-i*7,y+12+i*3);c.stroke();}c.restore();}
   else if(!air){c.save();c.globalAlpha=a.alpha*.3;c.fillStyle='#baad88';for(let i=0;i<3;i++){c.beginPath();c.ellipse(x-27-i*8,y+6,5+i*2,2+i,0,0,Math.PI*2);c.fill();}c.restore();}
   if(air&&a.lift>0){c.save();c.globalAlpha=a.alpha*.22;c.fillStyle='#14282b';c.beginPath();c.ellipse(x,y+6,24,7,0,0,Math.PI*2);c.fill();c.restore();}
  }
  c.save();c.translate(x,y-a.lift*(preview?.65:1));if(a.angle)c.rotate(a.angle);sprite(c,id,0,0,scale*a.scale);c.restore();
  if(['caracal','nh90'].includes(id)&&kind==='mission'&&p<.82){const cy=y-a.lift*(preview?.65:1)-25*scale;for(let i=0;i<3;i++){const v=time/75+i*Math.PI/3;c.save();c.globalAlpha=a.alpha*.25;c.translate(x,cy);c.scale(1,.45);c.rotate(v);poly(c,[[-31*scale,-1],[31*scale,-1],[31*scale,1],[-31*scale,1]],'#c9d2c5');c.restore();}}
  if(kind==='repair'){const xx=x+32,yy=y-25;poly(c,[[xx-2,yy+5],[xx+10,yy-7],[xx+13,yy-4],[xx+1,yy+8]],'#efca82');poly(c,[[xx+8,yy-7],[xx+9,yy-14],[xx+13,yy-16],[xx+12,yy-10],[xx+17,yy-9],[xx+20,yy-13],[xx+20,yy-6],[xx+14,yy-3]],'#efca82');if(Math.floor(time/180)%2===0)for(let i=0;i<3;i++)rect(c,xx-8+i*7,yy-9-i*3,2,2,'#fbdda0');}
  c.restore();
 }

 function scene(c,state,time=0,activities=[]){
  c.clearRect(0,0,720,440);rect(c,0,0,720,440,colors.sea);
  const project=(x,y)=>[350+(x-y)*26,74+(x+y)*14];
  const terrain=imageFor('terrain');if(terrain){c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";c.drawImage(terrain,0,0,720,440);c.restore();}
  else {
  for(let y=18;y<440;y+=21)for(let x=(y%3)*29;x<720;x+=77)rect(c,x+Math.round(Math.sin(time/2200+y)*3),y,20,1,colors.foam);

  for(let sum=0;sum<23;sum++)for(let x=0;x<13;x++){const y=sum-x;if(y<0||y>10||x+y<2||(x>10&&y>8))continue;const [px,py]=project(x,y);poly(c,[[px-26,py],[px,py+14],[px+26,py],[px,py-14]],(x===6||y===5)?colors.road:(x+y)%3===0?'#929d7e':colors.grass);if(x===12||y===10)poly(c,[[px-26,py],[px,py+14],[px+26,py],[px+26,py+7],[px,py+21],[px-26,py+7]],colors.edge);}
  // Runway, quay and gardens follow the same isometric grid.
  for(let x=1;x<=6;x++){const [px,py]=project(x,1);poly(c,[[px-24,py],[px,py+12],[px+24,py],[px,py-12]],'#405254');rect(c,px-5,py-1,10,2,'#e3ddbb');}
  for(let i=0;i<4;i++){const [x,y]=project(11,i+5);poly(c,[[x-13,y],[x+1,y+8],[x+57,y-21],[x+43,y-29]],'#b2ac8b');}
  }
  const objects=[];
  for(const [gx,gy] of window.QG_LAYOUT.trees){const [x,y]=project(gx,gy);objects.push({depth:y,draw(){if(!decoration(c,'tree',x,y,30,38)){rect(c,x,y-9,3,10,'#586553');poly(c,[[x-11,y-5],[x+1,y-27],[x+13,y-5]],'#496f5c');}}});}
  for(const [id,p] of Object.entries(positions)){const [x,y]=project(...p);objects.push({depth:y+12,draw(){building(c,id,x,y,state.buildings[id],time);if(state.integrity?.[id]<100){poly(c,[[x+18,y-9],[x+24,y+2],[x+12,y+2]],'#ba795a');rect(c,x+17,y-5,2,4,'#efe1b9');rect(c,x+17,y,2,1,'#efe1b9');}}});}
  for(const [id,[x,y,scale]] of Object.entries(locations)){if(!state.units[id]||state.units[id].owned===false)continue;const active=activities.find(a=>a.id===id),a=active?pose(id,active.progress,active.kind):null;const deployed=state.content?.operation&&[state.content.operation.unit,state.content.operation.support].includes(id);if(deployed&&!active)continue;objects.push({depth:a&&a.lift>10?1000:y+(a?.y||0),draw(){if(active){activity(c,id,active.progress,active.kind,false,time);return;}sprite(c,id,x,y+(['fremm','suffren'].includes(id)?Math.sin(time/1600)*2:0),scale);}});}
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
  if(terrain){for(let i=0;i<5;i++){const x=530+i*32,y=396+Math.sin(time/1700+i)*2;poly(c,[[x,y],[x+15,y-1],[x+20,y],[x+4,y+1]],'#577e86');}}
  // A small support vehicle travels along the central road.
  const phase=(time/1400)%16,progress=1.9+(phase<8?phase:16-phase),[vx,vy]=project(6,progress);if(!decoration(c,'support',vx,vy+3,27,22)){rect(c,vx-6,vy-7,12,7,'#e0c891');rect(c,vx-5,vy-6,4,3,'#496975');rect(c,vx-6,vy,3,3,'#203d41');rect(c,vx+3,vy,3,3,'#203d41');}
 }
 return {sprite,building,scene,ready,onReady,pose,activity};
})();
