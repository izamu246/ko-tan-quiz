// Service Worker - 工担攻略システム
const CACHE_NAME = 'kotan-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  // ネットワーク優先、失敗時はキャッシュ
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
