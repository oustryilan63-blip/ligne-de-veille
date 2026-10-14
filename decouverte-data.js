/* Textes originaux de Radar, références primaires consultées le 14 octobre 2026. */
window.RADAR_DISCOVERY_CONTENT={
  checkedAt:'2026-10-14',
  guides:[
    {slug:'sna-snle',title:'SNA et SNLE : quelle différence ?',theme:'Sous-marins',engins:[64,43],
      description:'Deux familles de sous-marins à propulsion nucléaire, avec des missions différentes. Des repères pour comprendre les sigles.',
      takeaway:'Le mot « nucléaire » décrit ici la propulsion. La mission de dissuasion distingue le SNLE du sous-marin d’attaque.',
      sections:[
        {title:'Le SNA : un sous-marin d’attaque',text:'Un SNA est un sous-marin nucléaire d’attaque. Ses missions comprennent la protection d’autres unités, la lutte contre des navires ou sous-marins et le renseignement. Les moyens embarqués varient selon la classe : la fiche d’un Suffren ne décrit pas un Virginia à l’identique.',sources:[0,1]},
        {title:'Le SNLE : la permanence de la dissuasion',text:'Un SNLE est un sous-marin nucléaire lanceur d’engins. Dans la Marine nationale, il porte la composante océanique de la dissuasion nucléaire. Sa mission repose sur des patrouilles discrètes. Il ne faut donc pas confondre l’énergie qui fait avancer le bâtiment et le rôle de son armement.',sources:[1,2]},
        {title:'La propulsion ne suffit pas à nommer la mission',text:'Les deux familles utilisent un réacteur pour fournir de l’énergie à bord. Les systèmes propulsifs diffèrent cependant selon les générations et les classes. Pour identifier un bâtiment, commence par sa classe et sa mission, puis regarde ses caractéristiques publiques.',sources:[3]}
      ],diagram:[['SNA','Attaque, protection, renseignement'],['SNLE','Dissuasion nucléaire océanique']],
      sources:[
        {label:'Naval Group — livraison et missions du Suffren',url:'https://www.naval-group.com/en/actualites/naval-group-delivers-suffren-french-defence-procurement-agency-dga'},
        {label:'Marine nationale — guide des forces sous-marines',url:'https://www.lamarinerecrute.fr/sites/default/files/2024-05/2023_MSRM_PAO_GUIDE_FORCE_SOUS_MARINES_C_205%20BD.pdf'},
        {label:'Marine nationale — mission à bord du SNLE Le Vigilant',url:'https://www.defense.gouv.fr/marine/actualites/lieutenant-vaisseau-maiwen-chef-du-service-propulsion-bord-du-snle-vigilant'},
        {label:'Cols bleus — propulsion nucléaire, juillet 2025',url:'https://www.colsbleus.defense.gouv.fr/sites/default/files/2025-07/COLSbleus_3128_PDFweb_Light.pdf'}]},
    {slug:'missile-balistique-croisiere',title:'Missile balistique ou de croisière ?',theme:'Missiles',engins:[128,125],
      description:'Comprendre ce qui distingue les familles balistique et de croisière, sans confondre trajectoire, portée, vitesse et charge.',
      takeaway:'« Balistique » et « de croisière » décrivent principalement le mode de vol. Ces mots ne déterminent pas, à eux seuls, la portée ni la nature de la charge.',
      sections:[
        {title:'Balistique : une trajectoire en grande partie non propulsée',text:'Un missile balistique reçoit une impulsion propulsive, puis suit une trajectoire principalement balistique sur une part importante de son vol. Certaines conceptions peuvent manœuvrer : le terme ne signifie pas que tous les modèles suivent exactement la même courbe.',sources:[0]},
        {title:'De croisière : un vol propulsé dans l’atmosphère',text:'Un missile de croisière emploie la portance aérodynamique et reste propulsé pendant l’essentiel de son vol. Les familles recouvrent des configurations très différentes. Le SCALP / Storm Shadow présenté dans l’atlas est un exemple de missile de croisière aéroporté.',sources:[0,1]},
        {title:'Quatre notions à lire séparément',text:'Le type de vol, la vitesse, la portée et la charge sont des informations distinctes. Le qualificatif « hypersonique » concerne une vitesse ; il ne remplace pas à lui seul une description du système. Dans les fiches Radar, vérifie toujours le modèle, la variante et le contexte de la valeur citée.',sources:[0,2]}
      ],diagram:[['Balistique','Propulsion initiale · phase balistique'],['Croisière','Portance aérodynamique · vol propulsé']],
      sources:[
        {label:'OTAN — définitions des missiles dans le traité INF',url:'https://www.nato.int/en/what-we-do/wider-activities/nato-and-the-inf-treaty'},
        {label:'MBDA — Storm Shadow / SCALP',url:'https://www.mbda-systems.com/products/deep-strike/storm-shadow-scalp'},
        {label:'Ministère des Armées — décryptage de la menace missile',url:'https://www.defense.gouv.fr/actualites/decryptage-comment-se-proteger-face-menace-missile-0'}]},
    {slug:'reconnaitre-rafale-mirage-2000',title:'Reconnaître un Rafale et un Mirage 2000',theme:'Reconnaissance',engins:[9,30],
      description:'Des indices visuels simples pour distinguer deux avions français : plans canards, moteurs et silhouette générale.',
      takeaway:'Cherche d’abord les petits plans canards du Rafale, puis le nombre de sorties de moteur. L’angle de la photo peut masquer un indice.',
      sections:[
        {title:'Une aile delta dans les deux cas',text:'Les deux avions présentent une aile delta, de forme triangulaire. Ce point commun explique certaines confusions sur les photos. Une cocarde, la peinture ou un réservoir extérieur ne suffisent pas à identifier le modèle.',sources:[0,1]},
        {title:'Rafale : canards et deux moteurs',text:'Le Rafale associe l’aile delta à de petits plans canards placés en avant des ailes principales. Il possède deux moteurs. Sur une vue arrière suffisamment nette, les deux sorties de moteur constituent un indice supplémentaire. Les variantes B, C et M demandent ensuite une identification plus précise.',sources:[0]},
        {title:'Mirage 2000 : un seul moteur',text:'Le Mirage 2000 possède un seul moteur et n’a pas les plans canards du Rafale. Il existe des versions monoplaces et biplaces : le nombre de places ne permet donc pas de distinguer à lui seul les deux familles. Compare plusieurs vues avant de conclure.',sources:[1]}
      ],diagram:[['Rafale','Plans canards · deux moteurs'],['Mirage 2000','Pas de canards · un moteur']],
      sources:[
        {label:'Dassault Aviation — formule aérodynamique du Rafale',url:'https://www.dassault-aviation.com/fr/defense/rafale/concevoir-et-optimiser/'},
        {label:'Dassault Aviation — Mirage 2000',url:'https://www.dassault-aviation.com/fr/defense/soutien-militaire/avions-soutenus/mirage-2000/'}]},
    {slug:'fregate-destroyer-corvette',title:'Frégate, destroyer, corvette : les repères',theme:'Marine',engins:[67,65,13],
      description:'Comprendre trois appellations de bâtiments de combat à partir d’exemples concrets, sans réduire leur rôle à leur taille.',
      takeaway:'Lis d’abord la mission et les équipements du bâtiment. Le nom de sa catégorie ne constitue pas une échelle universelle de puissance.',
      sections:[
        {title:'Frégate : une escorte aux missions multiples',text:'La catégorie regroupe des bâtiments aux spécialités variées. La Royal Navy décrit ses frégates comme des unités polyvalentes, historiquement associées à la lutte contre les sous-marins. Dans l’atlas, chaque frégate conserve sa variante technique et ses propres sources.',sources:[0]},
        {title:'Destroyer : l’exemple de la défense aérienne',text:'Les Type 45 britanniques ont été conçus autour de la protection contre les menaces aériennes et les missiles. Cet exemple aide à comprendre leur place dans une force navale ; il ne définit pas les missions de tous les destroyers du monde.',sources:[1]},
        {title:'Corvette : des capacités qui dépendent du modèle',text:'La Visby suédoise combine plusieurs missions, dont la lutte anti-surface, anti-sous-marine, la patrouille et la guerre des mines. Une appellation ne décrit donc pas tout son équipement. Pour comparer deux bâtiments, utilise leur classe, leur variante et les systèmes réellement documentés.',sources:[2]}
      ],diagram:[['Frégate','Escorte · spécialités variables'],['Destroyer Type 45','Défense aérienne et antimissile'],['Corvette Visby','Combat et surveillance en mer']],
      sources:[
        {label:'Royal Navy — catégories et missions des navires',url:'https://www.royalnavy.mod.uk/equipment/ships'},
        {label:'Royal Navy — classe Daring Type 45',url:'https://www.royalnavy.mod.uk/equipment/ships/daring-class'},
        {label:'Saab — missions de la classe Visby',url:'https://www.saab.com/products/visby-class-corvette'}]}
  ],
  comparisons:[
    {slug:'rafale-f35',title:'Rafale et F-35 : deux approches du combat aérien',a:9,b:3,
      intro:'Comparer le Rafale C et le F-35A, en distinguant la famille de l’avion et la variante dont proviennent les chiffres.',
      notes:[['Des versions bien précises','Le tableau porte sur le Rafale C monoplace et le F-35A. Il ne décrit pas les adaptations navales du Rafale M, ni les F-35B et F-35C.'],['Lire la conception','Le Rafale est un bimoteur à aile delta et plans canards. Le F-35A est un monomoteur dont la fiche US Air Force met en avant la faible observabilité et la fusion des capteurs.'],['Comparer avec leur contexte','Une vitesse maximale ou une masse ne résume pas les missions possibles. Les conditions de mesure et les standards logiciels doivent rester visibles.']],
      sources:[{label:'Dassault — Rafale',url:'https://www.dassault-aviation.com/en/defense/rafale/a-fully-optimized-airframe/'},{label:'US Air Force — F-35A',url:'https://www.af.mil/About-Us/Fact-Sheets/Display/Article/478441/f-35a-lightning-ii/'}]},
    {slug:'leclerc-leopard-2',title:'Leclerc et Leopard 2 : comparer les variantes',a:0,b:1,
      intro:'Mettre en regard le Leclerc XLR rénové et le Leopard 2 A7V : deux variantes documentées, avec leurs périmètres de mesure.',
      notes:[['Éviter le mélange des générations','Les caractéristiques du XLR rénové et du Leopard 2 A7V ne doivent pas être appliquées à toutes les versions des deux familles.'],['Regarder l’équipage','Le Leclerc utilise un chargement automatique et un équipage de trois personnes. Le Leopard 2 A7V conserve quatre membres d’équipage. Ce choix se comprend avec l’organisation du véhicule.'],['Lire les masses avec leur libellé','Une masse à vide, une masse au combat et une masse maximale autorisée ne sont pas directement équivalentes. Les intitulés du tableau restent associés à chaque valeur.']],
      sources:[{label:'Armée de Terre — Leclerc XLR',url:'https://www.defense.gouv.fr/terre/nos-materiels/nos-equipements-terre/vehicules-larmee-terre/vehicules-chars-bataille/char-leclerc-xlr-renove'},{label:'KNDS — Leopard 2 A7V',url:'https://knds.com/en/products/systems/leopard/leopard-2-a7'}]},
    {slug:'virginia-suffren',title:'Virginia et Suffren : deux familles de SNA',a:43,b:64,
      intro:'Comparer le Virginia sans VPM, Blocks I à IV, et la configuration du Suffren livrée en 2020, à partir des données publiques retenues dans les fiches.',
      notes:[['Deux familles de sous-marins d’attaque','Les deux classes utilisent une propulsion nucléaire et assurent plusieurs missions : lutte sous-marine, renseignement et actions avec des moyens embarqués.'],['La version change les chiffres','Les Virginia dotés du Virginia Payload Module ne sont pas la variante comparée ici. Les données du Suffren correspondent au périmètre indiqué dans sa fiche technique.'],['Ce que le tableau ne mesure pas','Les niveaux acoustiques et de nombreuses performances opérationnelles ne sont pas publiés. Aucun classement de discrétion ou d’efficacité n’est déduit des dimensions.']],
      sources:[{label:'US Navy — Attack Submarines SSN',url:'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169558/attack-submarines-ssn/'},{label:'Naval Group — livraison du Suffren',url:'https://www.naval-group.com/en/actualites/naval-group-delivers-suffren-french-defence-procurement-agency-dga'}]}
  ]
};
