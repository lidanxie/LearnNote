PWA学习笔记
===
## PWA(Progressive Web Apps):渐进式web app开发框架
###PWA特点：
* 渐进式-适用于选用任何浏览器是所有用户，因为它是以渐进式增强作为核心宗旨开发的。
* 自适应-适合任何机型
* 连接无关性-能够借助于服务工作栈线程在离线或低质量网络状况下工作
* 类似应用-
* 持续更新
* 安全-通过HTTPS提供
* 可发现-W3C清单和服务工作栈线程注册作用域能够让搜索引擎找到它们，从而将其识别为“
* 可再互动-通过推送通知之类的功能简化了再互动
* 可安装-用户可免去使用应用商店的麻烦，直接将对其最有用的应用保留在主屏幕上；
* 可链接-可通过网址轻松分享，无需复杂的安装；

### 第一个PWA应用

#### 1.构建App Shell
App Shell是驱动PWA用户界面所需的最小的HTML、CSS和js,是确保获得可靠而又出色性能的组件之一。
它的第一次加载速度非常快，并且能立即缓存。

App Shell架构将核心应用基础架构和UI与数据分离。所有UI和基础架构都利用服务工作线程缓存在本地，这样在后续加载时，PWA只需检索必要的数据，而不必加载所有内容。

#### 2.实现App Shell（天气组件）
##### 为App Shell创建HTML
>关键组件包括：
>> * 标头，其中包含标题和添加/刷新按钮
>> * 预报卡片容器
>> * 预报卡片模板
>> * 用于添加新城市的对话框
>> * 加载指示器

##### 连接关键Javacsript应用代码


####利用服务工作线程缓存App Shell
PWA必须快速并且可安装，这意味着它们在在线、离线以及间歇性、慢速连接下工作。
在通过服务工作线程提供的功能视为渐进式增强功能，仅在得到浏览器支持时添加。例如，您可以通过为您的应用缓存App Shell和数据，


##### 在服务工作线程可用时注册它
使应用离线工作的第一步是注册一个服务工作栈，即一个无需打开网页或用户交互便可实现的后台功能的脚本。

注册需要执行两个简单的步骤：
* 1.让浏览器将javascript文件注册为服务工作线程
* 2.创建包含此服务工作线程的javascript文件

首先，我们需要检查浏览器是否支持服务工作线程，如果支持，则注册服务工作线程。将以下代码添加到app.js

if('serviceWorker' in navigator) {
	navigator.serviceWorker
			 .register('./service-worker.js')
			 .then(function() {console.log('Service Worker R	egister')});
}

### 缓存网站资源
注册服务工作线程后，用户首次访问页面时将会触发安装事件。在此事件处理程序内，我们将缓存应用所需的全部资源。

触发服务工作线程时，它应打开caches对象并将其填充加载App Shell所需的资源。

var cacheName = 'myFirstPWA';
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
}) //会在服务工作线程启动时触发


#### 使用服务工作线程缓存预报数据
缓存优先于网络策略是适合我们的应用的理想策略。它会尽快将数据显示在屏幕上，然后再网络返回最新数据时更新数据。

缓存优先于网络意味着我们需要发起两个异步请求，一个发向缓存，一个发向网络。我们通过应用发出的网络请求不需要做多大的改动，但我们需要修改服务工作线程，以先缓存响应，然后，在网络请求返回时，将使用来自网络的最新数据更新应用。

##### 拦截网络请求并缓存响应

/拦截网络请求:使用fetch事件处理程序，将发给data Api的请求与其他请求分开处理
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


##### 发出请求
如前文所述，应用需要发起两个异步请求，一个发向缓存，一个发向网络。应用利用window中提供的caches对象来访问缓存 和检索最新数据。

为此，我们需要做的是：
* 1.检查全局window对象中是否提供了caches对象
* 2.从缓存请求数据。
* 3.如果服务器请求仍未完成，则用缓存的数据更新应用。
* 4.从服务器请求数据
* 5.保存数据以便稍后快速访问
* 6.使用来自服务器的最新数据更新应用

##### 从缓存中获取数据
if('caches' in window) {
	caches.match(url).then(function(response) {
		if(response) {
			response.json().then(function updateFormCache(json) {
				var results = json.query.results;
				results.key = key;
				results.label = label;
				results.created = json.query.created;
				app.updateForecastCard(results);
			})
		}
	})
}
如果缓存中有数据，将会返回响应并以极快的速度（几十微妙）渲染，并在XHR仍未完成时更新卡片。然后，在XHR响应时，将直接使用最新的数据更新卡片。


#### 支持本机集成
##### 通过mainfest.json文件声明应用清单


### 在网络应用中添加服务工作线程和离线功能

