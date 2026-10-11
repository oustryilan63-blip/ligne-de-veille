import fs from 'node:fs';
import path from 'node:path';
const destination=process.argv[2];
if(!destination)throw new Error('Indiquer le dossier de publication.');
const root=path.resolve(destination);
if(!fs.statSync(root).isDirectory())throw new Error('Dossier absent.');
const names=['engins-data.js','histoire-data.js','histoire-chiffres.js','histoire-technique.js','histoire-frises.js','histoire-photos-data.js','histoire-3d-data.js','actualites.js','quiz-data.js'];
let before=0,after=0,count=0;
for(const name of names){
  const file=path.join(root,name);if(!fs.existsSync(file))continue;
  const source=fs.readFileSync(file,'utf8'),start=source.indexOf('window.'),tail=source.slice(start);
  const assignment=tail.match(/^window\.[A-Z0-9_]+\s*=\s*/);if(start<0||!assignment)continue;
  const json=tail.slice(assignment[0].length).trim().replace(/;$/,'');
  let data;try{data=JSON.parse(json)}catch{console.log('Source conservée sans modification : '+name);continue;}
  const compact=source.slice(0,start)+assignment[0]+JSON.stringify(data)+';\n';
  before+=Buffer.byteLength(source);after+=Buffer.byteLength(compact);count++;
  fs.writeFileSync(file,compact);
}
console.log(`${count} fichiers de données : ${before} → ${after} octets (${before-after} octets économisés).`);
