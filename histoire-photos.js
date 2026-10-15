(() => {
  'use strict';
  const datasets = window.RADAR_HISTORY_PHOTOS || {};
  const make = (tag, cls, text) => { const node=document.createElement(tag); if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node; };
  const sourceLink = (text,url) => { const a=make('a','',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a; };
  const base = item => ({src:'assets/jeu/'+item.photo,alt:item.alt||item.name,author:item.photoAuthor||'Wikimedia Commons',license:item.photoLicense||'Licence indiquée sur la source',licenseUrl:item.photoLicenseUrl,source:item.photoSource||(item.photoFile?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(item.photoFile):item.source),caption:item.photoCaption||item.mediaLabel||'Photographie documentaire',real:item.mediaLabel!=='Illustration'});
  function photos(item){
    const list=datasets[item.name]||[],original=base(item);
    const all=original.real?[original,...list]:list.length?list:[original];
    const seen=new Set();return all.filter(p=>{if(seen.has(p.src))return false;seen.add(p.src);return true});
  }
  function creditFor(record){
    const credit=make('div','history-photo-credit');
    const attribution=make('span','history-credit-attribution');
    attribution.append(record.real===false?'Illustration : ':'Photo : ',record.author||'Auteur indiqué sur la source');
    const references=make('span','history-credit-references');
    if(record.licenseUrl)references.append(sourceLink(record.license||'Licence',record.licenseUrl));
    else references.append(record.license||'Licence indiquée sur la source');
    if(record.source)references.append(' · ',sourceLink('Source de la photo ↗',record.source));
    credit.append(attribution,references);
    return credit;
  }
  function preview(item){return photos(item).find(p=>p.real!==false&&p.src!=='assets/jeu/'+item.photo)||photos(item).find(p=>p.real!==false)||null;}
  function create(item){
    const records=photos(item),wrap=make('div','history-gallery');
    wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Photos de '+item.name);
    const frame=make('div','history-gallery-frame'),image=make('img');image.decoding='async';image.loading='eager';
    frame.append(image);wrap.append(frame);
    const controls=make('div','history-gallery-controls');
    const prev=make('button','history-gallery-arrow','←'),next=make('button','history-gallery-arrow','→');prev.type=next.type='button';
    prev.setAttribute('aria-label','Photo précédente de '+item.name);next.setAttribute('aria-label','Photo suivante de '+item.name);
    const counter=make('span','history-gallery-count');counter.setAttribute('role','status');counter.setAttribute('aria-live','polite');
    const enlarge=make('button','history-enlarge','Agrandir la photo ↗');enlarge.type='button';enlarge.setAttribute('aria-label','Agrandir les photos de '+item.name);
    controls.append(prev,counter,next,enlarge);wrap.append(controls);
    const caption=make('p','history-gallery-caption'),credit=make('div'),warning=make('p','history-gallery-warning');warning.setAttribute('role','status');warning.hidden=true;
    wrap.append(caption,credit,warning);
    let index=0,dialog=null,largeImage,largeCaption,largeCredit,largeCounter,largeWarning;
    function updateLarge(){if(!dialog)return;const record=records[index];largeImage.src=record.src;largeImage.alt=record.alt||item.name;largeImage.hidden=false;largeCaption.textContent=record.caption||'Photographie documentaire';largeCredit.replaceChildren(creditFor(record));largeCounter.textContent=(index+1)+' / '+records.length;largeWarning.hidden=true;}
    function openLarge(){
      if(!dialog){dialog=make('dialog','photo-lightbox');dialog.setAttribute('aria-label','Photos en grand : '+item.name);const header=make('div','photo-lightbox-header'),title=make('h2','',item.name),close=make('button','','Fermer ✕');close.type='button';close.addEventListener('click',()=>dialog.close());header.append(title,close);
        largeImage=make('img','photo-lightbox-image');largeCaption=make('p');largeCredit=make('div','photo-lightbox-credit');largeCounter=make('span');largeCounter.setAttribute('role','status');largeWarning=make('p','','Cette photo ne se charge pas. Choisis une autre vue ou ouvre sa source.');largeWarning.setAttribute('role','status');largeWarning.hidden=true;
        const actions=make('div','photo-lightbox-controls'),back=make('button','','← Précédente'),forward=make('button','','Suivante →');back.type=forward.type='button';back.disabled=forward.disabled=records.length<2;back.addEventListener('click',()=>show(index-1));forward.addEventListener('click',()=>show(index+1));actions.append(back,largeCounter,forward);dialog.append(header,largeImage,actions,largeCaption,largeCredit,largeWarning);wrap.append(dialog);
        dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowLeft'?-1:1))}});dialog.addEventListener('close',()=>enlarge.focus());largeImage.addEventListener('error',()=>{largeImage.hidden=true;largeWarning.hidden=false;});
      }
      updateLarge();dialog.showModal();dialog.querySelector('button').focus();
    }
    function show(position){
      index=(position+records.length)%records.length;
      const current=records[index];image.src=current.src;image.alt=current.alt||item.name;image.title=current.sourceCaption||current.caption||item.name;image.hidden=false;
      image.classList.toggle('history-gallery-contain',item.category==='missiles');
      counter.textContent=(index+1)+' / '+records.length;
      caption.textContent=current.caption||'Photographie documentaire de '+item.name;
      credit.replaceChildren(creditFor(current));warning.hidden=true;
      prev.disabled=next.disabled=records.length<2;
      if(dialog?.open)updateLarge();
    }
    image.addEventListener('error',()=>{image.hidden=true;warning.hidden=false;warning.textContent='Cette photo ne se charge pas. Tu peux passer à la suivante ou consulter sa source.';});
    prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
    enlarge.addEventListener('click',openLarge);image.addEventListener('click',openLarge);
    controls.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowLeft'?-1:1))}});
    show(0);return wrap;
  }
  window.RADAR_PHOTOS=Object.freeze({photos,preview,create,creditFor});
})();
