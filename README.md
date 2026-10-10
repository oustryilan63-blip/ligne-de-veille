# Ligne de Veille

Site francophone consacré à l'actualité de la défense, de la sécurité et de la géopolitique, avec un jeu de géographie sur les pays de conception d'engins militaires.

## Ouvrir le site

- [Site actuel](https://oustryilan63-blip.github.io/ligne-de-veille/)
- [Jeu de 45 engins](https://oustryilan63-blip.github.io/ligne-de-veille/jeux.html)
- [Maquette de l'accueil](https://oustryilan63-blip.github.io/ligne-de-veille/apercu-accueil.html)
- [Maquette du jeu](https://oustryilan63-blip.github.io/ligne-de-veille/apercu-jeux.html)

Le site fonctionne également sans installation : ouvrez `index.html` dans un navigateur. La page `jeux.html` contient le jeu de 45 engins.

Deux maquettes permettent de comparer une nouvelle direction graphique « Atlas stratégique » avant de l'appliquer au site :

- `apercu-accueil.html` : accueil ;
- `apercu-jeux.html` : jeu.

Les polices IBM Plex de la maquette sont conservées dans `assets/fonts/atlas` avec leur licence. Les crédits des photos du jeu sont affichés sous chaque photo et relevés dans `assets/jeu/ajouts/credits.json`.

## Actualités

Les actualités enregistrées sont dans `actualites.json`. Après les avoir mises à jour, exécutez `node scripts/build-news.mjs` pour régénérer `actualites.js`. La publication de nouveaux fichiers sur GitHub ou sur un hébergeur reste une étape distincte : les pages statiques ne se synchronisent pas toutes seules.

Plus de détails figurent dans `LISEZ-MOI.md`.
