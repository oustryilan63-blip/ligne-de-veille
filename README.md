# Ligne de Veille

Site francophone consacré à l'actualité de la défense, de la sécurité et de la géopolitique, avec six jeux autour des engins militaires.

## Ouvrir le site

- [Site](https://oustryilan63-blip.github.io/ligne-de-veille/)
- [Tous les jeux](https://oustryilan63-blip.github.io/ligne-de-veille/tous-les-jeux.html)
- [Deviner le pays de conception](https://oustryilan63-blip.github.io/ligne-de-veille/jeux.html)
- [Reconnaître l'engin sur une photo](https://oustryilan63-blip.github.io/ligne-de-veille/devine-engin.html)
- [Zoom mystère](https://oustryilan63-blip.github.io/ligne-de-veille/zoom-mystere.html)
- [Chrono défense](https://oustryilan63-blip.github.io/ligne-de-veille/chrono-defense.html)
- [Vrai ou faux ?](https://oustryilan63-blip.github.io/ligne-de-veille/vrai-ou-faux.html)
- [Défi du jour](https://oustryilan63-blip.github.io/ligne-de-veille/defi-du-jour.html)

Le site fonctionne également sans installation : ouvrez `index.html` dans un navigateur, puis la rubrique « Jeux ». Les six jeux utilisent le même catalogue de 45 engins. Le jeu chronologique s'appuie sur huit dates de premier vol vérifiées dans les archives des fabricants. Le vrai/faux contient douze affirmations sourcées, dont dix sont tirées au hasard par partie. Le défi du jour change à minuit, heure de Paris, et le résultat est conservé localement dans le navigateur : il n'y a pas de classement global.

La direction graphique « Atlas stratégique » est appliquée à l'accueil et aux jeux. Les polices IBM Plex sont conservées dans `assets/fonts/atlas` avec leur licence. Les photos des jeux sont créditées et leurs détails figurent dans `assets/jeu/ajouts/credits.json`. Les données des 45 engins sont partagées dans `engins-data.js`.

## Actualités

Les actualités enregistrées sont dans `actualites.json`. Après les avoir mises à jour, exécutez `node scripts/build-news.mjs` pour régénérer `actualites.js`. La publication de nouveaux fichiers sur GitHub ou sur un hébergeur reste une étape distincte : les pages statiques ne se synchronisent pas toutes seules.

Plus de détails figurent dans `LISEZ-MOI.md`.
