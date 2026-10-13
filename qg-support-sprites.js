/* Engins génériques de QG Radar : dessins canvas, sans modèle réel revendiqué. */
(function(root){
 'use strict';
 const colors={ink:'#243b41',tire:'#1f3031',olive:'#72846a',shade:'#4d6554',light:'#a8b398',roof:'#bbc19b',glass:'#31525f',glint:'#a6ccd0',metal:'#92a5a0',accent:'#d0a767'};
 function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
 function line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='square';c.lineJoin='miter';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
 function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 function shadow(c,x,y,rx,ry){c.save();c.globalAlpha*=.18;ellipse(c,x,y,rx,ry,'#14282b');c.restore();}
 function drone(c){
  // Projection des ailes sur le même plan incliné que l'aviation de QG.
  const point=(u,v)=>[Math.round(u*.94+v*.64),Math.round(-u*.42+v*.58)];
  const p=(pts,col)=>poly(c,pts.map(([u,v])=>point(u,v)),col);
  const l=(pts,col,width=1)=>line(c,pts.map(([u,v])=>point(u,v)),col,width);
  shadow(c,0,11,42,10);
  // Roues du train et bras fins visibles sous l'appareil au parking.
  for(const [u,v] of [[24,0],[-6,-9],[-6,9]]){const [x,y]=point(u,v);line(c,[[x,y],[x,y+8]],colors.metal,2);ellipse(c,x,y+9,3,2.2,colors.tire);rect(c,x,y+8,1,2,colors.light);}
  // Deux poutres, stabilisateur arrière et dérives.
  p([[-27,-9],[-8,-10],[-7,-7],[-26,-6]],colors.shade);
  p([[-27,6],[-7,7],[-8,10],[-26,9]],colors.olive);
  p([[-31,-17],[-25,-16],[-23,16],[-29,17]],colors.metal);
  p([[-29,0],[-24,0],[-23,16],[-29,17]],'#6b858a');
  const fin=(u,v)=>{const [x,y]=point(u,v);poly(c,[[x-2,y],[x-2,y-14],[x+3,y-13],[x+5,y+1]],colors.light);poly(c,[[x+3,y-13],[x+5,y+1],[x+1,y]],colors.shade);};
  fin(-27,-8);fin(-27,8);
  // Aile droite à grand allongement : extrémités et panneaux distincts.
  p([[4,-43],[-3,-42],[-9,-6],[-9,6],[-3,42],[4,43],[5,7],[5,-7]],colors.metal);
  p([[4,-43],[1,-43],[-3,-8],[5,-7]],'#c1ccc4');
  p([[5,7],[-3,8],[1,43],[4,43]],'#829da0');
  l([[-2,-35],[-5,-15]],'#718e91');l([[-5,15],[-2,35]],'#b9c9c0');
  l([[4,-39],[4,-15]],'#8faaa8');l([[4,15],[4,39]],'#587780');
  // Fuselage, nez, capteur ventral et entrée d'air.
  p([[42,0],[31,-3],[15,-5],[-12,-5],[-21,-3],[-21,3],[-12,5],[15,5],[31,3]],'#b9c8c0');
  p([[42,0],[25,1],[8,2],[-21,2],[-21,3],[-12,5],[15,5],[31,3]],'#6f8b92');
  p([[34,-1],[22,-3],[7,-3],[-3,-2],[24,-1]],'#d0d8cc');
  p([[13,-4],[3,-5],[-3,-3],[4,-2],[13,-2]],colors.glass);
  p([[11,-4],[5,-4],[2,-3],[10,-3]],colors.glint);
  const [sx,sy]=point(24,0);ellipse(c,sx,sy+4,4,3,colors.ink);ellipse(c,sx+1,sy+3,2,1.5,'#8badb2');
  // Hélice arrière statique. L'animation de départ reste gérée par QG_ART.
  l([[-24,-8],[-24,8]],colors.ink,2);p([[-25,-2],[-21,-2],[-21,2],[-25,2]],colors.shade);
  // Repères de jeu sans marquage d'un fabricant ou d'une armée.
  p([[-1,27],[2,27],[2,31],[-1,31]],colors.accent);p([[1,-30],[4,-30],[4,-27],[1,-27]],colors.light);
 }
 function depanneur(c){
  const p=(pts,col)=>poly(c,pts,col),r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
  shadow(c,-1,14,45,10);
  // Roues éloignées, châssis puis trois roues proches : même orientation que CAESAR.
  for(const [x,y] of [[-19,-5],[14,2],[30,5]]){ellipse(c,x,y,5,6,colors.tire);ellipse(c,x,y,2.2,3.5,colors.shade);}
  p([[-43,-5],[-24,-16],[39,-2],[44,9],[24,21],[-39,7]],colors.ink);
  p([[-41,-8],[-23,-18],[39,-5],[42,2],[23,13],[-40,1]],colors.shade);
  for(const [x,y] of [[-33,9],[7,16],[26,20]]){ellipse(c,x,y,6,7,colors.tire);ellipse(c,x+1,y-1,3.3,4.1,'#849575');ellipse(c,x+1,y-1,1.4,2.1,'#c3c4a0');}
  // Cabine basse à pans coupés, deux faces vitrées et calandre.
  p([[-43,-23],[-29,-32],[-11,-27],[-10,-5],[-24,4],[-43,-2]],colors.olive);
  p([[-43,-23],[-29,-32],[-11,-27],[-25,-18]],colors.roof);
  p([[-43,-21],[-25,-16],[-24,-4],[-43,-9]],colors.glass);
  p([[-23,-17],[-13,-24],[-12,-12],[-23,-5]],'#466976');
  p([[-40,-20],[-31,-17],[-29,-15],[-40,-17]],colors.glint);
  p([[-22,-16],[-16,-21],[-16,-19],[-22,-14]],'#91bbc2');
  r(-33,-19,2,11,colors.olive);r(-24,-6,2,7,colors.shade);
  p([[-43,-6],[-27,-2],[-27,2],[-43,-2]],colors.shade);r(-42,-5,5,3,'#e2d1a2');r(-30,-2,4,2,'#e2d1a2');
  p([[-45,0],[-28,5],[-26,8],[-45,3]],colors.ink);
  // Plateau de dépannage, coffre latéral et treuil.
  p([[-6,-13],[8,-21],[40,-14],[42,2],[25,11],[-6,3]],colors.olive);
  p([[-6,-13],[8,-21],[40,-14],[25,-6]],colors.light);
  p([[-6,-13],[25,-6],[25,11],[-6,3]],colors.shade);
  p([[25,-6],[40,-14],[42,2],[25,11]],'#80916e');
  p([[0,-5],[12,-3],[12,5],[0,2]],'#9aaa80');p([[14,-2],[22,0],[22,7],[14,5]],'#9aaa80');
  line(c,[[5,-1],[8,0]],colors.ink);line(c,[[17,3],[20,4]],colors.ink);
  p([[29,-8],[37,-12],[37,-5],[29,0]],colors.ink);line(c,[[30,-6],[36,-10]],colors.metal,2);
  // Petite grue hydraulique repliée, vérin contrasté et crochet.
  p([[7,-20],[11,-23],[20,-19],[16,-16]],colors.ink);p([[7,-20],[16,-16],[16,-11],[7,-15]],colors.olive);
  p([[11,-22],[14,-25],[33,-34],[37,-29],[17,-18]],colors.olive);
  p([[14,-25],[32,-35],[34,-33],[17,-22]],colors.light);
  p([[32,-35],[36,-34],[44,-20],[41,-17]],colors.olive);
  line(c,[[17,-21],[30,-28]],colors.accent,2);line(c,[[30,-28],[33,-30]],colors.metal,2);
  line(c,[[41,-20],[41,-10],[38,-7],[37,-10]],colors.ink,1.5);
  ellipse(c,14,-21,2,2,colors.metal);ellipse(c,34,-32,2,2,colors.metal);
  // Arceau, gyrophare orange, antenne et bandes de service.
  line(c,[[-26,-27],[-26,-35],[-11,-31],[-11,-26]],colors.shade,2);
  r(-23,-35,7,3,colors.accent);r(-21,-36,3,1,'#f0d39d');line(c,[[-35,-30],[-35,-39]],colors.ink);
  p([[27,6],[30,5],[30,9],[27,10]],colors.accent);p([[34,2],[37,0],[37,4],[34,6]],colors.light);
 }
 function sprite(c,id,x,y,scale=1){
  if(id!=='drone'&&id!=='depanneur')return false;
  if(!Number.isFinite(scale)||scale<=0)scale=1;
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  if(id==='drone')drone(c);else depanneur(c);
  c.restore();return true;
 }
 root.QG_SUPPORT_ART={sprite};
})(typeof window!=='undefined'?window:globalThis);
