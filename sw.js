const CACHE_NAME = "kalimati-v1";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.tailwindcss.com/3.4.17",
  "https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js",
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap"
];

// INSTALL → cache core files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE → clean old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH → smart caching
self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached first
      if (cached) return cached;
      
      // Else fetch from network
      return fetch(request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Offline fallback
          return caches.match("./index.html");
        });
    })
  );
});