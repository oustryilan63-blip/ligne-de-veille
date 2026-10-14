(() => {
 'use strict';
 const E=window.LDV_ENGINS,T=window.LDV_TECHNIQUE,$=id=>document.getElementById(id),params=new URLSearchParams(location.search);
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const a=(label,url)=>{const n=el('a','',label);n.href=url;if(url.startsWith('https://')){n.target='_blank';n.rel='noopener noreferrer'}return n};
 const valid=s=>s!==null&&/^\d+$/.test(s)&&E[Number(s)];
 const initialA=params.get('a')??document.body.dataset?.compareA,initialB=params.get('b')??document.body.dataset?.compareB;
 let first=valid(initialA)?Number(initialA):0,second=valid(initialB)?Number(initialB):E.findIndex((e,i)=>i!==first&&e.category===E[first].category);
 if(second===first)second=E.findIndex((e,i)=>i!==first&&e.category===E[first].category);
 $('compare-category').value=E[first].category===E[second].category?E[first].category:'all';
 function options(){const category=$('compare-category').value,pool=E.map((e,i)=>({e,i})).filter(x=>category==='all'||x.e.category===category);if(!pool.some(x=>x.i===first))first=pool[0].i;if(!pool.some(x=>x.i===second)||first===second)second=pool.find(x=>x.i!==first).i;for(const [id,value] of [['compare-a',first],['compare-b',second]]){const select=$(id);select.replaceChildren(...pool.map(({e,i})=>{const o=el('option','',e.name);o.value=String(i);return o}));select.value=String(value)}}
 function rowKey(label){const s=label.toLowerCase();if(s.includes('longueur'))return 'Longueur';if(s.includes('envergure'))return 'Envergure';if(s.includes('largeur'))return 'Largeur';if(s.includes('hauteur'))return 'Hauteur';if(s.startsWith('portée'))return 'Portée';if(s.includes('déplacement'))return 'Déplacement';if(s.includes('masse')&&s.includes('vide'))return 'Masse à vide';if(s.includes('masse')&&s.includes('décollage'))return 'Masse maximale au décollage';if(s.includes('masse')||s.includes('poids'))return 'Autre masse publiée';if(s.startsWith('vitesse'))return 'Vitesse';if(s.startsWith('propulsion')||s.startsWith('motorisation'))return 'Propulsion';return label;}
 function render(){
  const ids=[first,second];$('compare-a').querySelectorAll('option').forEach(o=>o.disabled=Number(o.value)===second);$('compare-b').querySelectorAll('option').forEach(o=>o.disabled=Number(o.value)===first);
  $('compare-notice').textContent=E[first].category!==E[second].category?'Ces engins appartiennent à des catégories différentes : les caractéristiques ne sont pas directement équivalentes.':'';
  const cards=$('compare-cards');cards.replaceChildren();const notes=$('compare-notes');notes.replaceChildren();
  for(const id of ids){const e=E[id],t=T[id],card=el('article','comparison-card'),img=el('img');img.src='assets/jeu/'+e.photo;img.alt=e.alt||e.name;card.append(img,el('h2','',e.name),el('p','variant',t.variant));const credit=el('p','comparison-credit');credit.append(a(e.photoAuthor+' · '+e.photoLicense,'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(e.photoFile)));card.append(credit,a('Lire son histoire →',window.RADAR_DISCOVERY?.profileURL(e)||'histoire.html?engin='+id));cards.append(card);const note=el('p');note.append(el('strong','',e.name+' — '),document.createTextNode(t.note));notes.append(note)}
  const table=$('compare-table');table.replaceChildren();table.append(el('caption','','Les caractéristiques, avec leur contexte'));
  const head=el('thead'),hr=el('tr');for(const title of ['Repère',E[first].name,E[second].name]){const th=el('th','',title);th.scope='col';hr.append(th)}head.append(hr);table.append(head);
  const rows=new Map();for(const [col,id] of ids.entries())for(const field of T[id].fields){const key=rowKey(field.label);if(!rows.has(key))rows.set(key,[[],[]]);rows.get(key)[col].push(field)}
  const body=el('tbody');for(const [key,columns] of rows){const tr=el('tr'),th=el('th','',key);th.scope='row';tr.append(th);for(const fields of columns){const td=el('td');if(!fields.length)td.textContent='Non renseigné pour cette variante';for(const field of fields){const block=el('div');block.append(el('strong','',field.value),el('small','',field.label));if(field.note)block.append(el('small','',field.note));block.append(a('Consulter la source ↗',field.source));td.append(block)}tr.append(td)}body.append(tr)}table.append(body);
  const preset=window.RADAR_DISCOVERY_CONTENT?.comparisons.find(p=>p.a===first&&p.b===second||p.a===second&&p.b===first),editorial=$('compare-editorial');
  if(editorial){editorial.replaceChildren();editorial.hidden=!preset;if(preset){editorial.append(el('h2','',preset.title),el('p','',preset.intro));for(const [title,copy]of preset.notes)editorial.append(el('h3','',title),el('p','',copy));const refs=el('div','discovery-refs');for(const ref of preset.sources)refs.append(a(ref.label+' ↗',ref.url));editorial.append(refs)}}
  document.title=(preset?.title||E[first].name+' / '+E[second].name)+' | Radar';
  const target=preset?'comparatif-'+preset.slug+'.html':'comparateur.html?a='+first+'&b='+second;
  try{history.replaceState(null,'',target)}catch{}
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical&&location.href){canonical.href=new URL(target,location.href).href;const node=document.querySelector('meta[property="og:url"]');if(node)node.setAttribute('content',canonical.href)}
  for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]']){const node=document.querySelector(selector);if(node)node.setAttribute('content',document.title)}
  if(preset)for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']){const node=document.querySelector(selector);if(node)node.setAttribute('content',preset.intro)}
  const heading=document.querySelector('.comparison-hero h1');if(heading)heading.textContent=E[first].name+' et '+E[second].name;
 }
 $('compare-category').addEventListener('change',()=>{options();render()});$('compare-a').addEventListener('change',()=>{first=Number($('compare-a').value);render()});$('compare-b').addEventListener('change',()=>{second=Number($('compare-b').value);render()});
 $('compare-share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('compare-share-status').textContent='Lien copié.'}catch{$('compare-share-status').textContent='Copie l’adresse de cette page dans ton navigateur.'}});
 options();render();
})();
