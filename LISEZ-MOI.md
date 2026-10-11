# Radar

Site : https://oustryilan63-blip.github.io/ligne-de-veille/

La navigation rassemble Actualités, Jeux et Histoire. La copie locale s’ouvre avec index.html.

## Catalogue et jeux

Le catalogue commun contient 100 engins, dont dix-huit missiles. Les mêmes photos et crédits alimentent l’histoire, le jeu du pays de conception, la reconnaissance du nom, Zoom mystère et le défi du jour. Les jeux du pays et du nom ont une catégorie Missiles. Le vrai/faux comprend 67 affirmations sourcées ; Chrono défense utilise 19 dates de premier vol vérifiées. Les missiles ne sont pas ajoutés artificiellement aux questions de premier vol d’avions.

Pour les programmes multinationaux documentés, chacun des pays partenaires indiqués dans la fiche est accepté dans le jeu géographique. Les résultats et scores restent dans le navigateur. Le défi du jour change à minuit, heure de Paris.

## Histoire

Les 100 fiches partagent l’ordre d’engins-data.js ; histoire-data.js contient les récits et histoire-chiffres.js les statistiques sourcées. Les sources officielles, constructeurs et travaux spécialisés sont cités. Chaque chiffre indique son périmètre et sa date : production, livraison, flotte ou pertes documentées. Une information indisponible ne signifie pas zéro. La carte distingue conception, utilisateurs actuels documentés et anciens utilisateurs. Les commandes et lieux de déploiement ne sont pas assimilés à des utilisateurs. Certaines nouvelles fiches ne recensent que les pays de conception ; cela est signalé.

Les photos Wikimedia Commons sont conservées avec leurs crédits et licences dans assets/jeu/ajouts et ses sous-dossiers serie-2, serie-3, serie-4 et serie-5. Les polices IBM Plex et leur licence sont dans assets/fonts/atlas. Le fond cartographique Natural Earth est dans le domaine public.

## Veille automatique à 8 h

Le workflow GitHub Actions veille-quotidienne.yml est programmé chaque matin à 8 h, fuseau Europe/Paris. Il fonctionne même si l’ordinateur est éteint. GitHub peut mettre l’exécution en attente : la publication n’est pas garantie à la seconde exacte.

La collecte consulte les flux du Sénat, du ministère britannique de la Défense, d’Opex360, d’OpexNews et de Conflits. Elle retient des titres récents datés, vérifie leurs liens et conserve l’historique. Les titres anglophones sont signalés. Les nouvelles cartes renvoient à la publication originale sans prétendre en proposer un résumé. Les anciens résumés éditoriaux restent dans les archives.

Le script exige au moins une source officielle et une source spécialisée accessibles. En cas d’échec global, la dernière version publique reste disponible et GitHub Actions indique l’erreur. L’accueil indique le dernier contrôle et le nombre de flux consultés.

actualites.json conserve les données ; scripts/update-news.py les collecte ; scripts/build-news.mjs valide et génère actualites.js. Le workflow enregistre puis publie les changements. On peut relancer la collecte depuis Actions → Veille de 8 h et publication du site → Run workflow. Une copie modifiée sur l’ordinateur doit être envoyée dans GitHub pour être publiée.

Le bouton Signaler une erreur prépare un e-mail, sans l’envoyer automatiquement. L’image d’ouverture a été créée pour ce projet avec ImageGen.

## Extension missiles — 11 octobre 2026

Dix nouvelles fiches, dont six ICBM, portent le catalogue à 100 engins et 18 missiles. Les jeux utilisant le catalogue commun les incluent ; dix affirmations complètent le vrai/faux. Chrono conserve ses dates de premiers vols d’avions. Les données de production, livraisons et inventaires restent distinctes et datées. Les événements matériels documentés apparaissent sous les statistiques, avec les sources et le statut (coulé, endommagé, attribution collective ou hors combat). Ils ne sont pas un bilan mondial de destructions. Les dix images et leurs licences sont regroupées dans assets/jeu/ajouts/serie-5. Le M51 est illustré par un dessin explicitement crédité.
