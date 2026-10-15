(() => {
  'use strict';
  const params=new URLSearchParams(location.search),raw=params.get('engin')??document.body.dataset?.engineIndex,index=Number(raw);
  const isProfile=raw!==null&&raw!==undefined&&Number.isInteger(index)&&index>=0&&index<(window.LDV_ENGINS||[]).length;
  const status=document.getElementById('history-load-state');
  const cache=new Map();
  function load(src){
    if(cache.has(src))return cache.get(src);
    const request=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=true;script.onload=resolve;script.onerror=()=>{script.remove();cache.delete(src);reject(new Error('Chargement impossible : '+src))};document.head.append(script)});
    cache.set(src,request);return request;
  }
  const profileData=['histoire-data.js?v=23','histoire-chiffres.js?v=17','histoire-technique.js?v=6','map-data.js','histoire-frises.js?v=8','histoire-photos-data.js?v=5','histoire-3d-data.js?v=6'];
  async function start(){
    status.hidden=false;status.textContent=isProfile?'Chargement de la fiche…':'Chargement du catalogue…';
    if(isProfile){document.body.classList.add('history-profile');document.getElementById('history-catalogue').hidden=true;await Promise.all(profileData.map(load));await Promise.all(['histoire-photos.js?v=4','histoire-3d.js?v=4'].map(load));}
    else {await load('histoire-catalog-data.js?v=6');window.RADAR_3D={has:item=>window.RADAR_CATALOG_3D.includes(item.name)};}
    await load('histoire.js?v=35');status.hidden=true;
    if(location.hash){let id=location.hash.slice(1);try{id=decodeURIComponent(id)}catch{}const anchor=document.getElementById(id);if(anchor)anchor.scrollIntoView({block:'start'});}
  }
  start().catch(()=>{status.textContent='Le chargement a échoué. ';const retry=document.createElement('button');retry.type='button';retry.textContent='Réessayer';retry.addEventListener('click',()=>location.reload());status.append(retry);});
})();
