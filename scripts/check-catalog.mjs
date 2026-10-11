import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.createContext(context);
for(const file of ['engins-data.js','histoire-data.js','histoire-chiffres.js','histoire-technique.js','quiz-data.js','map-data.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {LDV_ENGINS:engins,LDV_HISTOIRE:history,LDV_CHIFFRES:figures,LDV_FACTS:facts,LDV_CHRONO:chrono,LDV_MAP:map}=context.window;
const fail=message=>{throw new Error(message)};
const technical=context.window.LDV_TECHNIQUE;
if(Object.keys(technical).length!==engins.length)fail('Couverture des fiches techniques incomplète');
for(const [i,e] of engins.entries()){
  const t=technical[i];
  if(t?.name!==e.name||!t.variant||!/^\d{4}-\d{2}-\d{2}$/.test(t.checkedAt)||!t.note||t.fields?.length<3||!t.sources?.length)fail('Fiche technique incomplète : '+e.name);
  const urls=new Set(t.sources.map(s=>s.url));
  for(const s of t.sources)if(!s.label||!s.url?.startsWith('https://'))fail('Source technique invalide : '+e.name);
  for(const f of t.fields)if(!f.label||!f.value||!urls.has(f.source))fail('Caractéristique sans référence : '+e.name);
}
if(engins.length<90||history.length!==engins.length)fail(`Catalogue ${engins.length}, fiches ${history.length}`);
const names=new Set(),codes=new Set(map.map(x=>x.code));
for(const [i,e] of engins.entries()){
  if(names.has(e.name))fail('Nom doublon : '+e.name);names.add(e.name);
  for(const code of e.originCodes||[e.code])if(!codes.has(code))fail('Pays de conception inconnu : '+code);
  if(!codes.has(e.code))fail('Code pays absent de la carte : '+e.code);
  if(!fs.existsSync('assets/jeu/'+e.photo))fail('Photo manquante : '+e.photo);
  if(!e.source?.startsWith('https://'))fail('Source invalide : '+e.name);
  if(!e.photoFile||!e.photoAuthor||!e.photoLicense)fail('Crédit manquant : '+e.name);
  if(!history[i]?.story)fail('Histoire manquante : '+e.name);
  for(const source of history[i].storySources||[])if(!source.label||!source.url?.startsWith('https://'))fail('Source du récit invalide : '+e.name);
  for(const code of [...(history[i].current||[]),...(history[i].former||[])])if(!codes.has(code))fail('Pays utilisateur absent de la carte : '+e.name+' '+code);
}
for(const fact of facts)if(!names.has(fact.ref))fail('Question sans engin : '+fact.ref);
for(const date of chrono)if(!date.source?.startsWith('https://'))fail('Date sans source : '+date.name);
for(const [key,figure] of Object.entries(figures)){
  if(!Number.isInteger(Number(key))||Number(key)<0||Number(key)>=engins.length)fail('Chiffre hors catalogue : '+key);
  for(const field of ['production','inventory','losses','targets'])if(figure[field]&&(!figure[field].value||!figure[field].note||!figure[field].source?.startsWith('https://')))fail('Chiffre incomplet : '+key+' '+field);
  for(const record of figure.combatRecords||[])if(!record.title||!record.status||!record.date||!record.text||!record.sources?.length||record.sources.some(s=>!s.label||!s.url?.startsWith('https://')))fail('Événement incomplet : '+key);
}
console.log(`${engins.length} engins, ${history.length} fiches, ${facts.length} affirmations, ${chrono.length} dates, ${Object.keys(figures).length} fiches chiffrées : OK`);
