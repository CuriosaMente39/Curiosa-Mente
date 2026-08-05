const CACHE="neuroquiz60-v1";
const ASSETS=[
  "./","./index.html","./style.css","./app.js","./manifest.json",
  "./assets/icons/icon-192x192.png","./assets/icons/icon-512x512.png",
  "./assets/img/capa-neuro.png","./assets/img/funco-neuro.png","./assets/img/quiz-neuro.png",
  "./assets/img/robo-neuro.png","./assets/img/trofeu-neuro.png",
  "./assets/audio/acerto.wav","./assets/audio/erro.wav","./assets/audio/vitoria.wav","./assets/audio/clique.wav"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;
  }).catch(()=>caches.match("./index.html"))));
});