// Builds the website into docs/ (what GitHub Pages serves).
// usage: node tools/build.js
//   src/app.html   the app (HTML, CSS, JS) with a /*SEED*/ placeholder
//   your log is NOT built in: it lives in the sync gist (and in each device's browser storage)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const seed = JSON.stringify({ games: [], journal: [], shows: [] });   // new devices start empty: your log lives in the sync gist
// build stamp, e.g. 2026-10-23 10:12, shown under Data so you can tell which version is running
const d = new Date(), p = n => String(n).padStart(2, '0');
const stamp = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
const html = fs.readFileSync(path.join(root, 'src', 'app.html'), 'utf8').replace('/*SEED*/', () => seed).replace('__BUILD__', stamp);

const tmp = path.join(root, 'build', 'app.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, html);
// icons, manifest, service worker and the home-screen tags
execFileSync(process.execPath, [path.join(__dirname, 'site.js'), tmp, path.join(root, 'docs')], { stdio: 'inherit' });
console.log('built version', stamp);
