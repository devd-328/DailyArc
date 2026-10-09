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

self.addEventListener("push", (event) => {
  let title = "DailyArc";
  let body = "Check in before your streak resets.";
  if (event.data) {
    try {
      const payload = event.data.json();
      if (typeof payload.title === "string" && payload.title) title = payload.title;
      if (typeof payload.body === "string" && payload.body) body = payload.body;
    } catch {
      // Keep the fallback copy when the payload is not JSON.
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      data: { url: "/quests" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL("/quests", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        if (typeof client.navigate === "function") await client.navigate(target);
        await client.focus();
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
