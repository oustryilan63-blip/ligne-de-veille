(() => {
  'use strict';
  const fold=window.RADAR_CATALOGUE.fold;
  const rules=[['Aérien',/avion|chasseur|aerien|aeronaut|rafale|f.35|helicoptere|drone|aircraft|fighter|helicopter/],['Maritime',/marin|naval|navire|porte.avions|sous.marin|fregate|torpille|corvette|flotte|\bnavy\b|submarine|frigate|destroyer|amphibious|shipbuilding/],['Terrestre',/armee de terre|blind|char |chars|infanterie|artillerie|obusier|leclerc|gepard|soldat|\barmy\b|\btank\b|armoured|armored|artillery/],['Missiles',/missile|icbm|balistique|scalp|brahmos|atacms|iskander|meteor|patriot|ballistic|interceptor/],['Cyber et espace',/cyber|spatial|espace|satellite|orbite|guerre electronique|\bspace\b|electronic warfare/],['Géopolitique',/geopol|ukraine|russie|russe|chine|coree|iran|alliance|otan|conflit|diplomat|politique|sanction|sommet|multilateral|souverain|cessez.le.feu|relations internationales|moyen.orient|sahel|indopacifique|ormuz|taiwan|moscou|pekin|washington|riyad|yemen|liban|\bnato\b|russia|china|korea|summit|foreign affairs|middle east|lebanon/]];
  const documentText=item=>fold([item.title,item.sourceExcerpt?.text||(!item.autoCollected?item.summary:''),...(item.publisherCategories||[])].join(' '));
  function themes(item){const text=documentText(item),matched=rules.filter(([name,re])=>item.themes?.includes(name)||re.test(text)).map(([name])=>name);return matched.length?matched:['Autres'];}
  const tokens=s=>fold(s).replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const ambiguousNames=new Set(['apache','tigre','tiger','panther','lynx','gazelle','puma','cougar','tornado','typhoon','raptor','reaper','predator','spirit','viper','leclerc','centurion','warrior','challenger','patriot','meteor','mistral','trident']);
  const contexts={air:/avion|chasseur|aerien|aeronaut|helicoptere|drone|airbus|boeing|dassault|aircraft|fighter|helicopter|air force/,terre:/blind|\bchars?\b|artillerie|obusier|infanterie|armee|\barmy\b|\btanks?\b|armoured|armored/,mer:/naval|marin|navire|porte.avions|fregate|corvette|flotte|submarine|\bnavy\b|frigate|destroyer|amphibious|\bship\b/,missiles:/missile|balistique|intercept|munition|mbda|dissuasion|air.air|defense aerienne|icbm/};
  function related(item,engins=window.LDV_ENGINS||[]){
    const text=fold(item.title+' '+(item.sourceExcerpt?.text||'')),doc=' '+tokens(text)+' ';
    return engins.map((e,i)=>({e,i})).filter(({e})=>{
      const context=contexts[e.category];
      if(e.category==='mer'&&!context.test(text))return false;
      const model=e.name.match(/\b[A-Z]{1,4}[- ]?\d+[A-Z0-9-]*\b/);
      return [e.name,...(e.aliases||[]),model?.[0]].filter(Boolean).some(n=>{
        const key=tokens(n);
        // Un atlas géopolitique n'identifie pas l'A400M : son nom ou sa désignation sont nécessaires.
        if(key==='atlas'||key.length<3||!/[a-z]/.test(key))return false;
        // Hercules 100 (drone) et C-130 Hercules sont des appareils distincts.
        if(key==='hercules'&&!/\bc[- ]?130\b|\blockheed\b/.test(text))return false;
        if(ambiguousNames.has(key)&&context&&!context.test(text))return false;
        return doc.includes(' '+key+' ');
      });
    }).slice(0,3);
  }
  function image(item){return item.image?.kind==='article'?item.image:null;}
  window.RADAR_NEWS_TOOLS=Object.freeze({themes,related,image,fold,themeNames:[...rules.map(([name])=>name),'Autres']});
})();
