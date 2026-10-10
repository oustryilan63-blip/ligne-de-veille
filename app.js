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
  for (const item of news.items.slice(0, 4)) {
    if (!/^https:\/\//.test(item.url)) continue;

    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = item.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const date = document.createElement('span');
    date.className = 'news-date';
    date.textContent = dateLabel(item.date);

    const main = document.createElement('span');
    main.className = 'news-main';
    const source = document.createElement('span');
    source.className = 'news-source';
    source.textContent = `${item.sourceType} · ${item.source}${item.language === 'en' ? ' · en anglais' : ''}`;
    const title = document.createElement('strong');
    title.textContent = item.title;
    const summary = document.createElement('small');
    summary.textContent = item.summary;
    const why = document.createElement('span');
    why.className = 'news-why';
    const whyLabel = document.createElement('b');
    whyLabel.textContent = "Pourquoi c'est important";
    const whyText = document.createElement('span');
    whyText.textContent = item.why;
    why.append(whyLabel, whyText);
    main.append(source, title, summary);
    if (!item.autoCollected) main.append(why);

    const arrow = document.createElement('span');
    arrow.className = 'news-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    card.append(date, main, arrow);
    newsGrid.append(card);
  }

  archiveCount.textContent = `${news.items.length} publication${news.items.length > 1 ? 's' : ''}`;
  const months = new Map();
  for (const item of news.items) {
    if (!/^https:\/\//.test(item.url)) continue;
    const monthKey = item.date.slice(0, 7);
    if (!months.has(monthKey)) months.set(monthKey, []);
    months.get(monthKey).push(item);
  }
  for (const [monthKey, items] of months) {
    const group = document.createElement('div');
    group.className = 'archive-month';
    const heading = document.createElement('h3');
    heading.textContent = monthFormatter.format(parsedDate(`${monthKey}-01`));
    const list = document.createElement('ul');
    for (const item of items) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = shortDateFormatter.format(parsedDate(item.date));
      const title = document.createElement('strong');
      title.textContent = item.title;
      const source = document.createElement('span');
      source.textContent = item.source;
      link.append(date, title, source);
      row.append(link);
      list.append(row);
    }
    group.append(heading, list);
    archiveList.append(group);
  }

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
    const subject = `Signalement d'erreur — Ligne de Veille — ${selected.textContent}`;
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
