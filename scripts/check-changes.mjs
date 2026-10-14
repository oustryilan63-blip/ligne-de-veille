import {spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suites = {
  core: ['check-discovery.cjs', 'check-catalog.mjs', 'check-feature-flows.cjs', 'check-radar-features.cjs', 'check-game-ui.cjs', 'check-game-content.cjs'],
  histoire: ['check-histoire-loading.cjs', 'check-histoire-photos.cjs', 'check-histoire-3d.cjs'],
  actualites: ['check-news-images.cjs', 'check-news-validation.mjs', 'check-news-process.cjs'],
  qg: ['check-qg-game.cjs', 'check-qg-management.cjs', 'check-qg-combat.cjs'],
  radar: ['check-radar-game.cjs', 'check-radar-geography.mjs'],
  publication: ['check-static-optimization.cjs', 'check-confiance.cjs'],
};
const args = process.argv.slice(2);
const allowedFlags = new Set(['--all', '--plan', '--report', '--files', '--help']);
for (const arg of args) if (arg.startsWith('--') && !allowedFlags.has(arg)) throw new Error('Option inconnue : ' + arg);
if (args.includes('--help')) {
  console.log('Contrôle rapide : node scripts/check-changes.mjs\nCiblé : node scripts/check-changes.mjs --files histoire-photos-data.js assets/histoire/photos/150-1.webp\nComplet : --all · Afficher la sélection : --plan · Mesurer : --report');
  process.exit(0);
}
const fileFlag = args.indexOf('--files');
const files = fileFlag < 0 ? [] : args.slice(fileFlag + 1).filter(x => !x.startsWith('--')).map(f => f.replaceAll('\\', '/').replace(/^\.\//, ''));
if (fileFlag >= 0 && !files.length) throw new Error('Indiquer les fichiers modifiés après --files.');
const groups = new Set();
if (args.includes('--all')) Object.keys(suites).forEach(g => groups.add(g));
else if (!files.length) groups.add('core');
else for (const file of files) {
  if (/^(?:docs\/|[^/]+\.md$)/.test(file)) continue;
  let matched = false;
  const addIf = (pattern, names) => {if (pattern.test(file)) {names.forEach(g => groups.add(g)); matched = true;}};
  addIf(/^(?:histoire|engins-data|quiz-data)|^assets\/(?:histoire|jeu)\//, ['core', 'histoire']);
  addIf(/^(?:actualites|news-|index\.html|app\.js)|^scripts\/(?:news|update-news|build-news)/, ['actualites']);
  addIf(/^qg-|^assets\/qg\//, ['qg']);
  addIf(/^alerte-radar|^assets\/radar|^map-data/, ['radar']);
  addIf(/^(?:engins-data|quiz-data|catalogue-tools|collection|comparateur|sauvegarde|progression|revision|quiz-settings|arcade|jeux|devine-engin|chrono-defense|defi-du-jour|vrai-ou-faux|zoom-mystere)/, ['core']);
  addIf(/^\.github\/|^scripts\/(?:build-site|optimize-static|public-files|check-)/, ['publication']);
  // Un fichier sans correspondance conserve les contrôles généraux.
  if (!matched) groups.add('core');
}
const selected = [...new Set([...groups].flatMap(g => suites[g]))];
console.log(`${selected.length} contrôles locaux sélectionnés${groups.size ? ' : ' + [...groups].join(', ') : ' (documentation uniquement)'}.`);
if (args.includes('--plan')) {selected.forEach(n => console.log('  ' + n)); process.exit(0);}
const start = performance.now(), results = [];
let next = 0;
async function worker() {
  while (next < selected.length) {
    const name = selected[next++], began = performance.now();
    const result = await new Promise(resolve => {
      const child = spawn(process.execPath, [path.join(root, 'scripts', name)], {cwd: root, windowsHide: true, shell: false});
      let output = '', error = '';
      child.stdout.on('data', chunk => {output += chunk;}); child.stderr.on('data', chunk => {error += chunk;});
      child.once('error', e => resolve({name, ok: false, output: e.message, seconds: (performance.now() - began) / 1000}));
      child.once('close', code => resolve({name, ok: code === 0, output: (output + error).trim(), seconds: (performance.now() - began) / 1000}));
    });
    results.push(result);
    console.log(`${result.ok ? 'OK' : 'ÉCHEC'} ${name} · ${result.seconds.toFixed(2)} s`);
    if (!result.ok) console.error(result.output);
  }
}
await Promise.all(Array.from({length: Math.min(4, selected.length)}, worker));
const seconds = (performance.now() - start) / 1000;
console.log(`Terminé en ${seconds.toFixed(2)} s. Aucun accès réseau, construction ou publication lancé.`);
if (args.includes('--report')) {
  const dir = path.join(root, 'test-results'); fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'check-changes.json'), JSON.stringify({checkedAt: new Date().toISOString(), files, groups: [...groups], seconds, results}, null, 2) + '\n');
}
if (results.some(r => !r.ok)) process.exitCode = 1;
