(() => {
  const button=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
  if(!button||!nav)return;
  function setOpen(open){
    nav.classList.toggle('open',open);
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
  }
  button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){
      setOpen(false);button.focus();
    }
  });
})();
