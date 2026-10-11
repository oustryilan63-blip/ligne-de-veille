const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process'),os=require('os');
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'radar-static-'));
const names=['engins-data.js','histoire-data.js','histoire-chiffres.js','histoire-technique.js','histoire-frises.js','histoire-photos-data.js','histoire-3d-data.js','actualites.js','quiz-data.js'];
const snapshots={};for(const n of names){const src=fs.readFileSync(path.join(root,n),'utf8');fs.writeFileSync(path.join(temp,n),src);const ctx={window:{}};vm.runInNewContext(src,ctx);snapshots[n]=JSON.stringify(ctx.window)}
const run=()=>cp.execFileSync(process.execPath,[path.join(root,'scripts/optimize-static.mjs'),temp],{encoding:'utf8'});console.log(run().trim());
for(const n of names){const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(temp,n),'utf8'),ctx);assert.equal(JSON.stringify(ctx.window),snapshots[n],n)}
const once=names.map(n=>fs.readFileSync(path.join(temp,n),'utf8'));run();assert.deepEqual(names.map(n=>fs.readFileSync(path.join(temp,n),'utf8')),once);
const before=['engins-data.js','histoire-data.js','histoire-chiffres.js','histoire-technique.js','map-data.js','histoire-frises.js','histoire-photos-data.js','histoire-3d-data.js','histoire-photos.js','histoire-3d.js','histoire.js'].reduce((s,n)=>s+fs.statSync(path.join(root,n)).size,0);
const after=fs.statSync(path.join(temp,'engins-data.js')).size+['histoire-catalog-data.js','histoire-bootstrap.js','histoire.js'].reduce((s,n)=>s+fs.statSync(path.join(root,n)).size,0);
const workflow=fs.readFileSync(path.join(root,'.github/workflows/veille-quotidienne.yml'),'utf8');assert.match(workflow,/cron: '0 8,18 \* \* \*'/);assert.match(workflow,/timezone: Europe\/Paris/);assert.match(workflow,/node scripts\/optimize-static.mjs _site/);
console.log(`Catalogue Histoire : ${before} → ${after} octets JS hors compression réseau (${(100*(1-after/before)).toFixed(1)} % économisés). Données identiques après compaction, traitement stable, veille 8 h + 18 h vérifiés.`);
