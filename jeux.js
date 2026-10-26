const scrollBehavior=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const QUESTIONS = window.LDV_ENGINS;
const mapData = window.LDV_MAP;
const svg = document.querySelector('#world-map');
const tooltip = document.querySelector('#map-tooltip');
const choice = document.querySelector('#country-choice');
const feedback = document.querySelector('#game-feedback');
const answerPanel = document.querySelector('#answer-panel');
const mapPanel = document.querySelector('.map-panel');
const challenge = document.querySelector('#challenge-hero');
const gameEnd = document.querySelector('#game-end');
const SVG_NS = 'http://www.w3.org/2000/svg';
let round = 0;
let found = 0;
let points = 0;
let streak = 0;
let bestStreak = 0;
let hintsUsed = 0;
let hintUsed = false;
let attemptsLeft = 5;
let resolved = false;
let tried = new Set();
let deck = [];
let selectedMode = 'quick';
let selectedCategory = 'all';
let quizSettings;
const maxAttempts=()=>quizSettings?.config.level==='expert'?3:5;
const BASE_VIEW = { x: -60, y: -25, w: 1320, h: 550 };
const MIN_VIEW_WIDTH = 170;
let view = { ...BASE_VIEW };
const activePointers = new Map();
let gestureMoved = false;
let suppressMapClickUntil = 0;

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

function updateStatus() {
  document.querySelector('#round-count').textContent = `Question ${Math.min(round + 1, deck.length)} / ${deck.length}`;
  document.querySelector('#attempt-count').textContent = `${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''}`;
  document.querySelector('#score-count').textContent = `${found} trouvé${found > 1 ? 's' : ''} · ${points} point${points > 1 ? 's' : ''}`;
  const dots = document.querySelector('#attempt-dots');
  dots.replaceChildren();
  for (let index = 0; index < maxAttempts(); index++) {
    const dot = document.createElement('i');
    dot.classList.toggle('used', index >= attemptsLeft);
    dots.append(dot);
  }
}

function setFeedback(message, type = '') {
  feedback.textContent = message;
  feedback.className = `game-feedback ${type}`.trim();
}

function setCredit(item) {
  const credit = document.querySelector('#photo-credit');
  const fileLink = document.createElement('a');
  fileLink.href = item.photoSource || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.photoFile)}`;
  fileLink.target = '_blank';
  fileLink.rel = 'noopener noreferrer';
  fileLink.textContent = item.photoAuthor;
  const licenseLink = document.createElement('a');
  licenseLink.href = item.photoLicenseUrl;
  licenseLink.target = '_blank';
  licenseLink.rel = 'noopener noreferrer';
  licenseLink.textContent = item.photoLicense;
  credit.replaceChildren('Photo : ', fileLink, ' · ', licenseLink);
}

function startRound() {
  const item = deck[round];
  attemptsLeft = maxAttempts();
  resolved = false;
  tried = new Set();
  hintUsed = false;
  updateStatus();
  document.querySelector('#item-photo').src = `assets/jeu/${item.photo}`;
  document.querySelector('#item-photo').alt = item.alt;
  document.querySelector('#item-category').textContent = item.kind;
  document.querySelector('#item-name').textContent = item.name;
  document.querySelector('#item-prompt').textContent = 'Dans quel pays cet engin a-t-il été conçu ? Clique sur la carte pour répondre.';
  setCredit(item);
  setFeedback('Survole un pays pour voir son nom, puis clique pour tenter ta chance.');
  document.querySelector('#hint-button').disabled = false;
  document.querySelector('#hint-button').hidden=quizSettings.config.level==='expert';
  document.querySelector('#hint-text').hidden = true;
  document.querySelector('#hint-text').textContent = '';
  if(quizSettings.config.level==='beginner'){document.querySelector('#hint-text').textContent='Repère de départ : '+item.hint;document.querySelector('#hint-text').hidden=false;document.querySelector('#hint-button').disabled=true;}
  answerPanel.hidden = true;
  answerPanel.classList.remove('missed');
  choice.value = '';
  for (const path of svg.querySelectorAll('.country')) path.classList.remove('wrong', 'correct');
}

function finishRound(won) {
  resolved = true;
  document.querySelector('#hint-button').disabled = true;
  const item = deck[round];
  window.LDV_PROGRESS?.answer('pays',item.name,won,item.name);
  for (const code of item.originCodes || [item.code]) {
    svg.querySelector(`[data-code="${code}"]`)?.classList.add('correct');
  }
  if (won) {
    found += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    const attemptsUsed = maxAttempts() - attemptsLeft;
    const earned = Math.max(1, attemptsLeft + 1 - Number(hintUsed));
    points += earned;
    setFeedback(`Bravo ! ${item.country} trouvé en ${attemptsUsed} tentative${attemptsUsed > 1 ? 's' : ''}. +${earned} point${earned > 1 ? 's' : ''}.`, 'success');
  } else {
    streak = 0;
    setFeedback(`Les ${maxAttempts()} tentatives sont épuisées. La réponse était : ${item.country}.`, 'error');
  }
  updateStatus();
  document.querySelector('#answer-label').textContent = won ? 'Bonne réponse' : 'La réponse à retenir';
  document.querySelector('#answer-country').textContent = item.country;
  document.querySelector('#answer-explanation').textContent = item.explanation;
  const sourceLink = document.querySelector('#answer-source');
  sourceLink.href = item.source;
  let history = answerPanel.querySelector('.game-history-link');
  if (!history) { history = document.createElement('a'); history.className = 'game-history-link'; document.querySelector('#answer-explanation').parentElement.append(history); }
  history.href = 'histoire.html?engin=' + QUESTIONS.indexOf(item); history.textContent = 'Découvrir sa fiche Histoire →';
  sourceLink.firstChild.textContent = 'Vérifier dans la source officielle ';
  document.querySelector('#next-question').firstChild.textContent = round === deck.length - 1 ? 'Voir mon résultat ' : 'Question suivante ';
  answerPanel.classList.toggle('missed', !won);
  answerPanel.hidden = false;
  answerPanel.scrollIntoView({ behavior:scrollBehavior(), block: 'nearest' });
}

function guess(code) {
  if (resolved || !code) return;
  const country = mapData.find(entry => entry.code === code);
  if (!country) return;
  if (tried.has(code)) {
    setFeedback(`${country.name} a déjà été essayé. Choisis un autre pays.`, 'error');
    return;
  }
  tried.add(code);
  attemptsLeft -= 1;
  choice.value = '';
  if ((deck[round].originCodes || [deck[round].code]).includes(code)) {
    finishRound(true);
    return;
  }
  svg.querySelector(`[data-code="${code}"]`)?.classList.add('wrong');
  if (attemptsLeft === 0) {
    finishRound(false);
    return;
  }
  setFeedback(`${country.name} : ce n'est pas le bon pays. Il te reste ${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''}.`, 'error');
  updateStatus();
}

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function startGame() {
  const pool = quizSettings.pool(QUESTIONS,selectedCategory);
  deck = shuffled(pool).slice(0, selectedMode === 'quick' ? 5 : pool.length);
  round = 0;
  found = 0;
  points = 0;
  streak = 0;
  bestStreak = 0;
  hintsUsed = 0;
  view = { ...BASE_VIEW };
  setView();
  gameEnd.hidden = true;
  challenge.hidden = false;
  mapPanel.hidden = false;
  document.querySelector('.game-status').hidden = false;
  document.querySelector('#country-empty').hidden=pool.length>0;
  document.querySelector('#game-mode-description').textContent =
    `${deck.length} question${deck.length > 1 ? 's' : ''} · ${quizSettings.label()} · ${maxAttempts()} tentatives par engin · jusqu'à ${maxAttempts()} points par bonne réponse.`;
  if(!pool.length){resolved=true;challenge.hidden=mapPanel.hidden=answerPanel.hidden=true;document.querySelector('.game-status').hidden=true;return;}
  startRound();
}

function screenToMap(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function setView() {
  view.w = Math.max(MIN_VIEW_WIDTH, Math.min(BASE_VIEW.w, view.w));
  view.h = view.w * BASE_VIEW.h / BASE_VIEW.w;
  view.x = Math.max(BASE_VIEW.x, Math.min(BASE_VIEW.x + BASE_VIEW.w - view.w, view.x));
  view.y = Math.max(BASE_VIEW.y, Math.min(BASE_VIEW.y + BASE_VIEW.h - view.h, view.y));
  svg.setAttribute('viewBox', `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
  document.querySelector('#zoom-level').textContent = `${Math.round(BASE_VIEW.w / view.w * 100)} %`;
}

function zoomAt(factor, clientX, clientY) {
  const anchor = screenToMap({ clientX, clientY });
  const width = Math.max(MIN_VIEW_WIDTH, Math.min(BASE_VIEW.w, view.w * factor));
  const height = width * BASE_VIEW.h / BASE_VIEW.w;
  const ratioX = (anchor.x - view.x) / view.w;
  const ratioY = (anchor.y - view.y) / view.h;
  view = { x: anchor.x - ratioX * width, y: anchor.y - ratioY * height, w: width, h: height };
  setView();
}

function mapCenter() {
  const rect = svg.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function panFromTo(from, to) {
  const start = screenToMap({ clientX: from.x, clientY: from.y });
  const end = screenToMap({ clientX: to.x, clientY: to.y });
  view.x += start.x - end.x;
  view.y += start.y - end.y;
  setView();
}

function buildMap() {
  const sorted = [...mapData].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  for (const country of mapData) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', country.path);
    path.setAttribute('class', 'country');
    path.setAttribute('data-code', country.code);
    path.setAttribute('aria-label', country.name);
    path.setAttribute('fill-rule', 'evenodd');
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = country.name;
    path.append(title);
    svg.append(path);
  }
  for (const country of sorted) {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.name;
    choice.append(option);
  }
  svg.addEventListener('click', event => {
    if (performance.now() < suppressMapClickUntil) return;
    const path = event.target.closest?.('.country');
    if (path) guess(path.dataset.code);
  });
  svg.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
    event.target.setPointerCapture?.(event.pointerId);
    if (activePointers.size > 1) gestureMoved = true;
    tooltip.hidden = true;
  });
  svg.addEventListener('pointermove', event => {
    if (activePointers.has(event.pointerId)) {
      const previous = [...activePointers.values()].map(pointer => ({ ...pointer }));
      const pointer = activePointers.get(event.pointerId);
      const from = { x: pointer.x, y: pointer.y };
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (activePointers.size === 1) {
        if (Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) > 5) {
          gestureMoved = true;
          svg.classList.add('is-grabbing');
          panFromTo(from, pointer);
        }
      } else {
        gestureMoved = true;
        svg.classList.add('is-grabbing');
        const now = [...activePointers.values()];
        const oldDistance = Math.hypot(previous[0].x - previous[1].x, previous[0].y - previous[1].y);
        const newDistance = Math.hypot(now[0].x - now[1].x, now[0].y - now[1].y);
        const oldCenter = { x: (previous[0].x + previous[1].x) / 2, y: (previous[0].y + previous[1].y) / 2 };
        const newCenter = { x: (now[0].x + now[1].x) / 2, y: (now[0].y + now[1].y) / 2 };
        if (newDistance > 10 && oldDistance > 10) zoomAt(oldDistance / newDistance, newCenter.x, newCenter.y);
        panFromTo(oldCenter, newCenter);
      }
      tooltip.hidden = true;
      event.preventDefault();
      return;
    }
    const path = event.target.closest?.('.country');
    if (!path) { tooltip.hidden = true; return; }
    tooltip.textContent = path.querySelector('title').textContent;
    const rect = document.querySelector('#map-frame').getBoundingClientRect();
    tooltip.style.left = `${Math.min(rect.width - 115, Math.max(10, event.clientX - rect.left + 13))}px`;
    tooltip.style.top = `${Math.max(8, event.clientY - rect.top - 36)}px`;
    tooltip.hidden = false;
  });
  function endPointer(event) {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.delete(event.pointerId);
    if (gestureMoved) suppressMapClickUntil = performance.now() + 400;
    if (!activePointers.size) {
      gestureMoved = false;
      svg.classList.remove('is-grabbing');
    }
    tooltip.hidden = true;
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);
  svg.addEventListener('wheel', event => {
    event.preventDefault();
    zoomAt(Math.exp(event.deltaY * .0015), event.clientX, event.clientY);
    tooltip.hidden = true;
  }, { passive: false });
  svg.addEventListener('pointerleave', () => { tooltip.hidden = true; });
}

if (Array.isArray(mapData) && mapData.length) {
  buildMap();
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.addEventListener('click', () => {
      selectedMode = button.dataset.mode;
      for (const option of document.querySelectorAll('[data-mode]')) {
        option.setAttribute('aria-pressed', String(option === button));
      }
      startGame();
    });
  }
  for (const button of document.querySelectorAll('[data-category]')) {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      for (const option of document.querySelectorAll('[data-category]')) {
        option.setAttribute('aria-pressed', String(option === button));
      }
      startGame();
    });
  }
  document.querySelector('#hint-button').addEventListener('click', () => {
    if (resolved || hintUsed) return;
    hintUsed = true;
    hintsUsed += 1;
    const hint = document.querySelector('#hint-text');
    hint.textContent = `Indice : ${deck[round].hint} Un point sera retiré si tu trouves la réponse.`;
    hint.hidden = false;
    document.querySelector('#hint-button').disabled = true;
  });
  quizSettings=window.RADAR_QUIZ.mount(document.querySelector('#quiz-settings'),startGame);
  startGame();
  document.querySelector('#country-form').addEventListener('submit', event => {
    event.preventDefault();
    guess(choice.value);
  });
  document.querySelector('#zoom-in').addEventListener('click', () => {
    const center = mapCenter();
    zoomAt(.72, center.x, center.y);
  });
  document.querySelector('#zoom-out').addEventListener('click', () => {
    const center = mapCenter();
    zoomAt(1 / .72, center.x, center.y);
  });
  document.querySelector('#zoom-reset').addEventListener('click', () => {
    view = { ...BASE_VIEW };
    setView();
  });
  document.querySelector('#next-question').addEventListener('click', () => {
    if (!resolved) return; resolved = false;
    round += 1;
    if (round < deck.length) {
      startRound();
      challenge.scrollIntoView({ behavior:scrollBehavior(), block: 'start' });
    } else {
      challenge.hidden = true;
      mapPanel.hidden = true;
      answerPanel.hidden = true;
      document.querySelector('.game-status').hidden = true;
      document.querySelector('#final-score').textContent = `Tu as trouvé ${found} engin${found > 1 ? 's' : ''} sur ${deck.length} et obtenu ${points} point${points > 1 ? 's' : ''}. Meilleure série : ${bestStreak}. Indices utilisés : ${hintsUsed}.`;
      window.LDV_PROGRESS?.complete('pays',points,deck.length*maxAttempts(),quizSettings.label()+' · '+deck.length+' questions · '+(quizSettings.config.scope==='collection'?'Ma collection':selectedCategory));
      gameEnd.hidden = false;
      gameEnd.scrollIntoView({ behavior:scrollBehavior(), block: 'center' });
    }
  });
  document.querySelector('#play-again').addEventListener('click', () => {
    startGame();
    challenge.scrollIntoView({ behavior:scrollBehavior(), block: 'start' });
  });
} else {
  setFeedback('La carte est indisponible. Recharge la page pour commencer.', 'error');
}
