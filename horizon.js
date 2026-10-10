(() => {
'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const photos={"triomphant":{"key":"triomphant","src":"assets/horizon/triomphant.jpg","file":"SNLE de classe le Triomphant.jpg","artist":"Marine nationale","license":"Licence Ouverte","licenseUrl":"https://www.etalab.gouv.fr/licence-ouverte-open-licence","page":"https://commons.wikimedia.org/wiki/File:SNLE_de_classe_le_Triomphant.jpg","caption":"Classe Le Triomphant · photographie"},"snle3g":{"key":"snle3g","src":"assets/horizon/snle3g.png","file":"SNLE-3G-210221105752293576.png","artist":"800tonnes Naval Art","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","page":"https://commons.wikimedia.org/wiki/File:SNLE-3G-210221105752293576.png","caption":"SNLE 3G · vue d’artiste, programme futur"},"ohio":{"key":"ohio","src":"assets/horizon/ohio.jpg","file":"Good Luck Ohio.JPEG","artist":"PH1 James Preston","license":"Public domain","licenseUrl":"https://commons.wikimedia.org/wiki/Commons:Public_domain","page":"https://commons.wikimedia.org/wiki/File:Good_Luck_Ohio.JPEG","caption":"USS Ohio · photographie historique, avant sa conversion en SSGN"},"columbia":{"key":"columbia","src":"assets/horizon/columbia.jpg","file":"Artist rendering of a Columbia-class ballistic missile submarine, 2019 (190306-N-N0101-125).jpg","artist":"U.S. Navy illustration/released","license":"Public domain","licenseUrl":"https://commons.wikimedia.org/wiki/Commons:Public_domain","page":"https://commons.wikimedia.org/wiki/File:Artist_rendering_of_a_Columbia-class_ballistic_missile_submarine,_2019_(190306-N-N0101-125).jpg","caption":"Columbia · vue d’artiste de l’US Navy, 2019"},"borei":{"key":"borei","src":"assets/horizon/borei.jpg","file":"«Александр Невский» в Вилючинске.jpg","artist":"Ildus Gilyazutdinov","license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0","page":"https://commons.wikimedia.org/wiki/File:%C2%AB%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80_%D0%9D%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9%C2%BB_%D0%B2_%D0%92%D0%B8%D0%BB%D1%8E%D1%87%D0%B8%D0%BD%D1%81%D0%BA%D0%B5.jpg","caption":"Alexander Nevsky · classe Borei"},"borei-a":{"key":"borei-a","src":"assets/horizon/borei-a.jpg","file":"K-549 Knyaz Vladimir at sea trials (2019).jpg","artist":"HoteitH","license":"CC BY-SA 4.0","licenseUrl":"https://creativecommons.org/licenses/by-sa/4.0","page":"https://commons.wikimedia.org/wiki/File:K-549_Knyaz_Vladimir_at_sea_trials_(2019).jpg","caption":"Knyaz Vladimir · classe Borei-A, essais de 2019"}};
const photoKeys={fr:["triomphant","snle3g"],us:["ohio","columbia"],ru:["borei-a","borei"]};
const classes={
fr:[{name:'Le Triomphant',status:'Classe en service',system:'Famille M51 · évolution M51.3',description:'Quatre sous-marins constituent cette classe de la Force océanique stratégique française.',detail:'La classe Le Triomphant assure la composante océanique de la dissuasion française. Le ministère a annoncé la mise en service opérationnel du M51.3 en octobre 2025. Les évolutions du système accompagnent la modernisation progressive de la flotte.',sources:[['Marine nationale · classe Le Triomphant','https://www.defense.gouv.fr/en/node/13937'],['Ministère des Armées · M51.3, octobre 2025','https://www.defense.gouv.fr/sites/default/files/ministere-armees/28.10.2025%20Communiqu%C3%A9_A_mise%20en%20service%20op%C3%A9rationnel%20du%20missile%20M51.3.pdf']]},
{name:'SNLE 3G',status:'Programme futur · en développement',system:'Famille M51 · évolutions prévues',description:'La prochaine génération française, conçue pour succéder à la classe Le Triomphant.',detail:'Le programme SNLE de troisième génération prépare le renouvellement des quatre bâtiments français. La DGA indique une compatibilité avec le M51 et ses évolutions. Cette fiche décrit un programme futur ; un calendrier prévisionnel ne constitue pas une livraison acquise.',sources:[['DGA · programme SNLE','https://www.defense.gouv.fr/dga/marin-nucleaire-lanceur-dengins-snle']]}],
us:[{name:'Ohio · version SSBN',status:'Classe en service',system:'Trident II D5LE',description:'Les Ohio lanceurs d’engins constituent la flotte stratégique sous-marine américaine actuelle.',detail:'La version SSBN de la classe Ohio emporte le système Trident II. Elle est distincte des quatre Ohio convertis en SSGN. La prolongation de vie D5LE accompagne la transition vers la génération Columbia.',sources:[['US Navy · Trident II','https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169285/trident-ii-d5-missile/trident-ii-d5-missile/'],['US Navy · modernisation','https://www.ssp.navy.mil/News-Media/News/Article/4526926/answering-the-call-how-pae-ssp-is-forging-the-future-of-sea-based-deterrence/']]},
{name:'Columbia',status:'Programme futur · en construction',system:'Trident II D5LE prévu · D5LE2 en développement',description:'La génération destinée à remplacer progressivement les Ohio lanceurs d’engins.',detail:'La classe Columbia doit prendre la relève de la flotte Ohio SSBN. L’US Navy prévoit le D5LE pour l’équipement initial et développe une nouvelle évolution, D5LE2, pour la suite. Ces étapes futures restent distinctes des capacités déjà en service.',sources:[['US Navy · programme Columbia','https://www.ssp.navy.mil/About-Us/PAE-SSP-Mission/Development/'],['US Navy · D5LE et D5LE2','https://www.ssp.navy.mil/News-Media/News/Article/4526926/answering-the-call-how-pae-ssp-is-forging-the-future-of-sea-based-deterrence/']]}],
ru:[{name:'Borei-A · projet 955A',status:'Classe en service · génération modernisée',system:'Bulava',description:'La version modernisée de la famille Borei, construite par le chantier Sevmash.',detail:'Le Borei-A prolonge la famille Borei. Sevmash indique que le bâtiment de tête Knyaz Vladimir a rejoint la flotte en 2020. Le chantier documente également un essai de Bulava réalisé par le Knyaz Oleg pendant ses essais. Les déclarations du constructeur sont citées comme telles.',sources:[['Sevmash · Knyaz Oleg et Borei-A (russe)','https://sevmash.ru/rus/news/3190-2022-01-28-11-48-17.html']]},
{name:'Borei · projet 955',status:'Classe en service · première série',system:'Bulava',description:'La première série de la famille, qui précède les Borei-A.',detail:'La première série Borei comprend les bâtiments Yury Dolgoruky, Alexander Nevsky et Vladimir Monomakh, admis au service en 2013 et 2014 selon Sevmash. Le chantier a documenté en septembre 2014 un essai du système Bulava depuis le Vladimir Monomakh.',sources:[['Sevmash · première série (russe)','https://sevmash.ru/rus/news/3102-2021-05-28-09-27-40.html'],['Sevmash · essai de 2014 (russe)','https://sevmash.ru/rus/news/1769--l-r-lr-.html']]}]
};
function fact(){const photo=photos[photoKeys[$('hz-country').value][Number($('hz-class').value)]];$('hz-sub-photo').src=photo.src;$('hz-sub-photo').alt=photo.caption;const caption=$('hz-photo-credit');caption.replaceChildren();const label=document.createElement('span');label.textContent=photo.caption;const credit=document.createElement('a');credit.href=photo.page;credit.target='_blank';credit.rel='noopener noreferrer';credit.textContent=photo.artist+' · ';const license=document.createElement('a');license.href=photo.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';license.textContent=photo.license;caption.append(label,credit,license);const c=classes[$('hz-country').value][Number($('hz-class').value)];$('hz-class-name').textContent=c.name;$('hz-class-status').textContent=c.status;$('hz-class-description').textContent=c.description;
const panel=$('hz-fact-card');panel.replaceChildren();const left=document.createElement('div'),right=document.createElement('div'),title=document.createElement('h3'),p=document.createElement('p');title.textContent=c.name;p.textContent=c.detail;left.append(title,p);const dl=document.createElement('dl');for(const [label,value] of [['Statut',c.status],['Système réel associé · documentation',c.system]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd);}right.append(dl);for(const [label,url] of c.sources){const a=document.createElement('a');a.href=url;a.textContent=label+' ↗';a.target='_blank';a.rel='noopener noreferrer';right.append(a);}panel.append(left,right);}
function country(){const select=$('hz-class');select.replaceChildren();classes[$('hz-country').value].forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=c.name;select.append(o);});fact();}
$('hz-country').addEventListener('change',country);$('hz-class').addEventListener('change',fact);country();
// Fictional exploration drones: these values are invented, not missile data.
const drones={
 littoral:{name:'Littoral',range:2000,speed:120},
 alize:{name:'Alizé',range:4500,speed:180},
 grandlarge:{name:'Grand Large',range:6500,speed:240}
};
const earthRadius=6371.0088,rad=Math.PI/180,map=$('hz-map');
let start=[440,205],arrival=null,placing=null,busy=false,frame=0,completed=0;
let view={x:-60,y:-25,w:1320,h:550},circleKey='',circlePath='';
const drone=()=>drones[$('hz-drone').value];
const formatDistance=n=>Math.round(n).toLocaleString('fr-FR');
function coordinates(p){return {lat:85-p[1]/3.2,lon:p[0]*360/1200-180};}
function project(lat,lon){return [(((lon+180)%360+360)%360)*1200/360,(85-lat)*3.2];}
function geographicDistance(a,b){const p=coordinates(a),q=coordinates(b);const h=Math.sin((q.lat-p.lat)*rad/2)**2+Math.cos(p.lat*rad)*Math.cos(q.lat*rad)*Math.sin((q.lon-p.lon)*rad/2)**2;return earthRadius*2*Math.atan2(Math.sqrt(Math.min(1,Math.max(0,h))),Math.sqrt(Math.max(0,1-h)));}
function withinRange(a,b){return geographicDistance(a,b)<=drone().range+1e-7;}
function destination(a,bearing,km){const p=coordinates(a),lat=p.lat*rad,lon=p.lon*rad,d=km/earthRadius,b=bearing*rad;const lat2=Math.asin(Math.max(-1,Math.min(1,Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(b))));const lon2=lon+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(lat2));return project(lat2/rad,lon2/rad);}
function interpolate(a,b,t){
 if(t<=0)return a;if(t>=1)return b;
 const p=coordinates(a),q=coordinates(b),d=geographicDistance(a,b)/earthRadius;if(d<1e-10)return a;
 const A=Math.sin((1-t)*d)/Math.sin(d),B=Math.sin(t*d)/Math.sin(d);
 const x=A*Math.cos(p.lat*rad)*Math.cos(p.lon*rad)+B*Math.cos(q.lat*rad)*Math.cos(q.lon*rad),y=A*Math.cos(p.lat*rad)*Math.sin(p.lon*rad)+B*Math.cos(q.lat*rad)*Math.sin(q.lon*rad),z=A*Math.sin(p.lat*rad)+B*Math.sin(q.lat*rad);
 return project(Math.atan2(z,Math.hypot(x,y))/rad,Math.atan2(y,x)/rad);
}
function pathFromPoints(points){return points.map((p,i)=>`${!i||Math.abs(p[0]-points[i-1][0])>600?'M':'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('');}
function durationText(km){const minutes=Math.max(1,Math.round(km/drone().speed*60)),hours=Math.floor(minutes/60);return (hours?hours+' h ':'')+String(minutes%60).padStart(2,'0')+' min';}
const polygons=window.LDV_MAP.flatMap(c=>c.path.split('M').slice(1).map(part=>part.replace(/[LZ]/g,' ').trim().split(/\s+/).map(s=>s.split(',').map(Number))));
function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function isOcean(p){return p.x>=0&&p.x<=1200&&p.y>=0&&p.y<=480&&!polygons.some(poly=>inPolygon(p,poly));}
function svg(tag,attrs={},text=''){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));el.textContent=text;return el;}
for(const c of window.LDV_MAP)$('hz-land').append(svg('path',{d:c.path}));
function markerScale(){return 1/(map.getScreenCTM()?.a||1);}
function renderMap(){
 const g=$('hz-exercise'),s=markerScale();g.replaceChildren();
 const key=start.join(',')+':'+drone().range;if(key!==circleKey){circleKey=key;circlePath=pathFromPoints(Array.from({length:361},(_,i)=>destination(start,i,drone().range)));}
 $('hz-range').replaceChildren(svg('path',{d:circlePath,class:'hz-range-circle'}));
 const sub=svg('g',{class:'hz-sub-marker',transform:`translate(${start}) scale(${s*.32})`,role:'img','aria-label':'Sous-marin, point de départ'});
 sub.append(svg('path',{d:'M-49 4Q-37-1-27 2M-50 10Q-36 6-26 8M-45 15Q-34 12-27 12',fill:'none',stroke:'#9ababa','stroke-width':1.2,opacity:.55}));
 sub.append(svg('path',{d:'M-33 2L-43-8L-37 7L-44 18L-31 12Z',fill:'#76969c',stroke:'#b5cbc6','stroke-width':.8}));
 sub.append(svg('path',{d:'M-30 0C-16-4 20-4 33 0Q44 4 35 10C20 16-19 15-31 10Z',fill:'url(#hz-hull)',stroke:'#b0c4be','stroke-width':1}));
 sub.append(svg('path',{d:'M-14-1L-12-14Q-5-17 0-12L4-1Z',fill:'#4c6c77',stroke:'#aac3c1','stroke-width':.8}));
 sub.append(svg('path',{d:'M-8-14V-21H-5M-2-12V-18M-15-5H-23L-18-2H3L8-5Z',fill:'#8da9ab',stroke:'#c5d5cf','stroke-width':1}));
 sub.append(svg('path',{d:'M5 0L15 8L26 8L17 0Z',fill:'#708c94',stroke:'#afc5c5','stroke-width':.6}));
 sub.append(svg('path',{d:'M-28 4Q-6 1 28 3M-23 9Q1 12 28 8',stroke:'#a0b6b5','stroke-width':.6,opacity:.75,fill:'none'}));
 for(let i=0;i<4;i++)sub.append(svg('path',{d:`M${6+i*5} -1v2`,stroke:'#b2c5c0','stroke-width':.7}));
 g.append(sub,svg('text',{x:start[0],y:start[1]+16*s,'text-anchor':'middle','font-size':9*s},'SOUS-MARIN'));

 if(arrival){const pin=svg('g',{transform:`translate(${arrival}) scale(${s})`,role:'img','aria-label':'Destination du drone en mer',class:'hz-arrival'});pin.append(svg('circle',{r:6,fill:'#e4b081',stroke:'#fff4df','stroke-width':1.5}));g.append(pin,svg('text',{x:arrival[0],y:arrival[1]+22*s,'text-anchor':'middle','font-size':9*s},'DESTINATION'));}
}
function setFeedback(text){$('hz-feedback').textContent=text;}
function updateRoute(){
 const d=arrival?geographicDistance(start,arrival):0;
 $('hz-range-value').textContent=formatDistance(drone().range)+' km';
 $('hz-speed').textContent=drone().speed+' km/h';
 $('hz-distance').textContent=arrival?'≈ '+formatDistance(d)+' km':'— km';
 $('hz-duration').textContent=arrival?'≈ '+durationText(d):'—';
 $('hz-route-state').textContent=arrival?'Destination prête':'Destination à choisir';
 $('hz-launch').disabled=busy||!arrival||!withinRange(start,arrival);
 $('hz-objective').textContent=arrival?'Ton expédition.':'Prépare ton expédition.';
 renderMap();
}
function stopPlacing(){placing=null;map.classList.remove('placing');$('hz-place').setAttribute('aria-pressed','false');$('hz-destination').setAttribute('aria-pressed','false');$('hz-place').textContent='1 · Placer le sous-marin';$('hz-destination').textContent='2 · Choisir la destination';}
function setPlacing(mode){if(busy)return;if(placing===mode){stopPlacing();setFeedback('Placement annulé.');return;}stopPlacing();placing=mode;map.classList.add('placing');const button=$(mode==='start'?'hz-place':'hz-destination');button.setAttribute('aria-pressed','true');button.textContent='Annuler le placement';setFeedback(mode==='start'?'Clique dans l’océan pour placer le sous-marin.':'Choisis une destination en mer dans le cercle du drone.');map.focus({preventScroll:true});}
function clearAnimation(){cancelAnimationFrame(frame);$('hz-flight').replaceChildren();$('hz-progress').style.width='0%';}
function place(p){
 if(!placing||busy)return;
 if(!isOcean(p)){setFeedback('Choisis un point dans l’océan, hors des terres et des eaux intérieures.');return;}
 const other=placing==='start'?arrival:start;
 if(other&&geographicDistance(other,[p.x,p.y])<10){setFeedback('Choisis deux points espacés d’au moins 10 km.');return;}
 if(placing==='arrival'&&!withinRange(start,[p.x,p.y])){setFeedback(`Hors autonomie : ${Math.ceil(geographicDistance(start,[p.x,p.y])).toLocaleString('fr-FR')} km pour une limite de ${formatDistance(drone().range)} km.`+(arrival?' La destination précédente est conservée.':' Choisis un point plus proche.'));return;}
 const mode=placing;if(mode==='start')start=[p.x,p.y];else arrival=[p.x,p.y];
 const removed=arrival&&!withinRange(start,arrival);if(removed)arrival=null;
 stopPlacing();clearAnimation();updateRoute();setFeedback(removed?'Sous-marin déplacé. La destination devenue trop éloignée a été retirée.':arrival?'Destination prête. Lance le drone pour voir l’expédition.':'Sous-marin placé. Choisis une destination en mer dans le cercle.');
}
function changeDrone(){stopPlacing();clearAnimation();const removed=arrival&&!withinRange(start,arrival);if(removed)arrival=null;updateRoute();setFeedback(drone().name+' sélectionné. '+(removed?'La destination dépasse son autonomie et a été retirée.':'Autonomie et vitesse inventées pour cette expédition.'));}
$('hz-drone').addEventListener('change',changeDrone);
function lock(value){for(const id of ['hz-country','hz-class','hz-drone','hz-place','hz-destination','hz-clear'])$(id).disabled=value;$('hz-launch').hidden=value;$('hz-stop').hidden=!value;}
$('hz-place').addEventListener('click',()=>setPlacing('start'));
$('hz-destination').addEventListener('click',()=>setPlacing('arrival'));
$('hz-clear').addEventListener('click',()=>{if(busy)return;stopPlacing();arrival=null;clearAnimation();updateRoute();setFeedback('Destination effacée. Prépare une nouvelle expédition.');});
$('hz-stop').addEventListener('click',()=>{clearAnimation();busy=false;lock(false);updateRoute();setFeedback('Expédition interrompue. Tu peux modifier le trajet.');});
$('hz-launch').addEventListener('click',()=>{
 if(busy||!arrival||!withinRange(start,arrival))return;
 stopPlacing();clearAnimation();busy=true;lock(true);$('hz-objective').textContent='Exploration en cours…';
 const a=[...start],b=[...arrival];
 const track=svg('path',{d:pathFromPoints(Array.from({length:101},(_,i)=>interpolate(a,b,i/100))),fill:'none',stroke:'#e6b074','stroke-width':2,'stroke-dasharray':'5 5','vector-effect':'non-scaling-stroke'});
 const dot=svg('g',{'aria-hidden':'true'});dot.append(svg('path',{d:'M0-8L3-2L12 2V4L3 2L2 7L5 9H-5L-2 7L-3 2L-12 4V2L-3-2Z',fill:'#ffe8c0',stroke:'#a16b45','stroke-width':.8}));$('hz-flight').append(track,dot);
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?50:5000,t0=performance.now();
 function animate(t){const n=Math.min(1,(t-t0)/duration),p=interpolate(a,b,n),prev=interpolate(a,b,Math.max(0,n-.001)),next=interpolate(a,b,Math.min(1,n+.001));let dx=next[0]-prev[0];if(dx>600)dx-=1200;if(dx< -600)dx+=1200;const angle=Math.atan2(next[1]-prev[1],dx)*180/Math.PI+90;dot.setAttribute('transform',`translate(${p}) rotate(${angle}) scale(${markerScale()})`);$('hz-progress').style.width=`${n*100}%`;
 if(n<1){setFeedback(n<.2?'Départ du drone d’exploration…':n<.85?'Survol en cours · animation accélérée.':'Approche de la destination…');frame=requestAnimationFrame(animate);}else{busy=false;completed++;lock(false);updateRoute();$('hz-count').textContent=completed;$('hz-objective').textContent='Expédition terminée.';setFeedback('Destination atteinte. Durée théorique : '+durationText(geographicDistance(a,b))+' à la vitesse fictive choisie.');dot.remove();}}
 frame=requestAnimationFrame(animate);
});
function paint(){view.w=Math.max(330,Math.min(1320,view.w));view.h=view.w*550/1320;view.x=Math.max(-60,Math.min(1260-view.w,view.x));view.y=Math.max(-25,Math.min(525-view.h,view.y));map.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);renderMap();}
function resetView(){view={x:-60,y:-25,w:1320,h:550};paint();}
function zoom(f,anchor){const old=view.w,next=Math.max(330,Math.min(1320,old*f)),ratio=next/old,p=anchor||{x:view.x+view.w/2,y:view.y+view.h/2};view.x=p.x-(p.x-view.x)*ratio;view.y=p.y-(p.y-view.y)*ratio;view.w=next;paint();}
function point(e){const p=map.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(map.getScreenCTM().inverse());}
$('hz-zoom-in').addEventListener('click',()=>zoom(.8));$('hz-zoom-out').addEventListener('click',()=>zoom(1.25));$('hz-reset-map').addEventListener('click',resetView);
map.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.88:1.14,point(e));},{passive:false});
const pointers=new Map();let drag=null,pinch=0,tap=null;
map.addEventListener('pointerdown',e=>{tap={x:e.clientX,y:e.clientY};map.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag=point(e);if(pointers.size===2){tap=null;const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
map.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>6)tap=null;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch&&d)zoom(pinch/d,point({clientX:(a.x+b.x)/2,clientY:(a.y+b.y)/2}));pinch=d;drag=null;}else if(drag){const p=point(e);view.x+=drag.x-p.x;view.y+=drag.y-p.y;paint();drag=point(e);}else drag=point(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])map.addEventListener(name,e=>{if(name==='pointerup'&&tap&&pointers.size===1)place(point(e));tap=null;pointers.delete(e.pointerId);drag=null;pinch=0;});
map.addEventListener('keydown',e=>{if(e.target!==map)return;if(placing&&e.key==='Enter'){e.preventDefault();place({x:view.x+view.w/2,y:view.y+view.h/2});return;}if(e.key==='Escape'){stopPlacing();return;}if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))e.preventDefault();else return;if(e.key==='+'||e.key==='=')zoom(.8);else if(e.key==='-')zoom(1.25);else if(e.key==='Home')resetView();else{view.x+=e.key==='ArrowLeft'?-view.w*.08:e.key==='ArrowRight'?view.w*.08:0;view.y+=e.key==='ArrowUp'?-view.h*.08:e.key==='ArrowDown'?view.h*.08:0;paint();}});
const menu=document.querySelector('.menu-toggle'),nav=$('main-nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
window.addEventListener('pagehide',()=>{if(busy){cancelAnimationFrame(frame);busy=false;lock(false);updateRoute();setFeedback('Expédition interrompue après avoir quitté la page. Tu peux la relancer.');}});
new ResizeObserver(()=>renderMap()).observe(map);updateRoute();
})();
