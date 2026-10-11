(() => {
  'use strict';
  const models = Object.freeze(window.RADAR_3D_MODELS || {});
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const external = (text, url) => {
    const node = make('a', '', text);
    node.href = url; node.target = '_blank'; node.rel = 'noopener noreferrer';
    return node;
  };
  function create(item) {
    const model = models[item.name];
    if (!model) return null;
    const section = make('section', 'history-3d');
    section.id = 'vue-3d'; section.setAttribute('aria-labelledby', 'history-3d-title');
    const header = make('div', 'history-3d-head');
    const heading = make('div');
    heading.append(make('span', 'history-kicker', 'EXPLORER EN 3D · ' + item.kind));
    const title = make('h3', '', item.name + ' sous un autre angle');
    title.id = 'history-3d-title';
    heading.append(title, make('p', '', 'Tourne autour de l’engin, rapproche-toi et observe les détails de sa silhouette.'));
    header.append(heading);
    const stage = make('div', 'history-3d-stage');
    const poster = make('div', 'history-3d-poster');
    const photograph = window.RADAR_PHOTOS?.preview(item);
    const photo = make('img');
    if(photograph){photo.src = photograph.src;photo.alt = photograph.alt||'Photographie de '+item.name;}
    else {photo.hidden=true;poster.classList.add('history-3d-poster-noimage');}
    photo.loading = 'lazy'; photo.decoding = 'async';
    photo.addEventListener('error', () => { photo.hidden = true; poster.classList.add('history-3d-poster-noimage'); });
    const prompt = make('div');
    prompt.append(make('strong', '', 'À toi de l’explorer.'), make('p', '', 'Le modèle 3D se charge uniquement quand tu l’ouvres.'), make('small', '', 'Photo réelle · ' + item.name));
    poster.append(photo, prompt);
    stage.append(poster);
    const actions = make('div', 'history-3d-actions');
    const toggle = make('button', 'button button-dark', 'Charger la vue 3D');
    toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
    stage.id = 'history-3d-stage'; toggle.setAttribute('aria-controls', stage.id);
    actions.append(toggle);
    const status = make('p', 'history-3d-status'); status.setAttribute('role', 'status');
    const help = make('p', 'history-3d-help', 'Glisser : tourner · Molette ou pincement : zoomer · Bouton ⛶ du lecteur : plein écran. Sur mobile, fais défiler la page en dehors du lecteur.');
    help.hidden = true;
    const credit = make('p', 'history-3d-credit');
    credit.append(external(model.title, model.url), ' · par ', external(model.author, model.authorUrl), ' · sur ', external('Sketchfab', 'https://sketchfab.com'), ' · ');
    if (model.licenseUrl) credit.append(external(model.licenseLabel + ' (licence affichée)', model.licenseUrl));
    else credit.append(model.licenseLabel);
    const note = make('p', 'history-3d-note', model.note + ' Le lecteur est fourni par Sketchfab. L’affichage nécessite une connexion et un navigateur compatible 3D.');
    let frame = null;
    function open() {
      if (frame) return;
      const viewer = make('iframe');
      viewer.title = 'Vue 3D interactive : ' + model.title + ', par ' + model.author + ' sur Sketchfab';
      viewer.allow = 'autoplay; fullscreen'; viewer.allowFullscreen = true;
      viewer.referrerPolicy = 'strict-origin-when-cross-origin';
      viewer.src = 'https://sketchfab.com/models/' + model.id + '/embed?autostart=1&autospin=0&camera=0&preload=0&dnt=1&max_texture_size=2048';
      frame = viewer;
      viewer.addEventListener('load', () => {
        if (frame === viewer) status.textContent = 'Lecteur ouvert. Les textures peuvent encore se charger quelques instants.';
      });
      viewer.addEventListener('error', () => {
        if (frame === viewer) status.textContent = 'Le lecteur ne répond pas. Ferme la vue et recharge-la pour réessayer.';
      });
      status.textContent = 'Ouverture du lecteur 3D…';
      stage.replaceChildren(viewer); help.hidden = false;
      toggle.textContent = 'Fermer la vue 3D'; toggle.setAttribute('aria-expanded', 'true');
    }
    toggle.addEventListener('click', () => {
      if (!frame) { open(); return; }
      frame.remove(); frame = null; stage.replaceChildren(poster);
      status.textContent = 'Vue 3D fermée.'; help.hidden = true;
      toggle.textContent = 'Charger la vue 3D'; toggle.setAttribute('aria-expanded', 'false');
    });
    section.append(header, stage, actions, status, help, credit, note);
    if(photograph)section.append(window.RADAR_PHOTOS.creditFor(photograph));
    return { section, open };
  }
  window.RADAR_3D = Object.freeze({ has: item => Boolean(models[item.name]), create });
})();
