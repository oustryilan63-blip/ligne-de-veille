(() => {
  'use strict';
  const labels={beginner:'Débutant',standard:'Standard',expert:'Expert'};
  function mount(host,change,{collectionAllowed=true}={}){
    const query=new URLSearchParams(location.search),config={level:Object.hasOwn(labels,query.get('niveau'))?query.get('niveau'):'standard',scope:collectionAllowed&&query.get('collection')==='1'?'collection':'all'};
    const levelLabel=document.createElement('label');levelLabel.textContent='Difficulté';const level=document.createElement('select');level.id='quiz-difficulty';for(const [key,label]of Object.entries(labels)){const o=document.createElement('option');o.value=key;o.textContent=label;level.append(o)}level.value=config.level;levelLabel.append(level);host.append(levelLabel);
    let scope;if(collectionAllowed){const scopeLabel=document.createElement('label');scopeLabel.textContent='Sélection';scope=document.createElement('select');scope.id='quiz-scope';for(const [key,label]of [['all','Tous les engins'],['collection','Ma collection']]){const o=document.createElement('option');o.value=key;o.textContent=label;scope.append(o)}scope.value=config.scope;scopeLabel.append(scope);host.append(scopeLabel);}
    const note=document.createElement('p');note.id='quiz-settings-note';host.append(note);
    function describe(){const count=window.RADAR_COLLECTION?.names().length||0;if(scope)scope.options[1].textContent='Ma collection ('+count+')';const country=document.body.dataset.quiz==='pays';note.textContent=country?(config.level==='expert'?'3 tentatives, sans indice.':config.level==='beginner'?'5 tentatives ; un repère est affiché dès le départ.':'5 tentatives ; un indice est disponible.'):(config.level==='beginner'?'Des choix de silhouettes plus différentes ; une image moins recadrée dans Zoom mystère.':config.level==='expert'?'Des engins proches mais de familles distinctes ; aucun indice dans le quiz de noms.':'Quatre propositions, sans proposer deux variantes de la famille recherchée.');if(config.scope==='collection')note.textContent+=' Questions limitées aux engins de ta collection.';}
    level.addEventListener('change',()=>{config.level=level.value;describe();change()});scope?.addEventListener('change',()=>{config.scope=scope.value;describe();change()});
    window.addEventListener('radar-collection-change',()=>{describe();if(config.scope==='collection')change()});describe();
    return {config,label:()=>labels[config.level],pool:(items,category='all')=>items.filter(e=>(category==='all'||e.category===category)&&(config.scope!=='collection'||window.RADAR_COLLECTION?.has(e.name)))};
  }
  window.RADAR_QUIZ=Object.freeze({mount,labels});
})();
