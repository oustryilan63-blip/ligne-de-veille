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
  const tools=window.RADAR_CATALOGUE,collection=window.RADAR_COLLECTION;
  const collectionOnly=document.body.dataset.collectionOnly==='true';
  const countrySelect=document.getElementById('history-country'),typeSelect=document.getElementById('history-type'),sortSelect=document.getElementById('history-sort');
  const mapCodes = new Set(countries.map(c => c.code));
  const strip = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const codeName = code => {try {return nameFor.of(code) || code} catch {return code}};
  const el = (tag, cls, value) => {const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
  const link = (label, href) => {const a=el('a','',label);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
  const photo = item => {const img=el('img');const real=item.mediaLabel==='Illustration'?(window.RADAR_CATALOG_PHOTOS?.[item.name]||window.RADAR_PHOTOS?.photos(item).find(p=>p.real!==false)):null;img.src=real?.src||'assets/jeu/'+item.photo;img.alt=real?.alt||item.alt||item.name;img.loading='lazy';img.decoding='async';return img};
  const categories = ['Tous','Ajouts récents','Vues 3D','Chars et blindés','Avions','Drones et hélicoptères','Navires et sous-marins','Artillerie','Missiles'];
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
  const latest=engins.map(e=>e.addedAt||'').sort().at(-1);
  const latestBatch=Math.max(0,...engins.map(e=>e.addedBatch||0));
  const originCodes=[...new Set(engins.flatMap(e=>e.originCodes||[e.code]))].sort((a,b)=>tools.countryName(a).localeCompare(tools.countryName(b),'fr'));
  for(const code of originCodes){const option=el('option','',tools.countryName(code));option.value=code;countrySelect.append(option)}
  for(const [key,label] of Object.entries(tools.types).filter(([key])=>engins.some(e=>tools.type(e)===key))){const option=el('option','',label);option.value=key;typeSelect.append(option)}
  categories.forEach(c => {const b=el('button','',c);b.type='button';b.setAttribute('aria-pressed',String(c===selected));b.addEventListener('click',()=>{selected=c;filters.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalogue()});filters.append(b)});
  function renderCatalogue(){
    const query=search.value.trim();
    const found=engins.map((item,i)=>({item,i})).filter(({item})=>(!collectionOnly||collection.has(item.name))&&(selected==='Tous'||(selected==='Ajouts récents'?(latestBatch?item.addedBatch===latestBatch:item.addedAt&&item.addedAt===latest):selected==='Vues 3D'?window.RADAR_3D?.has(item):group(item)===selected))&&(!countrySelect.value||(item.originCodes||[item.code]).includes(countrySelect.value))&&(!typeSelect.value||tools.type(item)===typeSelect.value)&&tools.matches(item,query));
    if(sortSelect.value==='alpha')found.sort((a,b)=>a.item.name.localeCompare(b.item.name,'fr',{numeric:true}));
    if(sortSelect.value==='recent')found.sort((a,b)=>(b.item.addedAt||'').localeCompare(a.item.addedAt||'')||b.i-a.i);
    grid.replaceChildren();
    found.forEach(({item,i})=>{
      const a=el('a','history-card');if(item.category==='missiles')a.classList.add('history-card-missile');a.href=window.RADAR_DISCOVERY?.profileURL(item)||'histoire.html?engin='+i;a.setAttribute('aria-label','Lire la fiche : '+item.name);
      if(collectionOnly)a.href+=(a.href.includes('?')?'&':'?')+'retour=collection';
      a.append(photo(item));const body=el('div','history-card-copy');body.append(el('span','history-card-kicker',item.kind));
      const row=el('div','history-card-title');row.append(el('strong','',item.name),el('span','','↗'));body.append(row,el('span','history-card-country',item.country));if(window.RADAR_3D?.has(item))body.append(el('span','history-3d-badge','Vue 3D disponible'));a.append(body);const shell=el('article','history-card-shell');shell.append(a,collection.button(item));grid.append(shell);
    });
    count.textContent=found.length+' / '+engins.length+' ENGINS';empty.hidden=found.length>0;
    const criteria=[];
    if(query)criteria.push('Recherche : « '+query+' »');
    if(countrySelect.value)criteria.push(tools.countryName(countrySelect.value));
    if(typeSelect.value)criteria.push(tools.types[typeSelect.value]);
    if(selected!=='Tous')criteria.push(selected);
    if(sortSelect.value==='alpha')criteria.push('Tri : A à Z');
    if(sortSelect.value==='recent')criteria.push('Tri : derniers ajouts');
    const foldState=document.getElementById('history-fold-state'),activeSummary=document.getElementById('history-filter-summary');
    if(foldState)foldState.textContent=criteria.length?criteria.length+' critère'+(criteria.length>1?'s':'')+' actif'+(criteria.length>1?'s':''):'Aucun filtre actif';
    if(activeSummary){activeSummary.textContent=criteria.join(' · ');activeSummary.hidden=criteria.length===0;}
    if(collectionOnly&&collection.names().length===0)empty.textContent='Ta collection est vide. Dans Histoire, utilise les étoiles pour choisir tes premiers engins.';
    else empty.textContent='Aucun engin ne correspond à cette recherche.';
    const total=collection.names().length;
    document.querySelectorAll('[data-collection-count]').forEach(n=>n.textContent=String(total));
    const notice=document.getElementById('collection-state');if(notice)notice.textContent=collection.persistent()?'Collection conservée dans ce navigateur, sans compte.':'Le stockage est indisponible : cette collection reste disponible seulement sur cette page.';
    const quiz=document.getElementById('collection-quiz-link');if(quiz){quiz.href='devine-engin.html?collection=1'+(total<4?'&reponse=text':'');quiz.textContent=total<4?'Quiz en réponse libre →':'Quiz sur ma collection →';quiz.hidden=total===0;}
  }
  search.addEventListener('input',renderCatalogue);
  for(const select of [countrySelect,typeSelect,sortSelect])select.addEventListener('change',renderCatalogue);
  document.getElementById('history-reset')?.addEventListener('click',()=>{search.value=countrySelect.value=typeSelect.value='';sortSelect.value='catalogue';selected='Tous';filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent==='Tous')));renderCatalogue()});
  window.addEventListener('radar-collection-change',()=>{if(!detail.hidden)return;const active=document.activeElement?.dataset?.favourite;renderCatalogue();if(active){const target=[...grid.querySelectorAll('[data-favourite]')].find(b=>b.dataset.favourite===active);if(target)target.focus();else document.getElementById('collection-title')?.focus();}});
  function section(title, desc){const s=el('section','history-detail-section');s.append(el('h2','',title));if(desc)s.append(el('p','',desc));return s}
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
    wrap.id='technique';wrap.append(button,panel);return wrap;
  }
  function silhouetteCard(item){
    const rafaleDesign='https://www.dassault-aviation.com/fr/defense/rafale/concevoir-et-optimiser/';
    const rafaleSensors='https://www.dassault-aviation.com/fr/defense/rafale/detecter-et-poursuivre/';
    const leclerc='https://www.defense.gouv.fr/terre/nos-materiels/nos-equipements-terre/vehicules-larmee-terre/vehicules-chars-bataille/char-leclerc';
    const fremm='https://www.defense.gouv.fr/marine/forces-surface/fregates-multimissions';
    // Original teaching drawings: approximate outlines, with public component roles only.
    const drawings={
      Rafale:{view:'Vue de dessus · avant à gauche',note:'Rafale monoplace, représentation simplifiée. Les équipements peuvent varier selon la version.',
        shapes:[
          ['wings','M330 179 564 42 598 47 584 177 584 223 598 353 564 358 330 221'],
          ['canards','M258 182 281 111 310 119 305 181 M258 218 281 289 310 281 305 219'],
          ['body','M78 200 Q175 176 275 176 L347 169 615 169 640 181 640 219 615 231 347 231 275 224 Q175 224 78 200Z'],
          ['engines','M420 173 637 173 659 179 659 192 420 192Z M420 208 659 208 659 221 637 227 420 227Z'],
          ['body','M493 200 620 187 642 200 620 213Z'],
          ['cockpit','M183 200 Q219 182 276 189 L296 200 276 211 Q219 218 183 200Z'],
          ['radar','M78 200 Q127 188 166 186 L166 214 Q127 212 78 200Z']
        ],
        parts:[
          {key:'wings',label:'Ailes delta',x:65,y:23,text:'Leur forme triangulaire est un repère du Rafale. Elles assurent la portance et fonctionnent avec les petits plans canards placés à l’avant.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'canards',label:'Plans canards',x:36,y:33,text:'Ces petites surfaces mobiles se trouvent devant les ailes. Leur interaction avec l’aile delta participe à la maniabilité de l’avion.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'cockpit',label:'Cockpit',x:28,y:50,text:'C’est le poste du pilote. La version C représentée ici est monoplace ; le Rafale B possède deux places, tandis que le Rafale M est adapté au porte-avions.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'radar',label:'Radar dans le nez',x:14,y:50,text:'Le radar RBE2 est logé à l’avant, sous le radôme. Il contribue à détecter et suivre des objets dans les airs, sur terre et en mer ; il est invisible de l’extérieur.',source:rafaleSensors,credit:'Dassault Aviation'},
          {key:'engines',label:'Réacteurs M88',x:76,y:57,text:'Les réacteurs fournissent la poussée qui fait avancer l’avion. Les deux sorties à l’arrière aident à reconnaître ce biréacteur ; le M88 est produit par Safran Aircraft Engines.',source:'https://www.safran-group.com/fr/produits-services/m88-performances-fiabilite-operation',credit:'Safran'}
        ]},
      Leclerc:{view:'Vue de profil · avant à gauche',note:'Leclerc, silhouette de famille simplifiée. Les protections et équipements extérieurs diffèrent entre séries et rénovations.',
        shapes:[
          ['tracks','M207 238 630 238 Q670 240 670 278 Q670 310 630 310 L207 310 Q169 310 169 278 Q169 241 207 238Z'],
          ['body','M188 228 232 199 580 199 645 225 653 252 182 252Z'],
          ['engine','M516 201 580 201 645 225 639 246 516 246Z'],
          ['turret','M280 199 294 146 386 128 495 145 528 183 507 207 319 207Z'],
          ['gun','M91 159 294 159 294 175 91 175Z M80 154 104 154 104 180 80 180Z'],
          ['driver','M218 213 265 205 279 215 266 231 211 231Z'],
          ['detail','M353 130 353 117 402 117 402 132 M447 139 447 122 472 122 472 141 M535 209 535 239 M549 209 549 239 M563 212 563 239 M577 216 577 239']
        ],
        parts:[
          {key:'gun',label:'Canon',x:22,y:42,text:'Le canon de 120 mm constitue l’armement principal. Il est porté par la tourelle ; son long tube donne au char une silhouette très différente de celle d’un transport de troupes.',source:leclerc,credit:'Armée de Terre'},
          {key:'turret',label:'Tourelle',x:48,y:41,text:'Elle peut pivoter au-dessus du châssis et porte le canon ainsi que les moyens de visée. Le chargement automatique permet un équipage de trois personnes : chef de char, tireur et pilote.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'},
          {key:'tracks',label:'Chenilles',x:44,y:70,text:'Les chenilles entourent les roues du train de roulement. Elles répartissent la masse du char sur le sol et lui permettent de se déplacer sur des terrains variés.',source:leclerc,credit:'Armée de Terre'},
          {key:'engine',label:'Compartiment moteur',x:72,y:56,text:'Le groupe moteur se trouve à l’arrière du châssis. Il fournit l’énergie nécessaire au déplacement ; la vitesse et l’autonomie restent à lire dans la fiche technique de la version concernée.',source:leclerc,credit:'Armée de Terre'},
          {key:'driver',label:'Poste du pilote',x:30,y:55,text:'Le pilote conduit depuis l’avant du châssis. Le chef de char et le tireur travaillent dans la tourelle : cette répartition distingue la conduite du véhicule de l’utilisation de ses équipements.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'}
        ]},
      'FREMM Aquitaine':{view:'Vue de profil · proue à gauche',note:'FREMM française de lutte anti-sous-marine. Le sonar de coque est indiqué sous la ligne de flottaison ; sa forme est symbolique.',
        shapes:[
          ['hull','M66 245 286 245 304 225 713 225 708 272 675 294 153 294 93 273Z'],
          ['bridge','M279 243 305 185 368 185 396 226 396 244Z'],
          ['body','M373 244 397 210 511 210 529 244Z'],
          ['radar','M350 185 362 111 381 111 394 208 371 208Z M345 91 386 91 390 116 350 116Z'],
          ['body','M439 209 442 155 473 155 482 210Z M490 210 496 174 520 174 529 242Z'],
          ['hangar','M534 243 534 191 608 191 622 212 622 243Z'],
          ['gun','M139 245 148 221 178 221 189 244Z M151 224 107 208 109 201 164 218Z'],
          ['sonar','M145 294 Q161 323 202 304 L209 294Z'],
          ['detail','M311 193 363 193 369 209 304 209Z M634 230 692 230 M649 230 649 240 M681 230 681 240 M365 90 365 65 M350 79 380 79']
        ],
        parts:[
          {key:'radar',label:'Radar de veille',x:46,y:24,text:'Installé en hauteur, le radar de veille multifonctions contribue à surveiller les alentours du navire. La frégate dispose aussi de radars de navigation, destinés à un autre usage.',source:fremm,credit:'Marine nationale'},
          {key:'bridge',label:'Passerelle',x:40,y:49,text:'La passerelle est le poste de conduite du navire et de surveillance visuelle de la navigation. Les opérations de combat s’appuient également sur un système de combat qui rassemble les informations des capteurs.',source:fremm,credit:'Marine nationale'},
          {key:'gun',label:'Tourelle avant',x:20,y:57,text:'La tourelle de 76 mm est visible sur le pont avant. Elle constitue un équipement parmi d’autres : une frégate multimissions associe plusieurs moyens de surveillance, de protection et d’action.',source:fremm,credit:'Marine nationale'},
          {key:'hangar',label:'Hangar et pont d’envol',x:74,y:52,text:'À l’arrière se trouvent le hangar et la plateforme pour l’hélicoptère embarqué. Les FREMM françaises peuvent accueillir le Caïman Marine, qui prolonge leurs capacités au-delà du navire.',source:fremm,credit:'Marine nationale'},
          {key:'sonar',label:'Sonars',x:22,y:77,text:'Le sonar utilise le son pour observer sous l’eau. Les FREMM de lutte anti-sous-marine possèdent un sonar de coque et un sonar remorqué : ces capteurs complètent la surveillance assurée au-dessus de la mer.',source:fremm,credit:'Marine nationale'}
        ]}
    };
    const data=drawings[item.name];if(!data)return null;
    const wrap=section('Lire sa silhouette','Choisis un numéro sur le dessin ou le nom d’un élément pour comprendre son rôle.');wrap.id='silhouette';wrap.classList.add('history-silhouette');
    const layout=el('div','silhouette-layout'),figure=el('figure','silhouette-figure'),board=el('div','silhouette-board');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 800 400');svg.setAttribute('role','img');svg.setAttribute('aria-label','Silhouette simplifiée : '+item.name+'. '+data.view);
    const shapeNodes=[];
    for(const [key,d] of data.shapes){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('class','silhouette-shape'+(key==='detail'?' silhouette-detail':''));svg.append(p);shapeNodes.push({key,node:p});}
    if(item.name==='Leclerc')for(let x=221;x<=621;x+=66){const wheel=document.createElementNS('http://www.w3.org/2000/svg','circle');wheel.setAttribute('cx',x);wheel.setAttribute('cy','275');wheel.setAttribute('r','22');wheel.setAttribute('class','silhouette-wheel');svg.append(wheel);}
    board.append(svg);figure.append(el('div','silhouette-view',data.view),board,el('figcaption','','Schéma pédagogique Radar · proportions simplifiées. '+data.note));
    const controls=el('div','silhouette-controls'),choices=el('div','silhouette-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Éléments de '+item.name);
    const panel=el('div','silhouette-explanation');panel.id='silhouette-explanation';panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');
    const step=el('span','silhouette-step'),title=el('h3'),text=el('p'),ref=link('','');panel.append(step,title,text,ref);
    const buttons=[],hotspots=[];
    const select=n=>{const part=data.parts[n];step.textContent='Repère '+(n+1)+' / '+data.parts.length;title.textContent=part.label;text.textContent=part.text;ref.textContent='Source : '+part.credit+' ↗';ref.href=part.source;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));hotspots.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));shapeNodes.forEach(s=>s.node.classList.toggle('silhouette-highlight',s.key===part.key));};
    const keyboard=(event,n,list)=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(n+1)%data.parts.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(n+data.parts.length-1)%data.parts.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=data.parts.length-1;else return;event.preventDefault();select(next);list[next].focus();};
    data.parts.forEach((part,n)=>{const label=String(n+1).padStart(2,'0'),button=el('button','silhouette-choice');button.type='button';button.append(el('span','',label),el('span','',part.label));button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>select(n));button.addEventListener('keydown',event=>keyboard(event,n,buttons));choices.append(button);buttons.push(button);
      const point=el('button','silhouette-point',String(n+1));point.type='button';point.style.left=part.x+'%';point.style.top=part.y+'%';point.setAttribute('aria-label',label+' · '+part.label);point.setAttribute('aria-controls',panel.id);point.addEventListener('click',()=>select(n));point.addEventListener('keydown',event=>keyboard(event,n,hotspots));board.append(point);hotspots.push(point);
    });
    controls.append(choices,panel);layout.append(figure,controls);wrap.append(layout);select(0);return wrap;
  }
  function renderDetail(index){
    const item=engins[index],fact=facts[index]||{},figuresFor=figures[index]||{};
    catalogue.hidden=true;detail.hidden=false;detail.replaceChildren();document.body.classList.add('history-profile');document.title=item.name+' | Histoire | Radar';
    const fromCollection=params.get('retour')==='collection';
    const back=el('a','history-back',fromCollection?'← Revenir à ma collection':'← Revenir aux '+engins.length+' engins');back.href=fromCollection?'collection.html':'histoire.html';detail.append(back);
    const jump=el('nav','profile-jump');jump.setAttribute('aria-label','Dans cette fiche');detail.append(jump);
    const head=el('div','history-detail-head');const media=el('div',item.category==='missiles'?'history-missile-media':'');
    const photoRecords=window.RADAR_PHOTOS.photos(item),coverRecord=photoRecords[0],cover=el('a','history-cover'),coverImage=el('img');
    cover.href='#photos';cover.setAttribute('aria-label','Voir la galerie photo de '+item.name);coverImage.src=coverRecord.src;coverImage.alt=coverRecord.alt||item.name;coverImage.decoding='async';coverImage.loading='eager';cover.append(coverImage);
    const photoShortcut=el('a','history-photo-shortcut','Voir les '+photoRecords.length+' photo'+(photoRecords.length>1?'s':'')+' ↓');photoShortcut.href='#photos';
    media.append(cover,window.RADAR_PHOTOS.creditFor(coverRecord),photoShortcut);
    const copy=el('div','history-summary');copy.append(el('span','history-kicker',item.kind+' · '+item.country),el('h1','history-name',item.name));
    copy.append(el('p','history-introduction',item.explanation));
    const actions=el('div','history-profile-actions');actions.setAttribute('role','group');actions.setAttribute('aria-label','Actions sur cet engin');actions.append(collection.button(item,true));
    const compare=el('a','compare-link','Comparer cet engin →');compare.href='comparateur.html?a='+index;actions.append(compare);copy.append(actions);
    copy.append(technicalCard(index));
    const modelView=window.RADAR_3D?.create(item);
    if(modelView){const explore=el('a','button button-dark history-3d-shortcut','Explorer cet engin en 3D ↓');explore.href='#vue-3d';explore.addEventListener('click',()=>modelView.open());media.append(explore)}
    const events=window.LDV_TIMELINES?.[index]||[];
    const story=el('section','history-story');story.id='recit';story.setAttribute('aria-labelledby','story-title-'+index);const storyTitle=el('h2','','Son histoire');storyTitle.id='story-title-'+index;story.append(storyTitle);
    const storyMeta=el('div','history-story-meta');
    const minutes=Math.max(1,Math.round((fact.story||'').split(/\s+/).filter(Boolean).length/180));
    storyMeta.append(el('span','history-reading-time',minutes+' min de lecture'));
    if(fact.storyCheckedAt)storyMeta.append(el('span','history-story-reviewed','Récit revu le '+fact.storyCheckedAt));
    if(events.length){const shortcut=el('a','','Voir les '+events.length+' grandes étapes ↓');shortcut.href='#chronologie';storyMeta.append(shortcut)}
    story.append(storyMeta);
    const narrative=el('div','history-story-copy');
    (fact.story||'L’histoire de cet engin est présentée dans la source liée ci-dessous.').split('\n\n').filter(Boolean).forEach(paragraph=>narrative.append(el('p','',paragraph)));
    story.append(narrative);
    const storyURLs=[...new Set(fact.storySections?.flatMap(chapter=>chapter.sources||[])||fact.storySources?.map(source=>source.url)||[item.source])];
    if(storyURLs.length){
      const refs=el('details','history-story-sources');refs.append(el('summary','','Sources du récit · '+storyURLs.length+' référence'+(storyURLs.length>1?'s':'')));
      const list=el('ol');for(const url of storyURLs){const li=el('li'),label=fact.storySources?.find(source=>source.url===url)?.label||'Document de référence';li.append(link(label+' ↗',url));list.append(li)}refs.append(list);story.append(refs);
    }
    head.append(media,copy);detail.append(head);
    let essential;
    if(window.RADAR_DISCOVERY){
      essential=el('details','discovery-essential history-summary-fold');essential.id='essentiel';essential.append(el('summary','','Repères en bref'));
      const answers=el('div','discovery-answers');
      for(const q of window.RADAR_DISCOVERY.essentials(item,fact,technical[index])){const box=el('div','discovery-answer');box.append(el('h3','',q.question),el('p','',q.answer));if(q.source)box.append(link('Consulter la source ↗',q.source));answers.append(box)}
      essential.append(answers);
      const description=window.RADAR_DISCOVERY.description(item),url=window.RADAR_DISCOVERY.profileURL(item);
      for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]']){const node=document.querySelector(selector);if(node)node.setAttribute('content',description)}
      const canonical=document.querySelector('link[rel="canonical"]');if(canonical&&location.href){canonical.href=new URL(url,location.href).href;const node=document.querySelector('meta[property="og:url"]');if(node)node.setAttribute('content',canonical.href)}
      for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]']){const node=document.querySelector(selector);if(node)node.setAttribute('content',item.name+' | Histoire | Radar')}
    }
    if(essential)detail.append(essential);
    detail.append(story);
    const silhouette=silhouetteCard(item);if(silhouette)detail.append(silhouette);
    if(window.RADAR_DISCOVERY?.guideLinks){
      const reading=el('nav','learning-profile-reading');reading.setAttribute('aria-label','Comprendre le contexte de cet engin');
      reading.append(el('h2','','Pour comprendre son contexte'),el('p','','Le récit suit cet engin. Les dossiers expliquent les familles, les missions et les notions qui l’entourent.'));
      for(const guide of window.RADAR_DISCOVERY.guideLinks(item)){const anchor=el('a','',guide.title+' →');anchor.href=guide.url;reading.append(anchor);}
      const all=el('a','','Tous les dossiers et le lexique →');all.href='comprendre.html';reading.append(all);detail.append(reading);
    }
    if(events.length){
      const timeline=el('section','history-timeline');timeline.id='chronologie';timeline.setAttribute('aria-labelledby','timeline-title-'+index);
      const heading=el('h2','','Les grandes étapes');heading.id='timeline-title-'+index;
      timeline.append(heading,el('p','history-timeline-intro','Du développement aux évolutions de la carrière. Chaque étape conserve la précision de sa source.'));
      if(fact.timelineNote)timeline.append(el('p','history-timeline-note',fact.timelineNote));
      const list=el('ol');
      for(const [position,event] of events.entries()){
        const li=el('li'),number=el('span','history-timeline-number',String(position+1).padStart(2,'0'));number.setAttribute('aria-hidden','true');
        const ref=link('Vérifier ce jalon ↗',event.source);ref.setAttribute('aria-label','Source du jalon : '+event.label+' — '+event.date);
        li.append(number,el('time','',event.date),el('h4','',event.label),el('p','',event.detail),ref);list.append(li);
      }
      timeline.append(list);detail.append(timeline);
    }
    const photoSection=section('La galerie photo','Parcours les vues de l’engin et agrandis une photo pour observer ses détails.');photoSection.id='photos';photoSection.classList.add('history-photos');
    const gallery=window.RADAR_PHOTOS.create(item);gallery.querySelector('img').loading='lazy';photoSection.append(gallery);detail.append(photoSection);
    if(modelView)detail.append(modelView.section);
    const origin=item.code,origins=item.originCodes||[origin],former=fact.former||[];
    const current=fact.originOnly?[]:[...new Set([...(fact.documentedOperatorsOnly||former.includes(origin)?[]:[origin]),...(fact.current||[])])];
    const currentLabel=fact.operatorSnapshot?'Utilisateur attesté dans les sources':'Utilisateur actuel documenté';
    const mapSection=section('Où a-t-il été utilisé ?',"La carte situe le pays de conception et les pays utilisateurs documentés. Elle ne montre pas les pays ayant seulement passé commande ni les lieux de déploiement temporaire.");
    mapSection.id='utilisateurs';
    const mapWrap=el('div','history-map-wrap');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','-60 -25 1320 550');svg.setAttribute('role','img');svg.setAttribute('aria-label','Carte des pays associés à '+item.name);svg.classList.add('history-map');
    const mapTitle=document.createElementNS('http://www.w3.org/2000/svg','title');mapTitle.textContent='Carte des pays associés à '+item.name;svg.append(mapTitle);
    countries.forEach(c=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',c.path);p.dataset.code=c.code;if(former.includes(c.code))p.classList.add('former');if(current.includes(c.code))p.classList.add('current');if(origins.includes(c.code))p.classList.add('origin');const t=document.createElementNS('http://www.w3.org/2000/svg','title');let state=origins.includes(c.code)?' · conception':current.includes(c.code)?' · '+currentLabel.toLocaleLowerCase('fr'):former.includes(c.code)?' · ancien utilisateur documenté':'';t.textContent=codeName(c.code)+state;p.append(t);svg.append(p)});
    mapWrap.append(svg);mapSection.append(mapWrap);
    const legend=el('div','history-legend');[['origin','Pays de conception'],['current',currentLabel],['former','Ancien utilisateur documenté']].forEach(([cls,title])=>{const x=el('span');x.append(el('b',cls),document.createTextNode(title));legend.append(x)});mapSection.append(legend);
    const ops=el('div','history-operators');[['Conception',origins],[fact.operatorSnapshot?'Utilisateurs attestés': 'Utilisateurs actuels',current],['Anciens utilisateurs',former]].forEach(([label,codes])=>{const box=el('div');box.append(el('strong','',label),el('span','',codes.length?[...new Set(codes)].map(codeName).join(' · '):'Aucun pays confirmé dans cette sélection'));ops.append(box)});mapSection.append(ops);
    if(fact.operatorNote)mapSection.append(el('p','history-note',fact.operatorNote));
    if(fact.operatorSource)mapSection.append(el('p','history-note','Pays supplémentaires : consulter la source en bas de page.'));
    detail.append(mapSection);
    const stats=section('Repères chiffrés',"Chaque chiffre précise son périmètre : engins construits, livrés ou en service ; pertes documentées au combat ou lors d'un accident ; cibles attribuées. Les bilans de pertes ne sont pas des totaux mondiaux. Si les destructions de cibles ne peuvent pas être attribuées avec assez de confiance, la dernière carte indique le nombre de pays présents sur la carte.");
    const statGrid=el('div','history-stats');
    stats.id='chiffres';
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
    const sources=el('section','history-detail-section history-sources');sources.id='sources';sources.append(el('h2','','Sources de la fiche'));const list=el('ul');
    const refs=[['Présentation et histoire du programme',item.source],['Pays utilisateurs',fact.operatorSource],['Anciens utilisateurs',fact.formerSource],['Production et livraisons',production?.source],['Inventaire daté',inventory?.source],['Engins détruits',figuresFor.losses?.source],['Cibles détruites',figuresFor.targets?.source],...(fact.storySources||[]).map(ref=>[ref.label,ref.url]),...(fact.extraSources||[]).map(url=>['Autre source',url])];const seen=new Set();refs.forEach(([title,url])=>{if(url&&!seen.has(url)){seen.add(url);const li=el('li');li.append(link(title+' ↗',url));list.append(li)}});sources.append(list,el('p','',(fact.storyCheckedAt?'Récit et frise revus le '+fact.storyCheckedAt+'. Autres repères : dernière vérification indiquée le '+(fact.checkedAt||'10 octobre 2026'):'Sources consultées le '+(fact.checkedAt||'10 octobre 2026'))+'. La carte présente les pays documentés dans ces sources, sans prétendre couvrir chaque transfert ou retrait. Les bilans de pertes sont des minimums documentés ou des estimations datées, précisés dans chaque carte.'));detail.append(sources);
    const next=el('nav','history-next');next.setAttribute('aria-label','Parcourir les fiches');const prev=el('a','','← '+engins[(index+engins.length-1)%engins.length].name);prev.href=window.RADAR_DISCOVERY?.profileURL(engins[(index+engins.length-1)%engins.length])||'histoire.html?engin='+(index+engins.length-1)%engins.length;const after=el('a','',engins[(index+1)%engins.length].name+' →');after.href=window.RADAR_DISCOVERY?.profileURL(engins[(index+1)%engins.length])||'histoire.html?engin='+(index+1)%engins.length;next.append(prev,after);detail.append(next);
    for(const [label,id] of [['Histoire','recit'],...(silhouette?[['Silhouette','silhouette']]:[]),...(events.length?[['Chronologie','chronologie']]:[]),['Technique','technique'],['Photos','photos'],...(modelView?[['3D','vue-3d']]:[]),['Carte','utilisateurs'],['Chiffres','chiffres'],['Sources','sources']]){
      const a=el('a','',label);a.href='#'+id;a.dataset.section=id;
      a.addEventListener('click',()=>{markSection(id);if(id==='technique'){const button=document.getElementById('tech-toggle-'+index);if(button.getAttribute('aria-expanded')==='false')button.click();}});
      jump.append(a);
    }
    const sectionLinks=[...jump.querySelectorAll('a')];let currentSection='';
    function markSection(id){
      if(id===currentSection)return;currentSection=id;
      for(const a of sectionLinks){if(a.dataset.section===id){a.setAttribute('aria-current','location');if(typeof jump.scrollTo==='function')jump.scrollTo({left:Math.max(0,a.offsetLeft-16),behavior:'auto'});}else a.removeAttribute('aria-current');}
    }
    markSection(sectionLinks.some(a=>a.href.endsWith(location.hash))&&location.hash?location.hash.slice(1):'recit');
    if(typeof window.requestAnimationFrame==='function'){
      const targets=sectionLinks.map(a=>({id:a.dataset.section,node:document.getElementById(a.dataset.section)})).filter(s=>s.node);let queued=false;
      const schedule=()=>{if(queued)return;queued=true;window.requestAnimationFrame(()=>{queued=false;const line=jump.getBoundingClientRect().bottom+48;let nearest=null;for(const s of targets){const bounds=s.node.getBoundingClientRect();if(bounds.height>0&&bounds.top<=line&&(!nearest||bounds.top>nearest.top))nearest={id:s.id,top:bounds.top};}markSection(nearest?.id||'recit');});};
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
    }
  }
  const params=new URLSearchParams(location.search);const raw=params.get('engin')??document.body.dataset?.engineIndex,index=Number(raw);
  if(raw!==null&&raw!==undefined&&Number.isInteger(index)&&index>=0&&index<engins.length)renderDetail(index);else renderCatalogue();
  const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')});
  nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
})();
