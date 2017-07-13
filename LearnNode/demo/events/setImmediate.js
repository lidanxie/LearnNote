const EventEmitter = require('events')

class MyEmitter extends EventEmitter {};
/*const myEmitter = new MyEmitter();
myEmitter.once('event', (a, b) => {
	setImmediate(() => {
		console.log('这个是异步发生的');
	})
})
myEmitter.emit('event','1', '2');
myEmitter.emit('event', 'a', 'b');
*/

/*const myEmitter = new MyEmitter();
//只处理一次，所以不会无限循环
myEmitter.once('newListener', (event, listener) => {
	if(event === 'event') {
		//在开头插入一个新的监听器
		myEmitter.on('event', () => {
			console.log('B');
		});
	}
});
myEmitter.on('event', () => {
	console.log('A');
})
myEmitter.emit('event');  
*/
