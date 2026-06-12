"use strict";
const CACHE_NAME = "vishi-19-chapters-v3";
const CORE_ASSETS = [
  "./",
  "login.html",
  "index.html",
  "admin-dashboard.html",
  "debug-mobile.html",
  "css/style.css",
  "js/config.js",
  "js/security.js",
  "js/auth.js",
  "js/unlock-system.js",
  "js/chapters.js",
  "js/main.js",
  "README_SETUP.txt",
  "robots.txt",
  "security.txt",
  "assets/images/README_IMAGES.txt",
  "assets/audio/README_AUDIO.txt",
  "assets/videos/README_VIDEOS.txt",
  ...Array.from({ length: 19 }, (_, index) => `chapter-${String(index + 1).padStart(2, "0")}.html`)
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        return response;
      }).catch(() => cached || caches.match("login.html"));
      return cached || network;
    })
  );
});
