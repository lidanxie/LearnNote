const fs = require('fs');

fs.open('myfile', 'r', (err, fd) => {
	if(err) {
		if(err.code === 'ENOENT') {
			console.error('myfile does not exit');
			return;
		}
		throw err;
	}
	readMyData(fd);
})