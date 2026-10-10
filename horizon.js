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
const initialStart=[440,205];
// Arbitrary game balance: no geographic conversion or real missile performance.
const gameRanges={fr:[2400,3200],us:[2800,3600],ru:[3000,2200]};
const gameScale=10;
function rangeLimit(){return gameRanges[$('hz-country').value][Number($('hz-class').value)];}
function routeLength(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1])*gameScale;}
function withinRange(a,b){return routeLength(a,b)<=rangeLimit()+1e-7;}
function formatDistance(value){return Math.ceil(value).toLocaleString('fr-FR');}
const map=$('hz-map');
let start=[...initialStart],arrival=null,placing=null,busy=false,frame=0,completed=0;
let view={x:-60,y:-25,w:1320,h:550};
const polygons=window.LDV_MAP.flatMap(c=>c.path.split('M').slice(1).map(part=>part.replace(/[LZ]/g,' ').trim().split(/\s+/).map(s=>s.split(',').map(Number))));
function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function isOcean(p){return p.x>=0&&p.x<=1200&&p.y>=0&&p.y<=480&&!polygons.some(poly=>inPolygon(p,poly));}
function distance(){return arrival?Math.hypot(arrival[0]-start[0],arrival[1]-start[1]):0;}
function svg(tag,attrs={},text=''){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));el.textContent=text;return el;}
for(const c of window.LDV_MAP)$('hz-land').append(svg('path',{d:c.path}));
function markerScale(){return 1/(map.getScreenCTM()?.a||1);}
function renderMap(){
 const g=$('hz-exercise'),s=markerScale();g.replaceChildren();
 const range=$('hz-range');range.replaceChildren(svg('circle',{cx:start[0],cy:start[1],r:rangeLimit()/gameScale,class:'hz-range-circle'}));
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
 if(arrival){const mark=svg('g',{class:'hz-arrival',transform:`translate(${arrival}) scale(${s})`,role:'img','aria-label':'Point d’arrivée en mer'});mark.append(svg('path',{d:'M-9 0H-3M3 0H9M0-9V-3M0 3V9M-5-5L5 5M-5 5L5-5',stroke:'#e4b081','stroke-width':1.5,fill:'none'}));g.append(mark,svg('text',{x:arrival[0],y:arrival[1]+24*s,'text-anchor':'middle','font-size':9*s},'ARRIVÉE'));}
}
function setFeedback(text){$('hz-feedback').textContent=text;}
function updateRoute(){
 const d=distance()*gameScale;
 $('hz-distance').textContent=arrival?`${formatDistance(d)} / ${formatDistance(rangeLimit())} km fictifs`:'— / '+formatDistance(rangeLimit())+' km fictifs';
 $('hz-range-value').textContent=formatDistance(rangeLimit())+' km fictifs';
 $('hz-route-state').textContent=arrival?'Trajet prêt':'Arrivée à choisir';
 $('hz-launch').disabled=busy||!arrival||!withinRange(start,arrival);
 $('hz-objective').textContent=arrival?'Ton trajet d’essai.':'Prépare ton essai.';
 renderMap();
}
function stopPlacing(){placing=null;map.classList.remove('placing');$('hz-place').setAttribute('aria-pressed','false');$('hz-destination').setAttribute('aria-pressed','false');$('hz-place').textContent='1 · Placer le sous-marin';$('hz-destination').textContent='2 · Choisir l’arrivée';}
function setPlacing(mode){if(busy)return;if(placing===mode){stopPlacing();setFeedback('Placement annulé. Tu peux déplacer la carte ou lancer le trajet préparé.');return;}stopPlacing();placing=mode;map.classList.add('placing');const button=$(mode==='start'?'hz-place':'hz-destination');button.setAttribute('aria-pressed','true');button.textContent='Annuler le placement';setFeedback(mode==='start'?'Clique dans l’océan pour placer le sous-marin. Au clavier : zoome, déplace la carte puis valide le centre avec Entrée.':'Clique dans l’océan pour choisir l’arrivée. Au clavier : zoome, déplace la carte puis valide le centre avec Entrée.');map.focus({preventScroll:true});}
function clearAnimation(){cancelAnimationFrame(frame);$('hz-flight').replaceChildren();$('hz-progress').style.width='0%';}
function place(p){
 if(!placing||busy)return;
 if(!isOcean(p)){setFeedback('Choisis un point dans l’océan, hors des terres et des eaux intérieures.');return;}
 const other=placing==='start'?arrival:start;
 if(other&&Math.hypot(p.x-other[0],p.y-other[1])<12){setFeedback('Éloigne un peu les deux points pour que le trajet soit visible.');return;}
 if(placing==='arrival'&&!withinRange(start,[p.x,p.y])){setFeedback(`Hors portée : ${formatDistance(routeLength(start,[p.x,p.y]))} km fictifs pour une limite de ${formatDistance(rangeLimit())}. Choisis une arrivée en mer dans le cercle.`+(arrival?' Ton arrivée précédente est conservée.':''));return;}
 const mode=placing;if(mode==='start')start=[p.x,p.y];else arrival=[p.x,p.y];
 const removed=arrival&&!withinRange(start,arrival);if(removed)arrival=null;
 stopPlacing();clearAnimation();updateRoute();setFeedback((mode==='start'?'Sous-marin repositionné. ':'Arrivée choisie en mer. ')+(removed?'L’ancienne arrivée est désormais hors portée et a été retirée. Choisis une arrivée dans le cercle.':arrival?`Trajet : ${formatDistance(distance()*gameScale)} km fictifs.`:'Choisis maintenant le point d’arrivée dans le cercle.'));
}
function changeGameRange(){stopPlacing();clearAnimation();const removed=arrival&&!withinRange(start,arrival);if(removed)arrival=null;updateRoute();setFeedback(`Portée de jeu : ${formatDistance(rangeLimit())} km fictifs. `+(removed?'L’arrivée précédente est hors portée et a été retirée.':arrival?'Ton trajet reste dans la portée autorisée.':'Choisis une arrivée en mer dans le cercle.'));}
$('hz-country').addEventListener('change',changeGameRange);$('hz-class').addEventListener('change',changeGameRange);
function lock(value){for(const id of ['hz-country','hz-class','hz-place','hz-destination','hz-clear'])$(id).disabled=value;$('hz-launch').hidden=value;$('hz-stop').hidden=!value;}
$('hz-place').addEventListener('click',()=>setPlacing('start'));
$('hz-destination').addEventListener('click',()=>setPlacing('arrival'));
$('hz-clear').addEventListener('click',()=>{if(busy)return;stopPlacing();arrival=null;clearAnimation();updateRoute();setFeedback('Trajet effacé. Choisis une nouvelle arrivée en mer.');});
$('hz-stop').addEventListener('click',()=>{clearAnimation();busy=false;lock(false);updateRoute();setFeedback('Essai interrompu. Tu peux modifier ton trajet et recommencer.');});
$('hz-launch').addEventListener('click',()=>{
 if(busy||!arrival)return;
 if(!withinRange(start,arrival)){updateRoute();setFeedback('Hors portée. Choisis une arrivée dans le cercle avant de lancer l’essai.');return;}
 stopPlacing();clearAnimation();busy=true;lock(true);$('hz-objective').textContent='Essai en cours…';
 const a=[...start],b=[...arrival],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],control=[mid[0],mid[1]-Math.min(70,distance()*.3)];
 const track=svg('path',{d:`M${a} Q${control} ${b}`,fill:'none',stroke:'#e6b074','stroke-width':2,'stroke-dasharray':'5 5','vector-effect':'non-scaling-stroke'});
 const dot=svg('g',{'aria-hidden':'true'});dot.append(svg('path',{d:'M8 0L1-3H-7L-4 0L-7 3H1Z',fill:'#ffe8c0',stroke:'#be8050','stroke-width':.6}));$('hz-flight').append(track,dot);
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?50:4200,t0=performance.now();
 function animate(t){const n=Math.min(1,(t-t0)/duration),q=1-n,x=q*q*a[0]+2*q*n*control[0]+n*n*b[0],y=q*q*a[1]+2*q*n*control[1]+n*n*b[1],dx=2*q*(control[0]-a[0])+2*n*(b[0]-control[0]),dy=2*q*(control[1]-a[1])+2*n*(b[1]-control[1]);dot.setAttribute('transform',`translate(${x},${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI}) scale(${markerScale()})`);$('hz-progress').style.width=`${n*100}%`;
 if(n<1){setFeedback(n<.25?'Départ du projectile fictif…':n<.8?'Animation du trajet en cours…':'Arrivée dans la zone d’essai…');frame=requestAnimationFrame(animate);}else{busy=false;completed++;lock(false);updateRoute();$('hz-count').textContent=completed;$('hz-objective').textContent='Essai terminé.';setFeedback('Arrivée en mer atteinte. Tu peux choisir un autre point ou déplacer le sous-marin pour un nouvel essai.');dot.remove();$('hz-flight').append(svg('circle',{cx:b[0],cy:b[1],r:12*markerScale(),fill:'none',stroke:'#acd4ce','stroke-width':1,'vector-effect':'non-scaling-stroke'}));}}
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
window.addEventListener('pagehide',()=>{if(busy){cancelAnimationFrame(frame);busy=false;lock(false);updateRoute();setFeedback('Essai interrompu après avoir quitté la page. Tu peux le relancer.');}});
new ResizeObserver(()=>renderMap()).observe(map);updateRoute();
})();
