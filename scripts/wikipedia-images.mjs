import fs from 'node:fs/promises';

const articles = [
  ['challenger2','Challenger 2'],['bradley','M2 Bradley'],['stryker','Stryker'],
  ['caesar','CAESAR self-propelled howitzer'],['pzh2000','Panzerhaubitze 2000'],['himars','M142 HIMARS'],
  ['archer','Archer artillery system'],['lynx','Lynx (Rheinmetall armoured fighting vehicle)'],['guarani','VBTP-MR Guarani'],
  ['f22','Lockheed Martin F-22 Raptor'],['a10','Fairchild Republic A-10 Thunderbolt II'],['superhornet','Boeing F/A-18E/F Super Hornet'],
  ['su57','Sukhoi Su-57'],['c17','Boeing C-17 Globemaster III'],['h225m','Eurocopter EC725'],
  ['chinook','Boeing CH-47 Chinook'],['mq9','General Atomics MQ-9 Reaper'],['rq4','Northrop Grumman RQ-4 Global Hawk'],
  ['akinci','Bayraktar Akıncı'],['suffren','French submarine Suffren'],['type45','Type 45 destroyer'],
  ['seawolf','Seawolf-class submarine'],['aquitaine','French frigate Aquitaine'],['kongo','Kongō-class destroyer'],
  ['arleigh','Arleigh Burke-class destroyer']
];
const endpoint='https://en.wikipedia.org/w/api.php';
const get=async params=>{
  const url=endpoint+'?'+new URLSearchParams({...params,format:'json'});
  const response=await fetch(url,{headers:{'User-Agent':'Radar/1.0 (educational website; photo metadata)'}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  return response.json();
};
const data=await get({action:'query',titles:articles.map(x=>x[1]).join('|'),redirects:'1',prop:'pageimages',piprop:'thumbnail|name',pithumbsize:'960'});
const pages=Object.values(data.query.pages);
const preferred={guarani:'VBTP-MR Guarani (7810193370).jpg',pzh2000:'Dutch army Pzh-2000 firing on Taliban in Chura. June 16, 2007. Photo by David Axe.jpg',suffren:'2024 MBST 308 D 001 013.jpg'};
const files=[...new Set([...pages.map(p=>p.pageimage),...Object.values(preferred)].filter(Boolean))];
const info=await get({action:'query',titles:files.map(f=>'File:'+f).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960'});
const byFile=new Map(Object.values(info.query.pages).map(p=>[p.title.slice(5).replaceAll(' ','_'),p.imageinfo?.[0]]));
const output=[];
for(const [key,title] of articles){
  const redirect=data.query.redirects?.find(r=>r.from===title);
  const actual=redirect?.to||title;
  const page=pages.find(p=>p.title===actual)||pages.find(p=>p.title===title);
  const file=preferred[key]||page?.pageimage;
  const image=file&&byFile.get(file.replaceAll(' ','_'));
  const ext=image?.extmetadata||{};
  const record={key,title:page?.title||title,file,license:ext.LicenseShortName?.value,licenseUrl:ext.LicenseUrl?.value,artist:ext.Artist?.value,description:ext.ImageDescription?.value?.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,120),url:image?.thumburl};
  output.push(record);
  console.log(JSON.stringify({...record,url:record.url?.slice(0,90)}));
}
await fs.writeFile('scripts/wikipedia-image-results.json',JSON.stringify(output,null,2));
