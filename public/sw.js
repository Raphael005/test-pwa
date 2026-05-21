importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js'
);

const CACHE_NAME = 'test-pwa-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] })],
    })
);

workbox.routing.registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font',
    new workbox.strategies.CacheFirst({
        cacheName: 'assets-cache',
        plugins: [
            new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
            new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ url }) => url.hostname === 'cdn.jsdelivr.net',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'cdn-cache',
        plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 })],
    })
);

workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === 'document') return caches.match(OFFLINE_URL);
    return Response.error();
});

self.addEventListener('widgetinstall', (event) => { event.waitUntil(updateWidget(event)); });
self.addEventListener('widgetresume', (event) => { event.waitUntil(updateWidget(event)); });
self.addEventListener('widgetclick', (event) => { if (event.action == 'updateName') event.waitUntil(updateName(event)); });
self.addEventListener('widgetuninstall', (event) => {});

const updateWidget = async (event) => {
    const widgetDefinition = event.widget.definition;
    const payload = {
        template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
        data: JSON.stringify(await (await fetch(widgetDefinition.data)).json()),
    };
    await self.widgets.updateByInstanceId(event.instanceId, payload);
};

const updateName = async (event) => {
    const name = event.data.json().name;
    const widgetDefinition = event.widget.definition;
    const payload = {
        template: JSON.stringify(await (await fetch(widgetDefinition.msAcTemplate)).json()),
        data: JSON.stringify({name}),
    };
    await self.widgets.updateByInstanceId(event.instanceId, payload);
};

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
