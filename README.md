# Ligne de Veille

Site francophone consacré à l'actualité de la défense, de la sécurité et de la géopolitique, avec deux jeux autour des engins militaires.

## Ouvrir le site

- [Site](https://oustryilan63-blip.github.io/ligne-de-veille/)
- [Deviner le pays de conception](https://oustryilan63-blip.github.io/ligne-de-veille/jeux.html)
- [Reconnaître l'engin sur une photo](https://oustryilan63-blip.github.io/ligne-de-veille/devine-engin.html)

Le site fonctionne également sans installation : ouvrez `index.html` dans un navigateur. Les pages `jeux.html` et `devine-engin.html` proposent deux façons de jouer avec les mêmes 45 engins. Le second jeu offre quatre propositions ou une réponse à écrire, ainsi qu'une partie rapide ou complète.

La direction graphique « Atlas stratégique » est appliquée à l'accueil et aux jeux. Les polices IBM Plex sont conservées dans `assets/fonts/atlas` avec leur licence. Les photos des jeux sont créditées et leurs détails figurent dans `assets/jeu/ajouts/credits.json`. Les données des 45 engins sont partagées dans `engins-data.js`.

## Actualités

Les actualités enregistrées sont dans `actualites.json`. Après les avoir mises à jour, exécutez `node scripts/build-news.mjs` pour régénérer `actualites.js`. La publication de nouveaux fichiers sur GitHub ou sur un hébergeur reste une étape distincte : les pages statiques ne se synchronisent pas toutes seules.

Plus de détails figurent dans `LISEZ-MOI.md`.
