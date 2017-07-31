# PWADemo
## 准备工作

建议安装 http-server


### 准备一个 HTML 文件, 以及相应的 CSS 等

### 添加 manifest.json 文件
为了让 PWA 应用被添加到主屏幕, 使用 manifest.json 定义应用的名称, 图标等等信息。

### 添加 Service Worker

Service Worker 在网页已经关闭的情况下还可以运行, 用来实现页面的缓存和离线, 后台通知等等功能。sw.js 文件需要在 HTML 当中引入:

/**
* 在service worker当中会用到一些全局变量
* self :表示Service Work作用域，也是全局变量
* caches:表示缓存
* skipWaiting:表示强制当前处在waiting状态的脚本进入activate状态
* clients:表示Service Worker接管的页面
*/

### 处理静态缓存(sw.js文件中)

首先定义需要缓存的路径, 以及需要缓存的静态文件的列表, 这个列表也可以通过 Webpack 插件生成。
借助 Service Worker, 可以在注册完成安装 Service Worker 时, 抓取资源写入缓存:

### 更新静态资源
缓存的资源随着版本的更新会过期, 所以会根据缓存的字符串名称(这里变量为 cacheStorageKey, 值用了 "minimal-pwa-1")清除旧缓存, 可以遍历所有的缓存名称逐一判断决决定是否清除

在新安装的 Service Worker 中通过调用 self.clients.claim() 取得页面的控制权, 这样之后打开页面都会使用版本更新的缓存。旧的 Service Worker 脚本不再控制着页面之后会被停止。

### 查看 Demo
http-server -c-1 # 注意设置关闭缓存, 这里用参数 -c-1
然后用浏览器打开 http://localhost:8080
