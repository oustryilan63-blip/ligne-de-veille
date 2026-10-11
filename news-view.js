(() => {
  'use strict';
  const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  function mount(news,{dateLabel,monthFormatter,shortDateFormatter,parsedDate}){
    const tools=window.RADAR_NEWS_TOOLS,search=document.getElementById('news-search'),sourceSelect=document.getElementById('news-source-filter'),themeSelect=document.getElementById('news-theme-filter'),grid=document.getElementById('news-grid'),archive=document.getElementById('archive-list'),more=document.getElementById('news-more');
    let limit=4;
    for(const source of [...new Set(news.items.map(i=>i.source))].sort((a,b)=>a.localeCompare(b,'fr'))){const o=make('option','',source);o.value=source;sourceSelect.append(o)}
    for(const theme of tools.themeNames){const o=make('option','',theme);o.value=theme;themeSelect.append(o)}
    function render(){
      const query=tools.fold(search.value).trim().split(/\s+/).filter(Boolean),filtered=Boolean(query.length||sourceSelect.value||themeSelect.value);
      const items=news.items.filter(i=>/^https:\/\//.test(i.url)&&(!sourceSelect.value||i.source===sourceSelect.value)&&(!themeSelect.value||tools.themes(i).includes(themeSelect.value))&&query.every(word=>tools.fold([i.title,i.source,i.summary,i.sourceExcerpt?.text].join(' ')).includes(word)));
      grid.replaceChildren();
      for(const item of items.slice(0,limit)){
        const entry=make('article','news-entry'),card=make('a','news-card');card.href=item.url;card.target='_blank';card.rel='noopener noreferrer';
        const date=make('span','news-date',dateLabel(item.date)),main=make('span','news-main'),source=make('span','news-source',item.sourceType+' · '+item.source+(item.language==='en'?' · en anglais':'')),title=make('strong','',item.title),summary=make('small');
        if(item.sourceExcerpt){summary.append(make('span','news-summary-label','Extrait de l’éditeur'),document.createTextNode('« '+item.sourceExcerpt.text+' »'));}else summary.textContent=item.autoCollected?'Titre transmis par le flux de l’éditeur. Ouvre la publication pour lire l’article.':item.summary;
        main.append(source,title,summary);
        if(!item.autoCollected&&item.why){const why=make('span','news-why');why.append(make('b','','À retenir'),make('span','',item.why));main.append(why)}
        const arrow=make('span','news-arrow','↗');arrow.setAttribute('aria-hidden','true');card.append(date,main,arrow);entry.append(card);
        const matches=tools.related(item);if(matches.length){const links=make('div','news-related');links.setAttribute('aria-label','À explorer dans l’atlas');links.append(make('span','','Dans l’atlas :'));for(const {e,i}of matches){const a=make('a','',e.name+' →');a.href='histoire.html?engin='+i;links.append(a)}entry.append(links)}grid.append(entry);
      }
      document.getElementById('news-result-count').textContent=items.length?Math.min(limit,items.length)+' / '+items.length+' publication'+(items.length>1?'s':'')+(filtered?' correspondant aux filtres':''):'Aucune publication ne correspond à ces filtres.';
      more.hidden=items.length<=limit;
      archive.replaceChildren();document.getElementById('archive-count').textContent=items.length+' publication'+(items.length>1?'s':'')+(filtered?' filtrée'+(items.length>1?'s':''):'');
      const months=new Map();for(const item of items){const key=item.date.slice(0,7);if(!months.has(key))months.set(key,[]);months.get(key).push(item)}
      for(const [month,rows]of months){const group=make('div','archive-month'),heading=make('h3','',monthFormatter.format(parsedDate(month+'-01'))),list=make('ul');for(const item of rows){const row=make('li'),a=make('a');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';const time=make('time','',shortDateFormatter.format(parsedDate(item.date)));time.dateTime=item.date;a.append(time,make('strong','',item.title),make('span','',item.source+(item.language==='en'?' · en anglais':'')));row.append(a);list.append(row)}group.append(heading,list);archive.append(group)}
    }
    function change(){limit=search.value.trim()||sourceSelect.value||themeSelect.value?12:4;render()}
    search.addEventListener('input',change);sourceSelect.addEventListener('change',change);themeSelect.addEventListener('change',change);more.addEventListener('click',()=>{limit+=8;render()});document.getElementById('news-reset').addEventListener('click',()=>{search.value=sourceSelect.value=themeSelect.value='';change();search.focus()});render();
  }
  window.RADAR_NEWS_VIEW=Object.freeze({mount});
})();
