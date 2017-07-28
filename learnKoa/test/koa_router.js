const Koa = require('koa');

const router = require('koa-router')();

const app = new Koa();
app.use(async(ctx, next) => {
	console.log('Process ${ ctx.request.method } ${ ctx.request.url}');
})

router.get('/hello/:name', async(ctx,next) => {
	var name = ctx.params.name;
	ctx.response.body = '<h1>hello, ${ name }</h1>'
})