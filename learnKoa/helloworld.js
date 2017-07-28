//hello world
var koa = require('koa')
var app = koa();

app.use(function *(){
	this.body = 'hello World';
});

app.listen(3000);