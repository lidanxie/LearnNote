//一个长期运行的进程，为了忽视父进程的终止，通过分离且忽视其父进程的stdio文件描述符

const { spawn } = require('child_process');

const child = spawn(process.argv[0], ['child_program.js'], {
	detached: true,
	stdio:'ignore'
});

child.unref();