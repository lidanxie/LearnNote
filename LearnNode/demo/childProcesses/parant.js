/**
* 发送一个socket对象,sendHandle参数可用于将一个socket句柄传给子进程
*/

const normal = require('child_process').fork('child.js',['normal']);
const special = require('child_process').fork('child.js',['special']);

//开启server并发送socket给子进程。
//使用'pauseOnConnect'防止socket在被发送到子进程之前被读取。
const server = require('net').createServer({ pauseOnConnect: true });
server.on('connection', (socket) => {
	//特殊优先级
	if(socket.remoteAddress === '74.125.127.100') {
		special.send('socket', socket);
	}

	//普通优先级
	normal.send('socket', socket);
});
server.listen(1337);