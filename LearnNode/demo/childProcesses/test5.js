//将子进程输出重定向到文件：

const fs = require('fs');
const { spawn } = require('child_process');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const child = spawn('prg', [], {
	detached: true,
	stdio: ['ignore', out, err]
});

child.unref();