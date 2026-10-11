import fs from 'node:fs';import assert from 'node:assert/strict';import {validateImage} from './news-image-validation.mjs';
const news=JSON.parse(fs.readFileSync(new URL('../actualites.json',import.meta.url),'utf8'));
for(const item of news.items)validateImage(item);
const specific=news.items.find(i=>i.image?.provider==='specific-permission'),clone=()=>JSON.parse(JSON.stringify(specific));
let bad=clone();bad.image.kind='illustration';assert.throws(()=>validateImage(bad));
bad=clone();bad.image.src='https://www.opex360.com/wp-content/uploads/another-photo.jpg';assert.throws(()=>validateImage(bad));
bad=clone();bad.image.assetUrl='https://www.opex360.com/wp-content/uploads/another-main.jpg';assert.throws(()=>validateImage(bad));
bad=clone();bad.image.credit='Auteur inventé';assert.throws(()=>validateImage(bad));
const licensed=news.items.find(i=>i.image?.provider==='verified-asset');
if(licensed){
  bad=structuredClone(licensed);bad.image.sha256='0'.repeat(64);assert.throws(()=>validateImage(bad));
  bad=structuredClone(licensed);bad.image.rightsUrl=bad.url;assert.throws(()=>validateImage(bad));
  bad=structuredClone(licensed);bad.image.assetUrl='https://example.com/unrelated.jpg';assert.throws(()=>validateImage(bad));
}
console.log('Schéma des photos et permissions : vrais fichiers acceptés, substitution et droits inventés rejetés.');
