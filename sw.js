/* Barons' War Builder — service worker
 * Cache-first for the app shell; passthrough for cross-origin (Google Fonts).
 * Bump CACHE when publishing a new version so devices download the update. */

const CACHE = 'bw-builder-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './assets/crest-feudal-european.png',
  './assets/crest-flemish.png',
  './assets/crest-mercenary.png',
  './assets/crest-outlaw.png',
  './assets/crest-poitevin.png',
  './assets/crest-scottish.png',
  './assets/crest-welsh.png',
  './assets/crest-prince-louis.svg',
  './assets/plait.svg',
  './assets/flourish.svg',
  './assets/corner.svg',
  './assets/corner-tr.svg',
  './assets/corner-bl.svg',
  './assets/corner-br.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  // Only cache same-origin. Cross-origin (Google Fonts, etc.) hits the network.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (resp) {
        // Opportunistically cache successful GETs so navigation/refresh works offline
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return resp;
      }).catch(function () {
        // Fallback for navigation requests when fully offline
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
