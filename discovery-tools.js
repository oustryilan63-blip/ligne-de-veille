/* Repères communs aux fiches, à la recherche et aux pages préparées sur le serveur. */
(() => {
  'use strict';
  const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const slug=s=>fold(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const compact=s=>fold(s).replace(/[^a-z0-9]/g,'');
  const sentence=s=>String(s||'').trim().replace(/([^.!?…])$/u,'$1.');
  const profileURL=item=>'fiche-'+slug(item.name)+'.html';
  const description=item=>item.explanation.length<=165?item.explanation:item.explanation.slice(0,162).replace(/\s+\S*$/,'')+'…';
  function essentials(item,fact={},tech={}){
    const country=code=>{try{return new Intl.DisplayNames(['fr'],{type:'region'}).of(code)||code}catch{return code}};
    const origin=item.code,former=fact.former||[];
    const current=fact.originOnly?[]:[...new Set([...(fact.documentedOperatorsOnly||former.includes(origin)?[]:[origin]),...(fact.current||[])])];
    const users=fact.originOnly?'Cette fiche ne recense pas encore les pays utilisateurs.':current.length?current.map(country).join(' · '):'Aucun pays utilisateur confirmé dans la sélection de cette fiche.';
    const main=tech.fields?.find(f=>/^portée/i.test(f.label))||tech.fields?.find(f=>/équipage|armement principal|propulsion|vitesse maximale/i.test(f.label));
    return [
      {question:'Quel engin et quelle origine ?',answer:item.kind.toLocaleLowerCase('fr')+' · '+item.country+'. '+item.explanation,source:item.source},
      {question:fact.operatorSnapshot?'Quels utilisateurs sont attestés ?':'Quels utilisateurs sont documentés ?',answer:sentence(users)+(fact.operatorNote?' '+fact.operatorNote:' Sélection documentaire, pas un inventaire exhaustif.'),source:fact.operatorSource},
      {question:'Quelle variante est décrite ?',answer:sentence(tech.variant||'La famille indiquée dans le titre.')+(tech.note?' '+tech.note:''),source:tech.sources?.[0]?.url||item.source},
      main?{question:'Quel repère technique retenir ?',answer:main.label+' : '+main.value+'.'+(main.note?' '+main.note:''),source:main.source}:{question:'Où vérifier les caractéristiques ?',answer:'Consulte la fiche technique et les sources : seules les valeurs documentées y sont retenues.',source:item.source}
    ];
  }
  function rank(items,query,type='all'){
    const terms=fold(query).trim().split(/\s+/).filter(Boolean);
    return items.filter(i=>type==='all'||i.type===type).map((item,index)=>{
      const title=fold(item.title),hay=fold([item.title,item.description,item.keywords].join(' ')),compactHay=compact(hay),compactTitle=compact(title);
      if(!terms.every(term=>hay.includes(term)||(compact(term)&&compactHay.includes(compact(term)))))return null;
      const score=terms.reduce((sum,t)=>sum+(title.includes(t)||(compact(t)&&compactTitle.includes(compact(t)))?8:1),0)+(title===fold(query)||(compact(query)&&compactTitle===compact(query))?30:0);
      return {item,index,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.item);
  }
  window.RADAR_DISCOVERY=Object.freeze({fold,slug,profileURL,description,essentials,rank});
})();
