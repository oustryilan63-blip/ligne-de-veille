# Radar

Site francophone consacré à l'actualité de la défense, de la sécurité et de la géopolitique, avec sept jeux et un atlas de 100 engins militaires.

## Ouvrir le site

- [Site](https://oustryilan63-blip.github.io/ligne-de-veille/)
- [Tous les jeux](https://oustryilan63-blip.github.io/ligne-de-veille/tous-les-jeux.html)
- [Alerte radar](https://oustryilan63-blip.github.io/ligne-de-veille/alerte-radar.html)
- [Histoire des engins](https://oustryilan63-blip.github.io/ligne-de-veille/histoire.html)
- [Deviner le pays de conception](https://oustryilan63-blip.github.io/ligne-de-veille/jeux.html)
- [Reconnaître l'engin sur une photo](https://oustryilan63-blip.github.io/ligne-de-veille/devine-engin.html)
- [Zoom mystère](https://oustryilan63-blip.github.io/ligne-de-veille/zoom-mystere.html)
- [Chrono défense](https://oustryilan63-blip.github.io/ligne-de-veille/chrono-defense.html)
- [Vrai ou faux ?](https://oustryilan63-blip.github.io/ligne-de-veille/vrai-ou-faux.html)
- [Défi du jour](https://oustryilan63-blip.github.io/ligne-de-veille/defi-du-jour.html)

Le site fonctionne également sans installation : ouvrez `index.html` dans un navigateur, puis la rubrique « Jeux ». Les jeux de connaissance utilisent le catalogue de 100 engins. « Alerte radar » est une simulation d'arcade indépendante, avec des pistes et des moyens fictifs ; sa carte de France reprend les contours Natural Earth du site. Le jeu chronologique s'appuie sur dix-neuf dates de premier vol vérifiées dans les archives des fabricants. Le vrai/faux contient soixante-sept affirmations sourcées, dont dix sont tirées au hasard par partie. Le défi du jour change à minuit, heure de Paris, et le résultat est conservé localement dans le navigateur : il n'y a pas de classement global.

La direction graphique « Atlas stratégique » est appliquée à l'accueil, aux jeux et à la rubrique Histoire. Les polices IBM Plex sont conservées dans `assets/fonts/atlas` avec leur licence. Les photos sont créditées et leurs détails figurent dans `assets/jeu/ajouts/credits.json` et `assets/jeu/ajouts/serie-2/credits.json` et les relevés `serie-3/credits.json` et `serie-4/credits.json` du même dossier. Les données des 100 engins sont partagées dans `engins-data.js` ; leurs textes et chiffres historiques sont dans `histoire-data.js`. La carte utilise `map-data.js`.

## Histoire

`histoire.html` présente les 100 engins sous forme de catalogue filtrable. Chaque fiche est accessible par un lien direct (`histoire.html?engin=0` à `histoire.html?engin=99`) et montre la photo, un récit, une carte des pays documentés et les sources. Le pays de conception, les utilisateurs actuels et les anciens utilisateurs ont des couleurs distinctes. Les pays qui ont seulement commandé un engin ne sont pas considérés comme opérateurs. Les chiffres complémentaires sont dans `histoire-chiffres.js` : ils peuvent provenir de sources officielles, de constructeurs ou de travaux spécialisés fiables. Chaque carte précise si elle concerne la production, des livraisons, une flotte en service, des pertes sur un conflit donné ou des cibles attribuées. Un chiffre indisponible ne signifie pas zéro. Quand les cibles détruites ne peuvent pas être attribuées de façon fiable, la fiche affiche le nombre de pays représentés sur sa carte. Pour les bâtiments individuels, « 1 bâtiment » désigne la fiche du navire, pas toute sa classe. Les chiffres et les statuts des flottes doivent être revérifiés lors d'une mise à jour éditoriale.

## Actualités

Une collecte GitHub Actions est programmée tous les jours à **8 h, heure de Paris**, y compris après le changement d’heure. Elle fonctionne ordinateur éteint. GitHub peut retarder le démarrage de quelques minutes. Les titres, dates et liens proviennent des flux du Sénat, du ministère britannique de la Défense, d’Opex360, d’OpexNews et de Conflits. Les publications anglophones sont signalées. Aucun résumé automatique d’article n’est inventé : le lecteur est invité à consulter l’original. Les archives sont conservées. Une collecte doit réussir sur au moins une source documentaire et une source spécialisée ; sinon la dernière version publiée reste en place.

La configuration se trouve dans `.github/workflows/veille-quotidienne.yml`, la collecte dans `scripts/update-news.py` et les flux dans `scripts/news-sources.json`. La date et l’heure du dernier contrôle apparaissent sur l’accueil.

Les actualités enregistrées sont dans `actualites.json`. Après les avoir mises à jour, exécutez `node scripts/build-news.mjs` pour régénérer `actualites.js`. Le workflow publie ensuite automatiquement les fichiers sur GitHub Pages. Une modification locale ne devient publique qu’après son envoi dans le dépôt.

Plus de détails figurent dans `LISEZ-MOI.md`.

## Extension missiles — 11 octobre 2026

Dix nouvelles fiches, dont six ICBM, portent le catalogue à 100 engins et 18 missiles. Les jeux utilisant le catalogue commun les incluent ; dix affirmations complètent le vrai/faux. Chrono conserve ses dates de premiers vols d’avions. Les données de production, livraisons et inventaires restent distinctes et datées. Les événements matériels documentés apparaissent sous les statistiques, avec les sources et le statut (coulé, endommagé, attribution collective ou hors combat). Ils ne sont pas un bilan mondial de destructions. Les dix images et leurs licences sont regroupées dans assets/jeu/ajouts/serie-5. Le M51 est illustré par un dessin explicitement crédité.

## Fiches techniques (11 octobre 2026)

Les 100 fiches Histoire proposent un bouton sous leur présentation. `histoire-technique.js` contient 576 caractéristiques publiques avec une variante explicite, une source par valeur, une date de consultation et une note de périmètre. Les panneaux sont fermés au chargement et accessibles au clavier.

Les données non confirmées ne sont pas complétées par déduction. Certaines fiches restent partielles (notamment J-10, J-20, Su-57, Type 055, Topol-M, Yars, DF-41 et SM-3). Les masses, dimensions et performances varient selon les configurations. Les chiffres convertis sont signalés. Le contrôle du catalogue exige une fiche technique sourcée pour chaque nouvel engin.

## Relecture des fiches et portées — 11 octobre 2026

Les 100 fiches techniques et leurs récits ont été relus. Les variantes, conversions et conditions de mesure sont précisées ; les récits sont enrichis de jalons sourcés. Les 18 fiches missiles comportent une ligne de portée : 16 repères publics chiffrés, dont certaines bornes inférieures ou estimations datées, et deux absences explicitement signalées (IRIS-T air-air, SM-3 Block IIA). La portée M51 concerne uniquement le M51.2. Les références et réserves sont affichées à côté des valeurs. Astute : sixième livraison confirmée en septembre 2026, distincte de la disponibilité opérationnelle.

## Retrait de la rubrique Horizon — 11 octobre 2026

La navigation ne comporte plus que Actualités, Jeux et Histoire. L’ancienne adresse horizon.html redirige vers le catalogue des sept jeux ; elle ne charge plus l’activité ni ses scripts.

## Parcours de découverte — 11 octobre 2026

Accueil raccourci, défi du jour et veille mis en avant. comparateur.html affiche deux variantes avec leurs caractéristiques sourcées ; aucun classement de performances. histoire-frises.js contient 216 jalons datés pour les 100 fiches. progression.js conserve scores normalisés, badges et questions ratées dans le navigateur (clé ldv-progression-v1), sans compte ni transmission. revision.html propose une révision ciblée qui ne modifie pas les records. Le défi du jour ne peut être recompté après rechargement. En cas de stockage refusé, le jeu reste disponible.
