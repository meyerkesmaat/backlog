// Builds the website into docs/ (what GitHub Pages serves).
// usage: node tools/build.js
//   src/app.html   the app (HTML, CSS, JS) with a /*SEED*/ placeholder
//   src/data.json  the starting data: your games, shows and reviews
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const seed = fs.readFileSync(path.join(root, 'src', 'data.json'), 'utf8').replace(/</g, '\\u003c');
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
