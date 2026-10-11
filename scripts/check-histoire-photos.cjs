const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
const run=name=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),ctx);
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attrs={};this.classes=new Set();this.classList={add:c=>this.classes.add(c),toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c)};this.textContent='';}
 append(...children){this.children.push(...children)}
 replaceChildren(...children){this.children=[];this.append(...children)}
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){this.events[k]=fn}
 fire(k,event={}){this.events[k]?.(event)}
}
ctx.document={createElement:tag=>new Node(tag)};
run('engins-data.js');run('histoire-photos-data.js');run('histoire-photos.js');
const items=ctx.window.LDV_ENGINS,api=ctx.window.RADAR_PHOTOS,data=ctx.window.RADAR_HISTORY_PHOTOS;
const flatten=n=>[n,...n.children.filter(c=>c&&typeof c==='object').flatMap(flatten)];
let total=0,multi=0,newPhotos=0;
for(const item of items){
 const records=api.photos(item);total+=records.length;multi+=Number(records.length>1);newPhotos+=(data[item.name]||[]).length;
 assert.ok(records.length>0,item.name);assert.ok(records.every(p=>p.real!==false));
 assert.equal(new Set(records.map(p=>p.src)).size,records.length);
 for(const p of records){assert.ok(fs.existsSync(path.join(root,p.src)),p.src);assert.ok(p.author&&p.license&&p.source,item.name+' : crédits manquants');assert.ok(!p.src.includes('sketchfab'));}
 const gallery=api.create(item),all=flatten(gallery),img=all.find(n=>n.tag==='img'),buttons=all.filter(n=>n.tag==='button'),counter=all.find(n=>n.attrs['aria-live']==='polite'),controls=all.find(n=>n.className==='history-gallery-controls');
 assert.equal(img.src,records[0].src);assert.equal(counter.textContent,'1 / '+records.length);
 assert.equal(buttons[0].disabled,records.length===1);assert.equal(buttons[1].disabled,records.length===1);
 buttons[1].fire('click');assert.equal(img.src,records[1%records.length].src);assert.equal(counter.textContent,(1%records.length+1)+' / '+records.length);
 buttons[0].fire('click');assert.equal(img.src,records[0].src);
 buttons[0].fire('click');assert.equal(img.src,records.at(-1).src);
 let prevented=false;controls.fire('keydown',{key:'ArrowRight',preventDefault(){prevented=true}});assert.ok(prevented);assert.equal(img.src,records[0].src);
 img.fire('error');assert.ok(img.hidden);buttons[1].fire('click');assert.equal(img.hidden,false);
 const preview=api.preview(item);assert.ok(preview&&preview.real!==false,item.name+' : aperçu réel absent');
 if((data[item.name]||[]).length&&item.mediaLabel!=='Illustration')assert.notEqual(preview.src,records[0].src,item.name+' : aperçu identique à la base');
}
assert.equal(newPhotos,189);assert.equal(total,288);assert.equal(multi,98);
assert.equal(api.photos(items[97])[0].userProvided,true);assert.equal(api.photos(items[97]).length,1);
assert.ok(!data['Type 055'].some(p=>p.file==='Type 055 destroyer.jpg'));
assert.ok(!data.M51.some(p=>/M5-eclate/.test(p.file)));
assert.ok(!data['RBS 70'].some(p=>/MSHORAD/.test(p.file)));
const html=fs.readFileSync(path.join(root,'histoire.html'),'utf8'),loader=fs.readFileSync(path.join(root,'histoire-bootstrap.js'),'utf8');assert.ok(html.includes('histoire-bootstrap.js'));assert.ok(loader.indexOf('histoire-photos-data.js')<loader.indexOf('histoire-photos.js'));assert.ok(loader.includes('histoire-3d.js'));
console.log(total+' photographies, '+multi+' galeries multiples : fichiers, crédits, images réelles, navigation circulaire, clavier, erreurs d’image et aperçus distincts vérifiés.');
