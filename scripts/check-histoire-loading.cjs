const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const bootstrap=read('histoire-bootstrap.js'),renderer=bootstrap.match(/await load\('(histoire\.js\?v=\d+)'\)/)[1];
async function scenario(search,fail='',hash='',dataset={}){
 const scripts=[],events=[],status={hidden:true,textContent:'',append(n){this.button=n}},catalogue={hidden:false},anchor={scrollIntoView(){events.push('anchor')}};
 const nodes={'history-load-state':status,'history-catalogue':catalogue,'vue-3d':anchor};let reload=false;
 const ctx={window:{LDV_ENGINS:Array.from({length:130},(_,i)=>({name:'Engin '+i}))},location:{search,hash,reload(){reload=true}},URLSearchParams,Map,Promise,Error};
 ctx.document={
  body:{dataset,classList:{add(){}}},getElementById:id=>nodes[id],
  createElement:tag=>({tag,remove(){},addEventListener(k,fn){this[k]=fn}}),
  head:{append(s){
   scripts.push(s.src);
   queueMicrotask(()=>{
    if(s.src.includes(fail)&&fail)s.onerror();
    else {if(s.src.startsWith('histoire-catalog-data'))ctx.window.RADAR_CATALOG_3D=['Engin 9'];events.push(s.src);s.onload()}
   });
  }}
 };
 vm.runInNewContext(read('histoire-bootstrap.js'),ctx);await new Promise(resolve=>setImmediate(resolve));
 return {scripts,events,status,catalogue,ctx,retry(){status.button.click();return reload}};
}
(async()=>{
 const catalogue=await scenario('');assert.deepEqual(catalogue.scripts,['histoire-catalog-data.js?v=6',renderer]);assert.ok(catalogue.ctx.window.RADAR_3D.has({name:'Engin 9'}));assert.ok(!catalogue.ctx.window.RADAR_3D.has({name:'Engin 10'}));assert.ok(catalogue.status.hidden);
 const profile=await scenario('?engin=9','','#vue-3d');assert.ok(profile.catalogue.hidden);assert.ok(profile.scripts.includes('map-data.js?v=2'));assert.ok(!profile.scripts.some(s=>s.startsWith('histoire-catalog-data')));assert.ok(profile.events.indexOf('histoire-3d-data.js?v=6')<profile.events.indexOf(bootstrap.match(/histoire-3d\.js\?v=\d+/)[0]));assert.equal(profile.events.at(-1),'anchor');assert.ok(profile.status.hidden);
 const bundle='profile-data/9-0123456789ab.js',attributes={engineIndex:'9',profileData:bundle};
 const bundled=await scenario('','','#vue-3d',attributes);assert.deepEqual(bundled.scripts,[bundle,'histoire-photos.js?v=4',bootstrap.match(/histoire-3d\.js\?v=\d+/)[0],renderer]);assert.equal(bundled.events.at(-1),'anchor');assert.ok(bundled.status.hidden);
 assert.ok(!bundled.scripts.includes('map-data.js?v=2'));await bundled.ctx.window.RADAR_LOAD_MAP();await bundled.ctx.window.RADAR_LOAD_MAP();assert.equal(bundled.scripts.filter(src=>src==='map-data.js?v=2').length,1);
 const lateFailure=await scenario('','map-data','',attributes);assert.ok(lateFailure.status.hidden);await assert.rejects(lateFailure.ctx.window.RADAR_LOAD_MAP());await assert.rejects(lateFailure.ctx.window.RADAR_LOAD_MAP());assert.equal(lateFailure.scripts.filter(src=>src==='map-data.js?v=2').length,2);
 const brokenBundle=await scenario('',bundle,'',attributes);assert.ok(!brokenBundle.status.hidden);assert.ok(brokenBundle.retry());assert.ok(!brokenBundle.scripts.includes(renderer));
 const switched=await scenario('?engin=0','','',attributes);assert.ok(switched.scripts.includes('histoire-data.js?v=23'));assert.ok(!switched.scripts.includes(bundle));
 const externalBundle=await scenario('?engin=9','','',{...attributes,profileData:'https://example.invalid/data.js'});assert.ok(externalBundle.scripts.includes('histoire-data.js?v=23'));assert.ok(!externalBundle.scripts.some(src=>src.startsWith('https:')));
 for(const query of ['?engin=-1','?engin=130','?engin=bonjour','?engin=3.5'])assert.deepEqual((await scenario(query)).scripts,catalogue.scripts);
 const failed=await scenario('?engin=16','map-data');assert.ok(!failed.status.hidden);assert.match(failed.status.textContent,/échoué/);assert.ok(failed.retry());assert.ok(!failed.scripts.includes(renderer));
 const malformed=await scenario('','','#%E0%A4%A');assert.ok(malformed.status.hidden);assert.ok(!malformed.status.button);
 const catalogCtx={window:{}};for(const n of ['engins-data.js','histoire-3d-data.js','histoire-catalog-data.js'])vm.runInNewContext(read(n),catalogCtx);assert.deepEqual([...catalogCtx.window.RADAR_CATALOG_3D].sort(),Object.keys(catalogCtx.window.RADAR_3D_MODELS).sort());assert.ok(fs.existsSync(path.join(root,catalogCtx.window.RADAR_CATALOG_PHOTOS.M51.src)));
 console.log('Catalogue léger, fiches complètes, dépendances, filtres 3D, erreurs et ancres vérifiés.');
})().catch(e=>{console.error(e);process.exitCode=1});

