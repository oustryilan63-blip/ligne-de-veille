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
    const digest = topic.digest;
    if (!digest || digest.method !== 'publisher-excerpts' || !validDate(digest.checkedAt) ||
        !['updated','unchanged','retained','empty'].includes(digest.status) || !Array.isArray(digest.sources) ||
        !Array.isArray(digest.paragraphs) || digest.paragraphs.length > 3 ||
        (digest.paragraphs.length && !validDate(digest.updatedAt))) throw Error('Résumé de dossier invalide : ' + slug);
    for (const paragraph of digest.paragraphs) {
      const url = new URL(paragraph.url);
      if (url.protocol !== 'https:' || url.username || url.password || !validDate(paragraph.publishedAt) ||
          Date.parse(paragraph.publishedAt) > Date.parse(digest.checkedAt) + 300000 ||
          !paragraph.source || !paragraph.title || typeof paragraph.text !== 'string' ||
          paragraph.text.trim().split(/\s+/).length > 90 || paragraph.text.trim().split(/\s+/).length < 12 ||
          paragraph.truncated === true || /…|\.{3}/.test(paragraph.text) || !/[.!?]["»”’)\]]*$/.test(paragraph.text.trim())) throw Error('Résumé incomplet ou non sourcé : ' + slug);
    }
  }
  return data;
}

export function conflictDigestHTML(data, slug) {
  if (!conflictSlugs.includes(slug)) return '';
  const digest = data.topics[slug].digest;
  const intro = '<p class="learning-digest-method">Résumés des sources en deux ou trois phrases lorsque disponibles, assemblés automatiquement à 8 h et 18 h. Chaque événement garde sa date et son lien vers la publication complète.</p>';
  const status = digest.status === 'retained' ? '<p class="learning-digest-notice">Aucun nouveau résumé exploitable n’a été recueilli lors du dernier passage. Le dernier texte sourcé est conservé ci-dessous avec ses dates.</p>' : '';
  const paragraphs = digest.paragraphs.map(p => '<figure class="learning-digest-entry"><blockquote cite="' + esc(p.url) + '"><p class="learning-digest-paragraph">' + esc(p.text) + '</p></blockquote><figcaption class="learning-digest-credit"><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.title) + '" aria-label="' + esc(p.source + ' · ' + date(p.publishedAt) + ' : ' + p.title + ' (article complet)') + '">' + esc(p.source) + ' · <time datetime="' + esc(p.publishedAt) + '">' + esc(date(p.publishedAt)) + '</time> ↗</a></figcaption></figure>').join('');
  return '<section id="situation-recente" class="learning-digest" aria-labelledby="situation-recente-title"><h2 id="situation-recente-title">Les derniers événements rapportés</h2><p class="learning-digest-date">' + (digest.updatedAt ? 'Texte actualisé le <time datetime="' + esc(digest.updatedAt) + '">' + esc(date(digest.updatedAt, true)) + '</time> · ' : '') + 'Collecte contrôlée le <time datetime="' + esc(digest.checkedAt) + '">' + esc(date(digest.checkedAt, true)) + '</time>.</p>' + intro + status + (paragraphs || '<p>Aucun résumé récent exploitable n’est disponible pour ce dossier. Le contexte de référence reste consultable ci-dessous.</p>') + (digest.sources.some(s => !s.ok) ? '<p class="learning-digest-notice">Certaines sources de résumés étaient indisponibles : ' + digest.sources.filter(s => !s.ok).map(s => esc(s.source)).join(', ') + '.</p>' : '') + '</section>';
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
