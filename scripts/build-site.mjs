import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(root,process.argv[2]||'_site');
if(!output.startsWith(root+path.sep)||output===root)throw new Error('La construction doit rester dans un sous-dossier du projet');
if(fs.existsSync(output)&&fs.readdirSync(output).length)throw new Error('Utiliser un dossier de construction vide pour éviter des fichiers périmés');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'scripts/public-files.json'),'utf8'));
fs.mkdirSync(output,{recursive:true});let count=0,bytes=0;
function copy(file){const from=path.join(root,file),to=path.join(output,file);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);count++;bytes+=fs.statSync(from).size}
for(const file of manifest.rootFiles){if(!/^[a-z0-9.-]+$/.test(file))throw new Error('Chemin public invalide');copy(file)}
function walk(dir){for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const file=dir+'/'+entry.name;if(manifest.excludedAssets.some(p=>p.endsWith('/')?file.startsWith(p):p===file))continue;if(entry.isSymbolicLink())throw new Error('Lien symbolique non publié');if(entry.isDirectory())walk(file);else if(!manifest.excludedExtensions.some(ext=>file.endsWith(ext)))copy(file)}}
walk('assets');console.log(`Site public : ${count} fichiers, ${bytes} octets avant compaction des données.`);
