var express = require('express');
var app = express();

app.get('/', (req, res) => {
	res.send('hello world!');
});

var server = app.listen(3000, () => {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
})

/**
* 上面的代码启动一个服务并监听3000端口进入的所有连接请求。他将对所有(/)URL或路由返回"hello world!"字符串。对于其他所有路径全部返回404Not Found.
* req(请求)和res(响应)与Node提供的对象完全一致。因此，可以调用req.pipe()、req.on('data',callback)以及任何Node提供的方法。
*/