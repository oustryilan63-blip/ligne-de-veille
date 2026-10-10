// Dates de premier vol, vérifiées dans les archives des fabricants.
window.LDV_CHRONO = [
  { name: 'F-15 Eagle', year: 1972, date: '27 juillet 1972', context: 'Premier vol du prototype F-15 Eagle.', source: 'https://www.boeing.com/content/dam/boeing/boeingdotcom/history/pdf/Boeing_Products.pdf' },
  { name: 'F-16 Fighting Falcon', year: 1974, date: '2 février 1974', context: 'Premier vol officiel du prototype YF-16.', source: 'https://investors.lockheedmartin.com/news-releases/news-release-details/lockheed-martin-marks-aviation-milestone-30th-anniversary-first/' },
  { name: 'Mirage 2000', year: 1978, date: '10 mars 1978', context: 'Le Mirage 2000-01 décolle à Istres pour la première fois.', source: 'https://www.dassault-aviation.com/en/passion/history/1916-to-2000/1965-1986/' },
  { name: 'Rafale A', year: 1986, date: '4 juillet 1986', context: 'Premier vol du démonstrateur technologique Rafale A.', source: 'https://timeline.dassault-aviation.com/fr/un-socle-pour-le-futur/' },
  { name: 'JAS 39 Gripen', year: 1988, date: '1988', context: 'Saab fait voler le premier appareil de développement Gripen.', source: 'https://www.saab.com/about/company-in-brief/history' },
  { name: 'Pilatus PC-21', year: 2002, date: '1er juillet 2002', context: 'Premier vol de cet avion suisse d’entraînement.', source: 'https://www.pilatus-aircraft.com/en/company/heritage' },
  { name: 'F-35 Lightning II', year: 2006, date: '15 décembre 2006', context: 'Premier vol du F-35 Lightning II à Fort Worth.', source: 'https://investors.lockheedmartin.com/news-releases/news-release-details/lockheed-martin-f-35-lightning-ii-stealth-fighter-completes/' },
  { name: 'KC-390 Millennium', year: 2015, date: '3 février 2015', context: 'Premier vol de l’avion de transport brésilien.', source: 'https://www.embraer.com/media-center/en?detail=19386&mediatype=NEWS&page=38' }
];

// Chaque réf renvoie à une fiche du catalogue et à sa source primaire.
window.LDV_FACTS = [
  { claim: 'Le K2 Black Panther a été conçu en Corée du Sud.', answer: true, ref: 'K2 Black Panther', reason: 'Hyundai Rotem présente le K2 comme un char sud-coréen.' },
  { claim: 'Le Pilatus PC-21 est un avion de combat.', answer: false, ref: 'Pilatus PC-21', reason: 'Le PC-21 est un avion d’entraînement destiné à la formation des pilotes.' },
  { claim: 'Le CV90 est un véhicule de combat d’infanterie.', answer: true, ref: 'CV90', reason: 'BAE Systems classe le CV90 parmi les véhicules de combat d’infanterie.' },
  { claim: 'Le C-390 Millennium est un sous-marin.', answer: false, ref: 'C-390 Millennium', reason: 'Le C-390 est un avion de transport militaire construit par Embraer.' },
  { claim: 'Le HMS Queen Elizabeth est un porte-avions britannique.', answer: true, ref: 'HMS Queen Elizabeth', reason: 'La Royal Navy présente le HMS Queen Elizabeth comme un de ses porte-avions.' },
  { claim: 'Le Bayraktar TB2 est un drone conçu en Turquie.', answer: true, ref: 'Bayraktar TB2', reason: 'Baykar présente le TB2 comme son drone de combat turc.' },
  { claim: 'La classe Visby désigne des corvettes suédoises.', answer: true, ref: 'Classe Visby', reason: 'Saab décrit les navires Visby comme des corvettes de la marine suédoise.' },
  { claim: 'La classe Astute regroupe des sous-marins japonais.', answer: false, ref: 'Classe Astute', reason: 'Les sous-marins Astute appartiennent à la Royal Navy britannique.' },
  { claim: 'Le Leopard 2 est un char de conception française.', answer: false, ref: 'Leopard 2', reason: 'Le Leopard 2 est un char conçu en Allemagne.' },
  { claim: 'Le Rafale est un avion de combat français.', answer: true, ref: 'Rafale', reason: 'Dassault Aviation conçoit et produit le Rafale en France.' },
  { claim: 'Le Type 055 est un destroyer chinois.', answer: true, ref: 'Type 055', reason: 'La presse militaire officielle chinoise décrit le Type 055 comme un destroyer.' },
  { claim: 'L’A-29 Super Tucano est un avion d’attaque brésilien.', answer: true, ref: 'A-29 Super Tucano', reason: 'Embraer présente l’A-29 comme un appareil d’attaque et d’appui fabriqué au Brésil.' }
];

// Les premières envolées ajoutées sont mélangées à chaque nouvelle partie.
window.LDV_CHRONO.push(
  { name: 'CH-47 Chinook', year: 1961, date: '21 septembre 1961', context: 'Premier vol du CH-47A à rotors en tandem.', source: 'https://www.boeing.com/content/dam/boeing/boeingdotcom/history/pdf/Boeing-Chronology.pdf' },
  { name: 'C-17 Globemaster III', year: 1991, date: '15 septembre 1991', context: 'Premier vol du C-17 à Long Beach.', source: 'https://www.boeing.com/features/2026/09/35-years-ago-the-c-17-first-took-flight' },
  { name: 'F-22 Raptor', year: 1997, date: '7 septembre 1997', context: 'Premier vol du F-22 Raptor.', source: 'https://www.lockheedmartin.com/en-us/news/features/history/f-22.html' },
  { name: 'Su-57', year: 2010, date: '29 janvier 2010', context: 'Premier vol du prototype T-50, futur Su-57.', source: 'https://www.rostec.ru/media/news/su-57-15-let-v-nebe/' },
  { name: 'Bayraktar Akıncı', year: 2019, date: '6 décembre 2019', context: 'Premier vol du drone turc Akıncı.', source: 'https://baykartech.com/en/press/turkish-akinci-combat-drone-sets-new-national-avia/' }
);

window.LDV_FACTS.push(
  { claim: 'Le Challenger 2 est un char britannique.', answer: true, ref: 'Challenger 2', reason: 'L’armée britannique présente le Challenger 2 comme son char de combat.' },
  { claim: 'Le M2 Bradley a été conçu en Allemagne.', answer: false, ref: 'M2 Bradley', reason: 'Le Bradley est un véhicule de combat d’infanterie américain.' },
  { claim: 'Le Stryker est un blindé à huit roues.', answer: true, ref: 'Stryker', reason: 'General Dynamics le décrit comme un véhicule 8×8.' },
  { claim: 'Le CAESAR est un sous-marin français.', answer: false, ref: 'CAESAR', reason: 'Le CAESAR est un canon automoteur français monté sur camion.' },
  { claim: 'Le PzH 2000 est un obusier automoteur allemand.', answer: true, ref: 'PzH 2000', reason: 'KNDS présente le PzH 2000 comme un système d’artillerie allemand.' },
  { claim: 'Le M142 HIMARS est un lance-roquettes à roues.', answer: true, ref: 'M142 HIMARS', reason: 'Lockheed Martin décrit son lanceur sur un châssis à roues.' },
  { claim: 'L’Archer a été développé pour la marine suédoise.', answer: false, ref: 'Archer', reason: 'L’Archer est un système d’artillerie terrestre suédois.' },
  { claim: 'Le Lynx KF41 est un véhicule de combat d’infanterie.', answer: true, ref: 'Lynx KF41', reason: 'Rheinmetall classe le Lynx KF41 parmi ses véhicules de combat d’infanterie.' },
  { claim: 'Le VBTP-MR Guarani a été développé au Japon.', answer: false, ref: 'VBTP-MR Guarani', reason: 'Le Guarani a été développé au Brésil avec l’armée brésilienne.' },
  { claim: 'Le F-22 Raptor est un chasseur américain.', answer: true, ref: 'F-22 Raptor', reason: 'Lockheed Martin présente le F-22 comme son chasseur de supériorité aérienne.' },
  { claim: 'L’A-10 Thunderbolt II est un avion d’appui rapproché.', answer: true, ref: 'A-10 Thunderbolt II', reason: 'L’US Air Force l’a conçu spécialement pour l’appui des forces au sol.' },
  { claim: 'Le F/A-18E/F Super Hornet est un sous-marin.', answer: false, ref: 'F/A-18E/F Super Hornet', reason: 'Le Super Hornet est un avion de combat embarqué.' },
  { claim: 'Le Su-57 est un programme aéronautique russe.', answer: true, ref: 'Su-57', reason: 'Rostec retrace le programme russe T-50 devenu Su-57.' },
  { claim: 'Le C-17 Globemaster III est un char de transport.', answer: false, ref: 'C-17 Globemaster III', reason: 'Le C-17 est un avion de transport militaire.' },
  { claim: 'Le H225M Caracal est un hélicoptère polyvalent.', answer: true, ref: 'H225M Caracal', reason: 'Airbus le présente comme un hélicoptère militaire multirôle.' },
  { claim: 'Le CH-47 Chinook possède deux rotors en tandem.', answer: true, ref: 'CH-47 Chinook', reason: 'Boeing indique cette architecture à deux rotors pour le transport lourd.' },
  { claim: 'Le MQ-9 Reaper est un navire de surface.', answer: false, ref: 'MQ-9 Reaper', reason: 'Le MQ-9 est un drone américain de surveillance et d’attaque.' },
  { claim: 'Le RQ-4 Global Hawk est un drone de reconnaissance.', answer: true, ref: 'RQ-4 Global Hawk', reason: 'Northrop Grumman décrit le RQ-4 comme un aéronef de reconnaissance sans pilote.' },
  { claim: 'Le Bayraktar Akıncı est conçu en Turquie.', answer: true, ref: 'Bayraktar Akıncı', reason: 'Baykar présente l’Akıncı comme son drone de combat turc.' },
  { claim: 'La classe Suffren regroupe des frégates.', answer: false, ref: 'Classe Suffren', reason: 'Le programme Suffren porte sur des sous-marins nucléaires d’attaque français.' },
  { claim: 'Les Type 45 Daring sont des destroyers britanniques.', answer: true, ref: 'Type 45 Daring', reason: 'La Royal Navy recense six destroyers Type 45.' },
  { claim: 'La classe Seawolf compte trois sous-marins.', answer: true, ref: 'Classe Seawolf', reason: 'La marine américaine indique trois unités pour cette classe.' },
  { claim: 'L’Aquitaine est une frégate italienne.', answer: false, ref: 'FREMM Aquitaine', reason: 'L’Aquitaine est la première FREMM de la Marine nationale française.' },
  { claim: 'La classe Kongō sert dans la marine japonaise.', answer: true, ref: 'Classe Kongō', reason: 'La force maritime japonaise présente ses quatre destroyers Kongō.' },
  { claim: 'La classe Arleigh Burke est une famille de sous-marins.', answer: false, ref: 'Classe Arleigh Burke', reason: 'Il s’agit de destroyers de la marine américaine.' }
);

// Série 3 : cinq engins et deux premiers vols documentés.
window.LDV_FACTS.push(
  {"claim":"Le Bushmaster est un véhicule de conception australienne.","answer":true,"ref":"Bushmaster","reason":"Thales le fabrique à Bendigo, en Australie, pour des missions de transport protégé."},
  {"claim":"Le KF-21 Boramae est un avion de combat japonais.","answer":false,"ref":"KF-21 Boramae","reason":"KAI a conduit le programme KF-21 en Corée du Sud, avec une coopération indonésienne."},
  {"claim":"Le P-8 Poseidon est un avion de patrouille maritime.","answer":true,"ref":"P-8 Poseidon","reason":"Boeing le destine notamment à la surveillance maritime et à la lutte anti-sous-marine."},
  {"claim":"Le Pinaka est un sous-marin de la marine indienne.","answer":false,"ref":"Pinaka","reason":"Le Pinaka est un système terrestre de lance-roquettes multiples développé en Inde."},
  {"claim":"L’USS America LHA 6 est un bâtiment d’assaut amphibie.","answer":true,"ref":"USS America","reason":"La marine américaine classe l’USS America parmi ses bâtiments d’assaut amphibie, avec un important groupe aérien embarqué."}
);
window.LDV_CHRONO.push(
  {"name":"P-8 Poseidon","year":2009,"date":"25 avril 2009","context":"Premier vol du Boeing P-8A Poseidon, avion de patrouille maritime.","source":"https://www.boeing.com/content/dam/boeing/boeingdotcom/history/pdf/Boeing-Chronology.pdf"},
  {"name":"KF-21 Boramae","year":2022,"date":"19 juillet 2022","context":"Premier vol du prototype du chasseur sud-coréen KF-21.","source":"https://www.koreaaero.com/EN/Business/KF21.aspx"}
);
