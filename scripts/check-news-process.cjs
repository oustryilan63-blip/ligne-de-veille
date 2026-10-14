const {spawnSync} = require('node:child_process');
const fs = require('node:fs'), path = require('node:path');
const bundled = path.resolve(path.dirname(process.execPath), '../../python/python.exe');
const candidates = [...new Set([process.env.RADAR_PYTHON,
  process.platform === 'win32' && fs.existsSync(bundled) ? bundled : null,
  'python3', 'python'].filter(Boolean))];
for (const command of candidates) {
  let unavailable = false;
  for (const file of ['check-news-process.py', 'check-news-sources.py',
    'check-news-rights.py', 'check-news-excerpts.py']) {
    const result = spawnSync(command, [path.join(__dirname, file)],
      {encoding:'utf8', windowsHide:true, shell:false, env:{...process.env, PYTHONIOENCODING:'utf-8'}});
    if (result.error?.code === 'ENOENT' || result.status === 9009) {unavailable = true; break;}
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) console.error(result.error.message);
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
  if (!unavailable) process.exit(0);
}
console.error('Python 3.9+ nécessaire pour vérifier la collecte. RADAR_PYTHON peut indiquer son chemin.');
process.exit(1);
