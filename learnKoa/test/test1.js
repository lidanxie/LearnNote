const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

app.use(async (ctx, next) => {
	if(ctx.request.path === '/') {
		ctx.response.body = 'index.page';
	} else {
		await next();
	}
});

app.use(async (ctx, next) => {
	if(ctx.request.path === '/test') {
		ctx.response.body = 'TEST.page';
	} else {
		await next();
	}
})

app.use(async (ctx, next) => {
	if(ctx.request.path === 'error'){
		ctx.response.body = 'ERROR.page';
	}else {
		await next();
	}
})