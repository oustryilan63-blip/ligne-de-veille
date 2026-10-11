const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
function read(name){return fs.readFileSync(path.join(root,name),'utf8')}
vm.runInNewContext(read('engins-data.js'),ctx);
vm.runInNewContext(read('histoire-3d-data.js'),ctx);
const models=ctx.window.RADAR_3D_MODELS,items=ctx.window.LDV_ENGINS;
assert.equal(Object.keys(models).length,93);
const seen=new Set();
for(const [name,m] of Object.entries(models)){
 assert.equal(items[m.index].name,name);assert.equal(m.engine,name);
 assert.match(m.id,/^[a-f0-9]{32}$/);assert.ok(!seen.has(m.id));seen.add(m.id);
 assert.equal(new URL(m.thumbnail).hostname,'media.sketchfab.com');
 assert.equal(new URL(m.url).hostname,'sketchfab.com');assert.ok(m.author&&m.title&&m.note);
 assert.notEqual(m.thumbnail,'assets/jeu/'+items[m.index].photo);
}
assert.ok(!models['Classe Sōryū']);assert.ok(!models['LGM-25C Titan II']);
assert.match(models['T-90M'].title,/T-90M/);assert.doesNotMatch(models['T-90M'].title,/T-90MS/);
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attrs={};this.classList={add:()=>{}};this.textContent='';}
 append(...nodes){this.children.push(...nodes);nodes.forEach(n=>{if(n&&typeof n==='object')n.parent=this})}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){this.events[k]=fn}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
 fire(k){this.events[k]?.()}
}
ctx.document={createElement:tag=>new Element(tag)};
vm.runInNewContext(read('histoire-photos-data.js'),ctx);
vm.runInNewContext(read('histoire-photos.js'),ctx);
vm.runInNewContext(read('histoire-3d.js'),ctx);
function flatten(n){return [n,...n.children.filter(c=>c&&typeof c==='object').flatMap(flatten)]}
for(const item of items){
 const view=ctx.window.RADAR_3D.create(item);
 assert.equal(Boolean(view),Boolean(models[item.name]));if(!view)continue;
 const all=()=>flatten(view.section),stage=all().find(n=>n.id==='history-3d-stage'),toggle=all().find(n=>n.tag==='button'),poster=stage.children[0],status=all().find(n=>n.attrs.role==='status');
 assert.equal(all().filter(n=>n.tag==='iframe').length,0);
 assert.ok(!all().some(n=>n.textContent.includes('Ouvrir sur Sketchfab')));
 assert.equal(poster.children[0].src,ctx.window.RADAR_PHOTOS.preview(item).src);
 assert.ok(!poster.children[0].src.includes('sketchfab.com'));
 view.open();view.open();assert.equal(stage.children.length,1);
 const first=stage.children[0];assert.equal(first.tag,'iframe');assert.match(first.src,/dnt=1/);assert.match(first.src,new RegExp(models[item.name].id));
 first.fire('load');assert.match(status.textContent,/Lecteur ouvert/);
 toggle.fire('click');assert.equal(stage.children[0],poster);assert.equal(toggle.attrs['aria-expanded'],'false');
 first.fire('load');assert.equal(status.textContent,'Vue 3D fermée.');
 toggle.fire('click');assert.equal(stage.children[0].tag,'iframe');assert.notEqual(stage.children[0],first);
 toggle.fire('click');assert.equal(stage.children[0],poster);
 poster.children[0].fire('error');assert.equal(poster.children[0].hidden,true);
}
assert.ok(read('histoire.html').includes('histoire-bootstrap.js'));
assert.ok(read('histoire-bootstrap.js').indexOf('histoire-3d-data.js')<read('histoire-bootstrap.js').indexOf('histoire-3d.js'));
assert.equal(models.Rafale.id,'bf3f55ffe2864fc299fdf8052c65b4cc');
assert.equal(models["F-16 Fighting Falcon"].id,'599242a3ab9f4dc49558299ceaf1e10d');
console.log('93 modèles : cohérence du catalogue, aperçus distincts, lien redondant retiré, ouverture unique, fermeture, réouverture et erreurs tardives vérifiés.');
