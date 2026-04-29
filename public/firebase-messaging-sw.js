/* Tombstone worker: removes stale Firebase Messaging service workers
   left by other apps previously served from the same localhost origin. */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));

      await self.registration.unregister();

      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });

      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
