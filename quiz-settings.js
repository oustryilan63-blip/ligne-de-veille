(() => {
  'use strict';
  const labels={beginner:'Facile',standard:'Normal',expert:'Difficile'};
  function mount(host,change,{collectionAllowed=true}={}){
    const game=document.body.dataset.quiz==='pays'?'pays':document.body.dataset.game||'recognition';
    const query=new URLSearchParams(location.search),requested=Number(query.get('questions')),config={questions:[5,10,20].includes(requested)?requested:5,level:Object.hasOwn(labels,query.get('niveau'))?query.get('niveau'):'standard',scope:collectionAllowed&&query.get('collection')==='1'?'collection':'all'};
    const levelLabel=document.createElement('label');levelLabel.textContent='Difficulté';const level=document.createElement('select');level.id='quiz-difficulty';for(const [key,label]of Object.entries(labels)){const o=document.createElement('option');o.value=key;o.textContent=label;level.append(o)}level.value=config.level;levelLabel.append(level);host.append(levelLabel);
    let scope;if(collectionAllowed){const scopeLabel=document.createElement('label');scopeLabel.textContent='Sélection';scope=document.createElement('select');scope.id='quiz-scope';for(const [key,label]of [['all','Tous les engins'],['collection','Ma collection']]){const o=document.createElement('option');o.value=key;o.textContent=label;scope.append(o)}scope.value=config.scope;scopeLabel.append(scope);host.append(scopeLabel);}
    let length,lengthNote;if(game!=='chrono'){
      const lengthLabel=document.createElement('label');lengthLabel.textContent='Questions';length=document.createElement('select');length.id='quiz-length';
      for(const count of [5,10,20]){const option=document.createElement('option');option.value=String(count);option.textContent=count+' questions';length.append(option);}length.value=String(config.questions);lengthLabel.append(length);host.append(lengthLabel);
      lengthNote=document.createElement('p');lengthNote.id='quiz-length-note';lengthNote.hidden=true;host.append(lengthNote);
    }
    const note=document.createElement('p');note.id='quiz-settings-note';host.append(note);
    function describe(){
      const count=window.RADAR_COLLECTION?.names().length||0;if(scope)scope.options[1].textContent='Ma collection ('+count+')';
      const common={beginner:'Engins connus et silhouettes familières. ',standard:'Engins de difficulté intermédiaire. ',expert:'Engins moins courants. '};
      const descriptions={
        pays:{beginner:'5 tentatives. Un repère est affiché dès le départ.',standard:'5 tentatives. Un indice est disponible.',expert:'3 tentatives, sans indice.'},
        recognition:{beginner:'En QCM : une réponse parmi quatre noms. En réponse libre : 4 essais. Le pays est indiqué dès le départ.',standard:'En QCM : une réponse parmi quatre noms. En réponse libre : 3 essais. Un indice de pays est disponible.',expert:'Une seule tentative, en QCM comme en réponse libre. Aucun indice de pays.'},
        zoom:{beginner:config.questions+' photos à reconnaître parmi quatre noms. Le zoom de départ est plus large.',standard:config.questions+' photos à reconnaître parmi quatre noms. Chaque photo se dévoile en cinq niveaux de zoom.',expert:config.questions+' photos à reconnaître parmi quatre noms. Le zoom de départ est plus serré.'},
        chrono:{beginner:'Deux séries de quatre premiers vols à remettre dans l’ordre. Les appareils les plus familiers sont privilégiés.',standard:'Deux séries de quatre premiers vols à remettre dans l’ordre. Les dates et les sources apparaissent après vérification.',expert:'Deux séries de quatre premiers vols à remettre dans l’ordre, avec des appareils moins familiers.'},
        'vrai-faux':{beginner:config.questions+' affirmations sur des engins familiers. Réponds Vrai ou Faux, puis lis l’explication sourcée.',standard:config.questions+' affirmations. Réponds Vrai ou Faux, puis lis l’explication sourcée.',expert:config.questions+' affirmations sur des engins moins familiers. Réponds Vrai ou Faux, puis lis l’explication sourcée.'}
      };
      note.textContent=(['chrono','vrai-faux'].includes(game)?'':common[config.level])+(descriptions[game]||descriptions.recognition)[config.level];
      if(config.scope==='collection')note.textContent+=' Questions limitées aux engins de ta collection ; le niveau ajuste les aides.';
    }
    length?.addEventListener('change',()=>{config.questions=Number(length.value);describe();change()});
    level.addEventListener('change',()=>{config.level=level.value;describe();change()});scope?.addEventListener('change',()=>{config.scope=scope.value;describe();change()});
    window.addEventListener('radar-collection-change',()=>{describe();if(config.scope==='collection')change()});describe();
    return {config,take:items=>{const selected=items.slice(0,config.questions);if(lengthNote){lengthNote.hidden=items.length===0||items.length>=config.questions;lengthNote.textContent=lengthNote.hidden?'':items.length+' question'+(items.length>1?'s':'')+' disponible'+(items.length>1?'s':'')+' dans cette sélection. La partie est limitée à ce nombre.';}return selected;},label:()=>labels[config.level],pool:(items,category='all')=>{const selected=items.filter(e=>(category==='all'||e.category===category)&&(config.scope!=='collection'||window.RADAR_COLLECTION?.has(e.name)));return config.scope==='collection'?selected:window.RADAR_CATALOGUE.levelPool(selected,config.level)}};
  }
  window.RADAR_QUIZ=Object.freeze({mount,labels});
})();
