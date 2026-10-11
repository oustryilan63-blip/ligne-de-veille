import fs from 'node:fs/promises';

const searches = [
  ['bushmaster', 'Bushmaster protected mobility vehicle Australia'],
  ['kf21', 'KAI KF-21 Boramae'],
  ['p8', 'Boeing P-8A Poseidon'],
  ['pinaka', 'Pinaka multiple rocket launcher India'],
  ['america', 'USS America LHA-6 ship']
];
const found = [];
for (const [key, query] of searches) {
  const params = new URLSearchParams({action:'query',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960',format:'json'});
  const response = await fetch('https://commons.wikimedia.org/w/api.php?' + params, {headers:{'User-Agent':'Radar/1.0 (educational website; credits included)'}});
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`);
  const data = await response.json();
  const options = Object.values(data.query?.pages || {}).filter(p => p.imageinfo?.[0]?.thumburl).map(p => ({file:p.title.slice(5),url:p.imageinfo[0].thumburl,license:p.imageinfo[0].extmetadata?.LicenseShortName?.value,licenseUrl:p.imageinfo[0].extmetadata?.LicenseUrl?.value,artist:p.imageinfo[0].extmetadata?.Artist?.value}));
  found.push({key,options});
  console.log(key, options.slice(0,8).map(x=>`${x.file} (${x.license})`).join(' | '));
}
await fs.writeFile('scripts/series-3-image-candidates.json',JSON.stringify(found,null,2));
