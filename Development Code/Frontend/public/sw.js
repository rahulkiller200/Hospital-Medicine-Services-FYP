const CACHE_NAME = "healthcare-portal-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg"
];

// Offline fallback for Maps and data
const FALLBACK_HTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline Mode</title>
    <style>
      body { font-family: sans-serif; text-align: center; padding: 50px; background: #f4f7fa; color: #2b4c7e; }
      h1 { font-size: 2rem; }
      p { font-size: 1.2rem; color: #555; }
    </style>
  </head>
  <body>
    <h1>You are currently Offline</h1>
    <p>Please check your internet connection to access real-time hospital and pharmacy data.</p>
    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2b4c7e; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
  </body>
  </html>
`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Try network first, falling back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .then((response) => {
          if (!response) {
            return new Response(FALLBACK_HTML, {
              headers: { "Content-Type": "text/html" }
            });
          }
          return response;
        })
    );
  } else if (event.request.url.includes('/api/')) {
    // For API requests, do Network First, but cache the response natively!
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache First strategy for all other static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
