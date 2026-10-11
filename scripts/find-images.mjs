const searches = [
  ['challenger2','Challenger 2 tank British Army'],['bradley','M2 Bradley fighting vehicle'],['stryker','Stryker armored vehicle'],
  ['caesar','CAESAR self-propelled howitzer'],['pzh2000','Panzerhaubitze 2000'],['himars','M142 HIMARS'],
  ['archer','Archer artillery system Sweden'],['lynx','Lynx KF41 infantry fighting vehicle'],['guarani','VBTP-MR Guarani'],
  ['f22','F-22 Raptor'],['a10','A-10 Thunderbolt II'],['superhornet','F/A-18E Super Hornet'],['su57','Sukhoi Su-57'],
  ['c17','C-17 Globemaster III'],['h225m','H225M Caracal helicopter'],['chinook','CH-47 Chinook'],
  ['mq9','MQ-9 Reaper'],['rq4','RQ-4 Global Hawk'],['akinci','Bayraktar Akinci'],
  ['suffren','Suffren submarine S 635'],['type45','Type 45 destroyer Royal Navy'],['seawolf','USS Seawolf SSN 21'],
  ['aquitaine','FREMM Aquitaine frigate'],['kongo','JS Kongo DDG-173'],['arleigh','USS Arleigh Burke DDG-51']
];
for (const [key, query] of searches) {
  const params = new URLSearchParams({action:'query',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'5',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960',format:'json'});
  try {
    const response = await fetch('https://commons.wikimedia.org/w/api.php?'+params,{headers:{'User-Agent':'Radar/1.0 (public educational website; editor contact via site)'}});
    const data = await response.json();
    const found = Object.values(data.query?.pages||{}).filter(p=>p.imageinfo?.[0]?.thumburl).map(p=>({file:p.title.slice(5),license:p.imageinfo[0].extmetadata?.LicenseShortName?.value,url:p.imageinfo[0].thumburl,artist:p.imageinfo[0].extmetadata?.Artist?.value}));
    console.log(JSON.stringify({key,found:found.slice(0,3)}));
  } catch(error) { console.log(JSON.stringify({key,error:String(error)})); }
}
