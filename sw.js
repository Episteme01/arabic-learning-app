const CACHE_NAME = "kalimati-v2";

// Only cache LOCAL assets
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-72.png",
  "./icon-96.png",
  "./icon-128.png",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE (clean old cache)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH STRATEGY
self.addEventListener("fetch", (event) => {
  const request = event.request;
  
  // Only handle GET requests
  if (request.method !== "GET") return;
  
  // Network-first for HTML (fresh content)
  if (request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(request)
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match("./offline.html"))
    );
    return;
  }
  
  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          // Only cache same-origin files
          if (request.url.startsWith(self.location.origin)) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, resClone);
            });
          }
          return response;
        })
      );
    })
  );
});
