(() => {
  const game = document.body.dataset.game;
  if (!game) return;
  const $ = id => document.getElementById(id);
  const catalog = window.LDV_ENGINS || [];
  const rand = max => Math.floor(Math.random() * max);
  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const text = (id, value) => { $(id).textContent = value; };
  const show = (id, visible) => { $(id).hidden = !visible; };
  const menu = document.querySelector('.menu-toggle');
  const nav = $('main-nav');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
  });
  function setSource(item) {
    const source = $('arcade-source');
    source.href = item.source;
    source.hidden = !item.source;
  }
  function setCredit(item) {
    const credit = $('arcade-credit');
    if (!item.photoFile) { credit.hidden = true; return; }
    const photo = document.createElement('a');
    photo.href = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.photoFile)}`;
    photo.target = '_blank'; photo.rel = 'noopener noreferrer'; photo.textContent = item.photoAuthor;
    const license = document.createElement('a');
    license.href = item.photoLicenseUrl; license.target = '_blank'; license.rel = 'noopener noreferrer'; license.textContent = item.photoLicense;
    credit.replaceChildren('Photo : ', photo, ' · ', license);
    credit.hidden = false;
  }
  function historyLink(item, parent) {
    let link = parent.querySelector('.game-history-link');
    if (!link) { link = document.createElement('a'); link.className = 'game-history-link'; parent.append(link); }
    const index = catalog.indexOf(item);
    link.hidden = index < 0;
    if (index >= 0) { link.href = 'histoire.html?engin=' + index; link.textContent = 'Découvrir sa fiche Histoire →'; }
  }
  function result(ok, name, explanation, sourceItem, nextLabel) {
    const panel = $('arcade-result');
    panel.classList.toggle('missed', !ok);
    text('arcade-result-label', ok ? 'Bonne réponse' : 'À retenir');
    text('arcade-result-title', name);
    text('arcade-result-copy', explanation);
    setSource(sourceItem);
    historyLink(sourceItem, $('arcade-result-copy').parentElement);
    if (game === 'vrai-faux') {
      let figure = panel.querySelector('.result-photo');
      if (!figure) { figure = document.createElement('figure'); figure.className = 'result-photo'; panel.prepend(figure); }
      const img = document.createElement('img'); img.src = 'assets/jeu/' + sourceItem.photo; img.alt = sourceItem.name;
      const credit = document.createElement('a'); credit.href = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(sourceItem.photoFile);
      credit.target = '_blank'; credit.rel = 'noopener noreferrer'; credit.textContent = sourceItem.photoAuthor + ' · ' + sourceItem.photoLicense;
      figure.replaceChildren(img, credit);
    }
    text('arcade-next', nextLabel);
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function choiceButtons(names, onChoose) {
    const box = $('arcade-choices');
    box.replaceChildren(...names.map((name, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'arcade-choice';
      const label = document.createElement('span'); label.textContent = name;
      const number = document.createElement('span'); number.className = 'choice-index'; number.textContent = String(index + 1).padStart(2, '0');
      button.append(label, number);
      button.addEventListener('click', () => onChoose(name, button));
      return button;
    }));
  }
  function alternatives(item, seedShuffle = shuffle) {
    const sameKind = catalog.filter(other => other.kind === item.kind && other.name !== item.name);
    const sameCategory = catalog.filter(other => other.category === item.category && other.name !== item.name);
    const picked = [];
    for (const pool of [sameKind, sameCategory, catalog.filter(other => other.name !== item.name)]) {
      for (const other of seedShuffle(pool)) {
        if (!picked.some(chosen => chosen.name === other.name)) picked.push(other);
        if (picked.length === 3) break;
      }
      if (picked.length === 3) break;
    }
    return seedShuffle([item, ...picked]).map(choice => choice.name);
  }
  function markChoices(correct, selected) {
    $('arcade-choices').querySelectorAll('button').forEach(button => {
      button.disabled = true;
      button.classList.toggle('is-correct', button.firstChild.textContent === correct);
      button.classList.toggle('is-wrong', button === selected && button.firstChild.textContent !== correct);
    });
  }
  function finish(message, replay = true) {
    show('arcade-play', false); show('arcade-result', false); show('arcade-end', true);
    text('arcade-end-copy', message);
    show('arcade-restart', replay);
    $('arcade-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (game === 'zoom') {
    let deck, index, score, stage, resolved;
    const scales = [3.6, 2.8, 2.1, 1.5, 1];
    function round() {
      const item = deck[index]; stage = 0; resolved = false;
      text('arcade-progress', `PHOTO ${index + 1} / ${deck.length}`);
      text('arcade-score', `${score} POINTS`);
      text('arcade-eyebrow', 'PHOTO MYSTÈRE');
      text('arcade-question', 'Quel engin ?');
      text('arcade-detail', 'La photo est très zoomée. Révèle-la peu à peu si nécessaire.');
      const img = $('arcade-photo'); img.src = `assets/jeu/${item.photo}`; img.alt = 'Photo très agrandie d’un engin à identifier';
      img.style.transform = `scale(${scales[stage]})`;
      text('zoom-level', `CADRAGE ${stage + 1} / ${scales.length} · ${5 - stage} POINTS POSSIBLES`);
      $('zoom-reveal').disabled = false;
      setCredit(item); show('arcade-result', false);
      choiceButtons(alternatives(item), (answer, button) => {
        if (resolved) return;
        resolved = true; const ok = answer === item.name;
        if (ok) score += 5 - stage;
        img.style.transform = 'scale(1)'; img.alt = item.alt;
        $('zoom-reveal').disabled = true;
        markChoices(item.name, button);
        text('arcade-score', `${score} POINTS`);
        result(ok, item.name, item.explanation, item, index + 1 === deck.length ? 'Voir mon score →' : 'Photo suivante →');
      });
    }
    $('zoom-reveal').addEventListener('click', () => {
      if (resolved || stage === scales.length - 1) return;
      stage++;
      $('arcade-photo').style.transform = `scale(${scales[stage]})`;
      text('zoom-level', `CADRAGE ${stage + 1} / ${scales.length} · ${5 - stage} POINTS POSSIBLES`);
      $('zoom-reveal').disabled = stage === scales.length - 1;
    });
    $('arcade-next').addEventListener('click', () => { if (!resolved) return; resolved = false; if (++index === deck.length) finish(`${score} point${score > 1 ? 's' : ''} sur 25. Les bons réflexes d’observation font la différence.`); else round(); });
    $('arcade-restart').addEventListener('click', start);
    function start() { deck = shuffle(catalog).slice(0, 5); index = 0; score = 0; show('arcade-end', false); show('arcade-play', true); round(); }
    start();
  }

  if (game === 'chrono') {
    const byYear = [...window.LDV_CHRONO].sort((a, b) => a.year - b.year);
    let groups;
    function chooseGroups() {
      // Une seule date par année : les sources ne donnent pas toutes le jour exact.
      const seen = new Set();
      const selected = shuffle(byYear).filter(item => { if (seen.has(item.year)) return false; seen.add(item.year); return true; }).slice(0, 8).sort((a, b) => a.year - b.year);
      groups = [[selected[0], selected[2], selected[4], selected[6]], [selected[1], selected[3], selected[5], selected[7]]];
    }
    let group, score, order, resolved;
    function renderList() {
      const list = $('chrono-list');
      list.replaceChildren(...order.map((item, index) => {
        const row = document.createElement('li'); row.className = 'chrono-row';
        const number = document.createElement('span'); number.className = 'chrono-number'; number.textContent = String(index + 1).padStart(2, '0');
        const name = document.createElement('strong'); name.textContent = item.name;
        const alias = { 'F-15 Eagle':'F-15EX Eagle II', 'Rafale A':'Rafale', 'KC-390 Millennium':'C-390 Millennium' };
        const ref = catalog.find(entry => entry.name === (alias[item.name] || item.name));
        const caption = document.createElement('div'); caption.className = 'chrono-caption'; caption.append(name);
        if (ref) {
          const img = document.createElement('img'); img.className = 'chrono-thumb'; img.src = 'assets/jeu/' + ref.photo; img.alt = ref.name;
          row.append(img);
          const credit = document.createElement('a'); credit.className = 'chrono-credit'; credit.href = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(ref.photoFile); credit.target = '_blank'; credit.rel = 'noopener noreferrer';
          credit.textContent = (alias[item.name] ? 'Illustration : ' + ref.name + ' · ' : '') + ref.photoAuthor + ' · ' + ref.photoLicense;
          caption.append(credit);
        }
        const controls = document.createElement('span'); controls.className = 'chrono-controls';
        for (const [label, delta] of [['Monter', -1], ['Descendre', 1]]) {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = delta < 0 ? '↑' : '↓';
          button.setAttribute('aria-label', `${label} ${item.name}`); button.disabled = index + delta < 0 || index + delta >= order.length;
          button.addEventListener('click', () => { [order[index], order[index + delta]] = [order[index + delta], order[index]]; renderList(); const buttons = $('chrono-list').querySelectorAll('.chrono-controls')[index + delta].querySelectorAll('button'); const preferred = buttons[delta < 0 ? 0 : 1]; (preferred.disabled ? [...buttons].find(b => !b.disabled) : preferred)?.focus(); });
          controls.append(button);
        }
        row.prepend(number); row.append(caption, controls); return row;
      }));
    }
    function round() {
      resolved = false; order = shuffle(groups[group]);
      if (order.every((item, index) => item === groups[group][index])) [order[0], order[1]] = [order[1], order[0]];
      text('arcade-progress', `SÉRIE ${group + 1} / 2`); text('arcade-score', `${score} / 8 BIEN PLACÉS`);
      text('arcade-question', 'Quel appareil a volé avant les autres ?');
      text('arcade-detail', 'Classe ces quatre premiers vols du plus ancien au plus récent avec les flèches.');
      show('arcade-result', false); show('chrono-check', true); show('chrono-sources', false);
      renderList();
    }
    $('chrono-check').addEventListener('click', () => {
      if (resolved) return; resolved = true;
      const sorted = [...order].sort((a, b) => a.year - b.year);
      const correct = order.filter((item, index) => item === sorted[index]).length;
      score += correct; text('arcade-score', `${score} / 8 BIEN PLACÉS`);
      $('chrono-check').hidden = true;
      $('chrono-list').querySelectorAll('button').forEach(button => button.disabled = true);
      const sources = $('chrono-sources');
      sources.replaceChildren(...sorted.map(item => {
        const li = document.createElement('li');
        const a = document.createElement('a'); a.href = item.source; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = `${item.date} — ${item.name}`;
        const detail = document.createElement('span'); detail.textContent = item.context;
        li.append(a, detail); return li;
      }));
      sources.hidden = false;
      result(correct === 4, `${correct} / 4 bien placés`, 'Voici l’ordre vérifié des premiers vols. Ouvre chaque source pour retrouver sa date.', {}, group === 1 ? 'Voir mon score →' : 'Série suivante →');
      show('arcade-source', false);
    });
    $('arcade-next').addEventListener('click', () => { if (!resolved) return; resolved = false; if (++group === 2) finish(`${score} appareils bien placés sur 8. Rejoue pour découvrir une autre sélection de premiers vols.`); else round(); });
    $('arcade-restart').addEventListener('click', () => { chooseGroups(); group = 0; score = 0; show('arcade-end', false); show('arcade-play', true); round(); });
    chooseGroups(); group = 0; score = 0; round();
  }

  if (game === 'vrai-faux') {
    let deck, index, score, resolved;
    function round() {
      resolved = false; const fact = deck[index];
      text('arcade-progress', `AFFIRMATION ${index + 1} / ${deck.length}`);
      text('arcade-score', `${score} / ${deck.length} POINTS`);
      text('arcade-eyebrow', 'VÉRIFIER LES FAITS');
      text('arcade-question', fact.claim);
      text('arcade-detail', 'La source documentaire apparaît après ta réponse.');
      show('arcade-result', false);
      $('vf-buttons').querySelectorAll('button').forEach(button => { button.disabled = false; button.className = ''; });
    }
    $('vf-buttons').addEventListener('click', event => {
      const button = event.target.closest('button[data-answer]');
      if (!button || resolved) return;
      resolved = true; const fact = deck[index], answer = button.dataset.answer === 'true', ok = answer === fact.answer;
      if (ok) score++;
      $('vf-buttons').querySelectorAll('button').forEach(option => {
        option.disabled = true;
        option.classList.toggle('is-correct', (option.dataset.answer === 'true') === fact.answer);
        option.classList.toggle('is-wrong', option === button && !ok);
      });
      text('arcade-score', `${score} / ${deck.length} POINTS`);
      const ref = catalog.find(item => item.name === fact.ref);
      result(ok, fact.answer ? 'C’est vrai.' : 'C’est faux.', fact.reason, ref, index + 1 === deck.length ? 'Voir mon score →' : 'Affirmation suivante →');
    });
    $('arcade-next').addEventListener('click', () => { if (!resolved) return; resolved = false; if (++index === deck.length) finish(`${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${deck.length}. Chaque correction renvoie à une source.`); else round(); });
    $('arcade-restart').addEventListener('click', start);
    function start() { deck = shuffle(window.LDV_FACTS).slice(0, 10); index = 0; score = 0; show('arcade-end', false); show('arcade-play', true); round(); }
    start();
  }

  if (game === 'quotidien') {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const key = `${values.year}-${values.month}-${values.day}`;
    const label = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full' }).format(new Date());
    let seed = 2166136261;
    for (const char of key) { seed ^= char.charCodeAt(0); seed = Math.imul(seed, 16777619); }
    const nextSeed = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const seededShuffle = items => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(nextSeed() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    };
    let item = catalog[Math.floor(nextSeed() * catalog.length)];
    let names = alternatives(item, seededShuffle);
    const storageKey = `ldv-defi-${key}`;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch (_) { /* Navigation privée : la partie reste jouable. */ }
    // Conserver la photo et les réponses déjà jouées si le catalogue évolue.
    const remembered = saved && catalog.find(entry => entry.name === saved.itemName);
    if (remembered && Array.isArray(saved.names) && saved.names.length === 4 && new Set(saved.names).size === 4 && saved.names.includes(remembered.name) && saved.names.includes(saved.choice) && saved.names.every(name => catalog.some(entry => entry.name === name))) { item = remembered; names = saved.names; }
    else if (saved && saved.itemName) saved = null;
    let resolved = false;
    const refreshDay = () => {
      const today = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date()).map(part=>[part.type,part.value]));
      if (today.year + '-' + today.month + '-' + today.day !== key) location.reload();
    };
    setInterval(refreshDay, 60000);
    window.addEventListener('focus', refreshDay);
    text('arcade-progress', label.toUpperCase());
    text('arcade-score', '1 QUESTION · 1 TENTATIVE');
    text('arcade-eyebrow', 'PHOTO DU JOUR');
    text('arcade-question', 'Quel est cet engin ?');
    text('arcade-detail', 'Le même défi pour tous, renouvelé chaque jour à minuit, heure de Paris.');
    $('arcade-photo').src = `assets/jeu/${item.photo}`; $('arcade-photo').alt = 'Photographie de l’engin du défi du jour';
    setCredit(item);
    function shareText(ok) { return `Ligne de Veille · Défi du ${key} : ${ok ? '1/1 ✓' : '0/1 ◯'} — Et toi ? ${location.href.split('?')[0]}`; }
    function reveal(chosen) {
      if (resolved) return; resolved = true;
      const ok = chosen === item.name;
      try { localStorage.setItem(storageKey, JSON.stringify({ choice: chosen, correct: ok, itemName: item.name, names })); } catch (_) { /* Stockage facultatif. */ }
      $('arcade-choices').querySelectorAll('button').forEach(button => {
        button.disabled = true;
        button.classList.toggle('is-correct', button.firstChild.textContent === item.name);
        button.classList.toggle('is-wrong', button.firstChild.textContent === chosen && !ok);
      });
      text('arcade-score', ok ? 'RÉSULTAT : 1 / 1' : 'RÉSULTAT : 0 / 1');
      $('arcade-photo').alt = item.alt;
      result(ok, item.name, item.explanation, item, 'Partager mon résultat ↗');
      show('arcade-next', false); show('daily-share', true);
      $('daily-share').dataset.share = shareText(ok);
    }
    choiceButtons(names, name => reveal(name));
    if (saved && names.includes(saved.choice)) reveal(saved.choice);
    $('daily-share').addEventListener('click', async () => {
      const message = $('daily-share').dataset.share;
      try {
        if (navigator.share) await navigator.share({ title: 'Ligne de Veille · Défi du jour', text: message });
        else { await navigator.clipboard.writeText(message); text('daily-share', 'Résultat copié ✓'); }
      } catch (error) {
        if (error.name !== 'AbortError') text('daily-share', 'Partage indisponible sur ce navigateur');
      }
    });
  }
})();
