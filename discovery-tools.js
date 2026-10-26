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
  const guideKeywords=g=>[g.theme,...g.categories,g.history?.title||'',...(g.milestones||[]).map(m=>m.date+' '+m.title),...g.sections.map(s=>s.title+' '+s.text),...(g.history?.paragraphs||[]).map(p=>p.text||'')].join(' ').slice(0,24000);
  function rank(items,query,type='all'){
    const terms=fold(query).trim().split(/\s+/).filter(Boolean);
    return items.filter(i=>type==='all'||i.type===type).map((item,index)=>{
      const title=fold(item.title),hay=fold([item.title,item.description,item.keywords].join(' ')),compactHay=compact(hay),compactTitle=compact(title);
      if(!terms.every(term=>hay.includes(term)||(compact(term)&&compactHay.includes(compact(term)))))return null;
      const score=terms.reduce((sum,t)=>sum+(title.includes(t)||(compact(t)&&compactTitle.includes(compact(t)))?8:1),0)+(title===fold(query)||(compact(query)&&compactTitle===compact(query))?30:0);
      return {item,index,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.item);
  }
  function guideLinks(item){
    const kind=fold(item.kind),name=fold(item.name),links=[];
    const add=(slug,title)=>links.push({url:'comprendre-'+slug+'.html',title});
    if(item.category==='missiles')add('missile-balistique-croisiere','Missiles balistiques et de croisière : les repères');
    else if(item.category==='terre'&&/char|blinde|infanterie|transport|reconnaissance/.test(kind))add('char-blinde-infanterie','Char, blindé et VCI : comprendre les rôles');
    else if(item.category==='air'){
      if(/drone/.test(kind))add('familles-drones','Les familles de drones et leur histoire');
      else if(/rafale|mirage 2000/.test(name))add('reconnaitre-rafale-mirage-2000','Reconnaître Rafale et Mirage 2000');
      else add('radar-sonar','Détection et observation : les principes du radar et du sonar');
    }else if(item.category==='mer'){
      if(/sous-marin/.test(kind)){
        if(/nucleaire/.test(kind)||/suffren|virginia|astute|seawolf|los angeles|akula|ohio/.test(name))add('sna-snle','SNA et SNLE : deux familles de missions');
        add('radar-sonar','Radar et sonar : comprendre la détection');
      }else if(/porte-avions|porte-aeronefs/.test(kind))add('porte-avions-groupe-aeronaval','L’histoire et les fonctions du groupe aéronaval');
      else add('fregate-destroyer-corvette','Frégate, destroyer et corvette : les repères');
    }
    if(name==='rafale')links.push({url:'variantes-rafale.html',title:'Rafale C, B, M et standards : comprendre les versions'});
    if(name==='leopard 2')links.push({url:'variantes-leopard-2.html',title:'Leopard 2 A4, A6 et A7V : comparer les évolutions'});
    return links;
  }
  window.RADAR_DISCOVERY=Object.freeze({fold,slug,profileURL,description,essentials,rank,guideLinks,guideKeywords});
  if(typeof document==='undefined')return;
  // Complète les menus existants sans ajouter un second mécanisme d'ouverture.
  const menuButton=document.querySelector('.menu-toggle'),mainNav=document.getElementById('main-nav');
  if(menuButton&&mainNav&&document.addEventListener){
    const closeMenu=()=>{mainNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Ouvrir le menu');};
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
    document.addEventListener('click',event=>{if(menuButton.getAttribute('aria-expanded')==='true'&&!event.target.closest('.main-nav')&&!event.target.closest('.menu-toggle'))closeMenu();});
  }
  for(const path of document.querySelectorAll('[data-reading-path]')){
    const steps=[...path.querySelectorAll('[data-reading-step]')],status=path.querySelector('.reading-path-status');
    const update=()=>{const n=steps.filter(step=>step.checked).length;status.textContent=n+' / '+steps.length+' étapes cochées'+(n===steps.length?' · Parcours terminé ! Tu peux refaire le quiz ou poursuivre ta lecture.':'');};
    for(const label of path.querySelectorAll('.reading-step-check'))label.hidden=false;
    path.querySelector('.reading-path-controls').hidden=false;
    for(const step of steps)step.addEventListener('change',update);
    path.querySelector('[data-reading-reset]').addEventListener('click',()=>{for(const step of steps)step.checked=false;update();});
    update();
  }
  const filters=document.getElementById('learning-filters');
  if(filters){
    const cards=[...document.querySelectorAll('[data-guide-categories]')];
    const buttons=[...filters.querySelectorAll('[data-guide-filter]')];
    const status=document.getElementById('learning-filter-status');
    for(const button of buttons)button.addEventListener('click',()=>{
      const theme=button.dataset.guideFilter;
      for(const card of cards)card.hidden=theme!=='all'&&!card.dataset.guideCategories.split(' ').includes(theme);
      for(const other of buttons)other.setAttribute('aria-pressed',String(other===button));
      const count=cards.filter(card=>!card.hidden).length;
      status.textContent=count+' dossier'+(count>1?'s':'')+' · '+button.textContent;
    });
    filters.hidden=false;
  }
  const glossary=document.getElementById('glossary-search');
  if(glossary){
    const entries=[...document.querySelectorAll('[data-glossary-term]')];
    const count=document.getElementById('glossary-count');
    const update=()=>{const query=fold(glossary.value).trim();for(const entry of entries)entry.hidden=!fold(entry.dataset.glossaryTerm).includes(query);const n=entries.filter(e=>!e.hidden).length;count.textContent=n?n+' définition'+(n>1?'s':''):'Aucun terme trouvé. Essaie un autre mot ou efface la recherche.';};
    glossary.addEventListener('input',update);
    document.getElementById('glossary-search-wrap').hidden=false;
    update();
  }
  for(const form of document.querySelectorAll('.learning-quiz-form')){
    const fields=[...form.querySelectorAll('fieldset')],score=form.querySelector('.learning-quiz-score');
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const selected=fields.map(field=>[...field.querySelectorAll('input')].find(input=>input.checked));
      if(selected.some(input=>!input)){score.textContent='Choisis une réponse à chacune des trois questions.';return;}
      let total=0;
      fields.forEach((field,i)=>{const correct=selected[i].value===field.dataset.answer,feedback=field.querySelector('.learning-quiz-feedback');if(correct)total++;feedback.textContent=(correct?'✓ Bonne réponse. ':'À retenir : '+feedback.dataset.correct+'. ')+feedback.dataset.explanation;feedback.dataset.result=correct?'correct':'review';feedback.hidden=false;});
      score.textContent=total+' / '+fields.length+' · '+(total===fields.length?'Les repères sont acquis !':'Relis les explications, puis réessaie si tu le souhaites.');
    });
    form.addEventListener('reset',()=>{for(const field of fields)field.querySelector('.learning-quiz-feedback').hidden=true;score.textContent='';});
    form.hidden=false;
  }
})();
