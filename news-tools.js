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
  // Repères pédagogiques : la sélection par mots-clés n'est pas un résumé de l'article.
  const contextRules=[
    [/rafale/, 'Une configuration C, B ou M et un standard F3-R ou F4 décrivent des choses différentes. La version complète aide à comprendre une annonce.', 'variantes-rafale.html', 'Les versions du Rafale'],
    [/leopard.?2/, 'Le nom de la famille ne décrit pas tous les équipements : le pays et la version complète comptent pour comparer les matériels.', 'variantes-leopard-2.html', 'Les versions du Leopard 2'],
    [/suez|ormuz|malacca|panama|detroit|route maritime|bab.el.mandeb/, 'Un passage maritime peut relier le commerce, la logistique et la sécurité. Un chiffre de trafic doit être lu avec sa date et son unité.', 'comprendre-detroits-routes-maritimes.html', 'Détroits et routes maritimes'],
    [/\botan\b|\bnato\b|psdc|union europeenne/, 'L’OTAN et l’Union européenne sont des organisations distinctes. Une annonce doit être rattachée à l’institution qui prend la décision.', 'comprendre-otan-union-europeenne.html', 'OTAN et Union européenne'],
    [/drone|uncrewed|unmanned|\buav\b/, 'Sans pilote à bord ne signifie ni autonome ni nécessairement armé. La mission et la charge utile permettent de mieux distinguer les familles.', 'comprendre-familles-drones.html', 'Les familles de drones'],
    [/balistique|ballistic|croisiere|cruise missile|\bicbm\b|tomahawk/, 'Le type de vol, la portée et la charge sont des notions distinctes. Les valeurs doivent être associées à une version documentée.', 'comprendre-missile-balistique-croisiere.html', 'Missiles balistiques et de croisière'],
    [/porte.avions|aircraft carrier/, 'Un porte-avions agit avec ses aéronefs, des moyens d’escorte et du soutien. Le bâtiment seul ne décrit pas tout l’ensemble mobilisé.', 'comprendre-porte-avions-groupe-aeronaval.html', 'Le groupe aéronaval'],
    [/snle|\bsna\b|sous.marin nucleaire|nuclear submarine/, 'Propulsion nucléaire et mission de dissuasion ne sont pas synonymes. Le rôle permet de distinguer les familles de sous-marins.', 'comprendre-sna-snle.html', 'SNA et SNLE'],
    [/radar|sonar/, 'Le radar utilise des ondes radio ; le sonar utilise le son. L’écoute passive est aussi à distinguer de l’émission active.', 'comprendre-radar-sonar.html', 'Radar et sonar'],
    [/fregate|frigate|destroyer|corvette/, 'Ces appellations ne constituent pas un classement universel : la classe du navire, ses missions et ses équipements sont à vérifier.', 'comprendre-fregate-destroyer-corvette.html', 'Les familles de navires'],
    [/char de combat|blind[eé]|\btank\b|\bifv\b|\bvci\b|leclerc/, 'Un char de combat et un véhicule de combat d’infanterie remplissent des rôles différents. La catégorie seule ne résume pas une unité.', 'comprendre-char-blinde-infanterie.html', 'Char, blindé et VCI']
  ];
  function context(item){const text=documentText(item),match=contextRules.find(([rule])=>rule.test(text));return match?{text:match[1],url:match[2],title:match[3]}:null;}
  window.RADAR_NEWS_TOOLS=Object.freeze({themes,related,image,context,fold,themeNames:[...rules.map(([name])=>name),'Autres']});
})();
