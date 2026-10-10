const QUESTIONS = [
  {
    name: 'Leclerc', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Europe occidentale.", country: 'France', code: 'FR',
    photo: 'leclerc.jpg', alt: 'Un char Leclerc en mouvement',
    explanation: "Le Leclerc est un char conçu en France pour l'armée de Terre. KNDS France poursuit aujourd'hui sa modernisation avec le standard XLR.",
    source: 'https://knds.com/fr/filiales/knds-france',
    photoFile: 'Leclerc-openphotonet_PICT6015.JPG', photoAuthor: 'Daniel Steger',
    photoLicense: 'CC BY-SA 2.5', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/'
  },
  {
    name: 'Leopard 2', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Europe centrale.", country: 'Allemagne', code: 'DE',
    photo: 'leopard.jpg', alt: 'Un char Leopard 2 A7V',
    explanation: "Le Leopard 2 a été développé en Allemagne pour la Bundeswehr. Il est utilisé par de nombreux autres pays, mais son pays de conception reste l'Allemagne.",
    source: 'https://knds.com/en/products/systems/leopard/leopard-2-a7',
    photoFile: 'Leopard_2_A7V_313_Bad_Frankenhausen_2024.JPG', photoAuthor: 'Boevaya mashina',
    photoLicense: 'CC BY-SA 3.0 DE', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/de/'
  },
  {
    name: 'K2 Black Panther', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Asie orientale.", country: 'Corée du Sud', code: 'KR',
    photo: 'k2.jpg', alt: 'Un char K2 Black Panther en exercice',
    explanation: "Le K2 est un char de conception sud-coréenne, produit par Hyundai Rotem. Il a été pensé pour les besoins de l'armée de la République de Corée.",
    source: 'https://www.hyundai-rotem.co.kr/en/business/defense/details.do?productCt03=defense0101',
    photoFile: 'U.S.,_ROK_forces_forge_interoperability_with_combined_arms_exercise_-_8_of_8.jpg', photoAuthor: 'Staff Sgt. Jason Cochran / U.S. Air Force',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'F-35 Lightning II', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'f35.jpg', alt: 'Un avion F-35 en vol',
    explanation: "Le F-35 est un programme américain conduit par Lockheed Martin. Il associe des partenaires internationaux, mais son pays de conception principal est les États-Unis.",
    source: 'https://www.lockheedmartin.com/en-us/products/f-35/f-35-about.html',
    photoFile: 'F-35A_flight_(cropped).jpg', photoAuthor: 'Master Sgt. Donald R. Allen / U.S. Air Force',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'JAS 39 Gripen', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Europe du Nord.", country: 'Suède', code: 'SE',
    photo: 'gripen.jpg', alt: 'Un avion Saab JAS 39 Gripen en vol',
    explanation: "Le Gripen a été conçu par Saab pour répondre aux besoins de la Suède. Il équipe aussi d'autres pays et certaines versions sont produites à l'étranger.",
    source: 'https://www.saab.com/newsroom/stories/2020/august/all-you-need-to-know-about-gripen-the-smart-fighter',
    photoFile: 'Saab_JAS_39_Gripen_at_Kaivopuisto_Air_Show,_June_2017_(altered)_copy.jpg', photoAuthor: 'Tuomo Salonen / SIM Finnish Aviation Museum',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'Classe Astute', kind: 'SOUS-MARIN', category: 'mer', hint: "Ce pays est un archipel d'Europe du Nord-Ouest.", country: 'Royaume-Uni', code: 'GB',
    photo: 'astute.jpg', alt: 'Un sous-marin de la classe Astute en surface',
    explanation: "Les sous-marins de la classe Astute appartiennent à la Royal Navy. Ils sont construits au Royaume-Uni par BAE Systems, à Barrow-in-Furness.",
    source: 'https://www.royalnavy.mod.uk/news/2016/december/16/161216-fourth-astute-class-attack-submarine-formally-named',
    photoFile: 'HMS_Ambush_long.jpg', photoAuthor: 'LA(Phot) Will Haigh / Royal Navy',
    photoLicense: 'Open Government Licence v1.0', photoLicenseUrl: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/1/'
  },
  {
    name: 'Classe Sōryū', kind: 'SOUS-MARIN', category: 'mer', hint: "Ce pays est un archipel d'Asie orientale.", country: 'Japon', code: 'JP',
    photo: 'soryu.jpg', alt: 'Un sous-marin japonais de la classe Sōryū',
    explanation: "La classe Sōryū est une famille de sous-marins japonais de la Force maritime d'autodéfense du Japon.",
    source: 'https://www.mod.go.jp/msdf/equipment/ships/ss/souryu/',
    photoFile: 'SS_Shoryu.jpg', photoAuthor: 'Force maritime d’autodéfense du Japon',
    photoLicense: 'Government of Japan Terms of Use 2.0', photoLicenseUrl: 'https://www.mod.go.jp/en/notice.html'
  },
  {
    name: 'Merkava Mk 4', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve au Proche-Orient.", country: 'Israël', code: 'IL',
    photo: 'ajouts/merkava.jpg', alt: 'Des chars Merkava Mk 4 en exercice',
    explanation: "Le Merkava est un char conçu et développé en Israël. La photo montre des chars de l'armée israélienne en exercice.",
    source: 'https://www.mod.gov.il/en/departments/merkava-and-armored-vehicles-directorate',
    photoFile: 'Merkava Mk 4M 400 - Gdud 74 - pic01.jpg', photoAuthor: "IDF Spokesperson's Unit",
    photoLicense: 'CC BY-SA 3.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  {
    name: 'C1 Ariete', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Europe du Sud.", country: 'Italie', code: 'IT',
    photo: 'ajouts/ariete.jpg', alt: 'Un char C1 Ariete vu de face',
    explanation: "L'Ariete est le char de combat de l'armée italienne. Son développement et sa fabrication ont été menés en Italie.",
    source: 'https://www.esercito.difesa.it/equipaggiamenti/veicoli-blindati-e-corazzati-da-combattimento/veicoli-da-combattimento/carro-armato-ariete/81543.html',
    photoFile: 'Ariete front view.JPG', photoAuthor: 'kaminski',
    photoLicense: 'CC BY-SA 3.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  {
    name: 'Rafale', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Europe occidentale.", country: 'France', code: 'FR',
    photo: 'ajouts/rafale.jpg', alt: 'Un avion de combat Rafale au sol',
    explanation: "Le Rafale a été conçu en France par Dassault Aviation. Plusieurs forces aériennes étrangères l'utilisent également.",
    source: 'https://www.dassault-aviation.com/fr/defense/rafale/concevoir-et-optimiser/',
    photoFile: 'Dassault Rafale, ILA 2018, Schönefeld (1X7A5333).jpg', photoAuthor: 'Matti Blume',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'HAL Tejas', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Asie du Sud.", country: 'Inde', code: 'IN',
    photo: 'ajouts/tejas.jpg', alt: 'Un avion de combat Tejas en vol',
    explanation: "Le Tejas est un avion de combat développé en Inde et produit par Hindustan Aeronautics Limited.",
    source: 'https://hal-india.co.in/production-unit-details/lca-tejas-division-bangalore',
    photoFile: 'HAL Tejas.jpg', photoAuthor: 'Rahuldevnath',
    photoLicense: 'CC BY 3.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/3.0/'
  },
  {
    name: 'Bayraktar TB2', kind: 'DRONE', category: 'air', hint: "Ce pays est à cheval sur l'Europe et l'Asie.", country: 'Turquie', code: 'TR',
    photo: 'ajouts/tb2.jpg', alt: 'Un drone Bayraktar TB2 sur une piste',
    explanation: "Le Bayraktar TB2 est un drone conçu par la société turque Baykar. Il a ensuite été exporté vers plusieurs pays.",
    source: 'https://baykartech.com/en/uav/bayraktar-tb2/',
    photoFile: 'Bayraktar TB2 Ground.jpg', photoAuthor: 'Bayhaluk',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'AH-64 Apache', kind: 'HÉLICOPTÈRE', category: 'air', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/apache.jpg', alt: 'Un hélicoptère AH-64 Apache au sol',
    explanation: "L'Apache est un hélicoptère d'attaque conçu aux États-Unis. Boeing produit aujourd'hui la famille AH-64.",
    source: 'https://www.boeing.com/defense/military-rotorcraft/ah-64-apache',
    photoFile: 'AH-64 Apache, ILA 2024, Schoenefeld (ILA44641).jpg', photoAuthor: 'Matti Blume',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'Classe Visby', kind: 'CORVETTE', category: 'mer', hint: "Ce pays se trouve en Europe du Nord.", country: 'Suède', code: 'SE',
    photo: 'ajouts/visby.jpg', alt: 'La corvette suédoise HSwMS Visby en mer',
    explanation: "Les corvettes de la classe Visby ont été développées en Suède. Leur forme et leurs matériaux visent à réduire leur signature radar.",
    source: 'https://www.saab.com/newsroom/stories/2017/january/coastal-corvettes-that-evade-radar',
    photoFile: 'K31 HSwMS Visby (8643086211).jpg', photoAuthor: 'Mark Harkin',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'Type 10', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays est un archipel d'Asie orientale.", country: 'Japon', code: 'JP',
    photo: 'ajouts/type10.jpg', alt: 'Un char japonais Type 10 en démonstration',
    explanation: "Le Type 10 est un char développé pour la Force terrestre d'autodéfense japonaise et fabriqué par Mitsubishi Heavy Industries.",
    source: 'https://www.mod.go.jp/en/d_act/d_budget/pdf/fy2026_20260302a.pdf',
    photoFile: '10式戦車 (Type 10 Tank) - Japan Ground Self-Defense Force. (53824609147).jpg', photoAuthor: 'MIKI Yoshihito',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'K9 Thunder', kind: 'ARTILLERIE', category: 'terre', hint: "Ce pays se trouve en Asie orientale.", country: 'Corée du Sud', code: 'KR',
    photo: 'ajouts/k9.jpg', alt: 'Un canon automoteur K9 Thunder en tir',
    explanation: "Le K9 est un canon automoteur développé en Corée du Sud. La photo montre un exemplaire utilisé par la Pologne.",
    source: 'https://www.hanwhaaerospace.com/eng/media/newsroom/view.do?seq=271',
    photoFile: 'A Polish K9 howitzer fires an artillery round during a live fire demonstration.jpg', photoAuthor: 'Staff Sgt. Matthew Foster',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'F-16 Fighting Falcon', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/f16.jpg', alt: 'Un avion F-16 vu de face en vol',
    explanation: "Le F-16 a été conçu aux États-Unis par General Dynamics. Lockheed Martin a repris le programme et en produit des versions modernisées.",
    source: 'https://www.lockheedmartin.com/en-us/news/features/history/f16.html',
    photoFile: 'F-16 Fighting Falcon.jpg', photoAuthor: 'Staff Sgt. Cherie A. Thurlby / U.S. Air Force',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'Su-35', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays s'étend de l'Europe orientale à l'Asie.", country: 'Russie', code: 'RU',
    photo: 'ajouts/su35.jpg', alt: 'Un avion Su-35 en vol',
    explanation: "Le Su-35 est une évolution du Su-27 conçue par le bureau d'études Sukhoï en Russie.",
    source: 'https://uacrussia.ru/en/aircraft/lineup/military/su-35/',
    photoFile: 'Su-35 in flight. (3826731912).jpg', photoAuthor: 'Aleksandr Markin',
    photoLicense: 'CC BY-SA 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
  },
  {
    name: 'Chengdu J-10', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Asie orientale.", country: 'Chine', code: 'CN',
    photo: 'ajouts/j10.jpg', alt: 'Un avion de combat J-10 au sol',
    explanation: "Le J-10 est un avion développé en Chine par l'industrie aéronautique nationale. Son premier prototype a volé en 1998.",
    source: 'https://eng.chinamil.com.cn/2019special/2019-11/11/content_9673076.htm',
    photoFile: 'J-10 Fighter aircraft 20170902.jpg', photoAuthor: 'Tyg728',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'FA-50 Fighting Eagle', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Asie orientale.", country: 'Corée du Sud', code: 'KR',
    photo: 'ajouts/fa50.jpg', alt: 'Un avion FA-50 en vol au-dessus de la mer',
    explanation: "Le FA-50 a été développé en Corée du Sud par Korea Aerospace Industries à partir de l'avion d'entraînement T-50.",
    source: 'https://m.koreaaero.com/EN/Business/FA50.aspx',
    photoFile: 'FA-50 Fighting Eagle Test Flight.jpg', photoAuthor: 'Republic of Korea Air Force / Korea Aerospace Industries',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'Charles de Gaulle', kind: 'PORTE-AVIONS', category: 'mer', hint: "Ce pays se trouve en Europe occidentale.", country: 'France', code: 'FR',
    photo: 'ajouts/charles.jpg', alt: 'Le porte-avions Charles de Gaulle en mer',
    explanation: "Le Charles de Gaulle est le porte-avions de la Marine nationale française. Il a été construit en France et admis au service actif en 2001.",
    source: 'https://www.defense.gouv.fr/marine/actualites/25-ans-service-particulierement-actifs-porte-avions-charles-gaulle',
    photoFile: 'French aircraft carrier Charles de Gaulle (R91) underway in the Ionian Sea on 17 March 2022 (220317-N-DH793-1322).JPG',
    photoAuthor: 'Mass Communication Specialist 3rd Class Bela Chambers / U.S. Navy',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'HMS Queen Elizabeth', kind: 'PORTE-AVIONS', category: 'mer', hint: "Ce pays est un archipel d'Europe du Nord-Ouest.", country: 'Royaume-Uni', code: 'GB',
    photo: 'ajouts/queen.jpg', alt: 'Le porte-avions HMS Queen Elizabeth vu du ciel',
    explanation: "Le HMS Queen Elizabeth est un porte-avions conçu et construit au Royaume-Uni pour la Royal Navy.",
    source: 'https://www.royalnavy.mod.uk/organisation/units-and-squadrons/aircraft-carriers/hms-queen-elizabeth',
    photoFile: 'Aerial view of HMS Queen Elizabeth (R08) off Scotland on 28 June 2017 (4516752).jpg',
    photoAuthor: 'Fleet Air Arm aircrew / Royal Navy',
    photoLicense: 'Open Government Licence v1.0', photoLicenseUrl: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/1/'
  },
  {
    name: 'Type 055', kind: 'DESTROYER', category: 'mer', hint: "Ce pays se trouve en Asie orientale.", country: 'Chine', code: 'CN',
    photo: 'ajouts/type055.jpg', alt: 'Le destroyer Nanchang de la classe Type 055 en mer',
    explanation: "Le Type 055 est une classe de grands destroyers conçue et construite en Chine. La photo montre le Nanchang.",
    source: 'https://eng.chinamil.com.cn/CHINA_209163/TopStories_209189/10010836.html',
    photoFile: 'PLANS Nanchang (DDG-101) 20210427.jpg', photoAuthor: 'Ministère japonais de la Défense',
    photoLicense: 'CC BY 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    name: 'Álvaro de Bazán', kind: 'FRÉGATE', category: 'mer', hint: "Ce pays se trouve dans la péninsule Ibérique.", country: 'Espagne', code: 'ES',
    photo: 'ajouts/alvaro.jpg', alt: 'La frégate Álvaro de Bazán en mer',
    explanation: "La frégate Álvaro de Bazán est le premier bâtiment de la classe F-100, conçue par l'entreprise espagnole Navantia pour la marine espagnole.",
    source: 'https://catalogo.navantia.es/en/product/f100/',
    photoFile: 'Spanish frigate Alvaro De Bazan (F101) underway in the Atlantic Ocean on 8 October 2017 (171008-N-IC246-0301).JPG',
    photoAuthor: 'Mass Communication Specialist Seaman Apprentice Raymond Maddocks / U.S. Navy',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'M1 Abrams', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/abrams.jpg', alt: 'Des chars M1A2 Abrams pendant un exercice',
    explanation: "L'Abrams est un char américain. General Dynamics Land Systems développe et produit ses versions M1A2 modernisées.",
    source: 'https://www.gdls.com/abrams/',
    photoFile: 'M1A2 Abrams Main Battle Tanks (7084260).jpg', photoAuthor: 'Spc. Elizabeth MacPherson / U.S. Army',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'Puma', kind: 'VÉHICULE DE COMBAT', category: 'terre', hint: "Ce pays se trouve en Europe centrale.", country: 'Allemagne', code: 'DE',
    photo: 'ajouts/puma.jpg', alt: 'Un véhicule de combat d’infanterie Puma',
    explanation: "Le Puma est un véhicule de combat d'infanterie conçu en Allemagne par KNDS et Rheinmetall pour la Bundeswehr.",
    source: 'https://knds.com/en/products/systems/puma',
    photoFile: 'Puma.IFV.JPG', photoAuthor: 'Motorpferd',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'Patria AMV', kind: 'BLINDÉ À ROUES', category: 'terre', hint: "Ce pays se trouve en Europe du Nord.", country: 'Finlande', code: 'FI',
    photo: 'ajouts/patria.jpg', alt: 'Un blindé Patria AMV finlandais lors d’un défilé',
    explanation: "La famille AMV a été développée par l'entreprise finlandaise Patria. La photo montre un véhicule en service en Finlande.",
    source: 'https://www.patriagroup.com/products-and-services/protected-mobility/wheeled-mobility',
    photoFile: '2025 Finnish Independence Day parade Patria AMV.jpg', photoAuthor: 'VynedJ',
    photoLicense: 'CC BY 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    name: 'Challenger 3', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays est un archipel d'Europe du Nord-Ouest.", country: 'Royaume-Uni', code: 'GB',
    photo: 'ajouts/challenger3.jpg', alt: 'Un prototype de char Challenger 3 vu de face',
    explanation: "Le Challenger 3 est développé au Royaume-Uni par Rheinmetall BAE Systems Land à partir du Challenger 2. La photo montre un véhicule de présentation du programme.",
    source: 'https://rbsl.com/news-and-events/news/challenger3-dvd2024',
    photoFile: 'Challenger 3.jpg', photoAuthor: 'Corporal Adam J. Wakefield / UK Ministry of Defence',
    photoLicense: 'Open Government Licence v1.0', photoLicenseUrl: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/1/'
  },
  {
    name: 'T-90M', kind: 'CHAR DE COMBAT', category: 'terre', hint: "Ce pays s'étend de l'Europe orientale à l'Asie.", country: 'Russie', code: 'RU',
    photo: 'ajouts/t90m.jpg', alt: 'Un char T-90M russe',
    explanation: "Le T-90M est une version modernisée du char T-90 produite en Russie par Uralvagonzavod.",
    source: 'https://www.rostec.ru/en/media/news/uralvagonzavod-has-delivered-trains-with-modern-tanks-to-the-operational-forces/',
    photoFile: 'T-90M.jpg', photoAuthor: 'Ministère de la Défense de la Fédération de Russie',
    photoLicense: 'CC BY 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    name: 'F-15EX Eagle II', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/f15ex.jpg', alt: 'Un avion F-15EX Eagle II au sol',
    explanation: "Le F-15EX est une version récente du F-15 développée par Boeing aux États-Unis pour l'US Air Force.",
    source: 'https://www.boeing.com/defense/fighters-and-bombers/f-15ex-eagle',
    photoFile: 'F-15EX and F-15E air power soars at Kadena (9807266).jpg', photoAuthor: 'Senior Airman Amy Kelley / U.S. Air Force',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'Mirage 2000', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Europe occidentale.", country: 'France', code: 'FR',
    photo: 'ajouts/mirage2000.jpg', alt: 'Un avion Mirage 2000 en vol',
    explanation: "Le Mirage 2000 a été conçu en France par Dassault Aviation. Il est entré en service dans l'armée de l'Air française en 1984.",
    source: 'https://www.dassault-aviation.com/fr/defense/soutien-militaire/avions-soutenus/mirage-2000/',
    photoFile: 'Mirage2000.jpg', photoAuthor: 'Senior Airman Bethann Hunt / U.S. Air Force',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'A-29 Super Tucano', kind: 'AVION D’ATTAQUE', category: 'air', hint: "Ce pays se trouve en Amérique du Sud.", country: 'Brésil', code: 'BR',
    photo: 'ajouts/a29.jpg', alt: 'Deux avions A-29 Super Tucano en vol au-dessus de la forêt',
    explanation: "L'A-29 Super Tucano est un avion d'attaque léger et d'entraînement développé par l'entreprise brésilienne Embraer.",
    source: 'https://www.embraer.com/defense-security-air/a-29-super-tucano/pt/',
    photoFile: 'Aeronave A-29 Super Tucano em voo sobre a Floresta Amazônica (cropped).jpg', photoAuthor: 'Johnson Barros',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'Mitsubishi F-2', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays est un archipel d'Asie orientale.", country: 'Japon', code: 'JP',
    photo: 'ajouts/f2.jpg', alt: 'Un avion Mitsubishi F-2 en vol',
    explanation: "Le F-2 a été développé au Japon pour la Force aérienne d'autodéfense, dans un programme mené avec les États-Unis à partir du F-16.",
    source: 'https://www.mod.go.jp/asdf/hyakuri/2-2_aircraft/2-2-1_F2.html',
    photoFile: 'Mitsubishi F-2 in flight 01.jpg', photoAuthor: 'Jerry Gunner',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'MiG-35', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays s'étend de l'Europe orientale à l'Asie.", country: 'Russie', code: 'RU',
    photo: 'ajouts/mig35.jpg', alt: 'Un avion MiG-35 russe',
    explanation: "Le MiG-35 a été conçu en Russie par le bureau d'études Mikoyan comme évolution de la famille MiG-29.",
    source: 'https://uacrussia.ru/en/aircraft/lineup/military/mig-35/',
    photoFile: '1 MiG-35.jpg', photoAuthor: 'Ministère de la Défense de la Fédération de Russie',
    photoLicense: 'CC BY 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    name: 'Chengdu J-20', kind: 'AVION DE COMBAT', category: 'air', hint: "Ce pays se trouve en Asie orientale.", country: 'Chine', code: 'CN',
    photo: 'ajouts/j20.jpg', alt: 'Un avion de combat J-20 en vol',
    explanation: "Le J-20 a été développé en Chine par Chengdu Aircraft. Son prototype a effectué son premier vol en 2011.",
    source: 'https://eng.chinamil.com.cn/2019special/2019-11/11/content_9673085.htm',
    photoFile: 'J-20 fighter (cropped).jpg', photoAuthor: 'emperornie',
    photoLicense: 'CC BY-SA 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
  },
  {
    name: 'USS Gerald R. Ford', kind: 'PORTE-AVIONS', category: 'mer', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/ford.jpg', alt: 'Le porte-avions USS Gerald R. Ford en mer',
    explanation: "Le Gerald R. Ford est le premier porte-avions de sa classe, conçu et construit aux États-Unis pour l'US Navy.",
    source: 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169795/aircraft-carriers-cvn/',
    photoFile: 'USS Gerald R. Ford (CVN-78) underway in the Atlantic Ocean on 9 October 2022 (221009-N-TL968-1248).JPG', photoAuthor: 'Mass Communication Specialist 2nd Class Jackson Adkins / U.S. Navy',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'USS Zumwalt', kind: 'DESTROYER', category: 'mer', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/zumwalt.jpg', alt: 'Le destroyer USS Zumwalt sur l’eau',
    explanation: "Le Zumwalt est le premier destroyer de sa classe, un programme conçu pour l'US Navy et construit aux États-Unis.",
    source: 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2391800/destroyers-ddg-1000/no/no/destroyers-ddg-1000/',
    photoFile: 'USS Zumwalt (DDG 1000) underway for the first time 151207-N-ZZ999-001.jpg', photoAuthor: 'National Museum of the U.S. Navy',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'INS Vikrant', kind: 'PORTE-AVIONS', category: 'mer', hint: "Ce pays se trouve en Asie du Sud.", country: 'Inde', code: 'IN',
    photo: 'ajouts/vikrant.jpg', alt: 'Le porte-avions INS Vikrant pendant des essais en mer',
    explanation: "Le Vikrant est le premier porte-avions conçu par le bureau d'études de la marine indienne et construit en Inde.",
    source: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1896759&lang=3&reg=3',
    photoFile: 'IAC1 Vikrant (R11) with INS Kolkata (D63) during sea trial (cropped).jpg', photoAuthor: 'Marine indienne',
    photoLicense: 'GODL-India', photoLicenseUrl: 'https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf'
  },
  {
    name: 'Classe Taigei', kind: 'SOUS-MARIN', category: 'mer', hint: "Ce pays est un archipel d'Asie orientale.", country: 'Japon', code: 'JP',
    photo: 'ajouts/taigei.jpg', alt: 'Le sous-marin japonais Taigei en mer',
    explanation: "Les sous-marins de la classe Taigei ont été développés au Japon pour la Force maritime d'autodéfense japonaise.",
    source: 'https://www.mod.go.jp/msdf/equipment/ships/sse/taigei/',
    photoFile: 'SSE-6201 Taigei.jpg', photoAuthor: 'Force maritime d’autodéfense du Japon',
    photoLicense: 'CC BY 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  {
    name: 'Carlo Bergamini', kind: 'FRÉGATE', category: 'mer', hint: "Ce pays se trouve en Europe du Sud.", country: 'Italie', code: 'IT',
    photo: 'ajouts/bergamini.jpg', alt: 'La frégate Carlo Bergamini au port',
    explanation: "Le Carlo Bergamini est une frégate construite en Italie pour la marine italienne dans le programme FREMM mené conjointement par l'Italie et la France.",
    source: 'https://www.fincantieri.com/en/newsroom/press-releases/2011/the-first-multipurpose-frigate-launched-the-carlo-bergamini',
    photoFile: 'Carlo Bergamini (F-590) 1.jpg', photoAuthor: 'Antoloji',
    photoLicense: 'CC BY-SA 4.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  {
    name: 'CV90', kind: 'VÉHICULE DE COMBAT D’INFANTERIE', category: 'terre', hint: "Ce pays se trouve en Europe du Nord.", country: 'Suède', code: 'SE',
    photo: 'ajouts/cv90.jpg', alt: 'Un véhicule de combat CV9040 dans un paysage enneigé',
    explanation: "Le CV90 est un véhicule de combat d'infanterie développé en Suède. La photo montre un CV9040, version équipée d'un canon de 40 mm.",
    source: 'https://www.baesystems.com/en/product/cv90',
    photoFile: 'Swedish CV9040.JPG', photoAuthor: 'Mr Bullitt~commonswiki',
    photoLicense: 'CC BY-SA 2.5', photoLicenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5/'
  },
  {
    name: 'C-390 Millennium', kind: 'AVION DE TRANSPORT', category: 'air', hint: "Ce pays se trouve en Amérique du Sud et sa langue officielle est le portugais.", country: 'Brésil', code: 'BR',
    photo: 'ajouts/c390.jpg', alt: 'Un avion de transport Embraer KC-390 au décollage',
    explanation: "Le C-390 Millennium est un avion de transport militaire conçu au Brésil par Embraer. La photo montre la version KC-390, qui peut aussi ravitailler d'autres avions en vol.",
    source: 'https://embraer.com/defense-security-air/kc-390-millennium/en/',
    photoFile: 'EGLF - Embraer KC-390 - Força Aérea Brasileira - PT-ZNJ (42759650754).jpg', photoAuthor: 'Steve Lynes',
    photoLicense: 'CC BY 2.0', photoLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    name: 'Pilatus PC-21', kind: 'AVION D’ENTRAÎNEMENT', category: 'air', hint: "Ce pays alpin d'Europe centrale n'a pas d'accès à la mer.", country: 'Suisse', code: 'CH',
    photo: 'ajouts/pc21.jpg', alt: 'Un avion Pilatus PC-21 rouge en approche pour atterrir',
    explanation: "Le PC-21 est un avion d'entraînement conçu et construit en Suisse par Pilatus. Il sert à former des pilotes militaires, y compris dans des forces aériennes étrangères.",
    source: 'https://www.pilatus-aircraft.com/en/pc-21',
    photoFile: 'Pilatus pc-21 hb-hzc lands arp.jpg', photoAuthor: 'Adrian Pingstone (Arpingstone)',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'Classe Virginia', kind: 'SOUS-MARIN', category: 'mer', hint: "Ce pays se trouve en Amérique du Nord.", country: 'États-Unis', code: 'US',
    photo: 'ajouts/virginia.jpg', alt: 'Le sous-marin USS Virginia naviguant en surface',
    explanation: "La classe Virginia est une famille de sous-marins nucléaires d'attaque conçus aux États-Unis pour l'U.S. Navy. La photo montre l'USS Virginia, premier sous-marin de cette classe.",
    source: 'https://www.navy.mil/Resources/Fact-Files/Display-FactFiles/Article/2169558/attack-submarines-ssn/',
    photoFile: 'US Navy 040730-N-1234E-002 PCU Virginia (SSN 774) returns to the General Dynamics Electric Boat shipyard.jpg', photoAuthor: 'General Dynamics Electric Boat / U.S. Navy',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  },
  {
    name: 'Classe Gotland', kind: 'SOUS-MARIN', category: 'mer', hint: "Ce pays scandinave borde la mer Baltique.", country: 'Suède', code: 'SE',
    photo: 'ajouts/gotland.jpg', alt: 'Le kiosque du sous-marin Gotland naviguant en surface',
    explanation: "Les sous-marins de la classe Gotland ont été conçus en Suède par Kockums pour la marine suédoise. Ils utilisent une propulsion diesel-électrique complétée par un moteur Stirling.",
    source: 'https://www.saab.com/newsroom/press-releases/2018/hswms-gotland-relaunched-after-mid-life-upgrade',
    photoFile: 'Gotland NOCO2014 03.JPG', photoAuthor: 'MKFI',
    photoLicense: 'domaine public', photoLicenseUrl: 'https://commons.wikimedia.org/wiki/Commons:Public_domain'
  }
];

const mapData = window.LDV_MAP;
const svg = document.querySelector('#world-map');
const tooltip = document.querySelector('#map-tooltip');
const choice = document.querySelector('#country-choice');
const feedback = document.querySelector('#game-feedback');
const answerPanel = document.querySelector('#answer-panel');
const mapPanel = document.querySelector('.map-panel');
const challenge = document.querySelector('#challenge-hero');
const gameEnd = document.querySelector('#game-end');
const SVG_NS = 'http://www.w3.org/2000/svg';
let round = 0;
let found = 0;
let points = 0;
let streak = 0;
let bestStreak = 0;
let hintsUsed = 0;
let hintUsed = false;
let attemptsLeft = 5;
let resolved = false;
let tried = new Set();
let deck = [];
let selectedMode = 'quick';
let selectedCategory = 'all';
const BASE_VIEW = { x: -60, y: -25, w: 1320, h: 550 };
const MIN_VIEW_WIDTH = 170;
let view = { ...BASE_VIEW };
const activePointers = new Map();
let gestureMoved = false;
let suppressMapClickUntil = 0;

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
});
nav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Ouvrir le menu');
});

function updateStatus() {
  document.querySelector('#round-count').textContent = `Question ${Math.min(round + 1, deck.length)} / ${deck.length}`;
  document.querySelector('#attempt-count').textContent = `${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''}`;
  document.querySelector('#score-count').textContent = `${found} trouvé${found > 1 ? 's' : ''} · ${points} point${points > 1 ? 's' : ''}`;
  const dots = document.querySelector('#attempt-dots');
  dots.replaceChildren();
  for (let index = 0; index < 5; index++) {
    const dot = document.createElement('i');
    dot.classList.toggle('used', index >= attemptsLeft);
    dots.append(dot);
  }
}

function setFeedback(message, type = '') {
  feedback.textContent = message;
  feedback.className = `game-feedback ${type}`.trim();
}

function setCredit(item) {
  const credit = document.querySelector('#photo-credit');
  const fileLink = document.createElement('a');
  fileLink.href = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.photoFile)}`;
  fileLink.target = '_blank';
  fileLink.rel = 'noopener noreferrer';
  fileLink.textContent = item.photoAuthor;
  const licenseLink = document.createElement('a');
  licenseLink.href = item.photoLicenseUrl;
  licenseLink.target = '_blank';
  licenseLink.rel = 'noopener noreferrer';
  licenseLink.textContent = item.photoLicense;
  credit.replaceChildren('Photo : ', fileLink, ' · ', licenseLink);
}

function startRound() {
  const item = deck[round];
  attemptsLeft = 5;
  resolved = false;
  tried = new Set();
  hintUsed = false;
  updateStatus();
  document.querySelector('#item-photo').src = `assets/jeu/${item.photo}`;
  document.querySelector('#item-photo').alt = item.alt;
  document.querySelector('#item-category').textContent = item.kind;
  document.querySelector('#item-name').textContent = item.name;
  document.querySelector('#item-prompt').textContent = 'Dans quel pays cet engin a-t-il été conçu ? Clique sur la carte pour répondre.';
  setCredit(item);
  setFeedback('Survole un pays pour voir son nom, puis clique pour tenter ta chance.');
  document.querySelector('#hint-button').disabled = false;
  document.querySelector('#hint-text').hidden = true;
  document.querySelector('#hint-text').textContent = '';
  answerPanel.hidden = true;
  answerPanel.classList.remove('missed');
  choice.value = '';
  for (const path of svg.querySelectorAll('.country')) path.classList.remove('wrong', 'correct');
}

function finishRound(won) {
  resolved = true;
  document.querySelector('#hint-button').disabled = true;
  const item = deck[round];
  const correctPath = svg.querySelector(`[data-code="${item.code}"]`);
  if (correctPath) correctPath.classList.add('correct');
  if (won) {
    found += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    const attemptsUsed = 5 - attemptsLeft;
    const earned = Math.max(1, attemptsLeft + 1 - Number(hintUsed));
    points += earned;
    setFeedback(`Bravo ! ${item.country} trouvé en ${attemptsUsed} tentative${attemptsUsed > 1 ? 's' : ''}. +${earned} point${earned > 1 ? 's' : ''}.`, 'success');
  } else {
    streak = 0;
    setFeedback(`Les cinq tentatives sont épuisées. La réponse était : ${item.country}.`, 'error');
  }
  updateStatus();
  document.querySelector('#answer-label').textContent = won ? 'Bonne réponse' : 'La réponse à retenir';
  document.querySelector('#answer-country').textContent = item.country;
  document.querySelector('#answer-explanation').textContent = item.explanation;
  const sourceLink = document.querySelector('#answer-source');
  sourceLink.href = item.source;
  sourceLink.firstChild.textContent = 'Vérifier dans la source officielle ';
  document.querySelector('#next-question').firstChild.textContent = round === deck.length - 1 ? 'Voir mon résultat ' : 'Question suivante ';
  answerPanel.classList.toggle('missed', !won);
  answerPanel.hidden = false;
  answerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function guess(code) {
  if (resolved || !code) return;
  const country = mapData.find(entry => entry.code === code);
  if (!country) return;
  if (tried.has(code)) {
    setFeedback(`${country.name} a déjà été essayé. Choisis un autre pays.`, 'error');
    return;
  }
  tried.add(code);
  attemptsLeft -= 1;
  choice.value = '';
  if (code === deck[round].code) {
    finishRound(true);
    return;
  }
  svg.querySelector(`[data-code="${code}"]`)?.classList.add('wrong');
  if (attemptsLeft === 0) {
    finishRound(false);
    return;
  }
  setFeedback(`${country.name} : ce n'est pas le bon pays. Il te reste ${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''}.`, 'error');
  updateStatus();
}

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function startGame() {
  const pool = selectedCategory === 'all'
    ? QUESTIONS
    : QUESTIONS.filter(item => item.category === selectedCategory);
  deck = shuffled(pool).slice(0, selectedMode === 'quick' ? 5 : pool.length);
  round = 0;
  found = 0;
  points = 0;
  streak = 0;
  bestStreak = 0;
  hintsUsed = 0;
  view = { ...BASE_VIEW };
  setView();
  gameEnd.hidden = true;
  challenge.hidden = false;
  mapPanel.hidden = false;
  document.querySelector('.game-status').hidden = false;
  document.querySelector('#game-mode-description').textContent =
    `${deck.length} question${deck.length > 1 ? 's' : ''} tirée${deck.length > 1 ? 's' : ''} au hasard · 5 tentatives par engin · jusqu'à 5 points par bonne réponse.`;
  startRound();
}

function screenToMap(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function setView() {
  view.w = Math.max(MIN_VIEW_WIDTH, Math.min(BASE_VIEW.w, view.w));
  view.h = view.w * BASE_VIEW.h / BASE_VIEW.w;
  view.x = Math.max(BASE_VIEW.x, Math.min(BASE_VIEW.x + BASE_VIEW.w - view.w, view.x));
  view.y = Math.max(BASE_VIEW.y, Math.min(BASE_VIEW.y + BASE_VIEW.h - view.h, view.y));
  svg.setAttribute('viewBox', `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`);
  document.querySelector('#zoom-level').textContent = `${Math.round(BASE_VIEW.w / view.w * 100)} %`;
}

function zoomAt(factor, clientX, clientY) {
  const anchor = screenToMap({ clientX, clientY });
  const width = Math.max(MIN_VIEW_WIDTH, Math.min(BASE_VIEW.w, view.w * factor));
  const height = width * BASE_VIEW.h / BASE_VIEW.w;
  const ratioX = (anchor.x - view.x) / view.w;
  const ratioY = (anchor.y - view.y) / view.h;
  view = { x: anchor.x - ratioX * width, y: anchor.y - ratioY * height, w: width, h: height };
  setView();
}

function mapCenter() {
  const rect = svg.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function panFromTo(from, to) {
  const start = screenToMap({ clientX: from.x, clientY: from.y });
  const end = screenToMap({ clientX: to.x, clientY: to.y });
  view.x += start.x - end.x;
  view.y += start.y - end.y;
  setView();
}

function buildMap() {
  const sorted = [...mapData].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  for (const country of mapData) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', country.path);
    path.setAttribute('class', 'country');
    path.setAttribute('data-code', country.code);
    path.setAttribute('aria-label', country.name);
    path.setAttribute('fill-rule', 'evenodd');
    const title = document.createElementNS(SVG_NS, 'title');
    title.textContent = country.name;
    path.append(title);
    svg.append(path);
  }
  for (const country of sorted) {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.name;
    choice.append(option);
  }
  svg.addEventListener('click', event => {
    if (performance.now() < suppressMapClickUntil) return;
    const path = event.target.closest?.('.country');
    if (path) guess(path.dataset.code);
  });
  svg.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
    event.target.setPointerCapture?.(event.pointerId);
    if (activePointers.size > 1) gestureMoved = true;
    tooltip.hidden = true;
  });
  svg.addEventListener('pointermove', event => {
    if (activePointers.has(event.pointerId)) {
      const previous = [...activePointers.values()].map(pointer => ({ ...pointer }));
      const pointer = activePointers.get(event.pointerId);
      const from = { x: pointer.x, y: pointer.y };
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (activePointers.size === 1) {
        if (Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) > 5) {
          gestureMoved = true;
          svg.classList.add('is-grabbing');
          panFromTo(from, pointer);
        }
      } else {
        gestureMoved = true;
        svg.classList.add('is-grabbing');
        const now = [...activePointers.values()];
        const oldDistance = Math.hypot(previous[0].x - previous[1].x, previous[0].y - previous[1].y);
        const newDistance = Math.hypot(now[0].x - now[1].x, now[0].y - now[1].y);
        const oldCenter = { x: (previous[0].x + previous[1].x) / 2, y: (previous[0].y + previous[1].y) / 2 };
        const newCenter = { x: (now[0].x + now[1].x) / 2, y: (now[0].y + now[1].y) / 2 };
        if (newDistance > 10 && oldDistance > 10) zoomAt(oldDistance / newDistance, newCenter.x, newCenter.y);
        panFromTo(oldCenter, newCenter);
      }
      tooltip.hidden = true;
      event.preventDefault();
      return;
    }
    const path = event.target.closest?.('.country');
    if (!path) { tooltip.hidden = true; return; }
    tooltip.textContent = path.querySelector('title').textContent;
    const rect = document.querySelector('#map-frame').getBoundingClientRect();
    tooltip.style.left = `${Math.min(rect.width - 115, Math.max(10, event.clientX - rect.left + 13))}px`;
    tooltip.style.top = `${Math.max(8, event.clientY - rect.top - 36)}px`;
    tooltip.hidden = false;
  });
  function endPointer(event) {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.delete(event.pointerId);
    if (gestureMoved) suppressMapClickUntil = performance.now() + 400;
    if (!activePointers.size) {
      gestureMoved = false;
      svg.classList.remove('is-grabbing');
    }
    tooltip.hidden = true;
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);
  svg.addEventListener('wheel', event => {
    event.preventDefault();
    zoomAt(Math.exp(event.deltaY * .0015), event.clientX, event.clientY);
    tooltip.hidden = true;
  }, { passive: false });
  svg.addEventListener('pointerleave', () => { tooltip.hidden = true; });
}

if (Array.isArray(mapData) && mapData.length) {
  buildMap();
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.addEventListener('click', () => {
      selectedMode = button.dataset.mode;
      for (const option of document.querySelectorAll('[data-mode]')) {
        option.setAttribute('aria-pressed', String(option === button));
      }
      startGame();
    });
  }
  for (const button of document.querySelectorAll('[data-category]')) {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      for (const option of document.querySelectorAll('[data-category]')) {
        option.setAttribute('aria-pressed', String(option === button));
      }
      startGame();
    });
  }
  document.querySelector('#hint-button').addEventListener('click', () => {
    if (resolved || hintUsed) return;
    hintUsed = true;
    hintsUsed += 1;
    const hint = document.querySelector('#hint-text');
    hint.textContent = `Indice : ${deck[round].hint} Un point sera retiré si tu trouves la réponse.`;
    hint.hidden = false;
    document.querySelector('#hint-button').disabled = true;
  });
  startGame();
  document.querySelector('#country-form').addEventListener('submit', event => {
    event.preventDefault();
    guess(choice.value);
  });
  document.querySelector('#zoom-in').addEventListener('click', () => {
    const center = mapCenter();
    zoomAt(.72, center.x, center.y);
  });
  document.querySelector('#zoom-out').addEventListener('click', () => {
    const center = mapCenter();
    zoomAt(1 / .72, center.x, center.y);
  });
  document.querySelector('#zoom-reset').addEventListener('click', () => {
    view = { ...BASE_VIEW };
    setView();
  });
  document.querySelector('#next-question').addEventListener('click', () => {
    round += 1;
    if (round < deck.length) {
      startRound();
      challenge.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      challenge.hidden = true;
      mapPanel.hidden = true;
      answerPanel.hidden = true;
      document.querySelector('.game-status').hidden = true;
      document.querySelector('#final-score').textContent = `Tu as trouvé ${found} engin${found > 1 ? 's' : ''} sur ${deck.length} et obtenu ${points} point${points > 1 ? 's' : ''}. Meilleure série : ${bestStreak}. Indices utilisés : ${hintsUsed}.`;
      gameEnd.hidden = false;
      gameEnd.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  document.querySelector('#play-again').addEventListener('click', () => {
    startGame();
    challenge.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
} else {
  setFeedback('La carte est indisponible. Recharge la page pour commencer.', 'error');
}
