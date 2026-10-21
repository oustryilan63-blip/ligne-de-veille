const {spawnSync} = require('node:child_process');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const bundled = path.resolve(path.dirname(process.execPath), '../../python/python.exe');
  const candidates = [...new Set([process.env.RADAR_PYTHON, process.platform === 'win32' && fs.existsSync(bundled) ? bundled : null, 'python3', 'python'].filter(Boolean))];
  let tested = false;
  for (const command of candidates) {
    const r = spawnSync(command, [path.join(__dirname, 'check-conflicts.py')], {encoding:'utf8', windowsHide:true, shell:false});
    if (r.error?.code === 'ENOENT' || r.status === 9009) continue;
    if (r.status !== 0) throw Error((r.stdout || '') + (r.stderr || '') + (r.error?.message || ''));
    console.log('OK : 7 scénarios de collecte (tri, sources, doublons, dates, panne, sélection inchangée, fichier préservé).');
    tested = true; break;
  }
  assert.ok(tested, 'Python 3.9+ requis');
  const {validateConflictUpdates, conflictUpdateHTML, conflictSlugs} = await import('./build-conflicts.mjs');
  const data = validateConflictUpdates(JSON.parse(fs.readFileSync(path.join(__dirname, '../conflits-actualites.json'), 'utf8')));
  for (const slug of conflictSlugs) {
    const html = conflictUpdateHTML(data, slug, new Date(data.checkedAt));
    assert.ok(html.includes('HEURE DE PARIS') && html.includes(data.checkedAt));
    for (const i of data.topics[slug].items) assert.ok(html.includes(i.url.replaceAll('&','&amp;')));
  }
  const fixture = structuredClone(data), slug = conflictSlugs[0];
  fixture.topics[slug].items = [{title:'<img src=x onerror=alert(1)>', url:'https://example.com/?a=1&b=2', source:'Test <éditeur>', publishedAt:data.checkedAt}];
  const escaped = conflictUpdateHTML(fixture, slug, new Date(data.checkedAt));
  assert.ok(escaped.includes('&lt;img') && escaped.includes('&amp;b=2') && !escaped.includes('<img src=x'));
  fixture.topics[slug].items[0].url = 'javascript:alert(1)';
  assert.throws(() => validateConflictUpdates(fixture));
  fixture.topics[slug].items = [];
  assert.ok(conflictUpdateHTML(fixture, slug).includes('Aucune nouvelle publication'));
  assert.ok(conflictUpdateHTML(data, slug, new Date(Date.parse(data.checkedAt) + 27 * 3600000)).includes('plus d’un jour'));
  assert.equal(conflictUpdateHTML(data, 'familles-drones'), '');
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/veille-quotidienne.yml'), 'utf8');
  assert.ok(workflow.includes("cron: '0 8,18 * * *'") && workflow.includes('timezone: Europe/Paris'));
  assert.ok(workflow.indexOf('python3 scripts/update-conflicts.py') > workflow.indexOf('python3 scripts/update-news.py'));
  assert.ok(workflow.includes('git add actualites.json actualites.js conflits-actualites.json'));
  console.log('OK : 3 dossiers, rendu sans JavaScript, liens échappés, collecte partielle, calendrier Paris et conservation dans le dépôt.');
})().catch(error => {console.error(error); process.exitCode = 1;});
