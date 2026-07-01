"use strict";

const CACHE_NAME = "coach-tarot-v33";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=33",
  "./app.js?v=33",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {})
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        if (event.request.mode === "navigate") {
          return (await caches.match("./index.html")) || Response.error();
        }
        return Response.error();
      })
  );
});
