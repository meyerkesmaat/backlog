// Builds the hostable folder (Netlify Drop) from the built app: index.html + icons + manifest + service worker.
// usage: node site.js <built game-log.html> <output folder>
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const [src, out] = process.argv.slice(2);
fs.mkdirSync(out, {recursive:true});

// ---- tiny PNG encoder ----
const crcTable = Array.from({length:256}, (_,n)=>{ let c=n; for(let k=0;k<8;k++) c = c&1 ? 0xedb88320^(c>>>1) : c>>>1; return c>>>0; });
const crc = b => { let c = 0xffffffff; for(const x of b) c = crcTable[(c^x)&255]^(c>>>8); return (c^0xffffffff)>>>0; };
function chunk(type, data){ const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); }
function png(size, pixel){   // pixel(x,y) -> [r,g,b]
  const raw = Buffer.alloc((size*3+1)*size);
  for(let y=0;y<size;y++){ raw[y*(size*3+1)] = 0; for(let x=0;x<size;x++){ const [r,g,b] = pixel(x,y); const o = y*(size*3+1)+1+x*3; raw[o]=r; raw[o+1]=g; raw[o+2]=b; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',ihdr), chunk('IDAT',zlib.deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]);
}
// "b." in white on the accent red, 4x4 supersampled for smooth edges (iOS rounds the corners itself)
const BG = [229,56,59], FG = [255,255,255];
function inside(u,v){
  const stem = u>=0.27 && u<=0.39 && v>=0.18 && v<=0.80;
  const d = Math.hypot(u-0.515, v-0.615), bowl = d<=0.205 && d>=0.095 && u>=0.33;
  const dot = Math.hypot(u-0.80, v-0.755) <= 0.062;
  return stem || bowl || dot;
}
function icon(size){
  const S = 4;
  return png(size, (x,y)=>{ let n=0; for(let i=0;i<S;i++) for(let j=0;j<S;j++) if(inside((x+(i+.5)/S)/size,(y+(j+.5)/S)/size)) n++;
    const a = n/(S*S); return BG.map((c,k)=>Math.round(c*(1-a)+FG[k]*a)); });
}
fs.writeFileSync(path.join(out,'icon-180.png'), icon(180));
fs.writeFileSync(path.join(out,'icon-512.png'), icon(512));

fs.writeFileSync(path.join(out,'manifest.webmanifest'), JSON.stringify({
  name:'Backlog', short_name:'Backlog', start_url:'./', scope:'./', display:'standalone',
  background_color:'#111014', theme_color:'#111014',
  icons:[{src:'icon-180.png',sizes:'180x180',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]
}, null, 2));

fs.writeFileSync(path.join(out,'sw.js'), `// Offline support: the app itself is network-first (so updates arrive), covers and posters are cached after first view.
const CACHE = 'backlog-app-${Date.now()}', IMG = 'backlog-img-v1';
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png']))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE && k!==IMG).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const req = e.request; if(req.method!=='GET') return;
  const url = new URL(req.url);
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ const cp = r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return r; })
      .catch(()=>caches.match(req).then(r=>r || caches.match('index.html'))));
  } else if(req.destination==='image'){
    e.respondWith(caches.open(IMG).then(c=>c.match(req).then(hit=>hit || fetch(req).then(r=>{ c.put(req,r.clone()); return r; }))));
  }
});
`);

const pwa = `<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Backlog">`;
const html = fs.readFileSync(src,'utf8');
if(!html.includes('<!--PWA-->')) throw new Error('PWA placeholder missing');
fs.writeFileSync(path.join(out,'index.html'), html.replace('<!--PWA-->', pwa));
console.log('site ok', fs.readdirSync(out).join(', '));
