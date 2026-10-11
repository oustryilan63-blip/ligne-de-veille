import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {labelPoint} from './radar-map-geometry.mjs';

const root = path.resolve(import.meta.dirname, '..');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'map-data.js'), 'utf8'), context);
const countries = context.window.LDV_MAP;
const selected = ['IE','GB','PT','ES','FR','BE','NL','LU','DE','CH','IT','AT','CZ','DK','PL','SI','HR','BA','ME','AL','GR','DZ','TN'];
const paths = selected.map(code => {
  const item = countries.find(country => country.code === code);
  if (!item) return '';
  const france = code === 'FR';
  return `<path data-country="${code}" class="${france ? 'france' : 'neighbor'}" d="${item.path}"/>`;
}).join('');
const names=[['FR','FRANCE'],['GB','ROYAUME-UNI'],['ES','ESPAGNE'],['IT','ITALIE'],['DE','ALLEMAGNE'],['PT','PORTUGAL'],['BE','BELGIQUE'],['NL','PAYS-BAS'],['CH','SUISSE']];
const labels = names.map(([code,name])=>{const anchor=labelPoint(countries.find(c=>c.code===code).path);const cls=code==='FR'?'main':['BE','NL','CH'].includes(code)?'small':'minor';return `<text data-country-label="${code}" class="${cls}" x="${anchor.x}" y="${anchor.y}" dominant-baseline="middle">${name}</text>`}).join('')+[
 ['ATLANTIQUE',575,130],['MÉDITERRANÉE',614,153],['MANCHE',594,112.5]
].map(([name,x,y])=>`<text class="water" x="${x}" y="${y}">${name}</text>`).join('');
const grid = Array.from({length:20},(_,i)=>`<path d="M${565+i*5} 88V158"/>`).join('')+
  Array.from({length:14},(_,i)=>`<path d="M565 ${88+i*5}H665"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="565 88 100 70" role="img" aria-label="Carte stylisée de la France et des pays voisins">
<defs><linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102b36"/><stop offset="1" stop-color="#0b2029"/></linearGradient><radialGradient id="glow"><stop stop-color="#5ecbc1" stop-opacity=".1"/><stop offset="1" stop-color="#5ecbc1" stop-opacity="0"/></radialGradient></defs>
<rect x="565" y="88" width="100" height="70" fill="url(#sea)"/><g stroke="#8ab9b3" stroke-opacity=".1" stroke-width=".11">${grid}</g>
<g fill="#25413c" stroke="#62837c" stroke-width=".18" stroke-linejoin="round">${paths}</g>
<circle cx="607" cy="121" r="38" fill="url(#glow)"/>
<g fill="none" stroke="#7ac4b7" stroke-opacity=".22" stroke-width=".16"><circle cx="607" cy="121" r="12"/><circle cx="607" cy="121" r="24"/><circle cx="607" cy="121" r="36"/><path d="M565 121H665M607 88V158"/></g>
<g font-family="Arial, sans-serif" text-anchor="middle">${labels}</g>
<style>.france{fill:#476e61;stroke:#bce5c5;stroke-width:.42}.neighbor{fill:#25413c}text{paint-order:stroke;stroke:#143038;stroke-width:.35;stroke-linejoin:round}.main{fill:#edfff3;font-size:2.6px;font-weight:700;letter-spacing:.35px}.minor{fill:#d0e1d8;font-size:1.5px;letter-spacing:.14px}.small{fill:#c4d9d0;font-size:1.1px;letter-spacing:.04px}.water{fill:#78afae;font-size:1.35px;letter-spacing:.18px}</style></svg>`;
const destination=path.join(root,'assets','radar-france.svg');
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,svg);
console.log(destination);
