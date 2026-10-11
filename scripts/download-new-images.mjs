import fs from 'node:fs/promises';
import path from 'node:path';

const images=JSON.parse(await fs.readFile('scripts/wikipedia-image-results.json','utf8'));
const dest='assets/jeu/ajouts/serie-2';
await fs.mkdir(dest,{recursive:true});
const artistOverride={akinci:'Service de presse de la présidence de l’Azerbaïdjan',type45:'Brian Burnell',f22:'Master Sgt. Andy Dunaway / U.S. Air Force'};
const clean=value=>String(value||'Wikimedia Commons').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const credits=[];
for(const image of images){
  if(!image.url||!image.file||!image.license)throw new Error('Photo ou licence manquante : '+image.key);
  const response=await fetch(image.url,{headers:{'User-Agent':'Radar/1.0 (educational website; source attribution in credits)'}});
  if(!response.ok)throw new Error(`${image.key}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  const photo=`${image.key}.jpg`;
  await fs.writeFile(path.join(dest,photo),bytes);
  credits.push({key:image.key,file:image.file,path:`ajouts/serie-2/${photo}`,artist:artistOverride[image.key]||clean(image.artist),license:image.license,licenseUrl:image.licenseUrl||'https://commons.wikimedia.org/wiki/Commons:Public_domain',page:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(image.file.replaceAll(' ','_')),bytes:bytes.length});
  console.log(`${image.key}: ${bytes.length} bytes`);
}
await fs.writeFile(path.join(dest,'credits.json'),JSON.stringify(credits,null,2));
