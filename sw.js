const CACHE='fieldfab-v24';
const ASSETS=['./','./index.html','./styles.css?v=24','./app.js?v=24','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(function(){return caches.match('./index.html')}));return}e.respondWith(fetch(e.request,{cache:'no-store'}).then(function(r){if(e.request.method==='GET'){const clone=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,clone)})}return r}).catch(function(){return caches.match(e.request)}))});
