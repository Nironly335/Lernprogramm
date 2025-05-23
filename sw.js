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
  "tasks-files/noten.json",
  "tasks-files/mathe_without_katex.json",
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
  "Notes/Asharp_note.mp3",
  "mvp-demo/mvp.css",
  "mvp-demo/mvp.html",
  "mvp-demo/mvp.js",
  "mathe-demo.html"  
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[Service Worker] Caching files...");
      for (const file of FILES_TO_CACHE) {
        try {
          const response = await fetch(file);
          if (!response.ok) throw new Error(`Request failed: ${file}`);
          await cache.put(file, response.clone());
          console.log(`[Service Worker] Cached: ${file}`);
        } catch (err) {
          console.error(`[Service Worker] Failed to cache ${file}:`, err);
        }
      }
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
