/* Préférences des contenus tiers et effacement limité aux données de Radar. */
(() => {
 'use strict';
 const KEY='radar-external-consent-v1',LIFE=180*24*60*60*1000;
 const gameKeys=new Set(['ldv-progression-v1','radar-collection-v1','radar-qg-campaign-v1','radar-qg-training-content-v1','radar-qg-tutorial-seen-v1']);
 let memory=null,dialog=null,pending=null,opener=null;
 const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 function record(){let raw=memory;try{const saved=localStorage.getItem(KEY);if(saved)raw=JSON.parse(saved);}catch{}return raw&&raw.version===1&&['accepted','refused'].includes(raw.choice)&&Number.isFinite(raw.expiresAt)&&raw.expiresAt>Date.now()?raw:null;}
 const choice=()=>record()?.choice||null;
 function update(){const status=document.getElementById('privacy-choice-state');if(status)status.textContent=choice()==='accepted'?'Lecteurs Sketchfab autorisés sur ce navigateur.':choice()==='refused'?'Lecteurs Sketchfab refusés sur ce navigateur.':'Aucun choix enregistré pour les lecteurs Sketchfab.';}
 function set(value){if(!['accepted','refused'].includes(value))throw Error('Préférence inconnue.');memory={version:1,choice:value,createdAt:Date.now(),expiresAt:Date.now()+LIFE};let saved=true;try{localStorage.setItem(KEY,JSON.stringify(memory));}catch{saved=false;}update();window.dispatchEvent(new CustomEvent('radar-privacy-change'));return saved;}
 function link(text,href){const a=make('a','',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
 function close(){pending=null;dialog.close();opener?.focus();}
 function modal(){if(dialog)return;dialog=make('dialog','privacy-dialog');dialog.id='privacy-dialog';dialog.setAttribute('aria-labelledby','privacy-dialog-title');const title=make('h2','','Ouvrir le lecteur Sketchfab ?');title.id='privacy-dialog-title';
  const copy=make('p','','Ce contenu est fourni par Sketchfab. Son activation contacte ce service et lui transmet des données techniques de navigation, notamment votre adresse IP. Nous demandons le mode sans suivi du lecteur ; les cookies et traitements de son fonctionnement restent soumis à sa politique.');
  const policies=make('p');policies.append(link('Confidentialité de Sketchfab (en anglais)','https://sketchfab.com/privacy'),' · ',link('Conditions de Sketchfab (en anglais)','https://sketchfab.com/terms'));
  const age=make('label','privacy-age'),check=make('input');check.type='checkbox';check.id='privacy-age';age.append(check,' Je remplis les conditions d’âge de Sketchfab (18 ans ou plus).');
  const accept=make('button','button button-accent','Autoriser Sketchfab et ouvrir la 3D');accept.type='button';accept.disabled=true;check.addEventListener('change',()=>{accept.disabled=!check.checked;});
  const refuse=make('button','button button-light','Continuer avec les photos');refuse.type='button';const controls=make('div','privacy-actions');controls.append(accept,refuse);
  const note=make('p','trust-small','Votre choix est conservé jusqu’à 180 jours. Vous pouvez le retirer dans Confidentialité. Les photos, les fiches et les jeux restent accessibles lorsque vous refusez.');
  accept.addEventListener('click',()=>{if(!check.checked)return;const callback=pending;const saved=set('accepted');close();callback?.();if(!saved)update();});refuse.addEventListener('click',()=>{set('refused');close();});dialog.addEventListener('cancel',()=>{pending=null;opener?.focus();});dialog.append(title,copy,policies,age,controls,note);document.body.append(dialog);
 }
 function request(callback){if(choice()==='accepted'){callback();return;}modal();pending=callback;opener=document.activeElement;const check=dialog.querySelector('input');check.checked=false;dialog.querySelector('button').disabled=true;dialog.showModal();check.focus();}
 function ownKey(key){return gameKeys.has(key)||/^ldv-defi-\d{4}-\d{2}-\d{2}$/.test(key)||key===KEY;}
 function erase(storage=localStorage){const keys=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(ownKey(key))keys.push(key)}let failed=0;for(const key of keys)try{storage.removeItem(key)}catch{failed++;}memory=null;try{sessionStorage.removeItem('radar-import-done')}catch{}update();window.dispatchEvent(new CustomEvent('radar-privacy-change'));return {removed:keys.length-failed,failed};}
 window.RADAR_PRIVACY=Object.freeze({choice,request,set,erase,ownKey});
 window.addEventListener('storage',e=>{if(e.key===KEY){memory=null;update();window.dispatchEvent(new CustomEvent('radar-privacy-change'));}});
 document.getElementById('privacy-allow')?.addEventListener('click',()=>request(update));
 document.getElementById('privacy-refuse')?.addEventListener('click',()=>set('refused'));
 const deletion=document.getElementById('privacy-delete-dialog'),status=document.getElementById('privacy-delete-status');
 document.getElementById('privacy-erase')?.addEventListener('click',()=>deletion.showModal());
 document.getElementById('privacy-delete-cancel')?.addEventListener('click',()=>deletion.close());
 document.getElementById('privacy-delete-confirm')?.addEventListener('click',()=>{const result=erase();deletion.close();status.textContent=result.failed?'Certaines données n’ont pas pu être effacées. Vous pouvez les supprimer dans les paramètres du navigateur.':'Les données locales de Radar ont été effacées sur ce navigateur. Vos fichiers de sauvegarde téléchargés et vos e-mails restent sous votre contrôle.';});
 update();
})();
