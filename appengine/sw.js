/**
 * Service worker for Blockly Games (Edutictac).
 *
 * Strategy:
 *  - Precache the minimal shell on install.
 *  - Cache-first for assets that never change in practice
 *    (third-party libraries, images, audio).
 *  - Stale-while-revalidate for HTML, boot.js and generated JS
 *    (they have no content hash, so they must be revalidated).
 *
 * Bump CACHE on every deploy so old caches are dropped.
 */
const CACHE = 'bg-v2';

const PRECACHE = [
  './index.html',
  './manifest.json',
  './common/boot.js',
  './common/common.css',
  './pwa/icon-192.png',
  './pwa/icon-512.png',
];

const CACHE_FIRST = /\/third-party\/|\.(png|gif|jpg|svg|mp3|ogg|wav|css)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
          .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
      caches.keys().then((keys) => Promise.all(
          keys.filter((key) => key !== CACHE)
              .map((key) => caches.delete(key))))
          .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (CACHE_FIRST.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  // Pages carry a ?lang= query but the HTML shell is identical,
  // so the query string is ignored when looking up the cache.
  const cached = await cache.match(request, {ignoreSearch: true});
  const network = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  return cached || network;
}
