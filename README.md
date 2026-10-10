# Ligne de Veille

Site francophone consacré à l'actualité de la défense, de la sécurité et de la géopolitique, avec six jeux et un atlas de 70 engins militaires.

## Ouvrir le site

- [Site](https://oustryilan63-blip.github.io/ligne-de-veille/)
- [Tous les jeux](https://oustryilan63-blip.github.io/ligne-de-veille/tous-les-jeux.html)
- [Histoire des engins](https://oustryilan63-blip.github.io/ligne-de-veille/histoire.html)
- [Deviner le pays de conception](https://oustryilan63-blip.github.io/ligne-de-veille/jeux.html)
- [Reconnaître l'engin sur une photo](https://oustryilan63-blip.github.io/ligne-de-veille/devine-engin.html)
- [Zoom mystère](https://oustryilan63-blip.github.io/ligne-de-veille/zoom-mystere.html)
- [Chrono défense](https://oustryilan63-blip.github.io/ligne-de-veille/chrono-defense.html)
- [Vrai ou faux ?](https://oustryilan63-blip.github.io/ligne-de-veille/vrai-ou-faux.html)
- [Défi du jour](https://oustryilan63-blip.github.io/ligne-de-veille/defi-du-jour.html)

Le site fonctionne également sans installation : ouvrez `index.html` dans un navigateur, puis la rubrique « Jeux ». Les six jeux utilisent le même catalogue de 70 engins. Le jeu chronologique s'appuie sur treize dates de premier vol vérifiées dans les archives des fabricants. Le vrai/faux contient trente-sept affirmations sourcées, dont dix sont tirées au hasard par partie. Le défi du jour change à minuit, heure de Paris, et le résultat est conservé localement dans le navigateur : il n'y a pas de classement global.

La direction graphique « Atlas stratégique » est appliquée à l'accueil, aux jeux et à la rubrique Histoire. Les polices IBM Plex sont conservées dans `assets/fonts/atlas` avec leur licence. Les photos sont créditées et leurs détails figurent dans `assets/jeu/ajouts/credits.json` et `assets/jeu/ajouts/serie-2/credits.json`. Les données des 70 engins sont partagées dans `engins-data.js` ; leurs textes et chiffres historiques sont dans `histoire-data.js`. La carte utilise `map-data.js`.

## Histoire

`histoire.html` présente les 70 engins sous forme de catalogue filtrable. Chaque fiche est accessible par un lien direct (`histoire.html?engin=0` à `histoire.html?engin=69`) et montre la photo, un récit, une carte des pays documentés et les sources. Le pays de conception, les utilisateurs actuels et les anciens utilisateurs ont des couleurs distinctes. Les pays qui ont seulement commandé un engin ne sont pas considérés comme opérateurs. Les chiffres complémentaires sont dans `histoire-chiffres.js` : ils peuvent provenir de sources officielles, de constructeurs ou de travaux spécialisés fiables. Chaque carte précise si elle concerne la production, des livraisons, une flotte en service, des pertes sur un conflit donné ou des cibles attribuées. Un chiffre indisponible ne signifie pas zéro. Quand les cibles détruites ne peuvent pas être attribuées de façon fiable, la fiche affiche le nombre de pays représentés sur sa carte. Pour les bâtiments individuels, « 1 bâtiment » désigne la fiche du navire, pas toute sa classe. Les chiffres et les statuts des flottes doivent être revérifiés lors d'une mise à jour éditoriale.

## Actualités

Les actualités enregistrées sont dans `actualites.json`. Après les avoir mises à jour, exécutez `node scripts/build-news.mjs` pour régénérer `actualites.js`. La publication de nouveaux fichiers sur GitHub ou sur un hébergeur reste une étape distincte : les pages statiques ne se synchronisent pas toutes seules.

Plus de détails figurent dans `LISEZ-MOI.md`.
