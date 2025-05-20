const CACHE_NAME = "lernprogramm-v1";
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "images/logo--image.png",
  "images/icon-192.png",
  "images/icon-512.png",
  "katex/katex.css",
  "katex/katex.js",
  "katex/contrib/auto-render.js",
  "tasks-files/mathe.json",
  "tasks-files/web.json",
  "tasks-files/noten.json",
  "Notes/C_note.mp3",
  "Notes/D_note.mp3",
  "Notes/E_note.mp3",
  "Notes/F_note.mp3",
  "Notes/G_note.mp3",
  "Notes/A_note.mp3",
  "Notes/B_note.mp3",
  "Notes/Csharp_note.mp3",
  "Notes/Dsharp_note.mp3",
  "Notes/Fsharp_note.mp3",
  "Notes/Gsharp_note.mp3",
  "Notes/Asharp_note.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
