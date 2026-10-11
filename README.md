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

Huit flux sont suivis : Sénat — Défense, ministère britannique de la Défense, Zone Militaire, OpexNews, Revue Conflits, Blablachars, Forces Operations Blog et Naval News. Blablachars ajoute un regard sur les blindés, FOB sur les programmes et l’industrie, Naval News sur le naval international. Les publications anglaises gardent leur langue et sont signalées. Chaque collecte ajoute au maximum deux articles par source ; les titres identiques, après normalisation des accents et de la ponctuation, sont filtrés sur la semaine récente. Deux traitements d’un même sujet peuvent néanmoins apporter des informations différentes.

Les actualités affichent les **images principales réellement publiées avec les articles**. À 8 h et 18 h, la collecte les repère dans les métadonnées Open Graph ou Twitter des sources configurées. Elle conserve les licences libres vérifiées quand elles sont disponibles et utilise les autorisations de republication confirmées par le propriétaire de Radar pour les autres images. Chaque image garde le crédit indiqué dans l’article, ou « Crédit non indiqué par l’éditeur » quand celui-ci manque, ainsi que le lien vers sa publication. Les logos et images de remplacement sont exclus. Une image inaccessible reste absente ; sa recherche est retentée après 24 heures. Le filtre « Avec photo uniquement » facilite leur consultation. Conflits reste référencé par titre et lien sans reprise de ses extraits.

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

## Autorisations photographiques spécifiques

Deux images précises ont d’abord été autorisées sur confirmation du propriétaire de Radar : le Rafale au décollage (EMA / Armée de l’Air), et le banquet avec Xi Jinping (© Robin Utrecht / SIPA, crédit confirmé dans les métadonnées du fichier original). Ces fichiers gardent leurs enregistrements individuels dans scripts/news-image-policy.json.

## Autorisations des images d’actualité

Le 11 octobre 2026, le propriétaire de Radar confirme avoir reçu les autorisations de tous les sites et titulaires concernés pour republier les images principales des articles du site et intégrer cette récupération dans les mises à jour automatiques. Cette confirmation est enregistrée sous `publisherPermission` dans scripts/news-image-policy.json avec les domaines des sources et des médias pris en charge. Les crédits restent attachés aux images. Ces autorisations de republication sur Radar ne constituent pas une licence libre accordée aux visiteurs et ne portent pas sur le texte intégral des articles.
