# Structure de Radar

## Trois espaces

1. **Racine : site éditable.** Les pages HTML et leurs scripts restent proches pour conserver les anciens liens. `atlas.css` définit la direction artistique commune. Chaque jeu a ses styles.
2. **`assets/` : médias et licences.** `jeu/` contient les photos communes, `histoire/` les galeries, `actualites/` les anciens visuels retirés des actualités, `qg/` le terrain et les sprites, `fonts/` les polices.
3. **`scripts/`, `docs/`, `.github/` : maintenance.** Vérification, documentation, collecte et publication. Ils ne sont pas copiés dans le site public.

## Ce qui charge quand

Les huit jeux utilisent `assets/game-ui.css` et `assets/game-ui.js` pour leurs menus, raccourcis clavier, filtres et affichage commun. Ces petits fichiers sont copiés avec les ressources de `assets/`. `check-game-ui.cjs` contrôle les filtres, les raccourcis pendant une saisie ou un dialogue, les liens et la cadence des dessins.

- Actualités : `actualites.json` est la source, `build-news.mjs` produit `actualites.js`. `news-tools.js` repère les thèmes et sélectionne l’image attachée à chaque publication, `news-view.js` affiche d’abord quatre publications. Les images principales chargent progressivement. La collecte utilise les licences vérifiées et les autorisations de republication confirmées par le propriétaire dans `news-image-policy.json`. Les lignes d’archives ne sont créées qu’à l’ouverture du dépliant.
- Histoire : `histoire-bootstrap.js` charge un catalogue léger. Récits, chiffres, carte et médias détaillés sont chargés à l’ouverture d’une fiche. Les modèles 3D sont ouverts à la demande.
- QG : `qg-radar-engine.js` gère les règles, `qg-radar-layout.js` les positions, `qg-radar-art.js` le dessin. Les scripts `qg-radar-sprites.js` et `qg-radar-terrain.js` contiennent les chemins des WebP. Le QG attend leurs images et redessine ; une erreur conserve le dessin de secours.
- Collection et Sauvegardes : aucune donnée personnelle n’est envoyée à un serveur par ces fonctionnalités.

## Construction et publication

`scripts/public-files.json` liste les fichiers racine à publier. Ajouter un nouveau fichier public à cette liste. `build-site.mjs` copie cette liste et les médias autorisés vers `_site/`, sans documents, tests, caches et médias retirés. Les anciennes sources d’Horizon sont conservées pour l’historique ; seul `horizon.html`, qui redirige, est publié.

`optimize-static.mjs` compacte les données dans `_site/` sans changer les sources éditables. `check-public-site.mjs` vérifie les ressources locales des pages, styles et chemins des sprites. Le workflow lance ces outils, puis envoie uniquement `_site/` à GitHub Pages.

## Outils actifs

| Outil | Rôle |
|---|---|
| `update-news.py` | Titres, dates, liens, extraits courts autorisés et images officielles |
| `news_images.py` / `news-image-policy.json` | Photos d’articles, crédits et preuves de droits |
| `build-news.mjs` / `news-image-validation.mjs` | Validation des actualités et des licences de photo |
| `build-site.mjs` / `public-files.json` | Construction publique, exclusions explicites |
| `optimize-static.mjs` | Compaction des données dans le résultat |
| `check-public-site.mjs` | Contrôle des dépendances locales publiées |
| `check-catalog.mjs` | Cohérence des engins, sources et fiches |
| `check-feature-flows.cjs` | Parcours de recherche, collection et jeux |
| `check-news-images.cjs` / `check-news-excerpts.py` | Images, crédits, archives et flux |
| `check-histoire-*.cjs` | Chargement, galeries et modèles 3D |
| `check-qg-*.cjs` | Règles et parcours du jeu de gestion |

Les scripts `add-*`, `find-*`, `download-*`, `apply-new-engins.mjs`, `update-copy.mjs` et fichiers `series-*` sont des aides utilisées lors d’extensions passées. Ils ne sont pas nécessaires pour publier le site et ne doivent pas être relancés comme entretien quotidien. Les contrôles d’Horizon concernent une rubrique retirée.

## Découverte et référencement

`decouverte-data.js` contient les dossiers et les comparatifs éditoriaux sourcés. `discovery-tools.js` partage les adresses lisibles, les encadrés et le classement de recherche. `scripts/build-discovery.mjs` prépare pendant la construction les 162 pages `fiche-*.html`, Comprendre et ses dossiers, les trois comparatifs, la recherche, son index, le sitemap et les aperçus de partage. Aucun export supplémentaire n’est nécessaire. La recherche lit le dernier `actualites.json` à chaque construction de 8 h et 18 h. Les galeries, cartes et collections restent chargées à la demande. La variable `RADAR_SITE_URL` permet de changer l’adresse canonique lors du raccordement d’un domaine. L’image `assets/radar-partage.png` est une création graphique de Radar.
