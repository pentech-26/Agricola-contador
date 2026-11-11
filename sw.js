/* Contador de Agricola · PenTech
   Estrategia: RED PRIMERO (siempre la última versión publicada) y caché solo
   como respaldo sin conexión. Subir CACHE en cada publicación.
   El sitio pentech-26.github.io se comparte con los demás contadores y con
   LudoTech: al activarse solo se borran las cachés que empiezan por
   'agricola-contador-'. */
const CACHE = 'agricola-contador-v1';
const PREFIJO = 'agricola-contador-';
const ICONOS = ['campos','pastos','cereales','hortalizas','ovejas','jabalies','vacas','caballos','sinusar','establos','hab','fam','enf','cartas','extra','mend'].map(n => `./iconos/${n}.webp`);
const ARCHIVOS = [...ICONOS, './', './index.html', './manifest.json', './splash.webp',
  './fonts/bitter.woff2', './fonts/grenze-gotisch.woff2',
  './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ARCHIVOS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIJO) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const base = new URL('./', self.location).pathname;          // solo lo de este contador
  if (url.origin !== self.location.origin || !url.pathname.startsWith(base)) return;

  e.respondWith(
    fetch(new Request(req, { cache: 'no-cache' }))
      .then(resp => {
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return resp;
      })
      .catch(() =>
        caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }))
          .then(r => r || (req.mode === 'navigate' ? caches.open(CACHE).then(c => c.match('./index.html')) : Response.error()))
      )
  );
});
