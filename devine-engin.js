const ENGINES = window.LDV_ENGINS;
const el = id => document.getElementById(id);
const state = { answerMode: 'choices', roundMode: 'quick', category: 'all', deck: [], index: 0, found: 0, points: 0, attemptsLeft: 1, hintUsed: false, resolved: false };
let quizSettings;
const maxAttempts=()=>state.answerMode==='choices'?1:quizSettings?.config.level==='beginner'?4:quizSettings?.config.level==='expert'?1:3;

const menuButton = document.querySelector('.menu-toggle');
const nav = el('main-nav');
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

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeName(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isCorrectName(guess, item) {
  const accepted = [item.name, ...(item.aliases || []), item.name.replace(/^(classe|hms|uss|ins|chengdu|mitsubishi|pilatus|hal)\s+/i, '')];
  const model = item.name.match(/\b[A-Z]{1,4}[- ]?\d+[A-Z0-9-]*\b/);
  if (model) accepted.push(model[0]);
  if (item.name === 'JAS 39 Gripen') accepted.push('Gripen');
  if (item.name === 'A-29 Super Tucano') accepted.push('Super Tucano');
  return accepted.some(name => normalizeName(name) === normalizeName(guess));
}

function feedback(message, type = '') {
  const box = el('recognition-feedback');
  box.textContent = message;
  box.className = `game-feedback ${type}`.trim();
}

function updateStatus() {
  el('recognition-round').textContent = `Question ${Math.min(state.index + 1, state.deck.length)} / ${state.deck.length}`;
  el('recognition-attempts').textContent = `${state.attemptsLeft} tentative${state.attemptsLeft > 1 ? 's' : ''} restante${state.attemptsLeft > 1 ? 's' : ''}`;
  el('recognition-score').textContent = `${state.found} trouvé${state.found > 1 ? 's' : ''} · ${state.points} point${state.points > 1 ? 's' : ''}`;
}

function makeChoices(item) {
  if(window.RADAR_CATALOGUE){
    const pool=quizSettings.pool(ENGINES,state.category),names=window.RADAR_CATALOGUE.options(item,pool,quizSettings.config.level,shuffled);
    el('recognition-choices').replaceChildren(...names.map((name,index)=>{const button=document.createElement('button');button.type='button';button.dataset.name=name;const label=document.createElement('span');label.textContent=name;const number=document.createElement('span');number.className='choice-index';number.textContent=String(index+1).padStart(2,'0');button.append(label,number);return button}));return;
  }
  const alternatives = [];
  for (const pool of [ENGINES.filter(other => other.kind === item.kind), ENGINES.filter(other => other.category === item.category), ENGINES]) {
    for (const other of shuffled(pool)) {
      if (other.name !== item.name && !alternatives.some(choice => choice.name === other.name)) alternatives.push(other);
      if (alternatives.length === 3) break;
    }
    if (alternatives.length === 3) break;
  }
  const names = shuffled([item, ...alternatives]).map(choice => choice.name);
  el('recognition-choices').replaceChildren(...names.map((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.name = name;
    const label = document.createElement('span');
    label.textContent = name;
    const number = document.createElement('span');
    number.className = 'choice-index';
    number.textContent = String(index + 1).padStart(2, '0');
    button.append(label, number);
    return button;
  }));
}

function setCredit(item) {
  const credit = el('recognition-credit');
  const fileLink = document.createElement('a');
  fileLink.href = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.photoFile)}`;
  fileLink.target = '_blank';
  fileLink.rel = 'noopener noreferrer';
  fileLink.textContent = item.photoAuthor;
  const licenseLink = document.createElement('a');
  licenseLink.href = item.photoLicenseUrl;
  licenseLink.target = '_blank';
  licenseLink.rel = 'noopener noreferrer';
  licenseLink.textContent = item.photoLicense;
  credit.replaceChildren('Photo : ', fileLink, ' · ', licenseLink);
  credit.hidden = false;
}

function showAnswer(correct, chosenButton) {
  const item = state.deck[state.index];
  state.resolved = true;
  window.LDV_PROGRESS?.answer('recognition',item.name,correct,item.name);
  el('recognition-hint-button').disabled = true;
  if (correct) {
    state.found++;
    state.points += state.hintUsed || state.attemptsLeft < maxAttempts() ? 1 : 2;
  }
  updateStatus();
  if (state.answerMode === 'choices') {
    for (const button of el('recognition-choices').querySelectorAll('button')) {
      button.disabled = true;
      button.classList.toggle('is-correct', button.dataset.name === item.name);
      button.classList.toggle('is-wrong', button === chosenButton && !correct);
    }
  } else {
    el('recognition-input').disabled = true;
    el('recognition-form').querySelector('button').disabled = true;
  }
  feedback(correct ? 'Bonne réponse ! Découvre cet engin ci-dessous.' : `Il s’agissait de ${item.name}. Découvre son histoire ci-dessous.`, correct ? 'success' : 'error');
  const panel = el('recognition-answer');
  panel.classList.toggle('missed', !correct);
  el('recognition-result-label').textContent = correct ? 'Bonne réponse' : 'À retenir';
  el('recognition-name').textContent = item.name;
  el('recognition-explanation').textContent = item.explanation;
  el('recognition-source').href = item.source;
  let history = el('recognition-answer').querySelector('.game-history-link');
  if (!history) { history = document.createElement('a'); history.className = 'game-history-link'; el('recognition-explanation').parentElement.append(history); }
  history.href = 'histoire.html?engin=' + ENGINES.indexOf(item); history.textContent = 'Découvrir sa fiche Histoire →';
  el('recognition-next').firstChild.textContent = state.index + 1 === state.deck.length ? 'Voir mon score ' : 'Question suivante ';
  panel.hidden = false;
  setCredit(item);
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function submitAnswer(value, chosenButton = null) {
  if (state.resolved) return;
  const item = state.deck[state.index];
  const correct = state.answerMode === 'choices' ? value === item.name : isCorrectName(value.trim(), item);
  if (correct) {
    showAnswer(true, chosenButton);
    return;
  }
  state.attemptsLeft--;
  if (state.attemptsLeft === 0) {
    showAnswer(false, chosenButton);
  } else {
    updateStatus();
    feedback(`Ce n’est pas encore ça. ${state.attemptsLeft} essai${state.attemptsLeft > 1 ? 's' : ''} restant${state.attemptsLeft > 1 ? 's' : ''}.`, 'error');
    el('recognition-input').value = '';
    el('recognition-input').focus();
  }
}

function renderRound() {
  const item = state.deck[state.index];
  state.attemptsLeft = maxAttempts();
  state.hintUsed = false;
  state.resolved = false;
  el('recognition-kind').textContent = item.kind;
  const photo = el('recognition-photo');
  photo.src = `assets/jeu/${item.photo}`;
  photo.alt = 'Photographie de l’engin militaire à identifier';
  el('recognition-credit').hidden = true;
  el('recognition-hint').hidden = true;
  el('recognition-hint-button').disabled = false;
  el('recognition-hint-button').hidden = quizSettings.config.level==='expert';
  if(quizSettings.config.level==='beginner'){el('recognition-hint').textContent='Pays de conception : '+item.country+'.';el('recognition-hint').hidden=false;el('recognition-hint-button').disabled=true;}
  el('recognition-answer').hidden = true;
  el('recognition-choices').hidden = state.answerMode !== 'choices';
  el('recognition-form').hidden = state.answerMode !== 'text';
  el('recognition-input').value = '';
  el('recognition-input').disabled = false;
  el('recognition-form').querySelector('button').disabled = false;
  if (state.answerMode === 'choices') makeChoices(item);
  feedback(state.answerMode === 'choices' ? 'Choisis le nom qui correspond à la photo.' : 'Écris le nom de l’engin, puis valide.');
  updateStatus();
}

function startGame() {
  const pool = shuffled(quizSettings.pool(ENGINES,state.category));
  const choicesPossible=pool.length>=4&&pool.every(e=>window.RADAR_CATALOGUE.options(e,pool,quizSettings.config.level,shuffled).length===4);
  if(!choicesPossible&&state.answerMode==='choices')state.answerMode='text';
  document.querySelectorAll('[data-answer-mode]').forEach(b=>{b.disabled=b.dataset.answerMode==='choices'&&!choicesPossible;b.setAttribute('aria-pressed',String(b.dataset.answerMode===state.answerMode))});
  state.deck = state.roundMode === 'quick' ? pool.slice(0, 5) : pool;
  state.index = 0;
  state.found = 0;
  state.points = 0;
  el('recognition-end').hidden = true;
  el('recognition-card').hidden = false;
  el('recognition-answering').hidden = false;
  el('recognition-empty').hidden=pool.length>0;
  const questionCount = state.deck.length;
  el('recognition-mode-description').textContent = `${questionCount} question${questionCount>1?'s':''} · ${quizSettings.label()} · ${state.answerMode === 'choices' ? '4 propositions · une réponse par photo' : 'réponse libre · '+maxAttempts()+' essai(s) par photo'}. Une bonne réponse rapporte 1 ou 2 points.`+(pool.length&&!choicesPossible?' Réponse libre activée : quatre propositions distinctes ne sont pas disponibles pour toute cette sélection.':'');
  if(!pool.length){state.resolved=true;el('recognition-card').hidden=el('recognition-answering').hidden=el('recognition-answer').hidden=true;el('recognition-round').textContent='Aucune question';el('recognition-attempts').textContent='';el('recognition-score').textContent='0 point';return;}
  renderRound();
}

function finishGame() {
  window.LDV_PROGRESS?.complete('recognition',state.points,state.deck.length*2,quizSettings.label()+' · '+(state.answerMode==='choices'?'QCM':'Réponse libre')+' · '+state.deck.length+' questions · '+(quizSettings.config.scope==='collection'?'Ma collection':state.category));
  el('recognition-card').hidden = true;
  el('recognition-answering').hidden = true;
  el('recognition-answer').hidden = true;
  el('recognition-end').hidden = false;
  el('recognition-final-score').textContent = `${state.found} engin${state.found > 1 ? 's' : ''} reconnu${state.found > 1 ? 's' : ''} sur ${state.deck.length} · ${state.points} point${state.points > 1 ? 's' : ''} sur ${state.deck.length * 2}.`;
  el('recognition-end').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

for (const [selector, key] of [['[data-answer-mode]', 'answerMode'], ['[data-round-mode]', 'roundMode'], ['[data-category]', 'category']]) {
  document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
    const value = button.dataset[key];
    if (state[key] === value) return;
    state[key] = value;
    document.querySelectorAll(selector).forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    startGame();
  }));
}

el('recognition-choices').addEventListener('click', event => {
  const button = event.target.closest('button[data-name]');
  if (button) submitAnswer(button.dataset.name, button);
});
el('recognition-form').addEventListener('submit', event => {
  event.preventDefault();
  const value = el('recognition-input').value.trim();
  if (value) submitAnswer(value);
});
el('recognition-hint-button').addEventListener('click', () => {
  if (state.resolved) return;
  state.hintUsed = true;
  el('recognition-hint').textContent = `Pays de conception : ${state.deck[state.index].country}.`;
  el('recognition-hint').hidden = false;
  el('recognition-hint-button').disabled = true;
});
el('recognition-next').addEventListener('click', () => {
  if (!state.resolved) return; state.resolved = false;
  if (state.index + 1 === state.deck.length) finishGame();
  else { state.index++; renderRound(); el('recognition-card').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
el('recognition-restart').addEventListener('click', startGame);

quizSettings=window.RADAR_QUIZ.mount(el('quiz-settings'),startGame);
if(new URLSearchParams(location.search).get('collection')==='1')state.roundMode='full';
if(new URLSearchParams(location.search).get('reponse')==='text')state.answerMode='text';
document.querySelectorAll('[data-round-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.roundMode===state.roundMode)));
startGame();
