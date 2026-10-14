// Dessins originaux Radar. Le fond géographique réutilise les contours Natural Earth du site.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,label,size=18)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(label)}</text>`;
const line=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#9c6044" stroke-width="2"/>`;
const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#e2e9d7" stroke="#a7b49b"/>`;
const vehicle=(x,y,type)=>`<g transform="translate(${x} ${y})"><rect x="0" y="40" width="210" height="48" rx="18" fill="#334c3c"/><path d="M12 40L38 15H160L194 40" fill="#84916b"/>${type==='tank'?'<path d="M75 15V0H140L154 15M138 4H234" fill="#526947" stroke="#334c3c" stroke-width="7"/>':'<rect x="49" y="6" width="36" height="13" fill="#526947"/><path d="M85 9H140" stroke="#334c3c" stroke-width="5"/>'}<g fill="#d8ddca" stroke="#334c3c" stroke-width="4">${[25,65,105,145,185].map(cx=>`<circle cx="${cx}" cy="65" r="13"/>`).join('')}</g></g>`;
const plane=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})" fill="#566d56" stroke="#263b31" stroke-width="2"><path d="M0 -48L8 -5L62 12V21L9 12L7 42L23 54V61L0 55L-23 61V54L-7 42L-9 12L-62 21V12L-8 -5Z"/></g>`;
export function learningVisual(kind,map=[]){
  let body='',label='Schéma pédagogique',viewBox='0 0 640 300';
  if(kind==='armor'){
    label='Deux silhouettes simplifiées : le char de combat et le véhicule de combat d’infanterie';
    body=box(18,24,290,250)+box(332,24,290,250)+vehicle(45,113,'tank')+vehicle(370,113,'ifv')+text(40,62,'CHAR DE COMBAT',17)+text(354,62,'VÉHICULE D’INFANTERIE',16)+text(40,240,'Équipage · combat',17)+text(354,240,'Équipage + soldats transportés',15);
  }else if(kind==='sensors'){
    label='Radar : ondes radio et écho. Sonar actif : son et écho. Sonar passif : écoute des sons reçus.';
    body=[['RADAR','Onde radio →','← Écho',65],['SONAR ACTIF','Son émis →','← Écho',151],['SONAR PASSIF','Sons reçus ←','Sans émission propre',237]].map(([a,b,c,y])=>box(16,y-43,608,77)+text(34,y-10,a,16)+text(235,y-10,b,18)+text(235,y+16,c,15)+`<circle cx="570" cy="${y-4}" r="15" fill="#8c9a74"/>`).join('');
  }else if(kind==='carrier'){
    label='Le porte-avions, ses aéronefs, l’escorte et le ravitailleur : des fonctions complémentaires, sans positions opérationnelles.';
    body=box(160,90,320,124)+`<path d="M203 155L246 119H415L437 172H226Z" fill="#526947"/><path d="M242 142H406M255 154H400" stroke="#f3f5ed" stroke-width="3" stroke-dasharray="12 8"/>`+text(228,196,'PORTE-AVIONS',20)+plane(82,81,.45)+text(26,153,'Aéronefs',17)+box(17,217,170,56)+text(35,251,'Escorte',18)+box(457,217,166,56)+text(468,251,'Ravitaillement',16)+line(187,244,246,214)+line(457,244,410,214)+text(246,55,'Un ensemble coordonné',17);
  }else if(kind==='drones'){
    label='Deux formats de drones et trois questions : quelle mission, quelle charge utile, quel mode de conduite ?';
    body=box(20,25,255,245)+box(295,25,325,245)+`<g stroke="#334c3c" stroke-width="7"><path d="M83 92L201 168M83 168L201 92"/></g><g fill="none" stroke="#526947" stroke-width="6">${[[82,92],[201,168],[82,168],[201,92]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="29" ry="12"/>`).join('')}</g><rect x="121" y="111" width="40" height="40" rx="10" fill="#84916b"/>`+plane(450,130,1.05)+text(44,61,'Petit multirotor',19)+text(320,61,'Aéronef à voilure fixe',19)+text(44,239,'Format ≠ mission',17)+text(320,239,'Sans pilote à bord ≠ autonome',16);
  }else if(kind==='alliances'){
    label='OTAN et Union européenne : organisations distinctes avec des membres communs et une coopération.';
    body=`<circle cx="235" cy="142" r="105" fill="#b8cbd1" fill-opacity=".8" stroke="#496978" stroke-width="2"/><circle cx="402" cy="142" r="105" fill="#c8d5ad" fill-opacity=".7" stroke="#637b47" stroke-width="2"/>`+text(161,137,'OTAN',25)+text(395,137,'UE',25)+text(280,139,'Membres',14)+text(282,158,'communs',14)+text(106,280,'Coopération · institutions et décisions distinctes',18);
  }else if(kind==='chokepoints'){
    label='Carte de repérage des canaux de Panama et Suez et des détroits d’Ormuz et de Malacca. Localisations approchées.';
    viewBox='0 0 1200 550';
    // Projection du fond existant : longitude × 10/3 + 600 ; latitude × -10/3 + 275.
    const points=[['Panama',-79.6,9.1,210,349],['Suez',32.55,30,610,95],['Ormuz',56.5,26.5,812,116],['Malacca',101,2.5,940,353]];
    body=`<rect width="1200" height="550" fill="#e0ebeb"/><g fill="#c5d1b2" stroke="#82966e" stroke-width=".7">${map.filter(c=>c.code!=='AQ').map(c=>`<path d="${esc(c.path)}"/>`).join('')}</g>`+points.map(([name,lon,lat,lx,ly])=>{const x=600+lon*10/3,y=275-lat*10/3;return line(x,y,lx+45,ly-9)+`<circle cx="${x}" cy="${y}" r="6" fill="#9c6044" stroke="#fff" stroke-width="2"/>`+`<rect x="${lx-7}" y="${ly-30}" width="125" height="41" rx="6" fill="#fcfdf7"/>`+text(lx,ly,name,26)}).join('');
  }else return '';
  return `<svg class="learning-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${esc(label)}" focusable="false"><title>${esc(label)}</title><g fill="#263b31" font-family="Arial, sans-serif">${body}</g></svg>`;
}
export function learningFigure(g,map){return g.visual?`<figure class="learning-figure">${learningVisual(g.visual,map)}<figcaption>${g.visual==='chokepoints'?'Fond Natural Earth · domaine public. Repères approchés ; aucune donnée de trafic en temps réel.':'Schéma original Radar, simplifié et non à l’échelle.'}</figcaption></figure>`:'';}
export function readingMinutes(g){const words=[g.takeaway,...g.sections.map(s=>s.text),...(g.history?.paragraphs||[]).map(p=>p.text)].join(' ').split(/\s+/).length;return Math.max(2,Math.ceil(words/180));}
export function learningHistory(g){
  if(!g.history)return '';
  const ref=i=>{const source=g.sources[i];if(!source)throw Error('Référence historique absente : '+g.slug);return '<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.label)+' ↗</a>';};
  return '<section class="learning-history" id="contexte-historique" aria-labelledby="context-title"><span class="discovery-kicker">LE CONTEXTE HISTORIQUE</span><h2 id="context-title">'+esc(g.history.title)+'</h2>'+g.history.paragraphs.map(p=>'<p>'+esc(p.text)+'</p><div class="discovery-refs">'+p.sources.map(ref).join('')+'</div>').join('')+'<h3>Quelques jalons pour se repérer</h3><ol class="learning-timeline">'+g.milestones.map(m=>'<li><span class="learning-timeline-date">'+esc(m.date)+'</span><div><h4>'+esc(m.title)+'</h4><p>'+esc(m.text)+'</p>'+ref(m.source)+'</div></li>').join('')+'</ol></section>';
}
export function learningQuiz(g){
  if(!g.quiz?.length)return '';
  return `<section class="learning-quiz" aria-labelledby="quiz-title"><span class="discovery-kicker">POUR VÉRIFIER TES REPÈRES</span><h2 id="quiz-title">Trois questions, sans chronomètre.</h2><p>Facultatif · les réponses restent dans cette page, sans score enregistré.</p><form class="learning-quiz-form" hidden>${g.quiz.map((q,i)=>`<fieldset data-answer="${q.answer}"><legend>${i+1}. ${esc(q.question)}</legend>${q.choices.map((choice,j)=>`<label><input type="radio" name="question-${i}" value="${j}" required> <span>${esc(choice)}</span></label>`).join('')}<p class="learning-quiz-feedback" hidden data-explanation="${esc(q.explanation)}" data-correct="${esc(q.choices[q.answer])}"></p></fieldset>`).join('')}<div class="learning-quiz-actions"><button class="button button-dark" type="submit">Vérifier mes réponses →</button><button class="button button-light" type="reset">Recommencer</button></div><p class="learning-quiz-score" role="status" aria-live="polite"></p></form><noscript><p>Active JavaScript pour répondre au quiz. Le dossier et ses sources restent entièrement lisibles.</p></noscript></section>`;
}
export function glossaryHTML(C){return `<section class="learning-glossary" id="glossaire" aria-labelledby="glossary-title"><span class="eyebrow">LE PETIT LEXIQUE</span><h2 id="glossary-title">Un sigle te bloque ?</h2><p>Ouvre une définition, puis son dossier pour retrouver les exemples et les sources.</p><div id="glossary-search-wrap" hidden><label for="glossary-search">Rechercher un terme</label><input id="glossary-search" type="search" placeholder="Ex. SNA, drone, OTAN…" maxlength="100" autocomplete="off"><p id="glossary-count" role="status" aria-live="polite"></p></div><div class="learning-glossary-grid">${C.glossary.map(([term,definition,slug])=>`<details data-glossary-term="${esc(term+' '+definition)}"><summary>${esc(term)}</summary><p>${esc(definition)}</p><a href="comprendre-${esc(slug)}.html">Explication et sources →</a></details>`).join('')}</div></section>`;}
