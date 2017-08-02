var cacheName = 'myFirstPWA';
var dataCacheName = 'weatherData';
var filesToCaches = [];

self.addEventListener('install', function(e) {
	console.log("安装service worker");
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log("APP shell缓存了");
			return cache.addAll(filesToCaches);
		})
	)
})

self.addEventListener('activate', function(e) {
	console.log('serviceWorker activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if(key !== cacheName && key !== dataCacheName) {
					console.log('serviceWorker removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
})

//拦截网络请求:使用fetch事件处理程序，将发给data Api的请求与其他请求分开处理
self.addEventListener('fetch', function(e) {
	console.log('serviceWorker fetch', e.request.url);
	var dataUrl = 'http://query.yahooapis.com/v1/public/yql';
	if(e.request.url.indexOf(dataUrl) > -1) {
		e.respondWith(
			caches.open(dataCacheName).then(function(cache) {
				return fetch(e.request).then(function(response) {
					cache.put(e.request.url, response.clone());
					return response;
				})
			})
		)
	}else {
		e.respondWith(
			caches.match(e.request).then(function(response) {
				return response || fetch(e.request);
			})
		)
	}
})