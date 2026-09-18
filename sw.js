const CACHE="score-log-v3";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  // HTML/navigation is network-first so GitHub Pages updates are picked up promptly.
  if(req.mode === "navigate" || new URL(req.url).pathname.endsWith("/index.html")){
    event.respondWith(
      fetch(req).then(response => {
        const copy=response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      const copy=response.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
      return response;
    }))
  );
});
