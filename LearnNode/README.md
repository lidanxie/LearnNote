一.bcrypt的简单使用
=====

前段时间在捣鼓个人项目的时候用到了nodejs做服务端，发现使用加密的方法和之前常用的加密方式不太一致，下面以demo的形式总结一下bcrypt对密码进行加密的方法。

### 一、简介
**Bcrypt简介：** bcrypt是一种跨平台的文件加密工具。bcrypt 使用的是布鲁斯·施内尔在1993年发布的 Blowfish 加密算法。由它加密的文件可在所有支持的操作系统和处理器上进行转移。它的口令必须是8至56个字符，并将在内部被转化为448位的密钥。

简单的说，Bcrypt就是一款加密工具，可以比较方便地实现数据的加密工作。下面是使用Bcrypt对数据加密的一个简单的栗子：
 
### 二、栗子

```
var mongoose = require('mongoose');
 // 引入bcrypt模块
var bcrypt = require('bcrypt');
// 定义加密密码计算强度
var SALT_WORK_FACTOR = 10;

// 连接数据库
mongoose.connect('mongodb://localhost:27017/test');

//定义用户模式
var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: {
		unique: true,
		type: String
	}
}, {
	collection: "user"
});

//使用pre中间件在用户信息存储前进行密码加密
UserSchema.pre('save', function(next) {
	var user = this;

	//进行加密
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			next();
		})
	});
});

//编译模型
var UserBx = mongoose.model('UserBx', UserSchema);

//创建文档对象实例
var user = new UserBx({
	name: 'lidan',
	password: '12345'
});

//保存用户信息
user.save(function(err, user) {
	if(err) {
		console.log(err);
	}else {
		// 如果保存成功，打印用户密码
		console.log('password:' + user.password);
	}
})
```
结果：
![这里写图片描述](http://img.blog.csdn.net/20170815150509431?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQveGlleGluZ3hp/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

可以发现，保存到数据库中的是加密后的密码。

**注： SALT_WORK_FACTOR 表示密码加密的计算强度，从1级到10级，强度越高，密码越复杂，计算时间也越长。值得注意的是，强度为1-3时强度太低，系统会默认使用强度为10的计算方式进行加密。** 

[参考文档](https://github.com/shaneGirish/bcrypt-nodejs)


