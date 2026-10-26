(() => {
  'use strict';
  const scrollBehavior=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';

  const all = selector => [...document.querySelectorAll(selector)];
  const visible = node => {for (let n=node;n;n=n.parentElement) if(n.hidden) return false; return true;};
  const filters = document.getElementById('games-filters');
  if(filters){
    const cards=all('[data-game-family]'),buttons=all('[data-games-filter]'),count=document.getElementById('games-count');
    filters.addEventListener('click',event=>{
      const button=event.target.closest('button[data-games-filter]');if(!button)return;
      const selected=button.dataset.gamesFilter;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      cards.forEach(card=>{card.hidden=selected!=='all'&&card.dataset.gameFamily!==selected;});
      count.textContent=cards.filter(card=>!card.hidden).length+' jeux affichés sur '+cards.length;
    });
  }
  const menus=all('.play-menu');
  document.addEventListener('click',event=>{menus.forEach(menu=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){menus.forEach(menu=>{if(menu.open){menu.open=false;menu.querySelector('summary').focus();}});return;}
    if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!['1','2','3','4'].includes(event.key))return;
    if(['input','textarea','select'].some(tag=>event.target.closest(tag))||event.target.isContentEditable||all('dialog').some(d=>d.open)||menus.some(m=>m.open))return;
    const host=document.getElementById('recognition-choices')||document.getElementById('arcade-choices')||document.getElementById('vf-buttons');
    if(!host||!visible(host))return;
    const choices=[...host.querySelectorAll('button')];
    const button=choices[Number(event.key)-1];
    if(button&&!button.disabled&&visible(button)){event.preventDefault();button.click();}
  });
  for(const id of ['recognition-next','arcade-next','next-question','arcade-restart']){
    document.getElementById(id)?.addEventListener('click',()=>{
      requestAnimationFrame(()=>{
        const prompt=document.getElementById('recognition-prompt')||document.getElementById('arcade-question')||document.getElementById('item-name');
        if(prompt&&visible(prompt)){prompt.tabIndex=-1;prompt.focus({preventScroll:true});if(id==='arcade-restart')prompt.closest('.arcade-board')?.scrollIntoView({behavior:scrollBehavior(),block:'start'});}
      });
    });
  }
})();
