const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const conflictSlugs = ['ukraine-guerre-enjeux', 'taiwan-detroit-tensions', 'moyen-orient-conflits'];
const validDate = value => typeof value === 'string' && /(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value));
const date = (value, time = false) => new Intl.DateTimeFormat('fr-FR', {day:'numeric', month:'long', year:'numeric', ...(time ? {hour:'2-digit', minute:'2-digit'} : {}), timeZone:'Europe/Paris'}).format(new Date(value));

export function validateConflictUpdates(data) {
  if (data.version !== 1 || !validDate(data.checkedAt) || data.windowDays !== 14 ||
      data.schedule?.timezone !== 'Europe/Paris' || data.schedule.times.join(',') !== '08:00,18:00' ||
      !Number.isInteger(data.coverage?.ok) || data.coverage.ok < 2 ||
      !Number.isInteger(data.coverage.total) || data.coverage.ok > data.coverage.total ||
      !Array.isArray(data.coverage.unavailable)) throw Error('Suivi des conflits invalide');
  for (const slug of conflictSlugs) {
    const topic = data.topics?.[slug];
    if (!topic || !validDate(topic.changedAt) || !Array.isArray(topic.items) || topic.items.length > 4) throw Error('Dossier absent ou invalide : ' + slug);
    const seen = new Set();
    for (const item of topic.items) {
      const url = new URL(item.url);
      if (url.protocol !== 'https:' || url.username || url.password || !validDate(item.publishedAt) ||
          Date.parse(item.publishedAt) > Date.parse(data.checkedAt) + 300000 ||
          Date.parse(item.publishedAt) < Date.parse(data.checkedAt) - 14 * 86400000 ||
          typeof item.title !== 'string' || !item.title.trim() || !item.source || seen.has(item.url)) throw Error('Publication invalide : ' + slug);
      seen.add(item.url);
    }
  }
  return data;
}

export function conflictUpdateHTML(data, slug, now = new Date()) {
  if (!conflictSlugs.includes(slug)) return '';
  const topic = data.topics[slug], stale = now - new Date(data.checkedAt) > 26 * 3600000;
  const coverage = data.coverage.unavailable.length ? '<details class="learning-live-coverage"><summary>Collecte partielle · ' + data.coverage.ok + '/' + data.coverage.total + ' sources consultées</summary><p>Flux indisponibles lors du contrôle : ' + data.coverage.unavailable.map(esc).join(', ') + '. Les publications déjà repérées restent disponibles.</p></details>' : '';
  return '<section id="suivi-conflit" class="learning-live" aria-labelledby="suivi-conflit-title"><span class="discovery-kicker">SUIVI À 8 H ET 18 H · HEURE DE PARIS</span><h2 id="suivi-conflit-title">Les publications récentes</h2><p class="learning-live-date">Dernier contrôle : <time datetime="' + esc(data.checkedAt) + '">' + esc(date(data.checkedAt, true)) + '</time>.</p>' +
    (stale ? '<p class="learning-live-warning">Ce suivi n’a pas été actualisé depuis plus d’un jour. Consulte les sources pour les derniers développements.</p>' : '') +
    '<p class="learning-live-intro">Titres des éditeurs sélectionnés dans la veille des 14 derniers jours. Le contexte de référence et l’histoire se lisent plus bas.</p>' +
    (topic.items.length ? '<ul class="learning-live-list">' + topic.items.map(item => '<li><span>' + esc(item.source) + ' · <time datetime="' + esc(item.publishedAt) + '">' + esc(date(item.publishedAt)) + '</time>' + (item.language === 'en' ? ' · en anglais' : '') + '</span><a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' + esc(item.title) + ' ↗</a></li>').join('') + '</ul>' : '<p>Aucune nouvelle publication correspondant à ce dossier n’a été repérée dans cette période. Le contexte de référence reste disponible ci-dessous.</p>') + coverage + '</section>';
}
