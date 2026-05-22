const _cv='kotan-v5';

// キャッシュするファイル（アプリの静的ファイル）
const STATIC_FILES=[
  './',
  './index.html',
  './sw.js',
];

// インストール時：静的ファイルをキャッシュ
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(_cv).then(cache=>cache.addAll(STATIC_FILES)).catch(()=>{})
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==_cv).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// フェッチ：オンライン優先、失敗時はキャッシュにフォールバック
self.addEventListener('fetch',e=>{
  // GETリクエストのみ対象
  if(e.request.method!=='GET') return;

  // GitHub API・外部リクエストはキャッシュしない
  const url=e.request.url;
  if(url.includes('api.github.com')||url.includes('jsonbin.io')||url.includes('google.com')){
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503})));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res=>{
        // オンライン取得成功→キャッシュ更新してレスポンス返す
        if(res&&res.status===200){
          const clone=res.clone();
          caches.open(_cv).then(cache=>cache.put(e.request,clone));
        }
        return res;
      })
      .catch(()=>{
        // オフライン→キャッシュから返す
        return caches.match(e.request).then(cached=>{
          if(cached) return cached;
          return new Response('',{status:503,statusText:'Offline'});
        });
      })
  );
});
