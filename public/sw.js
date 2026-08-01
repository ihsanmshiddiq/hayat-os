const CACHE_NAME = "hayat-shell-v1";
const APP_SHELL = ["/landing", "/login", "/manifest.webmanifest", "/icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Keep the install shell available offline. API responses are intentionally
  // handled by the authenticated React Query cache instead of a shared SW
  // cache, preventing data from leaking between accounts on one device.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/login")),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.png" || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })),
    );
  }
});
