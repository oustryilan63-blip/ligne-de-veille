(() => {
  'use strict';
  const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  function mount(news,{dateLabel,monthFormatter,shortDateFormatter,parsedDate}){
    const tools=window.RADAR_NEWS_TOOLS,search=document.getElementById('news-search'),sourceSelect=document.getElementById('news-source-filter'),themeSelect=document.getElementById('news-theme-filter'),photosOnly=document.getElementById('news-photos-only'),grid=document.getElementById('news-grid'),archive=document.getElementById('archive-list'),more=document.getElementById('news-more');
    let limit=4,current=[],archiveDirty=true;
    const archiveDetails=document.getElementById('archive-details');
    const activeSummary=document.getElementById('news-active-summary'),activeChips=document.getElementById('news-active-filters'),clearSearch=document.getElementById('news-clear-search'),empty=document.getElementById('news-empty'),compact=document.getElementById('news-compact');
    const filterToggle=document.getElementById('news-filters-toggle'),filterPanel=document.getElementById('news-filters-panel'),filterState=document.getElementById('news-filters-state');
    filterToggle?.addEventListener('click',()=>{filterPanel.hidden=!filterPanel.hidden;filterToggle.setAttribute('aria-expanded',String(!filterPanel.hidden));});
    filterPanel?.addEventListener('keydown',event=>{if(event.key==='Escape'){filterPanel.hidden=true;filterToggle.setAttribute('aria-expanded','false');filterToggle.focus();}});
    const indexed=news.items.map(item=>({item,image:tools.image(item),themes:tools.themes(item),matches:tools.related(item),text:tools.fold([item.title,item.source,item.summary,item.sourceExcerpt?.text].join(' '))}));
    for(const source of [...new Set(news.items.map(i=>i.source))].sort((a,b)=>a.localeCompare(b,'fr'))){const o=make('option','',source);o.value=source;sourceSelect.append(o)}
    for(const theme of tools.themeNames){const o=make('option','',theme);o.value=theme;themeSelect.append(o)}
    if(window.location?.href&&new URL(window.location.href).searchParams.get('theme')==='geopolitique'){themeSelect.value='Géopolitique';limit=12;}
    function selectionSummary(){
      if(clearSearch)clearSearch.hidden=!search.value.trim();
      if(!activeSummary||!activeChips)return;
      activeChips.replaceChildren();
      const chip=(label,clear)=>{const button=make('button','news-filter-chip');button.type='button';button.setAttribute('aria-label','Retirer le filtre '+label);const cross=make('span','news-chip-cross','×');cross.setAttribute('aria-hidden','true');button.append(make('span','',label),cross);button.addEventListener('click',()=>{clear();change();const next=activeChips.querySelector('button');if(next)next.focus();else search.focus();});activeChips.append(button);};
      if(search.value.trim())chip('Recherche : '+search.value.trim(),()=>{search.value='';});
      if(sourceSelect.value)chip('Source : '+sourceSelect.value,()=>{sourceSelect.value='';});
      if(themeSelect.value)chip('Thème : '+themeSelect.value,()=>{themeSelect.value='';});
      if(photosOnly.checked)chip('Avec photo',()=>{photosOnly.checked=false;});
      activeSummary.hidden=activeChips.children.length===0;
    }
    function render(){
      const query=tools.fold(search.value).trim().split(/\s+/).filter(Boolean),filtered=Boolean(query.length||sourceSelect.value||themeSelect.value||photosOnly.checked);
      const activeFilters=Number(Boolean(sourceSelect.value))+Number(photosOnly.checked);
      if(filterState)filterState.textContent=activeFilters?activeFilters+' actif'+(activeFilters>1?'s':''):'Source et photo';
      filterToggle?.classList.toggle('has-active-filters',activeFilters>0);
      selectionSummary();
      const matching=indexed.filter(r=>/^https:\/\//.test(r.item.url)&&(!sourceSelect.value||r.item.source===sourceSelect.value)&&(!themeSelect.value||r.themes.includes(themeSelect.value))&&query.every(word=>r.text.includes(word)));
      const rows=photosOnly.checked?matching.filter(r=>r.image):matching;
      const items=rows.map(r=>r.item);current=items;archiveDirty=true;
      grid.replaceChildren();
      for(const {item,matches,themes} of rows.slice(0,limit)){
        const entry=make('article','news-entry'),card=make('a','news-card');card.href=item.url;card.target='_blank';card.rel='noopener noreferrer';
        const date=make('span','news-date',dateLabel(item.date)),main=make('span','news-main'),source=make('span','news-source',item.sourceType+' · '+item.source+(item.language==='en'?' · en anglais':'')),title=make('strong','',item.title),summary=make('small');
        if(item.sourceExcerpt?.text?.trim()&&!/conflits/i.test(item.source)){summary.append(make('span','news-summary-label','Extrait de l’éditeur'),document.createTextNode('« '+item.sourceExcerpt.text+' »'));}
        else if(!item.autoCollected&&item.summary?.trim())summary.textContent=item.summary;
        main.append(date,source);
        if(themes.includes('Géopolitique'))main.append(make('span','news-theme-tag','Géopolitique'));
        main.append(title);if(summary.textContent)main.append(summary);
        main.append(make('span','news-read','Lire l’article'+(item.language==='en'?' en anglais':'')+' chez '+item.source+' ↗'));
        if(!item.autoCollected&&item.why){const why=make('span','news-why');why.append(make('b','','À retenir'),make('span','',item.why));main.append(why)}
        const visual=tools.image(item),arrow=make('span','news-arrow','↗');arrow.setAttribute('aria-hidden','true');
        if(visual){
          const media=make('span','news-media'),img=make('img','news-thumb'),badge=make('span','news-image-label','Image de l’article');
          img.alt=visual.alt;img.width=300;img.height=190;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.src=visual.src;media.append(img,badge);card.append(media);
          const credit=make('div','news-image-credit'),sourceLink=make('a','',visual.credit.length>180?'Source de la photographie':visual.credit);sourceLink.href=visual.rightsUrl||visual.sourceUrl;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';credit.append(sourceLink);
          if(visual.licenseUrl){const licenseLink=make('a','',visual.license);licenseLink.href=visual.licenseUrl;licenseLink.target='_blank';licenseLink.rel='noopener noreferrer';credit.append(document.createTextNode(' · '),licenseLink)}
          if(visual.caption||visual.credit.length>180){const details=make('details','news-credit-details'),summary=make('summary','','Crédit et légende de l’éditeur');details.append(summary,make('p','',visual.caption||visual.credit));credit.append(details);}
          img.addEventListener('error',()=>{media.remove();credit.remove();card.classList.add('news-card-text-only')},{once:true});card.append(main,arrow);entry.append(card,credit);
        }else{card.classList.add('news-card-text-only');card.append(main,arrow);entry.append(card)}
        if(matches.length){const links=make('div','news-related');links.setAttribute('aria-label','À explorer dans l’atlas');links.append(make('span','','Dans l’atlas :'));for(const {e,i}of matches){const a=make('a','',e.name+' →');a.href='histoire.html?engin='+i;links.append(a)}entry.append(links)}
        const context=tools.context(item);
        if(context){const details=make('details','news-context'),summary=make('summary','','Un repère pour comprendre'),copy=make('p','',context.text),link=make('a','',context.title+' →'),note=make('small','','Explication Radar · lien proposé automatiquement selon les mots du titre, de l’extrait et des catégories. Ce repère ne résume pas l’article.');link.href=context.url;details.append(summary,copy,link,note);entry.append(details)}
        grid.append(entry);
      }
      document.getElementById('news-result-count').textContent=items.length?Math.min(limit,items.length)+' / '+items.length+' publication'+(items.length>1?'s':'')+(filtered?' correspondant aux filtres':''):'Aucune publication ne correspond à ces filtres.';
      more.hidden=items.length<=limit;
      if(empty)empty.hidden=items.length>0;
      document.getElementById('archive-count').textContent=items.length+' publication'+(items.length>1?'s':'')+(filtered?' filtrée'+(items.length>1?'s':''):'');
      if(archiveDetails?.open)renderArchive();
    }
    function renderArchive(){
      if(!archiveDirty)return;archiveDirty=false;archive.replaceChildren();
      const months=new Map();for(const item of current){const key=item.date.slice(0,7);if(!months.has(key))months.set(key,[]);months.get(key).push(item)}
      for(const [month,rows]of months){const group=make('div','archive-month'),heading=make('h3','',monthFormatter.format(parsedDate(month+'-01'))),list=make('ul');for(const item of rows){const row=make('li'),a=make('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';const time=make('time','',shortDateFormatter.format(parsedDate(item.date)));time.dateTime=item.date;a.append(time,make('strong','',item.title),make('span','',item.source+(item.language==='en'?' · en anglais':'')));row.append(a);list.append(row)}group.append(heading,list);archive.append(group)}
    }
    function change(){limit=search.value.trim()||sourceSelect.value||themeSelect.value||photosOnly.checked?12:4;render()}
    function reset(){search.value=sourceSelect.value=themeSelect.value='';photosOnly.checked=false;change();search.focus();}
    clearSearch?.addEventListener('click',()=>{search.value='';change();search.focus();});
    document.getElementById('news-clear-active')?.addEventListener('click',reset);
    document.getElementById('news-empty-reset')?.addEventListener('click',reset);
    compact?.addEventListener('click',()=>{const enabled=compact.getAttribute('aria-pressed')!=='true';compact.setAttribute('aria-pressed',String(enabled));grid.classList.toggle('is-compact',enabled);});
    archiveDetails?.addEventListener('toggle',()=>{if(archiveDetails.open)renderArchive()});
    search.addEventListener('input',change);sourceSelect.addEventListener('change',change);themeSelect.addEventListener('change',change);photosOnly.addEventListener('change',change);more.addEventListener('click',()=>{limit+=8;render()});document.getElementById('news-reset').addEventListener('click',reset);render();
  }
  window.RADAR_NEWS_VIEW=Object.freeze({mount});
})();
