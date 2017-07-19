const fs = require('fs');

fs.unlinkSync('./tmp/hello');
console.log('成功删除 /tmp/hello');