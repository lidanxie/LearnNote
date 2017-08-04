JavaScript学习笔记
=======

# 1.跨域资源共享CORS详解

最近深入了解了CORS的相关东西，觉得阮一峰老师的文章写得最详细易懂了，所有转载作为学习笔记。
原文地址：[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)

CORS是W3C的一个标准，全称是跨域资源共享（Cross-origin resource sharing）
本文详细介绍CORS的内部机制。

## 一、简介
CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。
整个CORS通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS通信与AJAX通信没有差别，代码完全一样。 浏览器一旦发现AJAX请求跨域，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。

因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。

## 二、两种请求
浏览器将CORS请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。

只要同时满足以下两大条件，就属于简单请求。

（1) 请求方法是以下三种方法之一：

 * HEAD
 * GET
 * POST
 
（2）HTTP的头信息不超出以下几种字段：

 * Accept
 * Accept-Language
 * Content-Language
 * Last-Event-Id
 * Content-Type:只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain
 
 凡是不同时满足上面两个条件，就属于非简单请求。
 浏览器对这两种请求的处理，是不一样的。

## 三、简单请求
### 3.1 基本流程
对于简单请求，浏览器直接发出CORS请求。具体来说，就是在头信息之中，增加一个`Origin`字段。

下面是一个例子，浏览器发现这次跨域请求AJAX请求是简单请求，就自动在头信息之中，添加一个`Origin`字段。

```
GET /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```
上面的头信息中，`Origin` 字段用来说明，本次请求来自哪个源（协议+域名+端口号）。服务器根据这个值，决定是否同意这次请求。

如果`Origin` 指定的源，不在许可范围之内，服务器返回一个正常的HTTP回应。浏览器发现这个回应的头信息没有包含`Access-Control-Allow-Origin` 字段（详见下文），就知道出错了，就会抛出一个错误，被`XMLHttpRequest` 的`onerror` 回调函数所捕获。注意，这种错误是无法通过状态码识别，因为HTTP回应的状态码有可能是200。

如果`Origin` 指定的域名下在许可的范围内，服务器返回的响应，会多出几个头信息字段。
```
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

上面的信息之中，有三个与CORS请求相关的字段，都以Access-Control-开头。

**（1）Access-Control-Allow-Origin**
该字段是必须的。它的值要么是请求时`Origin` 字段，要么是一个 * ，它表示接受任意域名的请求。

**（2）Access-Control-Allow-Credentials**
该字段是可选的。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包含在	CORS请求之中。设为true时，表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。**这个值也只能设为true**，如果服务器不要浏览器发送Cookie，删除该字段即可。

**（3）Access-Control-Expose-Headers**
该字段也是可选的。CORS请求时，`XMLHttpRequest` 对象的`getResponseHeader()` 方法只能拿到6个基本字段 `Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma`。 如果拿到其他字段，就必须在`Access-Control-Expose-Headers` 里面指定。上面的例子指定，`getResponseHeader('FooBar')` 可以返回`FooBar` 字段的值。

### 3.2 withCredentials 属性
上面说到，CORS请求默认不发送Cookie和HTTP认证信息。如果要把`Cookie` 发送到服务器，一方面需要服务器同意，指定`Access-Control-Allow-Credentials` 字段。

```
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在AJAX请求中打开**withCredentials**属性。

```
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```
否则，即使服务器同意发送Cookie，浏览器也不会发送。或者，服务器要求设置Cookie，浏览器也不会处理。
但是，如果省略**withCredentials**设置，有的浏览器还是会一起发送Cookie。这时，可以**显式关闭**withCredentials。

```
xhr.withCredentials = false;
```

**需要注意的是**，如果要发送`Cookie，Access-Control-Allow-Origin`就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的`document.cookie`也无法读取服务器域名下的Cookie。


## 四、非简单请求
### 4.1 预检请求
非简单请求是那种对服务器有特殊要求的请求，比如请求方法是PUT或DELETE，或者Content-Type字段的类型是application/json。

非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为“预检”请求（preflight）。

浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和信息字段。只有得到肯定的答复，浏览器才会发出正式的`XMLHttpRequest` 请求，否则就报错。

下面是一段浏览器的JavaScript脚本。

```
var url = 'http://api.alice.com/cors';
var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();
```

上面代码中，HTTP请求的方法是`PUT`，并且发送一个自定义头信息`X-Custom-Header`。

浏览器发现，这是一个非简单请求，就自动发出一个"预检"请求，要求服务器确认可以这样请求。下面是这个"预检"请求的HTTP头信息。

```
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```
“预检”请求用的请求方法是`OPTIONS`, 表示这个请求是来询问的。头信息里面，关键字为`Origin`, 表示请求来自哪个源。

除了**Origin**字段，"预检"请求的头信息包括两个特殊字段。

**（1）Access-Control-Request-Method **
这个字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是PUT。

**（2）Access-Control-Request-Headers **
该字段是一个用逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段。上例是X-Custom-Header。

### 4.2 预检请求的回应
服务器收到"预检"请求以后，检查了`Origin、Access-Control-Request-Method和Access-Control-Request-Headers`字段以后，确认允许跨源请求，就可以做出回应。

```
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

上面的HTTP缓存的回应中，关键是`Access-Control-Allow-Origin` 表示`http://api.bob.com`可以请求数据。该字段页可以设为*，表示同意任意跨源请求。

```
Access-Control-Allow-Origin: *
```
如果浏览器否定了预检请求，会返回一个正常的HTTP回应，但是没有任何CORS相关的头信息字段。这时，浏览器就会认定，服务器不同意预检请求，因此触发一个错误，被XMLHttpRequest对象的onerror回调函数捕获。控制台会打印出如下的报错信息。

```
XMLHttpRequest cannot load http://api.alice.com.
Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.
```

服务器回应的其他的CORS相关字段如下：

```
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000
```

**（1）Access-Control-Allow-Methods**
该字段是必须的，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意：返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次预检请求。

**（2）Access-Control-Allow-Headers**
如果浏览器请求包含`Access-Control-Allow-Headers`，则`Access-Control-Allow-Headers` 字段是必须的。它也是一个逗号分隔的字符串，表明服务器支持的**所有**头信息的字段，不限于浏览器在"预检"中请求的字段。

**（3）Access-Control-Allow-Credentials**
该请求与简单请求时的含义一样。

**（4）Access-Control-Max-Age**
该字段可选，用来指定本次预检请求的有效期，单位为妙。上面结果中，有效期是20天（1728000秒），即允许缓存该条回应1728000秒（即20天），在此期间，不用发出另一条预检请求。

### 4.3 浏览器的正常请求和回应
一旦服务器通过了预检请求，以后每次浏览器正常的CORS请求，就跟简单请求一样，会有一个`Origin` 头信息字段。服务器的回应，也都会有一个Access-Control-Allow-Origin头信息字段。

下面是预检请求之后，浏览器的正常CORS请求。

```
PUT /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
X-Custom-Header: value
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

上面的头信息`Origin` 是浏览器自动添加的。

下面是服务器正常的回应。

```
Access-Control-Allow-Origin: http://api.bob.com
Content-Type: text/html; charset=utf-8
```

上面的头信息中，**Access-Control-Allow-Origin** 字段是每次回应都必定包含的。

## 五、与JSONP的比较
CORS与JSONP的使用目的相同，但是比JSONP更强大。
JSONP只支持GET请求，CORS支持所有类型的HTTP请求。JSONP的优势在于支持老式浏览器，以及可以向不支持CORS的网站请求数据。


# 2.HTTP同源策略
**同源策略**是web安全策略中的一种，非常重要。
同源策略明确规定：**不同域的客户端在没有明确授权的情况下，不能读写对方的资源。** 
简单说来就是web浏览器允许第一个页面的脚本访问访问第二个页面的数据，但是也只有在两个页面有相同的源的时候，如果不同源则需要授权。源：**URI(统一资源标识符)、主机名、端口号**组合而成的。这个策略可以阻止一个页面上恶意脚本通过页面DOM对象获得访问另一个页面的敏感信息的权限。

### 历史
同源策略的概念要追溯到1995年的网景浏览器。同源策略作为一个重要的安全基石，所有的现代浏览器都在一定程度上实现了同源策略。同源策略虽然不是一个明确规范，但是经常为某些web技术（例如Microsoft Silverlight,Adobe Flash,Adobe Acrobat）或者某些机制（例如XMLHttpRequest）扩展定义大致兼容的安全边界。


### 源决定规则
RFC6454中有定义URI源的算法定义。对于绝对的URIs，源就是{**协议，域名，端口**}定义的。只有这些值完全一样才认为两个资源是同源的。如http://www.example.com：80/dir/page.html 

> http://  协议
> www.example.com  域名
> ：80 端口号

举个栗子：比较表格中的URL与"http://www.example.com/dir/page.html"是否同域。

| 对比URL | 结果 | 结果分析 |
| ------------- |:-------------:| :-----:|
| http://www.example.com/dir/page2.html | 同源 | 相同的协议、域名、端口号 |
| http://www.example.com/dir2/other.html | 同源 | 相同的协议、域名、端口号 |
| http://username:password@www.example.com/dir2/other.html | 同源 | 相同的协议、域名、端口号 |
| http://www.example.com:81/dir/other.html | 不同源 | 相同的协议、域名；不同的端口号 |
| https://www.example.com/dir/other.html | 不同源 | 相同的域名、端口号；不同的协议 |
| http://en.example.com/dir/other.html | 不同源 | 相同的协议、端口号；不同的域名|
| http://example.com/dir/other.html | 不同源 | 不同的域名（需要精确匹配） |
| http://v2.www.example.com/dir/other.html | 不同源 | 不同的域名（需要精确匹配） |
| http://www.example.com:80/dir/other.html | 看情况 | 端口明确，需要依赖于浏览器的实现 |

不像其他浏览器，IE在计算源的时候没有包括端口。

#### 限制的范围
随着互联网的发展，"同源政策"越来越严格。目前，如果非同源，共有三种行为受到限制。

 1. Cookie、LocalStorage 和 IndexDB 无法读取。
 2. DOM 无法获得。
 3. AJAX 请求不能发送。
 
 虽然这些限制是必要的，但是有时很不方便，合理的用途也受到影响。
#### **授权**
默认情况下访问一个站点是不允许跨越的，只有目标站点（比如：http://www.example.com/dir/page.html）明确返回HTTP响应头Access-Control-Allow-Origin: http://www.evil.com 那么www.evil.com站点上的客户端脚本就有权通过AJAX技术对www.foo.com上的数据进行读写操作。

#### 读写权限
Web上的资源有很多，有的只有读权限，有的同时拥有读和写的权限。比如：HTTP请求头里的Referer（表示请求来源）只可读，而document.cookie则具备读写权限。这样的区分也是为了安全上的考虑。

### 安全的考量
有这种限制的主要原因是因为如果没有同源策略将导致安全风险。假设用户在访问银行网站，并且没有登出。然后他又去了任意的其他网站，刚好这个网站有恶意的js代码，在后台请求银行网站的信息。因为用户目前仍然是银行站点的登陆状态，那么恶意代码就可以在银行站点做任意事情。例如，获取你的最近交易记录，创建一个新的交易等等。因为浏览器可以发送接收银行站点的session cookies，在银行站点域上。访问恶意站点的用户希望他访问的站点没有权限访问银行站点的cookie。当然确实是这样的，js不能直接获取银行站点的session cookie，但是他仍然可以向银行站点发送接收附带银行站点session cookie的请求，本质上就像一个正常用户访问银行站点一样。关于发送的新交易，甚至银行站点的CSRF（跨站请求伪造）防护都无能无力，因为脚本可以轻易的实现正常用户一样的行为。所以如果你需要session或者需要登陆时，所有网站都面临这个问题。如果上例中的银行站点只提供公开数据，你就不能触发任意东西，这样的就不会有危险了，这些就是同源策略防护的。当然，如果两个站点是同一个组织的或者彼此互相信任，那么就没有这种危险了。


### 规避同源策略
在某些情况下同源策略太严格了，给拥有多个子域的大型网站带来问题。下面简要介绍解决这种问题的技术：

#### **document.domain属性**
如果两个window或者frames包含的脚本可以把domain设置成一样的值，那么就可以规避同源策略，每个window之间可以互相沟通。例如，`orders.example.com`下页面的脚本和`catalog.example.com`下页面的脚本可以设置他们的`document.domain`属性为`example.com`，从而让这两个站点下面的文档看起来像在同源下，然后就可以让每个文档读取另一个文档的属性。

#### **跨域资源共享**
这种方式即上文所说的授权，使用了一个新的`Origin`请求头和一个新的`Access-Control-Allow-Origin`响应头扩展了HTTP。允许服务端设置`Access-Control-Allow-Origin`头标识哪些站点可以请求文件，或者设置`Access-Control-Allow-Origin`头为"*"，允许任意站点访问文件。

#### **跨文档通信**
这种方式允许一个页面的脚本发送文本信息到另一个页面的脚本中，不管脚本是否跨域。在一个window对象上调用postMessage()会异步的触发window上的onmessage事件，然后触发定义好的事件处理方法。一个页面上的脚本仍然不能直接访问另外一个页面上的方法或者变量，但是他们可以安全的通过消息传递技术交流。

#### **JSONP**
JOSNP允许页面接受另一个域的JSON数据，通过在页面增加一个可以从其它域加载带有回调的JSON响应的`<script>`标签。

#### **WebSocket**
现代浏览器允许脚本直连一个WebSocket地址而不管同源策略。然而，使用WebSocket URI的时候，在请求中插入Origin头就可以标识脚本请求的源。为了确保跨站安全，


# 3.关于HTTP不得不知的东西
> 摘要：相比之前的传输协议，HTTP/2在底层方面做了很多优化。有安全、省时、简化开发、更好的适应复杂页面、提供缓存利用率等优势，阿里云早在去年发布的CDN6.0服务就已正式支持HTTP/2，访问速度最高可提升68%。

###写在前面
超文本传输协议（英文：HyperText Transfer Protocol，缩写：HTTP）是互联网上应用最为广泛的一种网络协议。设计 HTTP 最初的目的是为了提供一种发布和接收 HTML 页面的方法。通过 HTTP 或者 HTTPS 协议请求的资源由统一资源标识符（URI）来标识。虽然HTTP/1.1稳定运行了十多年了，但HTTP/2来势汹汹，作为技术工程师有必要学习一下HTTP/2。


----------
### 1.Web始祖HTTP

> 处于计算机网络中的应用层，HTTP是建立在TCP协议之上，所以HTTP协议的瓶颈及其优化技巧都是基于TCP协议本身的特性，例如tcp建立连接的3次握手和断开连接的4次挥手以及每次建立连接带来的RTT延迟时间。

#### （1）HTTP/0.9
最早的原型，1991年发布，该版本极其简单，只支持 GET 方法，不支持 MIME 类型和各种 HTTP 首部等等。

#### （2）HTTP/1.0
1996年发布。HTTP/1.0在HTTP/0.9的基础之上添加很多方法，各种 HTTP 首部，以及对多媒体对象的处理。

除了GET命令，还引入了POST命令和HEAD命令，丰富了浏览器与服务器的互动手段。

任何格式的内容都可以发送。这使得互联网不仅可以传输文字，还能传输图像、视频、二进制文件。这为互联网的大发展奠定了基础。

HTTP请求和回应的格式也变了。除了数据部分，每次通信都必须包括头信息（HTTP header），用来描述一些元数据。

可以说，HTTP/1.0是对HTTP/0.9做了革命性的改变，但HTTP/1.0依然有一些缺点，其主要缺点是每个TCP连接只能发送一个请求，发送数据完毕后连接就关闭，如果还要请求其他资源，就得再新建一个连接。虽然有些浏览器为了解决这个问题，用了一个非标准的Connection头部，但这个不是标准头部，各个浏览器和服务器实现有可能不一致，因此不是根本解决办法。

####（3）HTTP/1.1
1999年正式发布。HTTP/1.1是当前主流的 HTTP 协议。完善了之前 HTTP 设计中的结构性缺陷，明确了语义，添加和删除了一些特性，支持更加复杂的的 Web 应用。

经过了十多年将近20年的发展，这个版本的HTTP协议已经很稳定了，跟HTTP/1.0相比，它新增了很多引人注目的新特性，比如Host协议头、Range分段请求、默认持久连接、压缩、分块传输编码（chunked）、缓存处理等等，至今都大量使用，而且很多软件依赖这些特性。

虽然HTTP/1.1并不像HTTP/1.0对于HTTP/0.9那样的革命性，但是也有很多增强，目前主流浏览器均默认采用HTTP/1.1。

####（4） SPDY
SPDY（发音：speedy）协议由Google开发，主要解决 HTTP/1.1 效率不高的问题，于2009年公开，到2016年初结束使命。因为HTTP/2已经被IETF标准化了，以后各种新版浏览器都会支持HTTP/2，Google认为SPDY已经没有存在的必要了，接下来的使命由HTTP/2去完成。

#### （5）HTTP/2
HTTP/2是最新的HTTP协议，已于2015年5月份正式发布， Chrome、 IE11、Safari以及Firefox 等主流浏览器已经支持 HTTP/2协议。

注意是HTTP/2而不是HTTP/2.0，这是因为IETF（Internet Engineering Task Force，互联网工程任务组）认为HTTP/2已经很成熟了，没有必要再发布子版本了，以后要是有重大改动就直接发布HTTP/3。

其实，HTTP/2的前身是SPDY，甚至它俩的目标、原理和基本实现都差不多。IETF组委会中有很多Google工程师，将SPDY推动成为标准也就不足为奇了。

HTTP/2不仅优化了性能而且兼容了HTTP/1.1的语义，其几大特性与SPDY差不多，与HTTP/1.1有巨大区别，比如它不是文本协议而是二进制协议，而且HTTP头部采用HPACK进行压缩，支持多路复用、服务器推送等等。

###2. HTTP与现代化浏览器
早在HTTP建立之初，主要就是为了将超文本标记语言(HTML)文档从Web服务器传送到客户端的浏览器。也是说对于前端来说，我们所写的HTML页面将要放在我们的web服务器上，用户端通过浏览器访问url地址来获取网页的显示内容，但是到了WEB2.0以来，我们的页面变得复杂，不仅仅单纯的是一些简单的文字和图片，同时我们的HTML页面有了CSS，Javascript，来丰富我们的页面展示，当ajax的出现，我们又多了一种向服务器端获取数据的方法，这些其实都是基于HTTP协议的。同样到了移动互联网时代，我们页面可以跑在手机端浏览器里面，但是和PC相比，手机端的网络情况更加复杂，这使得我们开始了不得不对HTTP进行深入理解并不断优化过程中。 

![这里写图片描述](http://img.blog.csdn.net/20170730155856127?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 3.HTTP 的基本优化
影响一个HTTP网络请求的因素主要有两个：带宽和延迟。

 - **带宽**：如果说我们还停留在拨号上网的阶段，带宽可能会成为一个比较严重影响请求的问题，但是现在网络基础建设已经使得带宽得到极大的提升，我们不再会担心由带宽而影响网速，那么就只剩下延迟了。
 - **延迟**：



 1. **浏览器阻塞（HOL blocking）**：浏览器会因为一些原因阻塞请求。浏览器对于同一个域名，同时只能有 4 个连接（这个根据浏览器内核不同可能会有所差异），超过浏览器最大连接数限制，后续请求就会被阻塞。
 2. **DNS 查询（DNS Lookup）**：浏览器需要知道目标服务器的 IP 才能建立连接。将域名解析为 IP 的这个系统就是 DNS。这个通常可以利用DNS缓存结果来达到减少这个时间的目的。
 3.  **建立连接（Initial connection）**：HTTP 是基于 TCP 协议的，浏览器最快也要在第三次握手时才能捎带 HTTP 请求报文，达到真正的建立连接，但是这些连接无法复用会导致每次请求都经历三次握手和慢启动。三次握手在高延迟的场景下影响较明显，慢启动则对文件类大请求影响较大。
 
![这里写图片描述](http://img.blog.csdn.net/20170730160935778?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 4. HTTP/1.0和HTTP/1.1的一些区别
两者的区别主要体现在：

 1. **缓存处理**，在HTTP1.0中主要使用header里的If-Modified-Since,Expires来做为缓存判断的标准，HTTP1.1则引入了更多的缓存控制策略例如Entity tag，If-Unmodified-Since, If-Match, If-None-Match等更多可供选择的缓存头来控制缓存策略。
 2. **带宽优化及网络连接的使用**，HTTP1.0中，存在一些浪费带宽的现象，例如客户端只是需要某个对象的一部分，而服务器却将整个对象送过来了，并且不支持断点续传功能，HTTP1.1则在请求头引入了range头域，它允许只请求资源的某个部分，即返回码是206（Partial Content），这样就方便了开发者自由的选择以便于充分利用带宽和连接。
 3. **错误通知的管理**，在HTTP1.1中新增了24个错误状态响应码，如409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。
 4. **Host头处理**，在HTTP1.0中认为每台服务器都绑定一个唯一的IP地址，因此，请求消息中的URL并没有传递主机名（hostname）。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机（Multi-homed Web Servers），并且它们共享一个IP地址。HTTP1.1的请求消息和响应消息都应支持Host头域，且请求消息中如果没有Host头域会报告一个错误（400 Bad Request）。
 5. **长连接**，HTTP 1.1支持长连接（PersistentConnection）和请求的流水线（Pipelining）处理，在一个TCP连接上可以传送多个HTTP请求和响应，减少了建立和关闭连接的消耗和延迟，在HTTP1.1中默认开启Connection： keep-alive，一定程度上弥补了HTTP1.0每次请求都要创建连接的缺点。

**区别用一张图来体现：**

![这里写图片描述](http://img.blog.csdn.net/20170730161657274?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

###5. HTTP1.0和1.1现存的一些问题

 1. 上面提到过的，HTTP1.x在传输数据时，每次都需要重新建立连接，无疑增加了大量的延迟时间，特别是在移动端更为突出。
 2. HTTP1.x在传输数据时，所有传输的内容都是明文，客户端和服务器端都无法验证对方的身份，这在一定程度上无法保证数据的安全性。
 2. HTTP1.x在使用时，header里携带的内容过大，在一定程度上增加了传输的成本，并且每次请求header基本不怎么变化，尤其在移动端增加用户流量。
 3. 虽然HTTP1.x支持了keep-alive，来弥补多次创建连接产生的延迟，但是keep-alive使用多了同样会给服务端带来大量的性能压力，并且对于单个文件被不断请求的服务(例如图片存放网站)，keep-alive可能会极大的影响性能，因为它在文件被请求之后还保持了不必要的连接很长时间。


### 6.HTTPS应声而出
为了解决以上问题，网景在1994年创建了HTTPS，并应用在网景导航者浏览器中。 最初，HTTPS是与SSL一起使用的；在SSL逐渐演变到TLS时（其实两个是一个东西，只是名字不同而已），最新的HTTPS也由在2000年五月公布的RFC 2818正式确定下来。简单来说，HTTPS就是安全版的HTTP，并且由于当今时代对安全性要求更高，chrome和firefox都大力支持网站使用HTTPS，苹果也在ios 10系统中强制app使用HTTPS来传输数据，由此可见HTTPS势在必行。  
这里简单介绍一下HTTPS，接下来将会写一篇有关于HTTPS详解的文章。

### 7.HTTPS与HTTP的一些区别

 1. HTTPS协议需要到CA申请证书，一般免费证书很少，需要交费。
 2. HTTP协议运行在TCP之上，所有传输的内容都是明文，HTTPS运行在SSL/TLS之上，SSL/TLS运行在TCP之上，所有传输的内容都经过加密的。
 3. HTTP和HTTPS使用的是完全不同的连接方式，用的端口也不一样，前者是80，后者是443。
 4. HTTPS可以有效的防止运营商劫持，解决了防劫持的一个大问题。
 
 ![这里写图片描述](http://img.blog.csdn.net/20170730163111105?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 8.使用SPDY加快你的网站速度
上文中提到了由Google开发，主要解决 HTTP/1.1 效率不高的问题的SPDY协议，SPDY可以说是综合了HTTPS和HTTP两者有点于一体的传输协议，主要解决：

 1. **降低延迟**，针对HTTP高延迟的问题，SPDY优雅的采取了多路复用（multiplexing）。多路复用通过多个请求stream共享一个tcp连接的方式，解决了HOL blocking的问题，降低了延迟同时提高了带宽的利用率。
 2. **请求优先级（request prioritization）**。多路复用带来一个新的问题是，在连接共享的基础之上有可能会导致关键请求被阻塞。SPDY允许给每个request设置优先级，这样重要的请求就会优先得到响应。比如浏览器加载首页，首页的html内容应该优先展示，之后才是各种静态资源文件，脚本文件等加载，这样可以保证用户能第一时间看到网页内容。
 3. **header压缩**。前面提到HTTP1.x的header很多时候都是重复多余的。选择合适的压缩算法可以减小包的大小和数量。
 4. **基于HTTPS的加密协议传输**，大大提高了传输数据的可靠性。
 5. **服务端推送（server push）**，采用了SPDY的网页，例如我的网页有一个sytle.css的请求，在客户端收到sytle.css数据的同时，服务端会将sytle.js的文件推送给客户端，当客户端再次尝试获取sytle.js时就可以直接从缓存中获取到，不用再发请求了。SPDY构成图：
 
 ![这里写图片描述](http://img.blog.csdn.net/20170730163808039?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

SPDY位于HTTP之下，TCP和SSL之上，这样可以轻松兼容老版本的HTTP协议(将HTTP1.x的内容封装成一种新的frame格式)，同时可以使用已有的SSL功能。

**兼容性：**
![这里写图片描述](http://img.blog.csdn.net/20170730163914684?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 9. HTTP/2新特性

#### （1）二进制协议
HTTP/2 采用二进制格式传输数据，而非HTTP/1.x的文本格式。消息头和消息体均采用二进制格式，并称之为”帧“（Frame）。Frame二进制基本格式如下：

![这里写图片描述](http://img.blog.csdn.net/20170730164518874?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

之所以说是基本格式，是因为所有HTTP/2 Frame都是由该基本格式来封装，类似于TCP头，目前有10个Frame，由Type字段来区分，各个Frame都有自己的二进制格式，都封装Frame Payload中。

其中有两个重要的Frame：Headers Frame（Type=0x1）和Data Frame（Type=0x0），分别对应HTTP/1.1中的消息头（Header）和消息体（Body），由此可见语义并没有太大变化，而是文本格式变成二进制的Frame。二者的转换和关系如下图（摘自 《High Performance Browser Networking》）：

![这里写图片描述](http://img.blog.csdn.net/20170730165355255?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

此外，HTTP/2中还有流（Stream）和消息（Message）的概念：

 - **流**：流是连接中的一个虚拟信道，可以承载双向的消息；每个流都有一个唯一的整数标识符（1、2…N）；流中包含消息，这个消息对应HTTP/1.x的请求消息（Request Message）或者响应消息（Response Message）。
 - **消息**：是指逻辑上的 HTTP 消息，比如请求、响应等，由一或多个帧组成，消息是通过帧（Frame）来传输的，响应消息比较大，可能由多个Data Frame来传输。
 - **帧**：HTTP 2.0 通信的最小单位，每个帧包含帧首部，至少也会标识出当前帧所属的流，承载着特定类型的数据，如 HTTP 首部、负荷，等等
![这里写图片描述](http://img.blog.csdn.net/20170730165637098?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

#### （2）头部压缩

![这里写图片描述](http://img.blog.csdn.net/20170730165754965?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

HTTP/1.x 每次请求和响应，都会携带大量冗余消息头信息，比如Cookie和User Agent，基本一样的内容，每次请求浏览器都会默认携带，这会浪费很多带宽资源，也影响了速度。这是因为HTTP是无状态协议，每次请求都必须附上所有信息，从而导致了每次请求都带上大量重复的消息头。

为此，HTTP/2做了优化，对消息头采用HPACK格式进行压缩传输，并对消息头建立索引表，相同的消息头只发送索引号，从而提高效率和速度。但付出的代价是客户端和服务器均维护一个索引表，在如今内存不值钱的时代，这点空间换取时间还是非常值得的。

关于HPACK请参考[RFC7541](https://tools.ietf.org/html/rfc7541)。

#### （3）多路复用
多路复用是指在一个TCP连接里，客户端和服务器都可以同时发送多个请求或者响应，对HTTP/1.x来说各个请求和响应都是有严格的次序要求，而在HTTP/2中，不用按照次序一一对应，而且并发的多个请求或者响应中任何一个请求阻塞了不会影响其他的请求或者响应，这样就避免了“队头堵塞”

#### （4）服务器推送
HTTP 2.0 新增的一个强大的新功能，就是服务器可以对一个客户端请求发送多个响应。服务器向客户端推送资源无需客户端明确地请求。
服务器推送（Server Push）是指在HTTP/2中服务器未经请求可以主动给客户端推送资源。例如服务端可以主动把 图片、JS 和 CSS 文件推送给浏览器，而不需要浏览器解析HTML后再发送这些请求。当浏览器解析HTML后这些需要的资源都已经在浏览器里了，大大提高了网页加载的速度。

![这里写图片描述](http://img.blog.csdn.net/20170730170326139?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

 - HTTP 2.0 连接后，客户端与服务器交换SETTINGS 帧，借此可以限定双向并发的流的最大数量。因此，客户端可以限定推送流的数量，或者通过把这个值设置为0 而完全禁用服务器推送。
 - 所有推送的资源都遵守同源策略。换句话说，服务器不能随便将第三方资源推送给客户端，而必须是经过双方确认才行。
 - PUSH_PROMISE：所有服务器推送流都由PUSH_PROMISE 发端，服务器向客户端发出的有意推送所述资源的信号。客户端接收到PUSH_PROMISE 帧之后，可以视自身需求选择拒绝这个流。
 
 **几点限制：**
 
 - 服务器必须遵循请求- 响应的循环，只能借着对请求的响应推送资源。
 - PUSH_PROMISE 帧必须在返回响应之前发送，以免客户端出现竞态条件。

#### （5）安全
HTTP的安全是由SSL/TLS来保障，也就是HTTPS，其实HTTP/2并不强制要求依赖SSL/TLS，但是，当前主流浏览器均只支持基于SSL/TLS的HTTP/2，况且在网络劫持日益猖獗的互联网环境下，HTTPS将是未来的趋势，HTTP/2基于HTTPS也是未来的趋势，而各大主流浏览器在实现HTTP/2之初均只支持SSL/TLS的HTTP/2，可见安全也是HTTP/2的重要特性之一。


----------
###写在最后
相比之前的传输协议，HTTP/2在底层方面做了很多优化。有安全、省时、简化开发、更好的适应复杂页面、提供缓存利用率等显著的优势，各大公司也已经纷纷开始使用HTTP/2协议了。

*参考文章：*

 - [http://www.alloyteam.com/2016/07/httphttp2-0spdyhttps-reading-this-is-enough/#prettyPhoto](http://www.alloyteam.com/2016/07/httphttp2-0spdyhttps-reading-this-is-enough/#prettyPhoto)
 - [http://blog.csdn.net/zqjflash/article/details/50179235](http://blog.csdn.net/zqjflash/article/details/50179235)
 - [http://www.jianshu.com/p/748c7ca7c50f](http://www.jianshu.com/p/748c7ca7c50f)


 




