// Offline support: the app itself is network-first (so updates arrive), covers and posters are cached after first view.
const CACHE = 'backlog-app-1792743469121', IMG = 'backlog-img-v1';
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
