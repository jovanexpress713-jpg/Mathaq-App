const CACHE_NAME = 'mazaq-offline-v2';
const APP_SHELL = ['/', '/site.webmanifest', '/mazaq_logo.jpg'];
const PUBLIC_API_PATHS = ['/api/settings', '/api/categories', '/api/products', '/api/offers'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mazaq-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isPublicCatalogRequest(url) {
  return PUBLIC_API_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(path + '/'));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache public catalog/settings only. Never cache admin, account, order, or other private API responses.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    if (!isPublicCatalogRequest(url)) return;
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok && response.type !== 'opaque') {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({
          success: false,
          error: 'لا توجد نسخة محفوظة من هذه البيانات. اتصل بالإنترنت ثم أعد المحاولة.'
        }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      }
    })());
    return;
  }

  // App navigation: network first, then the last successfully cached app shell.
  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put('/', response.clone());
        return response;
      } catch (_) {
        return (await cache.match(request)) || (await cache.match('/'));
      }
    })());
    return;
  }

  // Keep same-origin build assets and product imagery available after they have been visited once.
  const isAppAsset = url.origin === self.location.origin && url.pathname.startsWith('/assets/');
  const isImage = request.destination === 'image';
  if (isAppAsset || isImage) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        fetch(request).then((response) => {
          if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
        }).catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
        return response;
      } catch (error) {
        return new Response('', { status: 504, statusText: 'Offline image unavailable' });
      }
    })());
  }
});

self.addEventListener('push', (event) => {
  let data = { title: 'مذاق', body: 'لديك تحديث جديد من مذاق', url: '/' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || 'مذاق', {
    body: data.body || 'لديك تحديث جديد',
    icon: '/mazaq_logo.jpg',
    badge: '/mazaq_logo.jpg',
    data: { url: data.url || '/' },
    dir: 'rtl',
    lang: 'ar',
    tag: data.tag || 'mazaq-update'
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) { existing.navigate(target); return existing.focus(); }
    return clients.openWindow(target);
  }));
});
