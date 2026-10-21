# Radar

Actualités de défense et de géopolitique, huit jeux et un atlas de **162 engins** avec photographies, sources, fiches techniques et modèles 3D disponibles.

**[Ouvrir Radar](https://oustryilan63-blip.github.io/ligne-de-veille/)** · [Jeux](https://oustryilan63-blip.github.io/ligne-de-veille/tous-les-jeux.html) · [Histoire](https://oustryilan63-blip.github.io/ligne-de-veille/histoire.html)

## Se retrouver dans les fichiers

| Je veux modifier… | Fichiers à ouvrir |
|---|---|
| L’accueil et ses actualités | index.html, news-view.js, news-images.css |
| Les couleurs et la typographie | atlas.css, style.css |
| Les sources et horaires de veille | scripts/news-sources.json, .github/workflows/veille-quotidienne.yml |
| Les engins partagés par les jeux et l’atlas | engins-data.js |
| Les textes, chiffres et fiches techniques | histoire-data.js, histoire-chiffres.js, histoire-technique.js |
| Les chronologies et leurs références | histoire-frises.js |
| Les photos et modèles 3D | histoire-photos-data.js, histoire-3d-data.js, assets/histoire/ |
| Le jeu de gestion QG | qg-radar.html, qg-radar-engine.js, qg-radar-art.js, assets/qg/ |
| La collection et les sauvegardes | collection.js, sauvegarde.js |

Le [guide de structure](ARCHITECTURE.md) détaille les liens entre les fichiers. Le [journal](docs/journal.md) conserve les notes des versions précédentes ; certains chiffres de ces notes sont historiques.

## Actualités automatiques

GitHub Actions consulte les sources à **8 h et 18 h, heure de Paris**. GitHub peut décaler le démarrage d’une tâche planifiée. La date du dernier contrôle est affichée sur le site. La veille conserve les anciens articles et vérifie les liens avant d’ajouter un titre.

Les dossiers **Ukraine**, **Taïwan** et **Moyen-Orient** sont actualisés à 8 h et 18 h dans la même exécution que les actualités. `scripts/update-conflicts.py` conserve la liste des articles et appelle `conflict_digests.py` pour actualiser le texte des événements récents à partir des résumés RSS français d’ONU Info, France 24 et RFI (configuration : `scripts/conflict-digest-sources.json`). Il compile jusqu’à trois paragraphes, contenant chacun jusqu’à trois phrases complètes du résumé de l’éditeur (90 mots maximum), sa date de publication et un lien vérifié. Il ne coupe jamais une phrase pour atteindre cette limite et n’ajoute pas de points de suspension. Un résumé trop long ou incomplet est ignoré si aucune phrase complète exploitable ne peut être conservée. Les anciennes versions coupées ne sont pas réintroduites en cas de panne. Il ne génère ni analyse, ni traduction, ni bilan militaire. Les formulations prudentes des sources sont conservées. Les événements doivent dater des 14 derniers jours ; titres, thèmes, doublons et domaines sont filtrés. Aucun corps d’article, aucune nouvelle photo, aucune clé API ne sont nécessaires.

`conflits-actualites.json` conserve séparément la date de collecte, la date de modification du texte et la date de chaque publication. Un même texte ne reçoit pas une fausse nouvelle date de modification à chaque passage. Si les résumés manquent ou si les sources échouent, le dernier texte est conservé avec ses dates et un avis visible. Le contexte historique garde sa propre date de vérification. Le workflow enregistre les actualités et les trois dossiers dans le même commit puis reconstruit le site. Tests locaux sans réseau : `node scripts/check-conflicts.cjs`.

La sélection couvre aussi la **géopolitique** : diplomatie, alliances, sanctions, rivalités et enjeux économiques internationaux. Le bouton « Géopolitique » ouvre ce thème ; un lien direct est disponible avec `?theme=geopolitique#actualites`. Aux sources de défense et à Revue Conflits s’ajoutent [le Conseil de l’UE](https://www.consilium.europa.eu/en/about-site/rss/) et [Areion](https://www.areion24.news/diplomatie/). Leurs rubriques internationales sont sélectionnées avant la limite par source pour éviter les annonces administratives sans rapport. Les communiqués du Conseil sont référencés en anglais et signalés comme tels. Areion fournit les rubriques Diplomatie, Grands Dossiers de Diplomatie, Carto et Moyen-Orient. Les horaires existants et le traitement des photos sont conservés.

Onze flux sont suivis : Sénat — Défense, ministère britannique de la Défense, Zone Militaire, OpexNews, Forum Militaire, Revue Conflits, Blablachars, Forces Operations Blog, Naval News, Conseil de l’UE et Areion. Blablachars ajoute un regard sur les blindés, FOB sur les programmes et l’industrie, Naval News sur le naval international. [Forum Militaire](https://www.forum-militaire.fr/) est consulté par son [flux RSS](https://www.forum-militaire.fr/feed/), avec au maximum deux nouveaux articles par passage, sur la défense, les armées, l’industrie et la géopolitique. Les publications anglaises gardent leur langue et sont signalées. Chaque collecte ajoute au maximum deux ou trois articles par source selon sa configuration ; les titres identiques, après normalisation des accents et de la ponctuation, sont filtrés sur la semaine récente. Deux traitements d’un même sujet peuvent néanmoins apporter des informations différentes.

Les actualités affichent les **images principales réellement publiées avec les articles**. À 8 h et 18 h, la collecte les repère dans les métadonnées Open Graph ou Twitter des sources configurées. Elle conserve les licences libres vérifiées quand elles sont disponibles et utilise les autorisations de republication confirmées par le propriétaire de Radar pour les autres images. Chaque image garde le crédit indiqué dans l’article, ou « Crédit non indiqué par l’éditeur » quand celui-ci manque, ainsi que le lien vers sa publication. Les logos et images de remplacement sont exclus. Une image inaccessible reste absente ; sa recherche est retentée après 24 heures. Le filtre « Avec photo uniquement » facilite leur consultation. Conflits reste référencé par titre et lien sans reprise de ses extraits. Forum Militaire est suivi pour ses titres, dates, liens et courts extraits RSS ; ses photos ne sont pas republiées automatiquement, ses autorisations ne faisant pas partie des domaines déjà configurés.

## Histoires et frises

Les 162 récits sont organisés en chapitres : origines, conception, carrière et évolutions. Chaque passage donne accès à ses références dans un dépliant. Les frises réunissent des étapes documentées de la naissance du programme à sa carrière ; une annonce, un prototype, une livraison et une entrée en service restent des événements distincts. Les dates gardent la précision réelle des sources et les variantes sont identifiées. Un lien dans le récit donne accès directement à la chronologie.

Les paragraphes et leurs références se trouvent dans `histoire-data.js` (`storySections`), les événements dans `histoire-frises.js`. L’indice de chaque fiche reste celui d’`engins-data.js` : modifier les histoires ne change pas les identités utilisées dans les jeux ou les collections. Le chargement complet du récit reste réservé à l’ouverture d’une fiche.

## Modifier et vérifier

Node.js est nécessaire pour construire et contrôler le site ; Python 3.9+ avec les données de fuseaux horaires est utilisé pour la veille. Aucun paquet JavaScript à installer pour la construction courante.

Pour une modification courante, une seule commande choisit les contrôles utiles et en exécute jusqu'à quatre à la fois, sans accès réseau ni publication :

```sh
node scripts/check-changes.mjs --files histoire-photos-data.js
```

Remplacer les noms par les fichiers réellement modifiés. Sans argument, le contrôle général couvre le catalogue, les parcours et les sauvegardes. `--plan` affiche la sélection ; `--report` conserve les durées dans `test-results/check-changes.json`. Les changements de documentation ne lancent pas de tests. Pour une modification transversale ou avant une migration :

```sh
node scripts/check-changes.mjs --all
```

La recherche et la vérification des sources des nouvelles fiches restent nécessaires. Les contrôles automatiques vérifient leur cohérence ; ils ne confirment pas à eux seuls la justesse d'une source externe. Une retouche visuelle appelle un contrôle ciblé de son rendu.

### Publier ou changer d'hébergeur

Le workflow GitHub construit déjà le site et le publie après l'envoi des modifications sur main. Il n'est pas nécessaire de construire aussi le site localement, de fabriquer un ZIP et d'envoyer plusieurs copies à chaque retouche.

Pour exporter vers un autre hébergeur, préparer une seule fois un dossier vide avec ces commandes :

```sh
node scripts/build-news.mjs
node scripts/build-site.mjs _site-export
node scripts/optimize-static.mjs _site-export
node scripts/check-public-site.mjs _site-export
```

Le contenu de `_site-export/` est indépendant de GitHub et peut être déposé sur un hébergement statique. Le ZIP sert seulement si le service choisi le demande. La veille de 8 h et 18 h utilise actuellement GitHub Actions : lors d'une migration, garder ce traitement connecté au nouvel hébergement ou installer son remplacement avant de l'arrêter.

Le dossier **_site/** est le résultat destiné à l’hébergement, jamais le dossier à modifier. Le workflow reconstruit et publie ce dossier après un changement sur main. Pour consulter localement, ouvrir index.html ; la veille automatique reste exécutée sur GitHub.

## Navigation et prise en main des jeux

La page Jeux permet de filtrer les huit activités et affiche leur format avant de jouer. Une entrée en niveau Débutant facilite le premier essai. Chaque jeu propose un retour vers la sélection, un menu commun et des règles rapides. Les quiz de photo et de carte regroupent leurs réglages dans un dépliant ; changer un réglage lance une nouvelle partie. Les touches 1 à 4 répondent aux QCM, et 1 / 2 à Vrai ou faux, lorsqu'aucun champ de saisie ou menu n'est actif. QG et Alerte radar limitent leurs dessins à environ 30 rafraîchissements par seconde tout en continuant à compter leur temps d'animation. `assets/game-ui.css` et `assets/game-ui.js` regroupent ces fonctions.

## Données et médias

- Les numéros d’engins sont stables : **ajouter en fin de catalogue**, sans réordonner les entrées utilisées dans les liens et les sauvegardes.
- Les jeux de connaissance partagent le catalogue ; Chrono utilise 39 dates de premier vol vérifiées et Vrai ou faux 129 affirmations sourcées. QG et Alerte radar sont des simulations d’arcade.
- Les sauvegardes et favoris restent dans le navigateur ; leur export passe par la page Sauvegardes.
- Les crédits et licences des photos sont conservés avec les données et dans les dossiers de médias. Les polices locales ont leur licence dans assets/fonts/atlas/.
- Les sprites du QG sont des fichiers WebP séparés, mis en cache par le navigateur ; leur dessin n’a pas été modifié par cette optimisation.
- Le code et les médias tiers n’ont pas une licence commune : vérifier le crédit de chaque média avant réutilisation.

## Autorisations photographiques spécifiques

Deux images précises ont d’abord été autorisées sur confirmation du propriétaire de Radar : le Rafale au décollage (EMA / Armée de l’Air), et le banquet avec Xi Jinping (© Robin Utrecht / SIPA, crédit confirmé dans les métadonnées du fichier original). Ces fichiers gardent leurs enregistrements individuels dans scripts/news-image-policy.json.

## Autorisations des images d’actualité

Le 11 octobre 2026, le propriétaire de Radar confirme avoir reçu les autorisations de tous les sites et titulaires concernés pour republier les images principales des articles du site et intégrer cette récupération dans les mises à jour automatiques. Cette confirmation est enregistrée sous `publisherPermission` dans scripts/news-image-policy.json avec les domaines des sources et des médias pris en charge. Les crédits restent attachés aux images. Ces autorisations de republication sur Radar ne constituent pas une licence libre accordée aux visiteurs et ne portent pas sur le texte intégral des articles.

## Série 7 — 12 octobre 2026

Vingt nouveaux engins portent le catalogue à 150 : six terrestres, six avions, quatre familles navales et quatre missiles. Ils enrichissent Histoire, le comparateur, la collection et les jeux de connaissance pertinents. Quarante photographies réelles créditées et dix-sept lecteurs 3D sont ajoutés ; les variantes représentées sont précisées. Aucun lecteur approximatif n’est ajouté au VAB, à Horizon ou à Aster 30. Les cartes des nouvelles fiches suivent les utilisateurs explicitement documentés et leurs limites ; l’origine de conception n’est pas interprétée comme une utilisation actuelle. Les chiffres de livraisons, de commandes et les épisodes particuliers restent distingués des totaux de production. Les nouveaux engins se retrouvent dans « Ajouts récents ».

## Série 8 — 12 octobre 2026

Douze nouveaux engins : M26 Pershing, Centurion, PT-76, BMP-2, AC-130J Ghostrider, U-2 Dragon Lady, F-5 Tiger II, AV-8B Harrier II, classes Iowa et Nimitz, Naval Strike Missile et AGM-158 JASSM. Ils enrichissent l’atlas, les jeux de connaissance, le comparateur et la collection. Vingt-quatre photos réelles créditées, douze affirmations et quatre premiers vols sont ajoutés. Les lecteurs 3D sont présents lorsqu’un modèle correspondant a été trouvé. Les opérateurs suivent les attestations et dates explicitement citées ; les commandes de rénovation sont distinguées des résultats de combat. L’ergonomie des fiches reste conservée.

## Informations du site et protections

Les pages À propos, Mentions légales, Confidentialité et Conditions sont accessibles dans le pied de page. L’éditeur a déclaré une activité personnelle non professionnelle et choisi l’anonymat de l’article 1-1 II de la LCEN, en confirmant avoir communiqué ses éléments d’identification à GitHub. Le lecteur Sketchfab est soumis à un choix préalable ; le paramètre dnt=1 ne suffit pas à garantir une absence de traitement. Les données des jeux restent dans le navigateur. La page Confidentialité permet leur effacement ciblé après confirmation. La durée des échanges ordinaires reçus par e-mail doit être appliquée par l’éditeur : six mois après clôture, sous réserve des obligations de conservation justifiées.

Les pages ont une politique CSP calculée par scripts/security-meta.mjs : scripts du site et hachages des scripts intégrés, objets désactivés, URL de base bloquée, lecteur limité à Sketchfab. Les styles intégrés restent nécessaires aux jauges et aux cartes ; les images HTTPS des éditeurs restent autorisées. Le script de construction recalcule les hachages sur les fichiers publiés. Les en-têtes HTTP de GitHub Pages relèvent de l’hébergeur ; une balise meta ne fournit pas toutes les protections d’un en-tête CSP serveur.

### Publication cohérente depuis l’interface GitHub

Lorsque des fichiers sont envoyés dans plusieurs répertoires, préparer tous les changements sur une branche créée depuis main. Envoyer les fichiers publics et le manifeste sur cette même branche, vérifier la différence et les contrôles concernés, puis fusionner la branche en une seule publication dans main. Une modification intermédiaire du manifeste dans main peut référencer des fichiers qui n’ont pas encore été envoyés ; c’est la cause de l’échec #130 du 13 octobre 2026, corrigé par la publication complète #131. La veille de 8 h et 18 h (Europe/Paris) reste sur main.
