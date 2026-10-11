(() => {
  'use strict';
  const fold=window.RADAR_CATALOGUE.fold;
  const rules=[['Aérien',/avion|chasseur|aerien|aeronaut|rafale|f.35|helicoptere|drone/],['Maritime',/marin|naval|navire|porte.avions|sous.marin|fregate|torpille|corvette|flotte/],['Terrestre',/armee de terre|blind|char |chars|infanterie|artillerie|obusier|leclerc|gepard|soldat/],['Missiles',/missile|icbm|balistique|scalp|brahmos|atacms|iskander|meteor|patriot/],['Cyber et espace',/cyber|spatial|espace|satellite|orbite|guerre electronique/],['Géopolitique',/geopol|ukraine|russie|chine|coree|iran|alliance|otan|conflit|diplomat|politique/]];
  const documentText=item=>fold(item.title+' '+(item.sourceExcerpt?.text||(!item.autoCollected?item.summary:'')));
  function themes(item){const text=documentText(item),matched=rules.filter(([,re])=>re.test(text)).map(([name])=>name);return matched.length?matched:['Autres'];}
  const tokens=s=>fold(s).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  function related(item,engins=window.LDV_ENGINS||[]){const doc=' '+tokens(item.title+' '+(item.sourceExcerpt?.text||''))+' ';return engins.map((e,i)=>({e,i})).filter(({e})=>{if(e.category==='mer'&&!/naval|marin|navire|porte.avions|fregate|corvette|flotte|submarine/.test(fold(item.title)))return false;const model=e.name.match(/\b[A-Z]{1,4}[- ]?\d+[A-Z0-9-]*\b/);return [e.name,...(e.aliases||[]),model?.[0]].filter(Boolean).some(n=>{const key=tokens(n);return key.length>=3&&/[a-z]/.test(key)&&doc.includes(' '+key+' ');});}).slice(0,3);}
  function image(item){return item.image?.kind==='article'?item.image:null;}
  window.RADAR_NEWS_TOOLS=Object.freeze({themes,related,image,fold,themeNames:[...rules.map(([name])=>name),'Autres']});
})();
