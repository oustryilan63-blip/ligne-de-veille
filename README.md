# Radar

Actualités de défense et de géopolitique, huit jeux et un atlas de **130 engins** avec photographies, sources, fiches techniques et modèles 3D disponibles.

**[Ouvrir Radar](https://oustryilan63-blip.github.io/ligne-de-veille/)** · [Jeux](https://oustryilan63-blip.github.io/ligne-de-veille/tous-les-jeux.html) · [Histoire](https://oustryilan63-blip.github.io/ligne-de-veille/histoire.html)

## Se retrouver dans les fichiers

| Je veux modifier… | Fichiers à ouvrir |
|---|---|
| L’accueil et ses actualités | index.html, news-view.js, news-images.css |
| Les couleurs et la typographie | atlas.css, style.css |
| Les sources et horaires de veille | scripts/news-sources.json, .github/workflows/veille-quotidienne.yml |
| Les engins partagés par les jeux et l’atlas | engins-data.js |
| Les textes, chiffres et fiches techniques | histoire-data.js, histoire-chiffres.js, histoire-technique.js |
| Les photos et modèles 3D | histoire-photos-data.js, histoire-3d-data.js, assets/histoire/ |
| Le jeu de gestion QG | qg-radar.html, qg-radar-engine.js, qg-radar-art.js, assets/qg/ |
| La collection et les sauvegardes | collection.js, sauvegarde.js |

Le [guide de structure](ARCHITECTURE.md) détaille les liens entre les fichiers. Le [journal](docs/journal.md) conserve les notes des versions précédentes ; certains chiffres de ces notes sont historiques.

## Actualités automatiques

GitHub Actions consulte les sources à **8 h et 18 h, heure de Paris**. GitHub peut décaler le démarrage d’une tâche planifiée. La date du dernier contrôle est affichée sur le site. La veille conserve les anciens articles et vérifie les liens avant d’ajouter un titre.

Les photos d’article prises en charge sont les images éditoriales officielles GOV.UK sous OGL, avec exclusion des crédits tiers détectés. Elles sont affichées depuis le serveur officiel. Les autres publications utilisent une **illustration clairement signalée** : photographie libre d’un engin nommé dans le titre, mosaïque satellitaire NASA ou dessin Radar lié au thème. Les images d’un flux ne sont pas considérées comme librement réutilisables par défaut. Conflits est référencé par titre et lien, sans reprise de ses extraits ni de ses photos.

## Modifier et vérifier

Node.js est nécessaire pour construire et contrôler le site ; Python 3.9+ avec les données de fuseaux horaires est utilisé pour la veille. Aucun paquet JavaScript à installer pour la construction courante.

```sh
node scripts/build-news.mjs
node scripts/check-catalog.mjs
node scripts/check-feature-flows.cjs
node scripts/check-news-images.cjs
node scripts/build-site.mjs
node scripts/optimize-static.mjs _site
node scripts/check-public-site.mjs _site
```

Le dossier **_site/** est le résultat destiné à l’hébergement, jamais le dossier à modifier. Le workflow reconstruit et publie ce dossier après un changement sur main. Pour consulter localement, ouvrir index.html ; la veille automatique reste exécutée sur GitHub.

## Données et médias

- Les numéros d’engins sont stables : **ajouter en fin de catalogue**, sans réordonner les entrées utilisées dans les liens et les sauvegardes.
- Les jeux de connaissance partagent le catalogue ; Chrono utilise 29 dates de premier vol vérifiées et Vrai ou faux 97 affirmations sourcées. QG et Alerte radar sont des simulations d’arcade.
- Les sauvegardes et favoris restent dans le navigateur ; leur export passe par la page Sauvegardes.
- Les crédits et licences des photos sont conservés avec les données et dans les dossiers de médias. Les polices locales ont leur licence dans assets/fonts/atlas/.
- Les sprites du QG sont des fichiers WebP séparés, mis en cache par le navigateur ; leur dessin n’a pas été modifié par cette optimisation.
- Le code et les médias tiers n’ont pas une licence commune : vérifier le crédit de chaque média avant réutilisation.
