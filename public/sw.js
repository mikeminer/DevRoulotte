/* global fetch, self */

const DEVROULOTTE_SW_VERSION = "devroulotte-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(fetch(event.request));
});

self.addEventListener("message", (event) => {
  if (event.data === "DEVROULOTTE_SW_VERSION") {
    event.source?.postMessage(DEVROULOTTE_SW_VERSION);
  }
});
