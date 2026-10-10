// Repères publics pour le carnet de bord uniquement.
// Ce module ne modifie ni la carte, ni les distances, ni les animations.
(() => {
  'use strict';
  const references = {
    fr: {
      value: '≈ 8 000 km',
      label: 'M51 · estimation publique',
      note: 'Ordre de grandeur publié par le CSIS pour le M51. Ce chiffre ne constitue pas une portée maximale officielle, ni une valeur propre au M51.3.',
      future: 'Pour le SNLE 3G, ce repère concerne la famille M51 déjà documentée : il ne préjuge pas des performances des futures versions.',
      source: 'CSIS · fiche M51, mise à jour du 23 avril 2024',
      url: 'https://missilethreat.csis.org/missile/m51/'
    },
    us: {
      value: '≈ 7 400 km',
      label: 'Trident II D5 · donnée publique arrondie',
      note: 'L’US Navy publie 4 000 milles nautiques, soit environ 7 400 km. Cette donnée n’est pas présentée ici comme un maximum exact ni comme une portée propre à chaque évolution D5LE.',
      future: 'Pour Columbia, il s’agit d’un repère documentaire sur le D5. Aucune portée distincte du futur D5LE2 n’est déduite de cette valeur.',
      source: 'US Navy · fiche Trident II D5',
      url: 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169285/trident-ii-d5-missile/trident-ii-d5-missile/'
    },
    ru: {
      value: '≈ 8 300 km',
      label: 'Bulava · estimation publique',
      note: 'Ordre de grandeur publié par le CSIS pour le Bulava, associé aux classes Borei et Borei-A. Il ne constitue pas une garantie de portée maximale pour toutes les configurations.',
      source: 'CSIS · inventaire russe, mise à jour du 9 janvier 2026',
      url: 'https://missilethreat.csis.org/country/Russia/'
    }
  };
  const country = document.getElementById('hz-country');
  const submarineClass = document.getElementById('hz-class');
  const panel = document.getElementById('hz-fact-card');
  function renderReference() {
    const ref = references[country.value];
    panel.querySelector('.hz-range-documentary')?.remove();
    const box = document.createElement('section');
    box.className = 'hz-range-documentary';
    box.setAttribute('aria-label', 'Portée publique du missile');
    const title = document.createElement('h4');
    title.textContent = 'PORTÉE PUBLIÉE · DOCUMENTATION';
    const value = document.createElement('strong');
    value.textContent = ref.value;
    const label = document.createElement('p');
    label.className = 'hz-range-label';
    label.textContent = ref.label;
    const note = document.createElement('p');
    note.textContent = ref.note + (Number(submarineClass.value) === 1 && ref.future ? ' ' + ref.future : '');
    const source = document.createElement('a');
    source.href = ref.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = ref.source + ' ↗';
    const footnote = document.createElement('p');
    footnote.className = 'hz-range-footnote';
    footnote.textContent = 'Repère documentaire uniquement · indépendant des distances et animations du jeu. Source consultée le 11 octobre 2026.';
    box.append(title, value, label, note, source, footnote);
    panel.firstElementChild.append(box);
  }
  // Les fiches sont rendues par Horizon avant ces écouteurs.
  country.addEventListener('change', renderReference);
  submarineClass.addEventListener('change', renderReference);
  renderReference();
})();
