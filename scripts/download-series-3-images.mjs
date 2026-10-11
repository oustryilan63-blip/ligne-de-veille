import fs from 'node:fs/promises';
const request=async (site,params)=>{
 const r=await fetch(`https://${site}/w/api.php?`+new URLSearchParams({...params,format:'json'}),{headers:{'User-Agent':'Radar/1.0 (educational website; credits included)'}});
 if(!r.ok)throw new Error('HTTP '+r.status);return r.json();
};
const wiki=await request('en.wikipedia.org',{action:'query',titles:'KAI KF-21 Boramae',prop:'pageimages',piprop:'name',redirects:'1'});
const kfFile='A South Korean Air Force KF-21, developed by Korea Aerospace Industries, performs an aerial demonstration at the Aerospace and Defense Exhibition in Seoul, South Korea, October 21, 2023.jpg';
const selected=[['bushmaster','Bushmaster ADFA open day2.JPG'],['kf21',kfFile],['p8','P-8A Poseidon VX-20 Squadron.jpg'],['pinaka','Pinaka 214 MM Multiple Barrel Rocket Launcher System passes through the Rajpath during the 66th Republic Day Parade 2015, in New Delhi on January 26, 2015.jpg'],['america','USS America (LHA 6) off the coast of San Diego.JPG']];
const info=await request('commons.wikimedia.org',{action:'query',titles:selected.map(x=>'File:'+x[1]).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1200'});
const pages=Object.values(info.query.pages);
const clean=x=>String(x||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const dest='assets/jeu/ajouts/serie-3';await fs.mkdir(dest,{recursive:true});
const credits=[];
for(const [key,file] of selected){
 const page=pages.find(x=>x.title.slice(5).replaceAll(' ','_')===file.replaceAll(' ','_'));
 const image=page?.imageinfo?.[0];if(!image)throw new Error('Image manquante '+file);
 const meta=image.extmetadata; const license=meta.LicenseShortName?.value;if(!license)throw new Error('Licence manquante '+file);
 const r=await fetch(image.thumburl||image.url);if(!r.ok)throw new Error('Téléchargement '+key+' '+r.status);
 const bytes=Buffer.from(await r.arrayBuffer());await fs.writeFile(dest+'/'+key+'.jpg',bytes);
 const row={key,file:page.title.slice(5),path:`ajouts/serie-3/${key}.jpg`,artist:clean(meta.Artist?.value),license,licenseUrl:meta.LicenseUrl?.value||'https://commons.wikimedia.org/wiki/Commons:Public_domain',page:image.descriptionurl,bytes:bytes.length};
 credits.push(row);console.log(JSON.stringify(row));
}
await fs.writeFile(dest+'/credits.json',JSON.stringify(credits,null,2));
