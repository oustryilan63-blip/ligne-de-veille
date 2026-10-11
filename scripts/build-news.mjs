import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateImage } from './news-image-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'actualites.json'), 'utf8'));
const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
if (!isDate(source.updatedAt)) throw new Error('Date de mise à jour invalide');
if (typeof source.correctionsEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(source.correctionsEmail)) throw new Error('Adresse de signalement invalide');
if (!Array.isArray(source.items) || source.items.length < 1 || source.items.length > 2000) throw new Error('Il faut 1 à 2 000 actualités');
const urls = new Set();
for (const item of source.items) {
  if (!isDate(item.date) || item.date > source.updatedAt) throw new Error('Date de publication invalide');
  for (const [field, max] of [['source', 60], ['sourceType', 40], ['title', 140], ['summary', 600], ['why', 240]]) {
    if (typeof item[field] !== 'string' || !item[field].trim() || item[field].length > max) throw new Error(`Champ ${field} invalide`);
  }
  const url = new URL(item.url);
  if(/conflits/i.test(item.source))delete item.sourceExcerpt;
  validateImage(item);
  if(item.sourceExcerpt&&(item.sourceExcerpt.kind!=='feed-excerpt'||typeof item.sourceExcerpt.text!=='string'||item.sourceExcerpt.text.length>281||item.sourceExcerpt.text.trim().split(/\s+/).length>20))throw new Error('Extrait éditeur invalide');
  if (url.protocol !== 'https:' || urls.has(url.href)) throw new Error('URL non sécurisée ou en double');
  urls.add(url.href);
}
source.items.sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync(path.join(root, 'actualites.js'), `window.LDV_NEWS = ${JSON.stringify(source, null, 2)};\n`, 'utf8');
console.log(`${source.items.length} actualités prêtes pour le site et ses archives`);
