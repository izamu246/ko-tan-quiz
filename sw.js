const _cv='kotan-v3';

self.addEventListener('install',e=>{
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  // キャッシュを使わず毎回ネットワークから取得
  e.respondWith(
    fetch(e.request).catch(()=>new Response('offline',{status:503}))
  );
});
