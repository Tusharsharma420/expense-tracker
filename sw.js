const CACHE_NAME = 'expense-tracker-v2';
const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './style-family.css',
    './style-onboarding.css',
    './style-profile.css',
    './style-select.css',
    './app.js',
    './manifest.json',
    './icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => cachedResponse || fetch(event.request)
                .then((networkResponse) => {
                    const responseCopy = networkResponse.clone();

                    if (event.request.url.startsWith(self.location.origin)) {
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseCopy));
                    }

                    return networkResponse;
                })
                .catch(() => caches.match('./index.html')))
    );
});
