// ── 每次部署时递增这个版本号，PWA 就会自动更新 ──
const VERSION = 'linggan-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&family=Noto+Sans+SC:wght@200;300;400&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())   // 立即接管，不等旧页面关闭
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())  // 立即控制所有已打开的页面
  );
});

// network-first：优先拿最新，网络失败再用缓存
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// 主页面可以 postMessage('SKIP_WAITING') 来手动触发更新
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
