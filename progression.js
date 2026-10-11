(() => {
  'use strict';
  const KEY='ldv-progression-v1';
  const games={pays:['D’où vient cet engin ?','jeux.html'],recognition:['Quel est cet engin ?','devine-engin.html'],zoom:['Zoom mystère','zoom-mystere.html'],chrono:['Chrono défense','chrono-defense.html'],'vrai-faux':['Vrai ou faux ?','vrai-ou-faux.html'],quotidien:['Défi du jour','defi-du-jour.html'],radar:['Alerte radar','alerte-radar.html']};
  const blank=()=>({version:1,games:{},missed:[],correct:0,reviewed:0,days:[]});
  let data=blank(),persistent=true;
  try {const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1&&saved.games&&typeof saved.games==='object'&&!Array.isArray(saved.games)&&Array.isArray(saved.missed)){data={...blank(),...saved};data.missed=data.missed.filter(x=>x&&games[x.game]&&typeof x.id==='string'&&typeof x.label==='string').map(x=>({...x,key:x.game+'|'+x.id,payload:x.payload&&typeof x.payload==='object'?x.payload:{}}));}}
  catch {persistent=false;}
  const number=v=>Number.isFinite(v)&&v>=0?v:0;
  data.correct=number(data.correct);data.reviewed=number(data.reviewed);data.days=Array.isArray(data.days)?data.days.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)):[];
  for(const [id,record] of Object.entries(data.games)){if(!games[id]||!record||typeof record!=='object'){delete data.games[id];continue}record.played=number(record.played);record.perfect=number(record.perfect);if(record.best&&(!Number.isFinite(record.best.percent)||!Number.isFinite(record.best.score)||!Number.isFinite(record.best.max)||record.best.max<=0))record.best=null;}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data));persistent=true}catch{persistent=false}render();}
  const copy=v=>JSON.parse(JSON.stringify(v));
  function answer(game,id,ok,label,payload={}){
    if(!games[game]||typeof id!=='string')return;
    const key=game+'|'+id,index=data.missed.findIndex(x=>x.key===key);
    if(ok){data.correct++;if(index>=0)data.missed.splice(index,1);}
    else {const entry={key,game,id,label,payload};if(index<0)data.missed.push(entry);else data.missed[index]=entry;}
    save();
  }
  function complete(game,score,max,mode='Standard',day){
    if(!games[game]||!Number.isFinite(score)||!Number.isFinite(max)||max<=0||score<0||score>max)return;
    if(day){if(data.days.includes(day))return;data.days.push(day);}
    const record=data.games[game]||{played:0,best:null,perfect:0};record.played=number(record.played)+1;
    const percent=Math.round(score/max*100),run={score,max,percent,mode};
    if(!record.best||percent>record.best.percent||(percent===record.best.percent&&max>record.best.max))record.best=run;
    if(score===max)record.perfect=number(record.perfect)+1;
    data.games[game]=record;save();
  }
  function review(key,ok){const i=data.missed.findIndex(x=>x.key===key);if(i>=0&&ok){data.missed.splice(i,1);data.reviewed++;save();}}
  function stats(){const records=Object.values(data.games);return {played:records.reduce((n,r)=>n+number(r.played),0),explored:records.filter(r=>r.played>0).length,perfect:records.some(r=>r.perfect>0)}}
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function render(){
    document.querySelectorAll('[data-progress-strip]').forEach(box=>{
      const game=box.dataset.progressStrip,record=data.games[game],n=data.missed.filter(x=>x.game===game).length;
      const status=el('span','progress-record',record?.best?`Meilleur score : ${record.best.score}/${record.best.max} · ${record.best.percent} %`:'Ton premier record reste à écrire.');
      const link=el('a','progress-link',n?`Réviser mes erreurs (${n}) →`:'Mon carnet de joueur →');link.href=n?'revision.html?jeu='+encodeURIComponent(game):'tous-les-jeux.html#progression';
      box.replaceChildren(status,link);
      for(const end of document.querySelectorAll('#game-end, #recognition-end, #arcade-end, #radar-end')){
        let action=end.querySelector('.progress-finish');if(!action){action=el('p','progress-finish');end.append(action)}
        const reviewLink=el('a','progress-link',n?`Réviser mes erreurs (${n}) →`:'Voir mes scores et mes badges →');reviewLink.href=link.href;action.replaceChildren(reviewLink);
      }
    });
    const host=document.getElementById('progression');if(!host)return;
    const s=stats();host.replaceChildren();
    host.append(el('span','eyebrow','TON CARNET DE JOUEUR'),el('h2','','Apprendre. Revenir. Progresser.'),el('p','progress-note',persistent?'Scores et erreurs enregistrés sur ce navigateur, sans compte. Ils ne se synchronisent pas entre appareils.':'Le stockage est indisponible : ta progression reste disponible pendant cette page seulement.'));
    const gameCount=Object.keys(games).length;
    const summary=el('div','progress-summary');for(const [n,label] of [[s.played,'parties terminées'],[s.explored+'/'+gameCount,'jeux explorés'],[data.missed.length,'questions à réviser']]){const box=el('div');box.append(el('strong','',String(n)),el('span','',label));summary.append(box)}host.append(summary);
    const badges=el('ul','progress-badges');
    for(const [title,desc,won] of [['Premiers pas','Terminer une partie',s.played>0],['Explorateur',`Terminer une partie dans chacun des ${gameCount} jeux`,s.explored===gameCount],['Sans faute','Atteindre le score maximal dans une partie',s.perfect],['Curieux','Trouver 25 bonnes réponses',data.correct>=25],['Persévérant','Corriger 5 erreurs en révision',data.reviewed>=5]]){const li=el('li',won?'earned':'');li.append(el('strong','',(won?'✓ ':'○ ')+title),el('span','',desc));badges.append(li)}host.append(badges);
    const records=el('div','progress-records');
    for(const [id,[name,url]] of Object.entries(games)){const r=data.games[id],card=el('article');card.append(el('h3','',name),el('strong','',r?.best?`${r.best.score}/${r.best.max} · ${r.best.percent} %`:'Pas encore de record'),el('p','',r?.best?`${r.played} partie${r.played>1?'s':''} · ${r.best.mode}`:'Termine une partie pour enregistrer ton score.'));const a=el('a','',r?'Rejouer →':'Découvrir →');a.href=url;card.append(a);records.append(card)}host.append(records,el('p','progress-note','Les records utilisent le pourcentage de points obtenus. Le mode est précisé ; les parties de révision ne modifient pas les records.'));
    const actions=el('div','progress-actions'),link=el('a','button button-dark',data.missed.length?`Réviser mes ${data.missed.length} erreur${data.missed.length>1?'s':''} →`:'Découvrir la révision →');link.href='revision.html';actions.append(link);
    const reset=el('details','progress-reset'),summaryReset=el('summary','','Effacer ma progression');reset.append(summaryReset,el('p','','Cela efface les scores, badges et erreurs de ce navigateur. La réponse au défi du jour est conservée.'));const b=el('button','button button-light','Confirmer la remise à zéro');b.type='button';b.addEventListener('click',()=>{data=blank();save();document.getElementById('progression')?.scrollIntoView({block:'start'})});reset.append(b);actions.append(reset);host.append(actions);
  }
  function mount(game){const host=document.querySelector('[data-progress-strip="'+game+'"]');if(host)render();}
  window.LDV_PROGRESS={answer,complete,review,mount,render,missed:game=>copy(data.missed.filter(x=>!game||x.game===game)),snapshot:()=>copy(data),games};
  window.addEventListener('storage',event=>{if(event.key===KEY)location.reload()});
  render();
})();
