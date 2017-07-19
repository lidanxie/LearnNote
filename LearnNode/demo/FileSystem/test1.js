//异步方法
const fs = require('fs');

fs.unlink('hello.txt', (err) => {
	if(err) throw err;
	console.log('成功删除 /tmp/hello');
})