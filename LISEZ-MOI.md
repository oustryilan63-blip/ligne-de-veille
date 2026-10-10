# Ligne de Veille

Prototype de revue française consacré à la défense, à la sécurité et à la géopolitique.

La page d'accueil se concentre sur une sélection d'actualités sourcées et datées. Chaque sujet comporte un bref « Pourquoi c'est important » et renvoie à sa publication d'origine. Une archive regroupe les sujets par mois. Le bouton « Signaler une erreur » prépare un e-mail vers l'adresse choisie par le propriétaire du site. La sélection et les résumés sont produits automatiquement avec une aide de l'IA, sans validation humaine systématique avant publication ; les sources d'origine restent la référence.

Cette copie locale ne nécessite aucune installation : ouvrez `index.html` dans un navigateur. Elle contient huit publications au 10 octobre 2026. La version publique à jour est disponible à l'adresse https://oustryilan63-blip.github.io/ligne-de-veille/. Une ancienne copie reste accessible sur Netlify à l'adresse https://illustrious-kelpie-138794.netlify.app/. L'ancienne version privée, sans le jeu, reste disponible à l'adresse https://ligne-de-veille.astuteghost128.chatgpt.site/.

La nouvelle adresse publique est une copie statique : ses actualités ne se mettent pas à jour automatiquement. La veille quotidienne à 8 h continue sur l'ancienne version privée et, lorsque l'ordinateur et l'application sont ouverts, dans cette copie locale. Après une mise à jour locale, il faut envoyer les fichiers modifiés dans le dépôt GitHub ; GitHub Pages publie alors cette nouvelle version.

## Jeux

La page `jeux.html` propose « D'où vient cet engin ? » : quarante-cinq photos de chars, de blindés, d'avions, de drones, d'un hélicoptère, de navires et d'artillerie, à situer sur une carte cliquable. Le joueur choisit une partie rapide de cinq questions ou un grand tour, puis une catégorie (tout, terre, air ou mer). Les questions sont mélangées à chaque nouvelle partie. Le joueur dispose de cinq tentatives par engin et peut afficher un indice géographique. Une bonne réponse rapporte jusqu'à cinq points, avec un point de moins lorsqu'un indice a été utilisé. Après une bonne réponse ou cinq essais, une explication et sa source officielle apparaissent. Le pays demandé est celui de la conception principale, qui peut différer du pays de fabrication ou d'utilisation. Une liste de pays permet aussi de jouer au clavier et sur téléphone.

Les rubriques « Actualités » et « Jeux » apparaissent en haut des deux pages. Pour tester le parcours, ouvrez `index.html`, puis cliquez sur « Jeux » ; le lien « Actualités » du jeu permet de revenir à la revue.

La carte utilise les données Natural Earth du domaine public et couvre 241 pays et territoires représentés dans le jeu de données à l'échelle 1:50 millions. Elle se déplace au glisser avec la souris ou le doigt. La molette, le pincement à deux doigts et les boutons permettent de zoomer ; « Vue monde » recentre la carte. Les photos proviennent de Wikimedia Commons ; leur auteur, leur page et leur licence sont indiqués sous chaque image dans le jeu. Les trente-huit photos ajoutées et leur relevé de crédits sont rassemblés dans `assets/jeu/ajouts`. Le jeu reste disponible hors ligne.

Le jeu de quarante-cinq engins est disponible dans cette copie locale et sur GitHub Pages. Deux maquettes de la nouvelle direction graphique sont accessibles via `apercu-accueil.html` et `apercu-jeux.html` ; elles utilisent `atlas.css` et les polices libres IBM Plex rangées dans `assets/fonts/atlas`. Le site actuel reste séparé des maquettes. L'actualité automatique de l'ancienne version privée continue indépendamment.

## Mise à jour de la veille

Les actualités de cette copie sont conservées dans `actualites.json`. La tâche locale les actualise et recrée l'archive ZIP chaque matin si l'ordinateur est allumé et que l'application ChatGPT est ouverte. Pour une mise à jour manuelle, ajoutez les nouvelles entrées sans supprimer l'historique, avec un résumé, un motif « Pourquoi c'est important », une date et un lien vérifié. Exécutez ensuite `node scripts/build-news.mjs` pour produire `actualites.js`. Le script contrôle les dates, les champs requis, les doublons et les adresses HTTPS. La veille automatique du site hébergé utilise son propre stockage.

L'image d'ouverture a été créée pour ce projet avec ImageGen à partir de la consigne suivante : « Vue aérienne documentaire d'un passage maritime côtier non identifiable à l'aube, palette bleu marine et sable, espace sombre à gauche pour le texte, sans personne, véhicule, drapeau, logo ni texte. »
