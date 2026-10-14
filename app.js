const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});

nav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
});

const news = window.LDV_NEWS;
const newsGrid = document.querySelector('#news-grid');
const updated = document.querySelector('#news-updated');
const archiveList = document.querySelector('#archive-list');
const archiveCount = document.querySelector('#archive-count');
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});
const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long', year: 'numeric', timeZone: 'UTC'
});
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'short', timeZone: 'UTC'
});
const dateLabel = value => dateFormatter.format(new Date(`${value}T12:00:00Z`));
const parsedDate = value => new Date(`${value}T12:00:00Z`);

if (news && Array.isArray(news.items) && news.items.length) {
  const checked = news.checkedAt && !Number.isNaN(Date.parse(news.checkedAt)) ? new Date(news.checkedAt) : null;
  const checkLabel = checked ? new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Paris'}).format(checked) : dateLabel(news.updatedAt);
  const sources = news.automation?.sources || [];
  updated.textContent = `Dernier contrôle : ${checkLabel}${sources.length ? ' · '+sources.filter(s=>s.ok).length+'/'+sources.length+' flux consultés' : ''}`;
  window.RADAR_NEWS_VIEW.mount(news,{dateLabel,monthFormatter,shortDateFormatter,parsedDate});

  const reportDialog = document.querySelector('#report-dialog');
  const reportItem = document.querySelector('#report-item');
  for (const item of news.items) {
    const option = document.createElement('option');
    option.value = item.url;
    option.textContent = item.title;
    reportItem.append(option);
  }
  document.querySelector('#report-recipient').textContent = `Destinataire : ${news.correctionsEmail}`;
  document.querySelector('.report-open').addEventListener('click', () => reportDialog.showModal());
  document.querySelector('#report-close').addEventListener('click', () => reportDialog.close());
  reportDialog.addEventListener('click', event => {
    if (event.target === reportDialog) reportDialog.close();
  });
  document.querySelector('#report-form').addEventListener('submit', event => {
    event.preventDefault();
    const selected = reportItem.selectedOptions[0];
    const message = document.querySelector('#report-message').value.trim();
    const reference = document.querySelector('#report-reference').value.trim();
    if (!message) return;
    const subject = `Signalement d'erreur — Radar — ${selected.textContent}`;
    const body = `Publication : ${selected.textContent}\nLien : ${selected.value === 'site' ? location.href : selected.value}\n\nErreur constatée :\n${message}${reference ? `\n\nLien de vérification : ${reference}` : ''}`;
    location.href = `mailto:${news.correctionsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    reportDialog.close();
  });
} else {
  updated.textContent = 'La veille est momentanément indisponible.';
  archiveCount.textContent = 'Aucune publication';
  document.querySelector('.report-open').hidden = true;
}

document.querySelectorAll('a[href="#archives"]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('#archive-details').open = true;
  });
});

// La première valeur aléatoire et le jour parisien sont ceux du Défi du jour.
// L’aperçu ne contient ni nom de l’engin ni indication de sa réponse.
(() => {
  const catalog=window.LDV_ENGINS||[],visual=document.getElementById('daily-home-visual');
  if(!visual||!catalog.length)return;
  const card=document.getElementById('daily-home-card'),img=document.getElementById('daily-home-photo'),credit=document.getElementById('daily-home-credit');
  let displayedDay='';
  const external=(label,url)=>{const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  function refresh(){
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
    const key=parts.year+'-'+parts.month+'-'+parts.day;if(key===displayedDay)return;displayedDay=key;
    let seed=2166136261;for(const char of key){seed^=char.charCodeAt(0);seed=Math.imul(seed,16777619);}
    const random=((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;
    let item=catalog[Math.floor(random*catalog.length)];
    try{const saved=JSON.parse(localStorage.getItem('ldv-defi-'+key)),remembered=saved&&catalog.find(e=>e.name===saved.itemName);
      if(remembered&&Array.isArray(saved.names)&&saved.names.length===4&&new Set(saved.names).size===4&&saved.names.includes(remembered.name)&&saved.names.includes(saved.choice)&&saved.names.every(name=>catalog.some(e=>e.name===name)))item=remembered;
    }catch{/* L’aperçu reste disponible sans stockage local. */}
    credit.replaceChildren();
    if(item.photoFile&&item.photoAuthor&&item.photoLicenseUrl){credit.append(external(item.photoAuthor,item.photoSource||'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(item.photoFile)),' · ',external(item.photoLicense,item.photoLicenseUrl));}
    img.src='assets/jeu/'+item.photo;visual.hidden=false;card.classList.add('has-photo');
  }
  img.addEventListener('error',()=>{visual.hidden=true;card.classList.remove('has-photo');});
  refresh();
  if(typeof window.setInterval==='function')window.setInterval(refresh,60000);
  document.addEventListener?.('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
