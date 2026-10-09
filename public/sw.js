const STATIC_CACHE = "dailyarc-static-v1";
const PAGE_CACHE = "dailyarc-quests-v1";
const QUESTS_URL = "/quests";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirstStatic(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstQuests(event.request));
  }
});

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function networkFirstQuests(request) {
  try {
    const response = await fetch(request);
    const finalUrl = new URL(response.url);
    if (response.ok && finalUrl.pathname === QUESTS_URL) {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(QUESTS_URL, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(PAGE_CACHE);
    const cached = await cache.match(QUESTS_URL);
    if (cached) return cached;
    return new Response("You are offline. Open DailyArc once while online to keep today's quests.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
