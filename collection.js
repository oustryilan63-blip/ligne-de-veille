(() => {
  'use strict';
  const KEY='radar-collection-v1',known=new Set((window.LDV_ENGINS||[]).map(e=>e.name));
  function validate(raw){if(!raw||raw.version!==1||!Array.isArray(raw.names)||raw.names.length>1000||raw.names.some(n=>typeof n!=='string'||!known.has(n))||new Set(raw.names).size!==raw.names.length)throw Error('Collection invalide');return {version:1,names:[...raw.names]};}
  let state={version:1,names:[]},persistent=true;
  try{const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch{persistent=false;}
  const has=name=>state.names.includes(name);
  function publish(){document.querySelectorAll('[data-favourite]').forEach(b=>{const active=has(b.dataset.favourite),full=b.classList.contains('favourite-full');b.textContent=full?(active?'★ Retirer de ma collection':'☆ Ajouter à ma collection'):(active?'★':'☆');b.setAttribute('aria-label',(active?'Retirer de ma collection : ':'Ajouter à ma collection : ')+b.dataset.favourite);b.setAttribute('aria-pressed',String(active));});window.dispatchEvent(new CustomEvent('radar-collection-change'));}
  function toggle(name){if(!known.has(name))return;state.names=has(name)?state.names.filter(n=>n!==name):[...state.names,name];try{localStorage.setItem(KEY,JSON.stringify(state));persistent=true}catch{persistent=false}publish();}
  function button(item,full=false){const b=document.createElement('button');b.type='button';b.className='favourite-button'+(full?' favourite-full':'');b.dataset.favourite=item.name;const refresh=()=>{const active=has(item.name);b.textContent=full?(active?'★ Retirer de ma collection':'☆ Ajouter à ma collection'):(active?'★':'☆');b.setAttribute('aria-label',(active?'Retirer de ma collection : ':'Ajouter à ma collection : ')+item.name);b.setAttribute('aria-pressed',String(active));};refresh();b.addEventListener('click',()=>{toggle(item.name);refresh()});return b;}
  function pool(items){return items.filter(e=>has(e.name));}
  window.RADAR_COLLECTION=Object.freeze({key:KEY,validate,has,toggle,button,pool,names:()=>[...state.names],persistent:()=>persistent});
  window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{state=e.newValue?validate(JSON.parse(e.newValue)):{version:1,names:[]};persistent=true;publish()}catch{}});
})();
