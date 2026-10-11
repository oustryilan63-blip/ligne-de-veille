# Radar

Site : https://oustryilan63-blip.github.io/ligne-de-veille/

La navigation rassemble Actualités, Jeux et Histoire. La copie locale s’ouvre avec index.html.

## Catalogue et jeux

Le catalogue commun contient 130 engins, dont dix-huit missiles. Les mêmes photos et crédits alimentent l’histoire, le jeu du pays de conception, la reconnaissance du nom, Zoom mystère et le défi du jour. Les jeux du pays et du nom ont une catégorie Missiles. Le vrai/faux comprend 97 affirmations sourcées ; Chrono défense utilise 29 dates de premier vol vérifiées. Les missiles ne sont pas ajoutés artificiellement aux questions de premier vol d’avions.

Le septième jeu, « Alerte radar », propose dix manches sur une carte de France : identifier des pistes mobiles, laisser passer les amies et choisir un moyen fictif pour les hostiles. Les règles et effets sont inventés pour le jeu. Les scores et erreurs rejoignent le carnet local du navigateur.

Pour les programmes multinationaux documentés, chacun des pays partenaires indiqués dans la fiche est accepté dans le jeu géographique. Les résultats et scores restent dans le navigateur. Le défi du jour change à minuit, heure de Paris.

## Histoire

Les 130 fiches partagent l’ordre d’engins-data.js ; histoire-data.js contient les récits et histoire-chiffres.js les statistiques sourcées. Les sources officielles, constructeurs et travaux spécialisés sont cités. Chaque chiffre indique son périmètre et sa date : production, livraison, flotte ou pertes documentées. Une information indisponible ne signifie pas zéro. La carte distingue conception, utilisateurs actuels documentés et anciens utilisateurs. Les commandes et lieux de déploiement ne sont pas assimilés à des utilisateurs. Certaines nouvelles fiches ne recensent que les pays de conception ; cela est signalé.

Les photos Wikimedia Commons sont conservées avec leurs crédits et licences dans assets/jeu/ajouts et ses sous-dossiers serie-2, serie-3, serie-4 et serie-5. Les polices IBM Plex et leur licence sont dans assets/fonts/atlas. Le fond cartographique Natural Earth est dans le domaine public.

## Veille automatique à 8 h et 18 h

Le workflow GitHub Actions veille-quotidienne.yml est programmé chaque jour à 8 h et 18 h, fuseau Europe/Paris. Il fonctionne même si l’ordinateur est éteint. GitHub peut mettre l’exécution en attente : la publication n’est pas garantie à la seconde exacte.

La collecte consulte les flux du Sénat, du ministère britannique de la Défense, d’Opex360, d’OpexNews et de Conflits. Elle retient des titres récents datés, vérifie leurs liens et conserve l’historique. Les titres anglophones sont signalés. Les nouvelles cartes renvoient à la publication originale sans prétendre en proposer un résumé. Les anciens résumés éditoriaux restent dans les archives.

Le script exige au moins une source officielle et une source spécialisée accessibles. En cas d’échec global, la dernière version publique reste disponible et GitHub Actions indique l’erreur. L’accueil indique le dernier contrôle et le nombre de flux consultés.

actualites.json conserve les données ; scripts/update-news.py les collecte ; scripts/build-news.mjs valide et génère actualites.js. Le workflow enregistre puis publie les changements. On peut relancer la collecte depuis Actions → Radar · veille de 8 h et 18 h et publication du site → Run workflow. Une copie modifiée sur l’ordinateur doit être envoyée dans GitHub pour être publiée.

Le bouton Signaler une erreur prépare un e-mail, sans l’envoyer automatiquement. L’image d’ouverture a été créée pour ce projet avec ImageGen.

## Extension missiles — 11 octobre 2026

Dix nouvelles fiches, dont six ICBM, portent le catalogue à 100 engins et 18 missiles. Les jeux utilisant le catalogue commun les incluent ; dix affirmations complètent le vrai/faux. Chrono conserve ses dates de premiers vols d’avions. Les données de production, livraisons et inventaires restent distinctes et datées. Les événements matériels documentés apparaissent sous les statistiques, avec les sources et le statut (coulé, endommagé, attribution collective ou hors combat). Ils ne sont pas un bilan mondial de destructions. Les dix images et leurs licences sont regroupées dans assets/jeu/ajouts/serie-5. Le M51 est illustré par un dessin explicitement crédité.


## QG Radar

Le huitième jeu est une gestion de base côtière, au tour par tour. Deux décisions par semaine pendant douze semaines : missions, réparations, formations, repos et améliorations de cinq bâtiments. Six engins de l’atlas disposent de sprites originaux dessinés dans `qg-radar-art.js`. Les valeurs et missions sont fictives. Vingt événements sont possibles ; douze sont tirés sans répétition par campagne.

La campagne est sauvegardée dans ce navigateur sous `radar-qg-campaign-v1`, indépendamment des autres jeux. Une sauvegarde invalide est remplacée proprement. Les scores sont ajoutés une seule fois par campagne au carnet de joueur. Commandes de zoom, déplacement, pause des animations et préférence de mouvement réduit sont disponibles.

## Série 6 — 30 nouveaux engins, 11 octobre 2026

Le catalogue partagé compte 130 entrées. Cette série ajoute 10 engins terrestres, 10 appareils aériens, 5 familles navales et 5 missiles. Chaque ajout possède sa fiche Histoire, ses caractéristiques sourcées, une frise et une galerie de 2 ou 3 photographies réelles créditées. 29 nouvelles vues 3D sont proposées ; le modèle Type 212 trouvé était trop sommaire pour être retenu. Les variantes représentées sont indiquées. Le filtre « Ajouts récents » permet de retrouver cette série.

Les quatre jeux photographiques (pays, nom, zoom, défi), le vrai/faux, Chrono, la révision et le comparateur utilisent les nouveaux contenus pertinents. Alerte radar et QG Radar conservent leurs scénarios fictifs équilibrés. 30 affirmations et 10 premiers vols documentés sont ajoutés. Les cartes d’utilisateurs précisent leur périmètre ; les commandes, livraisons, productions et inventaires restent distincts. Les destructions non établies ne reçoivent aucun total inventé.

## Navigation, collection et sauvegardes — 11 octobre 2026

Recherche par noms, surnoms et pays ; filtres par pays de conception et type précis, tris alphabétique et récents. Les étoiles enregistrent une collection locale (collection.html), utilisable en QCM ou en réponse libre. Fiches avec navigation interne et photos en grand. Actualités filtrables par thème et source, courts extraits RSS attribués quand disponibles, et liens vers les engins repérés. Les quiz photo, Zoom mystère et pays proposent Débutant/Standard/Expert ; les modes sont indiqués dans les records. sauvegarde.html exporte ou restaure un fichier JSON validé : collection, progression, campagne QG, tutoriel et défis. Les données ne sont pas envoyées au serveur. Les parties de quiz en cours ne sont pas exportées.
