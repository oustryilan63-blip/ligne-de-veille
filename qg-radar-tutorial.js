/* Le tutoriel ne lit ni ne modifie la sauvegarde de campagne. */
(()=>{
 'use strict';
 const E=window.QG,$=id=>document.getElementById(id),KEY='radar-qg-tutorial-seen-v1';
 const steps=[
  {title:'Bienvenue aux Aigrettes.',section:'PRENDRE SES REPÈRES',art:'radar',body:'Tu diriges une base pendant 12 semaines. À chaque semaine, tu choisis deux décisions : une mission, une réparation, une amélioration, une formation ou du repos.',tip:'Ce tutoriel est un entraînement séparé. Ta campagne, ton budget et tes scores restent intacts.'},
  {title:'1. Envoyer un engin en mission',section:'ONGLET MISSIONS',art:'rafale',body:'Choisis une mission puis un engin de la bonne catégorie. Il doit avoir au moins 45 points d’état, ne pas avoir déjà été déployé cette semaine, et ton équipe doit avoir la compétence demandée.',tip:'Ici, le Rafale part pour 12 crédits et rapporte 34 crédits : tu gagnes 22 crédits nets. Il perd 18 points d’état. Une décision est utilisée.',button:'Essayer : envoyer le Rafale',action:{type:'mission',id:'1-0',unit:'rafale'}},
  {title:'2. Entretenir la flotte',section:'ONGLET FLOTTE',art:'rafale',body:'Les missions usent tes engins. Dans « Flotte », tu vois leur état et leur disponibilité. Une réparation coûte 18 crédits et une décision ; elle rend jusqu’à 38 points d’état avec l’atelier de départ.',tip:'Répare maintenant le Rafale de notre exemple. Un état de 100 est le maximum ; le lien « Histoire » permet de découvrir chaque engin.',button:'Essayer : réparer le Rafale',action:{type:'repair',id:'rafale'}},
  {title:'3. Passer à la semaine suivante',section:'LE BRIEF À DROITE DE LA CARTE',art:'port',body:'Tu as utilisé tes deux décisions. « Terminer la semaine » renouvelle tes décisions et la disponibilité des engins. Tu reçois la dotation, tu paies l’entretien, puis un événement se produit.',tip:'Au départ : +46 crédits de dotation et −28 d’entretien, soit +18 avant l’événement. Ses effets sont déjà appliqués quand tu lis le brief.',button:'Essayer : terminer la semaine',action:{type:'next'}},
  {title:'4. Améliorer les installations',section:'ONGLET BASE',art:'ecole',body:'Chaque bâtiment possède trois niveaux. Passer du niveau 1 au niveau 2 coûte 35 crédits et une décision. L’amélioration suivante coûte 70 crédits. Chaque niveau ajoute 2 crédits d’entretien par semaine.',tip:'Améliorons l’école : les prochaines formations donneront alors +2 de compétence au lieu de +1. L’atelier améliore les réparations ; le hangar et le port l’entretien automatique ; le radar la dotation.',button:'Essayer : améliorer l’école',action:{type:'upgrade',id:'ecole'}},
  {title:'5. Former et ménager l’équipe',section:'ONGLET BASE · ÉQUIPE',art:'caracal',body:'Une formation coûte 25 crédits et une décision. Avec l’école de niveau 2, notre équipe va passer de 1 à 3 de compétence. Il faut une compétence de 2 dès la semaine 5, puis de 3 dès la semaine 9.',tip:'Le repos est une autre décision : il rend jusqu’à 18 points de moral, sans coût en crédits. Le moral compte dans ton bilan final.',button:'Essayer : former l’équipe',action:{type:'train'}},
  {title:'À toi de diriger la base !',section:'LE CAP DES 12 SEMAINES',art:'radar',body:'Le bilan comporte cinq objectifs : 12 missions, 5 améliorations, un état moyen de 75, un moral de 90 et 200 crédits en réserve. Tu marques des points progressivement, jusqu’à 1 000.',tip:'Conseil : alterne missions et investissements. Garde du budget pour réparer et forme l’équipe avant les semaines 5 et 9. Tu peux rouvrir ce tutoriel à tout moment.'}
 ];
 // Chaque écran conserve son exemple, même après un retour en arrière.
 let demo=E.fresh(2026);const before=[],after=[];
 steps.forEach((step,i)=>{before[i]=JSON.parse(JSON.stringify(demo));if(step.action){const result=E.action(demo,step.action);if(!result.ok)throw Error('Exemple du tutoriel invalide : '+result.message);demo=result.state;after[i]=result;}else after[i]=null;});
 let index=0,tried=new Set(),opener=null;
 const dialog=$('qg-tutorial');
 function seen(){try{localStorage.setItem(KEY,'1');}catch{}}
 function close(){dialog.close();seen();opener?.focus();}
 function render(){
  const step=steps[index],result=tried.has(index)?after[index]:null,s=result?.state||before[index];
  $('qg-tutorial-step').textContent=`ÉTAPE ${index+1} / ${steps.length} · ${step.section}`;
  $('qg-tutorial-title').textContent=step.title;$('qg-tutorial-body').textContent=step.body;$('qg-tutorial-tip').textContent=step.tip;
  $('qg-tutorial-meter').value=index+1;
  $('qg-tutorial-budget').textContent=s.cash+' cr.';$('qg-tutorial-decisions').textContent=s.actions+' / 2';$('qg-tutorial-week').textContent=s.week+' / 12';
  $('qg-tutorial-result').textContent=result?result.message:step.action?'Clique pour essayer cette décision dans l’entraînement.':'Aucune décision de ta campagne ne sera utilisée.';
  const attempt=$('qg-tutorial-try');attempt.hidden=!step.action;attempt.disabled=!!result;attempt.textContent=result?'✓ Exemple réalisé':step.button||'';
  $('qg-tutorial-back').disabled=index===0;const next=$('qg-tutorial-next');next.disabled=!!step.action&&!result;next.textContent=index===steps.length-1?'Terminer le tutoriel →':'Continuer →';
  paintArt();
  $('qg-tutorial-title').focus();dialog.scrollTop=0;
 }
 function paintArt(){
  const step=steps[index],s=(tried.has(index)?after[index]?.state:null)||before[index];
  const canvas=$('qg-tutorial-art'),c=canvas.getContext('2d');c.clearRect(0,0,320,160);c.imageSmoothingEnabled=false;
  if(E.buildings.some(b=>b.id===step.art))window.QG_ART.building(c,step.art,160,116,s.buildings[step.art],0,1.2,true);
  else window.QG_ART.sprite(c,step.art,160,100,1.65);
  canvas.setAttribute('aria-label',E.units.find(u=>u.id===step.art)?.name||E.buildings.find(b=>b.id===step.art)?.name||'Base Radar');
 }
 window.QG_ART.ready?.then(paintArt);
 function open(){opener=document.activeElement;index=0;tried=new Set();dialog.showModal();render();}
 $('qg-tutorial-open').addEventListener('click',open);$('qg-tutorial-close').addEventListener('click',close);
 dialog.addEventListener('cancel',()=>{seen();});
 $('qg-tutorial-try').addEventListener('click',()=>{tried.add(index);render();$('qg-tutorial-next').focus();});
 $('qg-tutorial-back').addEventListener('click',()=>{if(index>0){index--;render();}});
 $('qg-tutorial-next').addEventListener('click',()=>{if(steps[index].action&&!tried.has(index))return;if(index===steps.length-1)close();else{index++;render();}});
 let show=true;try{show=localStorage.getItem(KEY)!=='1';}catch{}
 if(show)open();
})();
