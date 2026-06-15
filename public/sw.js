/* Influenza service worker — installability + conservative offline caching.
   Bump CACHE when shipping changes so old caches are cleared. */
const CACHE = "influenza-v2";
const PRECACHE = ["/", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never cache API/auth — always hit the network.
  if (sameOrigin && url.pathname.startsWith("/api/")) return;

  // Never cache React Server Component payloads or Next data — these are tied
  // to the current build id, so a stale copy points at chunk hashes that no
  // longer exist after a redeploy (causing 404s). Always go to the network.
  const isRSC = url.searchParams.has("_rsc") || request.headers.get("RSC") === "1";
  if (sameOrigin && (isRSC || url.pathname.startsWith("/_next/data/"))) return;

  // Navigations: network-first, fall back to cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Immutable, content-hashed build assets: cache-first (the URL changes per
  // build, so a cache hit is always the right file).
  if (sameOrigin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
      )
    );
    return;
  }

  // Other same-origin assets (icons, manifest, etc.): network-first so a
  // redeploy is picked up immediately, falling back to cache when offline.
  if (sameOrigin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request))
    );
  }
});
