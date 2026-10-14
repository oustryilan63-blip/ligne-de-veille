(() => {
  'use strict';
  const $=id=>document.getElementById(id),D=window.RADAR_DISCOVERY;
  const field=$('global-query'),form=$('global-search-form'),status=$('global-search-status'),results=$('global-search-results'),more=$('global-search-more'),retry=$('global-search-retry');
  const labels={engin:'Fiche d’engin',dossier:'Dossier Comprendre',actualite:'Actualité',jeu:'Jeu',comparatif:'Comparatif'};
  const params=new URLSearchParams(location.search);let type=Object.hasOwn(labels,params.get('type'))?params.get('type'):'all',items=[],ready=false,limit=12,timer;
  field.value=(params.get('q')||'').slice(0,180);
  const make=(tag,cls,copy)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(copy!==undefined)node.textContent=copy;return node};
  function link(copy,url,external=false){const a=make('a','',copy);a.href=url;if(external){a.target='_blank';a.rel='noopener noreferrer'}return a}
  function render(){
    if(!ready)return;
    const query=field.value.trim(),found=D.rank(items,query,type),shown=found.slice(0,limit);results.replaceChildren();
    for(const item of shown){
      const article=make('article','search-result');
      if(item.image){const image=make('img');image.src=item.image.src;image.alt=item.image.alt||item.title;image.width=110;image.height=85;image.loading='lazy';image.decoding='async';image.addEventListener('error',()=>image.remove(),{once:true});article.append(image)}
      const copy=make('div');copy.append(make('span','discovery-kicker',labels[item.type]+(item.date?' · '+item.date.split('-').reverse().join('/') :'')));
      const h=make('h2');h.append(link(item.title+(item.external?' ↗':''),item.url,item.external));copy.append(h,make('p','',item.description));
      if(item.image){const c=make('small');c.append(link(item.image.author||'Photo originale',item.image.source,true),' · ',link(item.image.license,item.image.licenseUrl,true));copy.append(c)}
      article.append(copy);results.append(article);
    }
    status.textContent=found.length?shown.length+' / '+found.length+' résultat'+(found.length>1?'s':'')+(query?' pour « '+query+' »':' sur Radar'):'Aucun résultat. Essaie un nom plus court, un pays ou une autre catégorie.';
    more.hidden=shown.length>=found.length;
    document.querySelectorAll('[data-search-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.searchType===type)));
    const next=new URLSearchParams();if(query)next.set('q',query);if(type!=='all')next.set('type',type);
    history.replaceState(null,'','recherche.html'+(next.size?'?'+next.toString():''));
  }
  async function load(){retry.hidden=true;status.textContent='Chargement de la recherche…';try{const response=await fetch('recherche-index.json',{cache:'no-cache'});if(!response.ok)throw Error('Index indisponible');const data=await response.json();if(!Array.isArray(data.items))throw Error('Index incomplet');items=data.items;ready=true;render()}catch{status.textContent='La recherche n’a pas pu charger son catalogue. Réessaie, ou ouvre directement Histoire, Comprendre ou Jeux.';retry.hidden=false}}
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);limit=12;render()});
  field.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{limit=12;render()},150)});
  document.querySelectorAll('[data-search-type]').forEach(b=>b.addEventListener('click',()=>{type=b.dataset.searchType;limit=12;render()}));
  more.addEventListener('click',()=>{limit+=12;render()});retry.addEventListener('click',load);load();
})();
