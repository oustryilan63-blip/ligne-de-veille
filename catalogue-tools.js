(() => {
  'use strict';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const compact=s=>fold(s).replace(/[^a-z0-9]/g,'');
  const types={tank:'Chars de combat',armour:'Autres blindés',artillery:'Artillerie',combat:'Avions de combat',bomber:'Bombardiers',transport:'Avions de transport',trainer:'Avions d’entraînement',recon:'Avions de reconnaissance',helicopter:'Hélicoptères',drone:'Drones',submarine:'Sous-marins',carrier:'Porte-avions',amphibious:'Bâtiments amphibies',surface:'Autres navires',ballistic:'Missiles balistiques',cruise:'Missiles de croisière',airmissile:'Missiles air-air',othermissile:'Autres missiles'};
  function type(e){const k=fold(e.kind);if(e.category==='terre')return /artillerie|obusier|canon|lance.roquettes/.test(k)?'artillery':/char.*(combat|bataille)/.test(k)?'tank':'armour';if(e.category==='air'){if(/helicoptere/.test(k))return 'helicopter';if(/drone/.test(k))return 'drone';if(/transport|ravitail/.test(k))return 'transport';if(/entrainement/.test(k))return 'trainer';if(/bombardier/.test(k))return 'bomber';if(/reconnaissance/.test(k))return 'recon';return 'combat'}if(e.category==='mer'){if(/sous.marin/.test(k))return 'submarine';if(/amphibie|porte.helicopteres/.test(k))return 'amphibious';if(/porte.avions|porte.aeronefs/.test(k))return 'carrier';return 'surface'}if(/balistique|icbm/.test(k))return 'ballistic';if(/croisiere/.test(k))return 'cruise';if(/air.air/.test(k))return 'airmissile';return 'othermissile'}
  const regions=new Intl.DisplayNames(['fr'],{type:'region'});
  const countryName=c=>{try{return regions.of(c)||c}catch{return c}};
  function matches(e,query){const terms=fold(query).trim().split(/\s+/).filter(Boolean),values=[e.name,e.kind,e.country,types[type(e)],...(e.aliases||[]),...(e.originCodes||[e.code]).map(countryName)];return terms.every(term=>values.some(v=>fold(v).includes(term)||compact(v).includes(compact(term))));}
  function family(e){const n=fold(e.name);if(/f.?15/.test(n))return 'f15';if(/challenger/.test(n))return 'challenger';if(/fremm|carlo bergamini/.test(n))return 'fremm';return compact(e.name)}
  function options(item,pool,level='standard',shuffle=arr=>[...arr].sort(()=>Math.random()-.5)){
    const distinct=pool.filter(e=>e.name!==item.name&&family(e)!==family(item)),chosen=[];
    const push=list=>{for(const e of shuffle(list)){if(!chosen.some(c=>c.name===e.name))chosen.push(e);if(chosen.length===3)break}};
    if(level==='beginner'){
      const seen=new Set([type(item)]);for(const e of shuffle(distinct)){if(!seen.has(type(e))){chosen.push(e);seen.add(type(e));}if(chosen.length===3)break}
    }else {if(level==='expert')push(distinct.filter(e=>type(e)===type(item)));if(chosen.length<3)push(distinct.filter(e=>e.category===item.category));}
    if(chosen.length<3)push(distinct);
    return chosen.length===3?shuffle([item,...chosen]).map(e=>e.name):[];
  }
  window.RADAR_CATALOGUE=Object.freeze({fold,compact,type,types,countryName,matches,family,options});
})();
