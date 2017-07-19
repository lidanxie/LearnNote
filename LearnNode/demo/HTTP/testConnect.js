const http = require('http');
const net = require('net');
const url = require('url');

//创建一个HTTP代理服务器
const proxy = http.createServer((req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('okay');
});

proxy.on('connect', (req, cltSocket, head) => {
	//连接一个服务器
	const srvUrl = url.parse('http://${req.url}');
	const srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
		cltSocket.write('HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: Node.js-proxy\r\n' + '\r\n');
		srvSocket.write(head);
		srvSocket.pipe(cltSocket);
		cltSocket.pipe(srvSocket);
	});
});

//代理服务器正在运行
proxy.listen(1337,'127.0.0.1', () => {
	const options = {
		port:1337,
		hostname:'127.0.0.1',
		method:'CONNECT',
		path:'www.google.com:80'
	};

	const req = http.request(options);
	req.end();

	req.on('connect', (res,socket,head) => {
		console.log('已连接！');

		//通过代理服务器发送一个请求
		socket.write('GET / HTTP/1.1\r\n' +
					'Host: www.google.com:80\r\n' +
					'Connection: close\r\n' + '\r\n');
		socket.on('data', (chunk) => {
			cosole.log(chunk.toString());
		});
		socket.on('end', () => {
			proxy.close();
		});
	});
});