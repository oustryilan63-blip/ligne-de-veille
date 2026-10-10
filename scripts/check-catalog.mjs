import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.createContext(context);
for(const file of ['engins-data.js','histoire-data.js','histoire-chiffres.js','quiz-data.js','map-data.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {LDV_ENGINS:engins,LDV_HISTOIRE:history,LDV_CHIFFRES:figures,LDV_FACTS:facts,LDV_CHRONO:chrono,LDV_MAP:map}=context.window;
const fail=message=>{throw new Error(message)};
if(engins.length!==90||history.length!==90)fail(`Catalogue ${engins.length}, fiches ${history.length}`);
const names=new Set(),codes=new Set(map.map(x=>x.code));
for(const [i,e] of engins.entries()){
  if(names.has(e.name))fail('Nom doublon : '+e.name);names.add(e.name);
  for(const code of e.originCodes||[e.code])if(!codes.has(code))fail('Pays de conception inconnu : '+code);
  if(!codes.has(e.code))fail('Code pays absent de la carte : '+e.code);
  if(!fs.existsSync('assets/jeu/'+e.photo))fail('Photo manquante : '+e.photo);
  if(!e.source?.startsWith('https://'))fail('Source invalide : '+e.name);
  if(!e.photoFile||!e.photoAuthor||!e.photoLicense)fail('Crédit manquant : '+e.name);
  if(!history[i]?.story)fail('Histoire manquante : '+e.name);
  for(const code of [...(history[i].current||[]),...(history[i].former||[])])if(!codes.has(code))fail('Pays utilisateur absent de la carte : '+e.name+' '+code);
}
for(const fact of facts)if(!names.has(fact.ref))fail('Question sans engin : '+fact.ref);
for(const date of chrono)if(!date.source?.startsWith('https://'))fail('Date sans source : '+date.name);
for(const key of Object.keys(figures))if(Number(key)>=engins.length)fail('Chiffre hors catalogue : '+key);
console.log(`${engins.length} engins, ${history.length} fiches, ${facts.length} affirmations, ${chrono.length} dates, ${Object.keys(figures).length} fiches chiffrées : OK`);
