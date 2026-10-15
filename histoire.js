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
        shapes:[["wings","M337 199 585 25 612 15 631 18 640 40 622 89 619 170 649 190 652 208 572 210 423 209Z M337 241 585 415 612 425 631 422 640 400 622 351 619 270 649 250 652 232 572 230 423 231Z","metal"],["wings","M355 196 586 34 611 25 620 28 611 81 609 165 584 183 555 199Z","light"],["wings","M355 244 586 406 611 415 620 412 611 359 609 275 584 257 555 241Z","metal"],["decor","M584 35 610 27 610 53 600 79 598 165 583 180 M615 57 621 43 626 45 619 64 M421 185 548 99 M450 197 587 101 M574 188 608 169 621 178 M578 194 626 182 636 193","seam"],["decor","M584 405 610 413 610 387 600 361 598 275 583 260 M615 383 621 397 626 395 619 376 M421 255 548 341 M450 243 587 339 M574 252 608 271 621 262 M578 246 626 258 636 247","seam"],["wings","M583 12 648 12 653 16 648 20 583 20Z M583 420 648 420 653 424 648 428 583 428Z","metal"],["decor","M596 14 640 14 M596 422 640 422","glint"],["canards","M283 195 310 122 328 117 347 138 363 191 335 197Z M283 245 310 318 328 323 347 302 363 249 335 243Z","metal"],["decor","M299 184 318 129 327 125 342 144 353 184 M299 256 318 311 327 315 342 296 353 256","seam"],["body","M106 220Q154 204 209 195L273 189 309 187 337 181Q377 170 421 173L614 181 643 190 662 200 662 240 643 250 614 259 421 267Q377 270 337 259L309 253 273 251 209 245Q154 236 106 220Z","metal"],["body","M110 219Q165 207 219 202L291 201 332 194Q384 182 439 186L617 191 650 203 650 220Z","light"],["body","M110 222Q165 234 219 239L291 239 332 246Q384 258 439 254L617 249 650 237 650 222Z","metal"],["body","M316 192 338 178 365 181 381 195 374 211 326 211Z M316 248 338 262 365 259 381 245 374 229 326 229Z","dark"],["body","M321 193 339 183 361 185 371 194 365 200 326 201Z M321 247 339 257 361 255 371 246 365 240 326 239Z","metal"],["engines","M379 184Q447 178 505 181L620 189 650 197 659 211 621 216 380 210Z M379 256Q447 262 505 259L620 251 650 243 659 229 621 224 380 230Z","metal"],["engines","M635 189 661 194 680 198 681 213 661 218 636 214Z M635 251 661 246 680 242 681 227 661 222 636 226Z","nozzle"],["decor","M643 192 644 215 M650 193 651 216 M658 195 659 216 M666 197 667 215 M675 199 675 213 M643 248 644 225 M650 247 651 224 M658 245 659 224 M666 243 667 225 M675 241 675 227","seam"],["body","M330 211 425 202 488 204 613 213 641 219 641 223 613 228 488 236 425 238 330 229Z","light"],["body","M452 219 599 207 656 219 644 224 599 225Z","metal"],["decor","M454 219 600 209 642 218 M340 216 420 211 M340 225 420 231 M485 207 483 232 M545 211 545 228 M586 214 586 225","seam"],["radar","M106 220Q151 205 198 197L201 243Q151 235 106 220Z","radome"],["decor","M198 197 201 243 M212 195 215 245 M288 193 304 198 M288 247 304 242 M386 183 386 202 M386 257 386 238 M525 184 523 203 M525 256 523 237 M589 188 588 207 M589 252 588 233","seam"],["cockpit","M213 220Q229 205 254 200L282 200Q302 202 315 220Q302 238 282 240L254 240Q229 235 213 220Z","frame"],["cockpit","M219 220Q236 208 256 206L280 206Q296 208 305 220Q296 232 280 234L256 234Q236 232 219 220Z","glass"],["decor","M263 206 276 233 M226 219 252 210 273 211 M285 211 299 218","glint"],["decor","M556 92a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M556 348a9 9 0 1 0 18 0a9 9 0 1 0 -18 0","roundel-white"],["decor","M558.8 92a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0 M558.8 348a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0","roundel-red"],["decor","M562 92a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M562 348a3 3 0 1 0 6 0a3 3 0 1 0 -6 0","roundel-blue"],["decor","M363 216 373 216 373 224 363 224Z","dark"]],
        highlights:[["wings","M337 199 585 25 612 15 631 18 640 40 622 89 619 170 649 190 652 208 572 210 423 209Z M337 241 585 415 612 425 631 422 640 400 622 351 619 270 649 250 652 232 572 230 423 231Z"],["canards","M283 195 310 122 328 117 347 138 363 191 335 197Z M283 245 310 318 328 323 347 302 363 249 335 243Z"],["cockpit","M213 220Q229 205 254 200L282 200Q302 202 315 220Q302 238 282 240L254 240Q229 235 213 220Z"],["radar","M106 220Q151 205 198 197L201 243Q151 235 106 220Z"],["engines","M379 184Q447 178 505 181L620 189 650 197 681 198 681 213 661 218 380 210Z M379 256Q447 262 505 259L620 251 650 243 681 242 681 227 661 222 380 230Z"]],
        parts:[
          {key:'wings',label:'Ailes delta',x:74,y:10,tx:69,ty:21,text:'Leur forme triangulaire est un repère du Rafale. Elles assurent la portance et fonctionnent avec les petits plans canards placés à l’avant.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'canards',label:'Plans canards',x:34,y:15,tx:40,ty:36,text:'Ces petites surfaces mobiles se trouvent devant les ailes. Leur interaction avec l’aile delta participe à la maniabilité de l’avion.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'cockpit',label:'Cockpit',x:27,y:84,tx:33,ty:50,text:'C’est le poste du pilote. La version C représentée ici est monoplace ; le Rafale B possède deux places, tandis que le Rafale M est adapté au porte-avions.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'radar',label:'Radar dans le nez',x:10,y:31,tx:18,ty:50,text:'Le radar RBE2 est logé à l’avant, sous le radôme. Il contribue à détecter et suivre des objets dans les airs, sur terre et en mer ; il est invisible de l’extérieur.',source:rafaleSensors,credit:'Dassault Aviation'},
          {key:'engines',label:'Réacteurs M88',x:90,y:66,tx:82,ty:48,text:'Les réacteurs fournissent la poussée qui fait avancer l’avion. Les deux sorties à l’arrière aident à reconnaître ce biréacteur ; le M88 est produit par Safran Aircraft Engines.',source:'https://www.safran-group.com/fr/produits-services/m88-performances-fiabilite-operation',credit:'Safran'}
        ]},
      Leclerc:{view:'Vue de profil · avant à gauche',note:'Leclerc, illustration de famille. Les protections et équipements extérieurs diffèrent entre séries et rénovations.',
        shapes:[["decor","M265 344Q503 330 743 341L755 351Q523 371 245 354Z","shadow"],["tracks","M310 271 693 271Q733 272 738 307Q739 338 705 344L311 344Q274 341 272 311Q273 278 310 271Z","rubber"],["tracks","M313 280 691 280Q721 281 727 308Q728 330 704 334L313 334Q286 332 284 310Q285 287 313 280Z","dark"],["tracks","M312 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M317 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M324 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M331 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M344.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M340 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M331 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M326.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M331 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M340 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M372 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M377 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M384 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M391 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M404.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M400 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M391 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M386.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M391 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M400 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M432 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M437 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M444 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M451 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M464.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M460 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M451 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M446.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M451 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M460 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M492 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M497 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M504 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M511 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M524.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M520 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M511 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M506.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M511 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M520 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M552 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M557 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M564 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M571 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M584.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M580 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M571 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M566.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M571 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M580 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M612 312a25 25 0 1 0 50 0a25 25 0 1 0 -50 0","rubber"],["tracks","M617 312a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","olive"],["decor","M624 312a13 13 0 1 0 26 0a13 13 0 1 0 -26 0","wheel"],["decor","M631 312a6 6 0 1 0 12 0a6 6 0 1 0 -12 0","dark"],["decor","M644.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M640 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M631 319.79a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M626.5 312a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M631 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["decor","M640 304.21a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0","light"],["tracks","M283 304a17 17 0 1 0 34 0a17 17 0 1 0 -34 0 M688 305a20 20 0 1 0 40 0a20 20 0 1 0 -40 0","wheel"],["decor","M292 304a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M699 305a9 9 0 1 0 18 0a9 9 0 1 0 -18 0","dark"],["decor","M299 338l1 6 M299 272l1 6","tread"],["decor","M317 338l1 6 M317 272l1 6","tread"],["decor","M335 338l1 6 M335 272l1 6","tread"],["decor","M353 338l1 6 M353 272l1 6","tread"],["decor","M371 338l1 6 M371 272l1 6","tread"],["decor","M389 338l1 6 M389 272l1 6","tread"],["decor","M407 338l1 6 M407 272l1 6","tread"],["decor","M425 338l1 6 M425 272l1 6","tread"],["decor","M443 338l1 6 M443 272l1 6","tread"],["decor","M461 338l1 6 M461 272l1 6","tread"],["decor","M479 338l1 6 M479 272l1 6","tread"],["decor","M497 338l1 6 M497 272l1 6","tread"],["decor","M515 338l1 6 M515 272l1 6","tread"],["decor","M533 338l1 6 M533 272l1 6","tread"],["decor","M551 338l1 6 M551 272l1 6","tread"],["decor","M569 338l1 6 M569 272l1 6","tread"],["decor","M587 338l1 6 M587 272l1 6","tread"],["decor","M605 338l1 6 M605 272l1 6","tread"],["decor","M623 338l1 6 M623 272l1 6","tread"],["decor","M641 338l1 6 M641 272l1 6","tread"],["decor","M659 338l1 6 M659 272l1 6","tread"],["decor","M677 338l1 6 M677 272l1 6","tread"],["decor","M695 338l1 6 M695 272l1 6","tread"],["decor","M713 338l1 6 M713 272l1 6","tread"],["body","M268 267 311 233 383 225 686 225 728 245 743 278 729 312 291 312Z","olive"],["body","M268 267 311 233 383 225 686 225 728 245 686 260 379 253Z","olive-light"],["body","M269 267 379 253 686 260 742 278 729 305 291 305Z","olive"],["engine","M619 228 683 228 723 246 685 260 619 255Z","olive-light"],["decor","M633 234 682 237M633 240 694 243M633 246 705 249M633 252 688 255","seam"],["body","M306 258 384 250 688 255 735 270 727 305 299 305Z","olive"],["decor","M319 257 350 253 372 304 332 305Z M417 252 447 252 473 305 436 305Z M535 253 568 254 592 305 554 305Z M654 255 685 257 708 304 674 304Z","camo-dark"],["decor","M368 251 392 251 419 305 389 305Z M486 253 512 253 538 305 506 305Z M601 255 625 255 653 305 620 305Z","camo-sand"],["decor","M341 253 347 304M399 251 405 304M457 252 463 304M515 253 521 304M573 254 579 304M631 255 637 304M689 258 695 303","seam"],["decor","M331.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M336.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M389.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M394.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M447.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M452.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M505.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M510.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M563.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M568.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M621.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M626.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M679.2 262a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M684.2 298a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0","light"],["decor","M315 299 356 297 366 301 M398 298 436 296 M487 301 518 299 M573 298 606 301 M664 299 701 298","wear"],["turret","M381 228 375 194 404 172 462 160 591 164 664 176 684 194 681 226 642 239 428 238Z","olive"],["turret","M375 194 404 172 462 160 591 164 664 176 684 194 549 195 429 206Z","olive-light"],["turret","M375 194 429 206 428 238 381 228Z","khaki"],["turret","M429 206 549 195 684 194 681 226 642 239 428 238Z","olive"],["decor","M468 160 503 161 528 196 496 204 507 238 471 238 451 207 477 192Z","camo-sand"],["decor","M584 164 618 168 639 194 625 204 648 237 611 239 585 214 597 193Z M388 190 406 181 422 204 416 233 392 225Z","camo-dark"],["turret","M391 192 423 188 437 200 435 219 403 222 389 212Z","khaki"],["gun","M59 198 391 193 399 197 399 209 391 213 59 205Q53 201 59 198Z","olive-light"],["gun","M59 202 391 202 399 206 399 209 391 213 59 205Z","olive"],["gun","M55 197Q59 196 63 198L63 206Q59 208 55 205Z","nozzle"],["decor","M122 198 122 206 M185 197 185 207 M241 196 241 209 M294 195 294 210 M348 194 348 212","seam"],["turret","M462 163 462 151 494 150 501 163Z M555 164 555 142 568 137 583 141 584 164Z","olive"],["decor","M561 142 578 142 578 150 561 150Z","glass"],["decor","M486 151 488 114 M618 173 620 126 M488 114 489 94 M620 126 621 105 M494 158 527 160 M534 199 568 197 M609 212 631 209 M650 204 672 201","rail"],["driver","M316 239 345 233 374 237 367 248 326 253Z","olive-light"],["driver","M329 237 349 236 357 240 335 245Z","glass"],["decor","M289 263 301 258 309 265 298 272Z M723 262 732 268 725 277 716 270Z","lamp"],["decor","M448 232 455 229 458 232 452 236Z M550 231 557 228 560 232 554 235Z","light"]],
        highlights:[["gun","M59 198 391 193 399 197 399 209 391 213 59 205Q53 201 59 198Z"],["turret","M381 228 375 194 404 172 462 160 591 164 664 176 684 194 681 226 642 239 428 238Z"],["tracks","M310 271 693 271Q733 272 738 307Q739 338 705 344L311 344Q274 341 272 311Q273 278 310 271Z"],["engine","M619 228 683 228 723 246 685 260 619 255Z"],["driver","M316 239 345 233 374 237 367 248 326 253Z"]],
        parts:[
          {key:'gun',label:'Canon',x:15,y:29,tx:29,ty:46,text:'Le canon de 120 mm constitue l’armement principal. Il est porté par la tourelle ; son long tube donne au char une silhouette très différente de celle d’un transport de troupes.',source:leclerc,credit:'Armée de Terre'},
          {key:'turret',label:'Tourelle',x:63,y:23,tx:65,ty:46,text:'Elle peut pivoter au-dessus du châssis et porte le canon ainsi que les moyens de visée. Le chargement automatique permet un équipage de trois personnes : chef de char, tireur et pilote.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'},
          {key:'tracks',label:'Chenilles',x:48,y:89,tx:61,ty:74,text:'Les chenilles entourent les roues du train de roulement. Elles répartissent la masse du char sur le sol et lui permettent de se déplacer sur des terrains variés.',source:leclerc,credit:'Armée de Terre'},
          {key:'engine',label:'Compartiment moteur',x:94,y:45,tx:84,ty:55,text:'Le groupe moteur se trouve à l’arrière du châssis. Il fournit l’énergie nécessaire au déplacement ; la vitesse et l’autonomie restent à lire dans la fiche technique de la version concernée.',source:leclerc,credit:'Armée de Terre'},
          {key:'driver',label:'Poste du pilote',x:34,y:70,tx:43,ty:55,text:'Le pilote conduit depuis l’avant du châssis. Le chef de char et le tireur travaillent dans la tourelle : cette répartition distingue la conduite du véhicule de l’utilisation de ses équipements.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'}
        ]},
      'FREMM Aquitaine':{view:'Vue de profil · proue à gauche',note:'FREMM française de lutte anti-sous-marine. Le sonar de coque est indiqué sous la ligne de flottaison ; sa forme est symbolique.',
        shapes:[["decor","M60 317Q350 311 739 313 M95 327Q370 321 704 327 M165 337Q388 331 652 337","water"],["hull","M67 267 257 267 281 257 722 257 716 287 688 304 143 304 92 286Z","metal"],["hull","M67 267 257 267 281 257 722 257 713 268 282 267 260 276 92 277Z","light"],["hull","M96 289 145 304 688 304 715 287 714 296 690 310 145 310Z","hull-dark"],["decor","M111 296 701 296","bootline"],["bridge","M256 267 270 229 292 217 359 217 383 239 386 264Z","metal"],["bridge","M270 229 292 217 359 217 370 229 294 231Z","light"],["bridge","M294 231 370 229 380 247 291 248Z","metal"],["decor","M295 234 306 234 305 243 293 244Z M311 234 322 233 323 242 310 243Z M327 233 338 233 339 242 327 242Z M343 233 354 232 356 241 343 242Z M359 232 369 232 374 240 360 241Z","glass"],["radar","M328 219 334 199 362 199 377 220 379 238 329 238Z","metal"],["radar","M328 190 337 173 358 173 369 190 362 200 335 200Z","radome"],["radar","M337 173 358 173 363 181 332 182Z","light"],["decor","M335 195 362 195 M339 203 340 216 M359 203 365 216","seam"],["body","M377 266 389 226 413 209 450 210 468 237 471 266Z","metal"],["body","M389 226 413 209 450 210 459 223 415 223Z","light"],["body","M402 210 411 183 426 176 443 183 450 210Z","metal"],["body","M414 184 422 139 427 139 433 184Z","metal"],["decor","M424 139 424 77 M424 92 424 65 M416 102 432 102 M410 119 439 119 M416 131 433 131 M418 150 435 150 M418 166 437 166 M429 184 432 203 M403 201 443 201","rail"],["decor","M421.2 84a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0 M420.5 108a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0","dark"],["body","M461 266 461 222 482 218 504 227 508 265Z","metal"],["body","M461 222 482 218 504 227 482 231Z","light"],["decor","M466 221 480 220 494 225 482 228Z","dark"],["body","M493 266 493 239 515 235 527 245 527 267Z","metal"],["hangar","M517 265 518 233 583 233 607 243 610 266Z","metal"],["hangar","M518 233 583 233 607 243 541 244Z","light"],["hangar","M593 243 607 243 610 265 594 265Z","dark"],["decor","M596 247 607 247 M596 251 608 251 M596 255 608 255 M596 259 609 259 M547 249 582 249 M551 255 582 255","seam"],["hangar","M610 266 610 258 718 258 713 267Z","deck"],["decor","M631 262 700 262 M643 259 643 265 M690 259 690 265","deck-mark"],["gun","M145 267 147 256 158 245 178 245 188 256 189 267Z","metal"],["gun","M147 256 158 245 178 245 184 251 163 258Z","light"],["gun","M155 253 112 238 107 241 154 258Z","metal"],["decor","M210 266 210 256 235 256 239 264 239 267 M217 256 218 250 228 250 232 256","seam"],["body","M477 261 478 248 496 247 508 256 506 263Z","rubber"],["decor","M381 254 399 254 405 263 380 263Z","dark"],["decor","M83 267 83 258 M109 268 109 258 M202 267 202 256 M246 267 246 253 M611 258 611 249 M632 258 632 249 M654 258 654 249 M676 258 676 249 M700 258 700 249 M83 259 110 259 M202 258 246 254 M611 250 700 250","rail"],["decor","M284 219 286 189 M310 218 311 196 M477 218 478 196 M494 235 495 204 M487 218 503 218 M545 233 546 218 553 218 553 233","rail"],["sonar","M143 304Q154 327 184 320L202 307Z","sonar"],["decor","M285 282 374 282 M465 280 585 280 M192 289 213 289 M639 285 674 285","seam"]],
        highlights:[["radar","M328 190 337 173 358 173 369 190 362 200 377 220 379 238 329 238 328 219 334 199 335 200Z"],["bridge","M256 267 270 229 292 217 359 217 383 239 386 264Z"],["gun","M145 267 147 256 155 253 107 241 112 238 158 253 158 245 178 245 188 256 189 267Z"],["hangar","M517 265 518 233 583 233 607 243 610 258 718 258 713 267 610 266Z"],["sonar","M143 304Q154 327 184 320L202 307Z"]],
        parts:[
          {key:'radar',label:'Radar de veille',x:39,y:29,tx:44,ty:44,text:'Installé en hauteur, le radar de veille multifonctions contribue à surveiller les alentours du navire. La frégate dispose aussi de radars de navigation, destinés à un autre usage.',source:fremm,credit:'Marine nationale'},
          {key:'bridge',label:'Passerelle',x:28,y:45,tx:40,ty:54,text:'La passerelle est le poste de conduite du navire et de surveillance visuelle de la navigation. Les opérations de combat s’appuient également sur un système de combat qui rassemble les informations des capteurs.',source:fremm,credit:'Marine nationale'},
          {key:'gun',label:'Tourelle avant',x:13,y:45,tx:21,ty:58,text:'La tourelle de 76 mm est visible sur le pont avant. Elle constitue un équipement parmi d’autres : une frégate multimissions associe plusieurs moyens de surveillance, de protection et d’action.',source:fremm,credit:'Marine nationale'},
          {key:'hangar',label:'Hangar et pont d’envol',x:83,y:44,tx:71,ty:57,text:'À l’arrière se trouvent le hangar et la plateforme pour l’hélicoptère embarqué. Les FREMM françaises peuvent accueillir le Caïman Marine, qui prolonge leurs capacités au-delà du navire.',source:fremm,credit:'Marine nationale'},
          {key:'sonar',label:'Sonars',x:23,y:85,tx:22,ty:72,text:'Le sonar utilise le son pour observer sous l’eau. Les FREMM de lutte anti-sous-marine possèdent un sonar de coque et un sonar remorqué : ces capteurs complètent la surveillance assurée au-dessus de la mer.',source:fremm,credit:'Marine nationale'}
        ]}
    };
    const data=drawings[item.name];if(!data)return null;
    const wrap=section('Lire sa silhouette','Choisis un numéro sur le dessin ou le nom d’un élément pour comprendre son rôle.');wrap.id='silhouette';wrap.classList.add('history-silhouette');
    const layout=el('div','silhouette-layout'),figure=el('figure','silhouette-figure'),viewport=el('div','silhouette-viewport'),board=el('div','silhouette-board');board.id='silhouette-board';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Dessin de '+item.name);
    const svgNode=(tag,attrs={})=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);return node;};
    const svg=svgNode('svg',{viewBox:'0 0 800 440',role:'img','aria-label':'Illustration pédagogique : '+item.name+'. '+data.view});
    const defs=svgNode('defs');
    const materials={metal:['#d0d7da','#9daab3','#657c8e'],light:['#e1e8e9','#c7d0d4','#9eaeb8'],olive:['#8c9175','#5e6d54','#34463b'],'olive-light':['#b0b296','#85916d','#586b55'],wheel:['#899471','#536545','#2c4032'],glass:['#c0e3e5','#51798e','#1d364d'],nozzle:['#a8b0ae','#5d6b72','#263d4a'],radome:['#c7cecf','#a0afb4','#7c919d']};
    for(const [name,colors] of Object.entries(materials)){const gradient=svgNode('linearGradient',{id:'silhouette-'+name,x1:'0%',y1:'0%',x2:'0%',y2:'100%'});colors.forEach((color,i)=>gradient.append(svgNode('stop',{offset:i*50+'%','stop-color':color})));defs.append(gradient);}
    const finish=svgNode('filter',{id:'silhouette-surface',x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'});
    finish.append(svgNode('feTurbulence',{type:'fractalNoise',baseFrequency:'.55',numOctaves:'1',seed:'11',result:'grain'}),svgNode('feColorMatrix',{in:'grain',type:'saturate',values:'0',result:'mono'}));
    const opacity=svgNode('feComponentTransfer',{in:'mono',result:'soft-grain'});opacity.append(svgNode('feFuncA',{type:'linear',slope:'.08'}));finish.append(opacity,svgNode('feComposite',{in:'soft-grain',in2:'SourceAlpha',operator:'in',result:'surface'}),svgNode('feBlend',{in:'SourceGraphic',in2:'surface',mode:'multiply'}));defs.append(finish);
    svg.append(defs);
    const artwork=svgNode('g',{class:'silhouette-artwork',filter:'url(#silhouette-surface)'}),shapeNodes=[],leaders=[];
    for(const [key,d,tone='metal'] of data.shapes){
      const p=svgNode('path',{d,class:'silhouette-shape silhouette-material-'+tone});p.dataset.part=key;if(key==='decor')p.classList.add('silhouette-decoration');
      const n=data.parts.findIndex(part=>part.key===key);if(n>=0){p.classList.add('silhouette-part');p.addEventListener('click',()=>select(n));}
      artwork.append(p);
    }
    if(item.name==='FREMM Aquitaine'){const pennant=svgNode('text',{x:'166',y:'282',class:'silhouette-marking'});pennant.textContent='D650';artwork.append(pennant);}
    svg.append(artwork);
    for(const [key,d] of data.highlights){const p=svgNode('path',{d,class:'silhouette-selection'});svg.append(p);shapeNodes.push({key,node:p});}
    for(const part of data.parts){const leader=svgNode('g',{class:'silhouette-leader'});leader.append(svgNode('path',{d:'M'+part.x*8+' '+part.y*4.4+' L'+part.tx*8+' '+part.ty*4.4}),svgNode('circle',{cx:part.tx*8,cy:part.ty*4.4,r:'4'}));svg.append(leader);leaders.push(leader);}
    board.append(svg);viewport.append(board);
    const toolbar=el('div','silhouette-toolbar'),view=el('span','silhouette-view',data.view),modes=el('div','silhouette-mode-switch'),detailed=el('button','silhouette-detail-mode','Détaillé'),mode=el('button','silhouette-mode','Contours');modes.setAttribute('role','group');modes.setAttribute('aria-label','Présentation du schéma');
    for(const button of [detailed,mode]){button.type='button';button.setAttribute('aria-controls',board.id);}
    detailed.setAttribute('aria-pressed','true');mode.setAttribute('aria-pressed','false');
    const setOutline=outline=>{board.classList.toggle('silhouette-outline',outline);mode.setAttribute('aria-pressed',String(outline));detailed.setAttribute('aria-pressed',String(!outline));};
    mode.addEventListener('click',()=>setOutline(true));detailed.addEventListener('click',()=>setOutline(false));modes.append(detailed,mode);toolbar.append(view,modes);
    const legend=el('div','silhouette-legend');legend.append(el('span','silhouette-legend-swatch'),el('span','','Zone sélectionnée · clique sur le dessin ou un repère'));
    figure.append(toolbar,viewport,legend,el('figcaption','','Illustration originale Radar · proportions simplifiées. '+data.note));
    const controls=el('div','silhouette-controls'),choices=el('div','silhouette-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Éléments de '+item.name);
    const panel=el('div','silhouette-explanation');panel.id='silhouette-explanation';panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');
    const step=el('span','silhouette-step'),title=el('h3'),text=el('p'),ref=link('','');panel.append(step,title,text,ref);
    const buttons=[],hotspots=[];let active=0;
    const select=n=>{active=n;const part=data.parts[n];step.textContent='Repère '+(n+1)+' / '+data.parts.length;title.textContent=part.label;text.textContent=part.text;ref.textContent='Source : '+part.credit+' ↗';ref.href=part.source;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));hotspots.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));shapeNodes.forEach(s=>s.node.classList.toggle('silhouette-highlight',s.key===part.key));leaders.forEach((node,i)=>node.classList.toggle('silhouette-leader-active',i===n));};
    const keyboard=(event,n,list)=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(n+1)%data.parts.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(n+data.parts.length-1)%data.parts.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=data.parts.length-1;else return;event.preventDefault();select(next);list[next].focus();};
    data.parts.forEach((part,n)=>{const label=String(n+1).padStart(2,'0'),button=el('button','silhouette-choice');button.type='button';button.append(el('span','',label),el('span','',part.label));button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>select(n));button.addEventListener('keydown',event=>keyboard(event,n,buttons));choices.append(button);buttons.push(button);
      const point=el('button','silhouette-point',String(n+1));point.type='button';point.style.left=part.x+'%';point.style.top=part.y+'%';point.setAttribute('aria-label',label+' · '+part.label);point.setAttribute('aria-controls',panel.id);point.addEventListener('click',()=>select(n));point.addEventListener('keydown',event=>keyboard(event,n,hotspots));board.append(point);hotspots.push(point);
    });
    const partNav=el('div','silhouette-part-nav'),previous=el('button','silhouette-previous','← Précédent'),nextPart=el('button','silhouette-next','Suivant →');previous.type=nextPart.type='button';previous.setAttribute('aria-label','Élément précédent');nextPart.setAttribute('aria-label','Élément suivant');previous.addEventListener('click',()=>select((active+data.parts.length-1)%data.parts.length));nextPart.addEventListener('click',()=>select((active+1)%data.parts.length));partNav.append(previous,nextPart);panel.append(partNav);
    const actions=el('div','silhouette-actions'),enlarge=el('button','silhouette-enlarge','Agrandir le schéma ↗');enlarge.type='button';enlarge.setAttribute('aria-haspopup','dialog');enlarge.setAttribute('aria-expanded','false');actions.append(enlarge);
    let dialog=null,zoom=100,zoomOut,zoomIn,zoomValue;
    const setZoom=value=>{const old=zoom;zoom=Math.max(100,Math.min(200,value));const x=((viewport.scrollLeft||0)+(viewport.clientWidth||0)/2)*zoom/old-(viewport.clientWidth||0)/2,y=((viewport.scrollTop||0)+(viewport.clientHeight||0)/2)*zoom/old-(viewport.clientHeight||0)/2;board.style.width=zoom+'%';zoomValue.textContent=zoom+' %';zoomOut.disabled=zoom===100;zoomIn.disabled=zoom===200;viewport.scrollLeft=zoom===100?0:Math.max(0,x);viewport.scrollTop=zoom===100?0:Math.max(0,y);};
    enlarge.addEventListener('click',()=>{
      if(!dialog){
        dialog=el('dialog','silhouette-modal');dialog.setAttribute('aria-labelledby','silhouette-modal-title');dialog.setAttribute('aria-describedby','silhouette-zoom-help');
        const header=el('div','silhouette-modal-header'),heading=el('h2','',item.name+' · le schéma en grand'),close=el('button','silhouette-close','Fermer ×');heading.id='silhouette-modal-title';close.type='button';close.setAttribute('aria-label','Fermer le schéma agrandi');close.addEventListener('click',()=>dialog.close());header.append(heading,close);
        const tools=el('div','silhouette-zoom-tools'),zoomGroup=el('div','silhouette-zoom-group'),reset=el('button','silhouette-zoom-reset','Réinitialiser');zoomGroup.setAttribute('role','group');zoomGroup.setAttribute('aria-label','Zoom du schéma');zoomOut=el('button','silhouette-zoom-out','−');zoomIn=el('button','silhouette-zoom-in','+');zoomOut.type=zoomIn.type=reset.type='button';zoomOut.setAttribute('aria-label','Zoom arrière');zoomIn.setAttribute('aria-label','Zoom avant');reset.setAttribute('aria-label','Réinitialiser le zoom');zoomValue=el('output','silhouette-zoom-value');zoomValue.setAttribute('aria-live','polite');zoomOut.addEventListener('click',()=>setZoom(zoom-25));zoomIn.addEventListener('click',()=>setZoom(zoom+25));reset.addEventListener('click',()=>setZoom(100));zoomGroup.append(zoomOut,zoomValue,zoomIn,reset);
        const help=el('p','','Après avoir zoomé, fais défiler le dessin pour explorer ses détails. Les numéros et les explications restent cliquables.');help.id='silhouette-zoom-help';tools.append(zoomGroup,help);dialog.append(header,tools);wrap.append(dialog);
        dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dialog.close();}});
        dialog.addEventListener('close',()=>{setZoom(100);layout.remove();wrap.append(layout);enlarge.setAttribute('aria-expanded','false');enlarge.focus({preventScroll:true});});
      }
      layout.remove();dialog.append(layout);setZoom(100);dialog.showModal();enlarge.setAttribute('aria-expanded','true');dialog.querySelector('.silhouette-close').focus();
    });
    controls.append(choices,panel);layout.append(figure,controls);wrap.append(actions,layout);select(0);return wrap;
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
