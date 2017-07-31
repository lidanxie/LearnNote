var cacheStorageKey = 'minimal-pwa-1'

var cacheList = [
	'/',
	'index.html',
	'main.css',
	'e.png'
]

/**
* 添加service Worker，service Worker在网页已经关闭的情况下还可以运行，用来实现页面的缓存和离线，后台通知等
*/
if(navigator.serviceWork != null){
	navigator.serviceWork.register('sw.js')
	.then((registration) => {
		console.log("registered events at scope", registration.scope);
	});
}

/**
* 在service worker当中会用到一些全局变量
* self :表示Service Work作用域，也是全局变量
* caches:表示缓存
* skipWaiting:表示强制当前处在waiting状态的脚本进入activate状态
* clients:表示Service Worker接管的页面
*/

/**
* 处理静态资源
*
* 借助Service Worker,可以注册完成安装Service Worker时，抓取资源写入缓存
*/
self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(cacheStorageKey)
		.then(cache => cache.addAll(cacheList))
		.then(() => self.skipWaiting())
		// 调用self.skipWaiting()方法是为了在页面更新的过程中,新的service worker脚本能立即激活和生效
	)
})

/**
* 处理动态缓存
* 网页抓取资源的过程中，在Service Worker可以捕获到fetch事件，可以编写代码决定如何响应资源的请求。
*/
self.addEventListener('fetch', e => {
	e.responWith(
		caches.match(e.request).then((response) => {
			if(response != null) {
				return response
			}
			return fetch(e.request.url)
		})
	)
})

/**
* 更新静态资源
* 
* 缓存的资源随版本的更新会过期，所以会根据缓存的字符串名称清除旧缓存，可以遍历所有的缓存名称逐一判断决定是否清除
*/
self.addEventListener('active', e => {
	e.waitUntil(
		Promise.all(
			caches.keys().then(cacheNames => {
				return cacheNames.map(name => {
					if(name !== cacheStorageKey) {
						return caches.delete(name)
					}
				})
			})
		).then(() => {
			return self.clients.claim()
		})
	)
})