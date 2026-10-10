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
