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
        shapes:[["decor","M143 242Q335 173 675 201L707 232Q445 289 143 242Z","shadow"],["wings","M351 201 616 42 644 44 631 191 655 204 655 236 631 249 644 396 616 398 351 239Z","metal"],["wings","M380 195 615 57 624 59 612 181 582 188 570 217 398 217Z","light"],["wings","M380 245 615 383 624 381 612 259 582 252 570 223 398 223Z","metal"],["decor","M461 154 603 69M493 166 614 94M473 285 608 369M497 274 614 346 M580 190 615 181 628 190 M580 250 615 259 628 250","seam"],["canards","M281 199 299 125 319 118 340 122 332 201Z M281 241 299 315 319 322 340 318 332 239Z","metal"],["decor","M298 194 313 131 331 127M298 246 313 309 331 313","seam"],["body","M102 220Q164 201 235 193L304 190 340 177Q378 172 415 175L653 184 675 194 675 246 653 256 415 265Q378 268 340 263L304 250 235 247Q164 239 102 220Z","metal"],["body","M103 220Q174 208 250 204L333 202 360 192 445 191 648 196 652 220Z","light"],["body","M107 222Q183 235 252 235L324 239 359 249 463 250 648 241 655 224Z","metal"],["body","M313 192 336 177 369 181 383 204 365 214 323 210Z M313 248 336 263 369 259 383 236 365 226 323 230Z","dark"],["decor","M322 195 341 185 360 188 370 201 358 206 328 203 M322 245 341 255 360 252 370 239 358 234 328 237","seam"],["engines","M384 183Q475 175 615 185L661 188 682 197 682 211 632 215 386 210Z M384 257Q475 265 615 255L661 252 682 243 682 229 632 225 386 230Z","metal"],["engines","M651 187 684 191 696 196 696 213 680 217 650 213Z M651 253 684 249 696 244 696 227 680 223 650 227Z","nozzle"],["decor","M659 190 659 214M668 192 668 215M678 194 678 215M687 196 687 213 M659 250 659 226M668 248 668 225M678 246 678 225M687 244 687 227","seam"],["body","M334 211 454 203 591 208 649 216 649 224 591 232 454 237 334 229Z","light"],["body","M451 220 601 207 663 220 601 226Z","metal"],["decor","M453 220 601 207 653 219 M352 219 437 219 M366 229 443 232","seam"],["radar","M102 220Q155 204 199 199L200 241Q155 236 102 220Z","radome"],["decor","M196 200 196 240 M208 200 210 240 M302 199 312 202 M312 238 302 241 M398 187 399 202 M398 253 399 238 M536 187 536 205 M536 253 536 235 M595 190 595 208 M595 250 595 232","seam"],["cockpit","M214 220Q231 204 268 202L303 205Q318 210 323 220Q318 230 303 235L268 238Q231 236 214 220Z","frame"],["cockpit","M220 220Q238 207 268 207L300 210 311 220 300 230 268 233Q238 233 220 220Z","glass"],["decor","M270 208 279 232 M228 218 266 211 289 212","glint"],["decor","M562 110a10 10 0 1 0 20 0a10 10 0 1 0 -20 0 M562 330a10 10 0 1 0 20 0a10 10 0 1 0 -20 0","roundel-white"],["decor","M565 110a7 7 0 1 0 14 0a7 7 0 1 0 -14 0 M565 330a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","roundel-red"],["decor","M568.4 110a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0 M568.4 330a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0","roundel-blue"],["decor","M376 216 386 216 386 224 376 224Z","dark"]],
        highlights:[["wings","M351 201 616 42 644 44 631 191 655 204 655 236 631 249 644 396 616 398 351 239Z"],["canards","M281 199 299 125 319 118 340 122 332 201Z M281 241 299 315 319 322 340 318 332 239Z"],["cockpit","M214 220Q231 204 268 202L303 205Q318 210 323 220Q318 230 303 235L268 238Q231 236 214 220Z"],["radar","M102 220Q155 204 199 199L200 241Q155 236 102 220Z"],["engines","M384 183Q475 175 615 185L661 188 696 196 696 213 632 215 386 210Z M384 257Q475 265 615 255L661 252 696 244 696 227 632 225 386 230Z"]],
        parts:[
          {key:'wings',label:'Ailes delta',x:74,y:12,tx:68,ty:26,text:'Leur forme triangulaire est un repère du Rafale. Elles assurent la portance et fonctionnent avec les petits plans canards placés à l’avant.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'canards',label:'Plans canards',x:36,y:17,tx:39,ty:35,text:'Ces petites surfaces mobiles se trouvent devant les ailes. Leur interaction avec l’aile delta participe à la maniabilité de l’avion.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'cockpit',label:'Cockpit',x:27,y:82,tx:32,ty:50,text:'C’est le poste du pilote. La version C représentée ici est monoplace ; le Rafale B possède deux places, tandis que le Rafale M est adapté au porte-avions.',source:rafaleDesign,credit:'Dassault Aviation'},
          {key:'radar',label:'Radar dans le nez',x:10,y:30,tx:18,ty:50,text:'Le radar RBE2 est logé à l’avant, sous le radôme. Il contribue à détecter et suivre des objets dans les airs, sur terre et en mer ; il est invisible de l’extérieur.',source:rafaleSensors,credit:'Dassault Aviation'},
          {key:'engines',label:'Réacteurs M88',x:90,y:68,tx:82,ty:48,text:'Les réacteurs fournissent la poussée qui fait avancer l’avion. Les deux sorties à l’arrière aident à reconnaître ce biréacteur ; le M88 est produit par Safran Aircraft Engines.',source:'https://www.safran-group.com/fr/produits-services/m88-performances-fiabilite-operation',credit:'Safran'}
        ]},
      Leclerc:{view:'Vue de profil · avant à gauche',note:'Leclerc, illustration de famille. Les protections et équipements extérieurs diffèrent entre séries et rénovations.',
        shapes:[["decor","M178 336Q405 353 711 328L730 340Q396 378 162 349Z","shadow"],["tracks","M237 253 637 253Q687 256 692 294Q692 336 650 340L239 340Q191 339 187 299Q187 261 237 253Z","rubber"],["tracks","M237 263 637 263Q672 264 681 295Q680 325 650 329L239 329Q204 326 200 299Q202 270 237 263Z","dark"],["tracks","M239 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M244 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M252 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M260 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M301 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M306 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M314 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M322 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M363 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M368 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M376 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M384 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M425 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M430 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M438 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M446 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M487 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M492 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M500 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M508 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M549 303a28 28 0 1 0 56 0a28 28 0 1 0 -56 0","rubber"],["tracks","M554 303a23 23 0 1 0 46 0a23 23 0 1 0 -46 0","olive"],["decor","M562 303a15 15 0 1 0 30 0a15 15 0 1 0 -30 0","wheel"],["decor","M570 303a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","dark"],["tracks","M199 291a19 19 0 1 0 38 0a19 19 0 1 0 -38 0 M628 290a22 22 0 1 0 44 0a22 22 0 1 0 -44 0","wheel"],["decor","M210 291a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M638 290a12 12 0 1 0 24 0a12 12 0 1 0 -24 0","dark"],["decor","M220 331l-1 8 M220 254l-1 8","tread"],["decor","M238 331l-1 8 M238 254l-1 8","tread"],["decor","M256 331l-1 8 M256 254l-1 8","tread"],["decor","M274 331l-1 8 M274 254l-1 8","tread"],["decor","M292 331l-1 8 M292 254l-1 8","tread"],["decor","M310 331l-1 8 M310 254l-1 8","tread"],["decor","M328 331l-1 8 M328 254l-1 8","tread"],["decor","M346 331l-1 8 M346 254l-1 8","tread"],["decor","M364 331l-1 8 M364 254l-1 8","tread"],["decor","M382 331l-1 8 M382 254l-1 8","tread"],["decor","M400 331l-1 8 M400 254l-1 8","tread"],["decor","M418 331l-1 8 M418 254l-1 8","tread"],["decor","M436 331l-1 8 M436 254l-1 8","tread"],["decor","M454 331l-1 8 M454 254l-1 8","tread"],["decor","M472 331l-1 8 M472 254l-1 8","tread"],["decor","M490 331l-1 8 M490 254l-1 8","tread"],["decor","M508 331l-1 8 M508 254l-1 8","tread"],["decor","M526 331l-1 8 M526 254l-1 8","tread"],["decor","M544 331l-1 8 M544 254l-1 8","tread"],["decor","M562 331l-1 8 M562 254l-1 8","tread"],["decor","M580 331l-1 8 M580 254l-1 8","tread"],["decor","M598 331l-1 8 M598 254l-1 8","tread"],["decor","M616 331l-1 8 M616 254l-1 8","tread"],["decor","M634 331l-1 8 M634 254l-1 8","tread"],["body","M181 267 218 235 285 218 618 218 678 237 699 273 683 290 209 290Z","olive"],["body","M182 267 218 235 285 218 618 218 678 237 643 257 285 252Z","olive-light"],["body","M182 267 285 252 643 257 699 273 683 290 209 290Z","olive"],["engine","M561 221 617 221 673 239 643 257 561 251Z","olive-light"],["decor","M577 228 628 232M577 233 636 238M577 238 645 244M577 243 637 249","seam"],["decor","M245 263 289 258 304 286 271 288Z M362 258 398 258 418 290 375 290Z M484 259 515 259 542 291 502 290Z M623 263 651 262 670 286 646 290Z","camo-dark"],["decor","M302 256 338 256 357 287 322 289Z M427 258 464 258 485 289 447 290Z M555 261 587 261 605 289 574 289Z","camo-sand"],["decor","M252 257 257 287M315 256 322 289M378 257 384 290M441 259 447 289M504 260 510 290M567 261 573 289M630 262 636 290","seam"],["turret","M308 220 296 188 333 163 442 153 561 166 590 187 581 224 527 237 355 235Z","olive"],["turret","M296 188 333 163 442 153 561 166 590 187 464 188 357 201Z","olive-light"],["turret","M296 188 357 201 355 235 308 220Z","khaki"],["turret","M357 201 464 188 590 187 581 224 527 237 355 235Z","olive"],["decor","M375 174 418 158 453 159 479 188 434 195 409 231 375 231 389 197Z","camo-sand"],["decor","M504 161 540 165 558 188 541 197 560 229 530 236 504 216 512 190Z M315 194 331 184 350 203 346 227 324 218Z","camo-dark"],["turret","M319 189 355 185 368 197 361 217 329 218 313 204Z","khaki"],["gun","M84 186 321 186 327 192 327 205 321 210 84 205Z","olive-light"],["gun","M84 197 321 197 327 205 321 210 84 205Z","olive"],["gun","M75 184 95 184 100 189 100 206 93 209 75 206Z","dark"],["decor","M143 187 143 206 M180 187 180 207 M226 188 226 207 M270 189 270 208","seam"],["turret","M391 160 391 143 429 143 434 159Z M473 158 472 133 490 128 506 133 505 161Z","olive"],["decor","M478 135 500 135 500 143 478 143Z","glass"],["turret","M530 166 535 129 540 129 540 167 M423 153 429 117 434 117 431 155","dark"],["decor","M428 117 429 85 M537 129 541 102 M364 205 377 209 M446 208 484 204 M518 207 533 205 M566 200 577 198","seam"],["driver","M226 241 258 233 286 238 278 251 237 255Z","olive-light"],["driver","M241 239 266 236 273 241 247 246Z","glass"],["decor","M204 265 218 260 223 267 211 274Z M675 263 684 269 677 278 666 270Z","lamp"],["decor","M366 229 374 225 378 230 373 233Z M452 225 459 221 463 226 459 230Z","light"]],
        highlights:[["gun","M75 184 95 184 100 186 321 186 327 192 327 205 321 210 84 205 75 206Z"],["turret","M308 220 296 188 333 163 442 153 561 166 590 187 581 224 527 237 355 235Z"],["tracks","M237 253 637 253Q687 256 692 294Q692 336 650 340L239 340Q191 339 187 299Q187 261 237 253Z"],["engine","M561 221 617 221 673 239 643 257 561 251Z"],["driver","M226 241 258 233 286 238 278 251 237 255Z"]],
        parts:[
          {key:'gun',label:'Canon',x:14,y:26,tx:25,ty:45,text:'Le canon de 120 mm constitue l’armement principal. Il est porté par la tourelle ; son long tube donne au char une silhouette très différente de celle d’un transport de troupes.',source:leclerc,credit:'Armée de Terre'},
          {key:'turret',label:'Tourelle',x:51,y:22,tx:51,ty:44,text:'Elle peut pivoter au-dessus du châssis et porte le canon ainsi que les moyens de visée. Le chargement automatique permet un équipage de trois personnes : chef de char, tireur et pilote.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'},
          {key:'tracks',label:'Chenilles',x:42,y:87,tx:48,ty:69,text:'Les chenilles entourent les roues du train de roulement. Elles répartissent la masse du char sur le sol et lui permettent de se déplacer sur des terrains variés.',source:leclerc,credit:'Armée de Terre'},
          {key:'engine',label:'Compartiment moteur',x:87,y:43,tx:77,ty:55,text:'Le groupe moteur se trouve à l’arrière du châssis. Il fournit l’énergie nécessaire au déplacement ; la vitesse et l’autonomie restent à lire dans la fiche technique de la version concernée.',source:leclerc,credit:'Armée de Terre'},
          {key:'driver',label:'Poste du pilote',x:21,y:70,tx:31,ty:55,text:'Le pilote conduit depuis l’avant du châssis. Le chef de char et le tireur travaillent dans la tourelle : cette répartition distingue la conduite du véhicule de l’utilisation de ses équipements.',source:'https://www.defense.gouv.fr/dga/actualites/dga-commande-100-chars-leclerc-renoves-xlr',credit:'Direction générale de l’armement'}
        ]},
      'FREMM Aquitaine':{view:'Vue de profil · proue à gauche',note:'FREMM française de lutte anti-sous-marine. Le sonar de coque est indiqué sous la ligne de flottaison ; sa forme est symbolique.',
        shapes:[["decor","M60 321Q350 312 733 317 M96 333Q370 325 702 333 M165 344Q388 339 649 345","water"],["hull","M64 250 265 250 287 231 720 231 715 280 687 305 152 305 91 279Z","metal"],["hull","M64 250 265 250 287 231 720 231 708 249 282 249 272 261 102 262Z","light"],["hull","M91 279 152 305 687 305 715 280 712 293 690 313 153 313Z","hull-dark"],["decor","M107 287 698 287","bootline"],["bridge","M263 248 276 197 303 176 370 176 387 217 389 246Z","metal"],["bridge","M276 197 303 176 370 176 379 190 300 190Z","light"],["bridge","M300 190 379 190 387 217 298 217Z","metal"],["decor","M299 196 310 196 309 206 297 206Z M315 196 326 196 326 206 314 206Z M331 196 342 196 343 206 331 206Z M347 196 358 196 360 206 347 206Z M363 196 374 196 377 206 363 206Z","glass"],["body","M387 247 394 209 430 197 496 207 520 245Z","metal"],["body","M394 209 430 197 496 207 488 218 405 220Z","light"],["body","M450 204 450 145 470 140 485 147 491 211Z","metal"],["decor","M450 145 470 140 485 147 465 151Z","light"],["decor","M455 145 468 142 478 146 465 148Z","dark"],["radar","M337 177 346 125 352 117 371 117 381 179 374 211 345 210Z","metal"],["radar","M346 125 352 117 371 117 373 129 349 132Z","light"],["radar","M340 103 347 83 373 83 384 104 377 120 347 120Z","radome"],["radar","M347 83 373 83 378 96 342 97Z","light"],["decor","M361 83 361 60 M350 69 374 69 M343 145 376 145 M342 153 377 153 M340 163 380 163","seam"],["body","M507 246 507 179 522 167 535 173 542 240Z","metal"],["decor","M512 182 531 182 533 199 512 199Z M512 207 534 207 535 221 512 221Z","dark"],["hangar","M545 245 546 187 600 187 620 200 621 245Z","metal"],["hangar","M546 187 600 187 620 200 567 200Z","light"],["hangar","M584 203 612 203 612 245 584 245Z","dark"],["decor","M587 207 609 207M587 212 609 212M587 217 609 217M587 222 609 222M587 227 609 227M587 232 609 232M587 237 609 237","seam"],["hangar","M621 245 621 232 716 232 711 245Z","deck"],["decor","M641 236 697 236 M650 233 650 241 M687 233 687 241","deck-mark"],["gun","M131 250 133 233 144 219 164 219 178 233 182 250Z","metal"],["gun","M133 233 144 219 164 219 171 229 149 236Z","light"],["gun","M145 226 101 202 95 204 143 234Z","metal"],["decor","M202 247 202 234 226 234 233 244 233 248 M208 234 210 226 218 226 223 234","seam"],["body","M412 242 413 228 438 228 450 237 448 244Z","rubber"],["decor","M89 251 89 241M117 252 117 243M190 252 190 241M242 250 242 237 M622 232 622 221M640 232 640 221M660 232 660 221M680 232 680 221M702 232 702 221 M89 243 118 243 M190 243 242 238 M622 222 702 222","rail"],["decor","M471 140 470 115 M503 176 501 132 M494 145 511 145 M550 188 551 169 562 169 562 187","rail"],["sonar","M140 305Q151 331 187 323L205 308Z","sonar"],["decor","M228 274h9 M246 274h9 M264 274h9 M282 274h9 M300 274h9 M318 274h9 M336 274h9 M354 274h9 M372 274h9 M390 274h9 M408 274h9 M426 274h9 M444 274h9 M462 274h9 M480 274h9 M498 274h9 M516 274h9 M534 274h9","seam"]],
        highlights:[["radar","M337 177 346 125 340 103 347 83 373 83 384 104 377 120 381 179 374 211 345 210Z"],["bridge","M263 248 276 197 303 176 370 176 387 217 389 246Z"],["gun","M131 250 133 233 143 232 95 204 101 202 145 226 144 219 164 219 178 233 182 250Z"],["hangar","M545 245 546 187 600 187 620 200 621 232 716 232 711 245Z"],["sonar","M140 305Q151 331 187 323L205 308Z"]],
        parts:[
          {key:'radar',label:'Radar de veille',x:45,y:12,tx:45,ty:25,text:'Installé en hauteur, le radar de veille multifonctions contribue à surveiller les alentours du navire. La frégate dispose aussi de radars de navigation, destinés à un autre usage.',source:fremm,credit:'Marine nationale'},
          {key:'bridge',label:'Passerelle',x:30,y:30,tx:41,ty:45,text:'La passerelle est le poste de conduite du navire et de surveillance visuelle de la navigation. Les opérations de combat s’appuient également sur un système de combat qui rassemble les informations des capteurs.',source:fremm,credit:'Marine nationale'},
          {key:'gun',label:'Tourelle avant',x:13,y:40,tx:19,ty:53,text:'La tourelle de 76 mm est visible sur le pont avant. Elle constitue un équipement parmi d’autres : une frégate multimissions associe plusieurs moyens de surveillance, de protection et d’action.',source:fremm,credit:'Marine nationale'},
          {key:'hangar',label:'Hangar et pont d’envol',x:83,y:34,tx:75,ty:53,text:'À l’arrière se trouvent le hangar et la plateforme pour l’hélicoptère embarqué. Les FREMM françaises peuvent accueillir le Caïman Marine, qui prolonge leurs capacités au-delà du navire.',source:fremm,credit:'Marine nationale'},
          {key:'sonar',label:'Sonars',x:23,y:86,tx:22,ty:72,text:'Le sonar utilise le son pour observer sous l’eau. Les FREMM de lutte anti-sous-marine possèdent un sonar de coque et un sonar remorqué : ces capteurs complètent la surveillance assurée au-dessus de la mer.',source:fremm,credit:'Marine nationale'}
        ]}
    };
    const data=drawings[item.name];if(!data)return null;
    const wrap=section('Lire sa silhouette','Choisis un numéro sur le dessin ou le nom d’un élément pour comprendre son rôle.');wrap.id='silhouette';wrap.classList.add('history-silhouette');
    const layout=el('div','silhouette-layout'),figure=el('figure','silhouette-figure'),board=el('div','silhouette-board');board.id='silhouette-board';
    const svgNode=(tag,attrs={})=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);return node;};
    const svg=svgNode('svg',{viewBox:'0 0 800 440',role:'img','aria-label':'Illustration pédagogique : '+item.name+'. '+data.view});
    const defs=svgNode('defs');
    const materials={metal:['#d0d7da','#9daab3','#657c8e'],light:['#e1e8e9','#c7d0d4','#9eaeb8'],olive:['#a0a78b','#748263','#4c5e49'],'olive-light':['#c0c5a3','#99a57d','#738460'],wheel:['#899471','#536545','#2c4032'],glass:['#c0e3e5','#51798e','#1d364d'],nozzle:['#a8b0ae','#5d6b72','#263d4a'],radome:['#c7cecf','#a0afb4','#7c919d']};
    for(const [name,colors] of Object.entries(materials)){const gradient=svgNode('linearGradient',{id:'silhouette-'+name,x1:'0%',y1:'0%',x2:'0%',y2:'100%'});colors.forEach((color,i)=>gradient.append(svgNode('stop',{offset:i*50+'%','stop-color':color})));defs.append(gradient);}
    svg.append(defs);
    const artwork=svgNode('g',{class:'silhouette-artwork'}),shapeNodes=[],leaders=[];
    for(const [key,d,tone='metal'] of data.shapes){
      const p=svgNode('path',{d,class:'silhouette-shape silhouette-material-'+tone});p.dataset.part=key;
      const n=data.parts.findIndex(part=>part.key===key);if(n>=0){p.classList.add('silhouette-part');p.addEventListener('click',()=>select(n));}
      artwork.append(p);
    }
    if(item.name==='FREMM Aquitaine'){const pennant=svgNode('text',{x:'166',y:'282',class:'silhouette-marking'});pennant.textContent='D650';artwork.append(pennant);}
    svg.append(artwork);
    for(const [key,d] of data.highlights){const p=svgNode('path',{d,class:'silhouette-selection'});svg.append(p);shapeNodes.push({key,node:p});}
    for(const part of data.parts){const leader=svgNode('g',{class:'silhouette-leader'});leader.append(svgNode('path',{d:'M'+part.x*8+' '+part.y*4.4+' L'+part.tx*8+' '+part.ty*4.4}),svgNode('circle',{cx:part.tx*8,cy:part.ty*4.4,r:'4'}));svg.append(leader);leaders.push(leader);}
    board.append(svg);
    const toolbar=el('div','silhouette-toolbar'),view=el('span','silhouette-view',data.view),mode=el('button','silhouette-mode','Contours');mode.type='button';mode.setAttribute('aria-pressed','false');mode.setAttribute('aria-label','Afficher la vue en contours');mode.setAttribute('aria-controls',board.id);
    mode.addEventListener('click',()=>{const outline=board.classList.toggle('silhouette-outline');mode.setAttribute('aria-pressed',String(outline));mode.setAttribute('aria-label',outline?'Revenir à la vue détaillée':'Afficher la vue en contours');});
    toolbar.append(view,mode);
    const legend=el('div','silhouette-legend');legend.append(el('span','silhouette-legend-swatch'),el('span','','Zone sélectionnée · clique sur le dessin ou un repère'));
    figure.append(toolbar,board,legend,el('figcaption','','Illustration originale Radar · proportions simplifiées. '+data.note));
    const controls=el('div','silhouette-controls'),choices=el('div','silhouette-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label','Éléments de '+item.name);
    const panel=el('div','silhouette-explanation');panel.id='silhouette-explanation';panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true');
    const step=el('span','silhouette-step'),title=el('h3'),text=el('p'),ref=link('','');panel.append(step,title,text,ref);
    const buttons=[],hotspots=[];
    const select=n=>{const part=data.parts[n];step.textContent='Repère '+(n+1)+' / '+data.parts.length;title.textContent=part.label;text.textContent=part.text;ref.textContent='Source : '+part.credit+' ↗';ref.href=part.source;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));hotspots.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));shapeNodes.forEach(s=>s.node.classList.toggle('silhouette-highlight',s.key===part.key));leaders.forEach((node,i)=>node.classList.toggle('silhouette-leader-active',i===n));};
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
