(() => {
  'use strict';
  const engins = window.LDV_ENGINS || [];
  const facts = window.LDV_HISTOIRE || [];
  const figures = window.LDV_CHIFFRES || {};
  const technical = window.LDV_TECHNIQUE || {};
  const countries = window.LDV_MAP || [];
  const nameFor = new Intl.DisplayNames(['fr'], {type:'region'});
  const catalogue = document.getElementById('history-catalogue');
  const detail = document.getElementById('history-detail');
  const grid = document.getElementById('history-grid');
  const filters = document.getElementById('history-filters');
  const search = document.getElementById('history-search');
  const count = document.getElementById('history-count');
  const empty = document.getElementById('history-empty');
  const mapCodes = new Set(countries.map(c => c.code));
  const strip = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const codeName = code => {try {return nameFor.of(code) || code} catch {return code}};
  const el = (tag, cls, value) => {const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
  const link = (label, href) => {const a=el('a','',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
  const photo = item => {const img=el('img');img.src='assets/jeu/'+item.photo;img.alt=item.alt || item.name;img.loading='lazy';return img};
  const categories = ['Tous','Chars et blindés','Avions','Drones et hélicoptères','Navires et sous-marins','Artillerie','Missiles'];
  const group = item => {
    if (item.category === 'missiles') return 'Missiles';
    if (item.category === 'mer') return 'Navires et sous-marins';
    if (/CHAR|BLINDÉ|VÉHICULE/.test(item.kind)) return 'Chars et blindés';
    if (/ARTILLERIE/.test(item.kind)) return 'Artillerie';
    if (/DRONE|HÉLICOPTÈRE/.test(item.kind)) return 'Drones et hélicoptères';
    if (/SOUS-MARIN|PORTE-AVIONS|DESTROYER|FRÉGATE|CORVETTE/.test(item.kind)) return 'Navires et sous-marins';
    return 'Avions';
  };
  let selected = 'Tous';
  categories.forEach(c => {const b=el('button','',c);b.type='button';b.setAttribute('aria-pressed',String(c===selected));b.addEventListener('click',()=>{selected=c;filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalogue()});filters.append(b)});
  function renderCatalogue(){
    const query=strip(search.value.trim());
    const found=engins.map((item,i)=>({item,i})).filter(({item})=>(selected==='Tous'||group(item)===selected)&&strip([item.name,item.kind,item.country].join(' ')).includes(query));
    grid.replaceChildren();
    found.forEach(({item,i})=>{
      const a=el('a','history-card');if(item.category==='missiles')a.classList.add('history-card-missile');a.href='histoire.html?engin='+i;a.setAttribute('aria-label','Lire la fiche : '+item.name);
      a.append(photo(item));const body=el('div','history-card-copy');body.append(el('span','history-card-kicker',item.kind));
      const row=el('div','history-card-title');row.append(el('strong','',item.name),el('span','','↗'));body.append(row,el('span','history-card-country',item.country));a.append(body);grid.append(a);
    });
    count.textContent=found.length+' / '+engins.length+' ENGINS';empty.hidden=found.length>0;
  }
  search.addEventListener('input',renderCatalogue);
  function section(title, desc){const s=el('section','history-detail-section');s.append(el('h3','',title));if(desc)s.append(el('p','',desc));return s}
  function technicalCard(index){
    const data=technical[index];
    const wrap=el('div','history-tech');
    const button=el('button','history-tech-toggle');button.type='button';
    const caption=el('span','','Afficher la fiche technique');
    const icon=el('span','history-tech-icon','+');icon.setAttribute('aria-hidden','true');
    button.append(caption,icon);button.id='tech-toggle-'+index;
    button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','tech-panel-'+index);
    const panel=el('section','history-tech-panel');panel.id='tech-panel-'+index;panel.hidden=true;
    panel.setAttribute('aria-labelledby',button.id);
    if(data){
      panel.append(el('h3','','Fiche technique'),el('p','history-tech-variant','Version : '+data.variant));
      const refs=data.sources||[],list=el('dl','history-tech-fields');
      for(const field of data.fields){
        const row=el('div'),value=el('dd','',field.value),number=refs.findIndex(s=>s.url===field.source)+1;
        const citation=link('['+number+']',field.source);citation.className='history-tech-citation';
        citation.setAttribute('aria-label','Source : '+field.label+' — '+(refs[number-1]?.label||'référence'));
        value.append(' ',citation);
        if(field.note)value.append(el('small','history-tech-field-note',field.note));
        row.append(el('dt','',field.label),value);list.append(row);
      }
      panel.append(list);
      if(data.note)panel.append(el('p','history-tech-note',data.note));
      const sources=el('ol','history-tech-sources');for(const ref of refs){const li=el('li');li.append(link(ref.label+' ↗',ref.url));sources.append(li)}
      panel.append(el('p','history-tech-source-title','Sources des caractéristiques'),sources,
        el('p','history-tech-date','Sources consultées le '+data.checkedAt.split('-').reverse().join('/')+'.'));
    }else panel.append(el('p','history-tech-note','Les caractéristiques de cet engin ne sont pas encore vérifiées.'));
    button.addEventListener('click',()=>{const opened=panel.hidden;panel.hidden=!opened;button.setAttribute('aria-expanded',String(opened));caption.textContent=opened?'Masquer la fiche technique':'Afficher la fiche technique';icon.textContent=opened?'−':'+'});
    wrap.append(button,panel);return wrap;
  }
  function renderDetail(index){
    const item=engins[index],fact=facts[index]||{},figuresFor=figures[index]||{};
    catalogue.hidden=true;detail.hidden=false;detail.replaceChildren();document.body.classList.add('history-profile');document.title=item.name+' | Histoire | Ligne de Veille';
    const back=el('a','history-back','← Revenir aux '+engins.length+' engins');back.href='histoire.html';detail.append(back);
    const head=el('div','history-detail-head');const media=el('div',item.category==='missiles'?'history-missile-media':'');media.append(photo(item));
    const credit=el('p','history-photo-credit',(item.mediaLabel||'Photo')+' : '+(item.photoAuthor||'Wikimedia Commons')+' · '+(item.photoLicense||'Licence indiquée sur la source'));
    if(item.photoFile){credit.append(' · ',link('Voir la photo','https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(item.photoFile)))}
    if(item.photoLicenseUrl){credit.append(' · ',link('Licence',item.photoLicenseUrl))}media.append(credit);
    const copy=el('div');copy.append(el('span','history-kicker',String(index+1).padStart(2,'0')+' / '+item.kind+' / '+item.country),el('h2','',item.name),el('p','history-subtitle','Origine : '+item.country));
    copy.append(el('p','',item.explanation));
    const compare=el('a','compare-link','Comparer cet engin →');compare.href='comparateur.html?a='+index;copy.append(compare);
    copy.append(technicalCard(index));
    (fact.story||'L’histoire de cet engin est présentée dans la source liée ci-dessous.').split('\n\n').forEach(paragraph=>copy.append(el('p','',paragraph)));
    head.append(media,copy);detail.append(head);
    const events=window.LDV_TIMELINES?.[index]||[];
    if(events.length){const timeline=el('section','history-timeline');timeline.append(el('h3','','Les grandes étapes'),el('p','','Jalons documentés : les dates conservent la précision de leurs sources.'));const list=el('ol');for(const event of events){const li=el('li');li.append(el('time','',event.date),el('h4','',event.label),el('p','',event.detail),link('Vérifier ce jalon ↗',event.source));list.append(li)}timeline.append(list);detail.append(timeline)}
    const origin=item.code,origins=item.originCodes||[origin],former=fact.former||[];
    const current=fact.originOnly?[]:[...new Set([...(former.includes(origin)?[]:[origin]),...(fact.current||[])])];
    const mapSection=section('Où a-t-il été utilisé ?',"La carte situe le pays de conception et les pays utilisateurs documentés. Elle ne montre pas les pays ayant seulement passé commande ni les lieux de déploiement temporaire.");
    const mapWrap=el('div','history-map-wrap');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','-60 -25 1320 550');svg.setAttribute('role','img');svg.setAttribute('aria-label','Carte des pays associés à '+item.name);svg.classList.add('history-map');
    const mapTitle=document.createElementNS('http://www.w3.org/2000/svg','title');mapTitle.textContent='Carte des pays associés à '+item.name;svg.append(mapTitle);
    countries.forEach(c=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',c.path);p.dataset.code=c.code;if(former.includes(c.code))p.classList.add('former');if(current.includes(c.code))p.classList.add('current');if(origins.includes(c.code))p.classList.add('origin');const t=document.createElementNS('http://www.w3.org/2000/svg','title');let state=origins.includes(c.code)?' · conception':current.includes(c.code)?' · utilisateur actuel documenté':former.includes(c.code)?' · ancien utilisateur documenté':'';t.textContent=codeName(c.code)+state;p.append(t);svg.append(p)});
    mapWrap.append(svg);mapSection.append(mapWrap);
    const legend=el('div','history-legend');[['origin','Pays de conception'],['current','Utilisateur actuel documenté'],['former','Ancien utilisateur documenté']].forEach(([cls,title])=>{const x=el('span');x.append(el('b',cls),document.createTextNode(title));legend.append(x)});mapSection.append(legend);
    const ops=el('div','history-operators');[['Conception',origins],['Utilisateurs actuels',current],['Anciens utilisateurs',former]].forEach(([label,codes])=>{const box=el('div');box.append(el('strong','',label),el('span','',codes.length?[...new Set(codes)].map(codeName).join(' · '):'Aucun pays confirmé dans cette sélection'));ops.append(box)});mapSection.append(ops);
    if(fact.operatorNote)mapSection.append(el('p','history-note',fact.operatorNote));
    if(fact.operatorSource)mapSection.append(el('p','history-note','Pays supplémentaires : consulter la source en bas de page.'));
    detail.append(mapSection);
    const stats=section('Repères chiffrés',"Chaque chiffre précise son périmètre : engins construits, livrés ou en service ; pertes documentées au combat ou lors d'un accident ; cibles attribuées. Les bilans de pertes ne sont pas des totaux mondiaux. Si les destructions de cibles ne peuvent pas être attribuées avec assez de confiance, la dernière carte indique le nombre de pays présents sur la carte.");
    const statGrid=el('div','history-stats');
    const production=figuresFor.production||fact.production;
    const inventory=figuresFor.inventory;
    const mainFigure=production||inventory;
    const userCount=new Set([...current,...former]).size;
    const data=[
      [mainFigure?.label||'Exemplaires produits / livrés',mainFigure?.value||'Chiffre inconnu',mainFigure?.note||'Aucun volume de production suffisamment étayé trouvé pour ce modèle.',mainFigure?.source],
      [figuresFor.losses?.label||(item.category==='missiles'?'Pertes / interceptions documentées':'Engins détruits'),figuresFor.losses?.value||'Bilan indisponible',figuresFor.losses?.note||(item.category==='missiles'?'Aucun bilan consolidé retenu. Un missile consommé lors d’un tir n’est pas automatiquement une perte ou une interception ennemie.':'Aucun décompte fiable, avec un périmètre précis, retenu pour cette fiche. Cela ne signifie pas zéro perte.'),figuresFor.losses?.source],
      figuresFor.targets?[figuresFor.targets.label||'Cibles détruites attribuées',figuresFor.targets.value,figuresFor.targets.note,figuresFor.targets.source]:['Pays sur la carte',fact.originOnly?'Non recensés':String(userCount),"Pays utilisateurs documentés dans notre sélection ; ce n'est pas un total mondial.",null]
    ];
    if(production&&inventory)data.push([inventory.label,inventory.value,inventory.note,inventory.source]);
    data.forEach(([label,value,note,source])=>{const box=el('div','history-stat');box.append(el('span','',label),el('strong','',value),el('small','',note));if(source)box.append(link('Source ↗',source));statGrid.append(box)});stats.append(statGrid);detail.append(stats);
    if(figuresFor.combatRecords?.length){
      const records=section('Faits documentés',"Des événements précis pour comprendre les résultats attribués à ce missile. Ces exemples ne constituent pas un bilan mondial ; dommages, naufrages et opérations hors combat sont distingués.");
      records.classList.add('history-records');
      for(const record of figuresFor.combatRecords){
        const card=el('article','history-record');
        const meta=el('div','history-record-meta');meta.append(el('span','history-record-status',record.status),el('span','history-record-date',record.date));
        card.append(meta,el('h4','',record.title),el('p','',record.text));
        const links=el('ul','history-record-sources');
        for(const source of record.sources){const li=el('li');li.append(link(source.label+' ↗',source.url));links.append(li)}
        card.append(links);records.append(card);
      }
      detail.append(records);
    }
    const sources=el('section','history-detail-section history-sources');sources.append(el('h3','','Sources de la fiche'));const list=el('ul');
    const refs=[['Présentation et histoire du programme',item.source],['Pays utilisateurs',fact.operatorSource],['Anciens utilisateurs',fact.formerSource],['Production et livraisons',production?.source],['Inventaire daté',inventory?.source],['Engins détruits',figuresFor.losses?.source],['Cibles détruites',figuresFor.targets?.source],...(fact.storySources||[]).map(ref=>[ref.label,ref.url]),...(fact.extraSources||[]).map(url=>['Autre source',url])];const seen=new Set();refs.forEach(([title,url])=>{if(url&&!seen.has(url)){seen.add(url);const li=el('li');li.append(link(title+' ↗',url));list.append(li)}});sources.append(list,el('p','','Sources consultées le '+(fact.checkedAt||'10 octobre 2026')+'. La carte présente les pays documentés dans ces sources, sans prétendre couvrir chaque transfert ou retrait. Les bilans de pertes sont des minimums documentés ou des estimations datées, précisés dans chaque carte.'));detail.append(sources);
    const next=el('nav','history-next');next.setAttribute('aria-label','Parcourir les fiches');const prev=el('a','','← '+engins[(index+engins.length-1)%engins.length].name);prev.href='histoire.html?engin='+(index+engins.length-1)%engins.length;const after=el('a','',engins[(index+1)%engins.length].name+' →');after.href='histoire.html?engin='+(index+1)%engins.length;next.append(prev,after);detail.append(next);
  }
  const params=new URLSearchParams(location.search);const index=Number(params.get('engin'));
  if(params.has('engin')&&Number.isInteger(index)&&index>=0&&index<engins.length)renderDetail(index);else renderCatalogue();
  const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')});
  nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
})();
