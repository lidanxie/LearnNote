# 一.bcrypt的简单使用


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


# 二、nodejs实现文件上传
前段时间在做个人项目的时候，用到了nodejs服务端上传文件，现在回头把这个小结一下，作为记录。

本人上传文件时是基于express的[multiparty](https://www.npmjs.com/package/multiparty)，当然也可以说使用*connect-multiparty*中间件实现，但官方似乎不推荐使用*connect-multiparty*中间件。废话不多说，下面看代码吧。

#### 步骤：
（1）使用express创建项目，默认使用的是jade模板引擎，但是还是习惯于html,所以就改为html模板。
（2）在项目目录中，通过npm install multiparty进行安装必要组件。
（3）修改views/index.html，添加一个文件上传的form。

```
index.html

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>上传文件</title>
</head>
<body>
	上传文件
	<form method='post', action='/file/uploading', enctype='multipart/form-data'>
		<input type="file" name="inputFile">
		<input type="submit" value="上传">
	</form>
</body>
</html>
```

（4）修改routes/index.js，实现上传页面和上传响应的后台代码。

```
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');

/* 上传页面. */
router.get('/', function(req, res, next) {
  //res.render('./views/index');
  res.sendfile('./views/index.html'); 
});

/* 上传 */
router.post('/file/uploading', function(req, res, next) {
	/* 生成multiparty对象，并配置上传目标路径 */
	var form = new multiparty.Form();
	/* 设置编辑 */
	form.encoding = 'utf-8';
	//设置文件存储路劲
	form.uploadDir = './public/files';
	//设置文件大小限制
	form.maxFilesSize = 2 * 1024 * 1024;
	// form.maxFields = 1000;   //设置所有文件的大小总和
	//上传后处理
	form.parse(req, function(err, fields, files) {
		var filesTemp = JSON.stringify(files, null, 2);

		if(err) {
			console.log('parse error:' + err);
		}else {
			console.log('parse files:' + filesTemp);
			var inputFile = files.inputFile[0];
			var uploadedPath = inputFile.path;
			var dstPath = './public/files' + inputFile.originalFilename;
			//重命名为真实文件名
			fs.rename(uploadedPath, dstPath, function(err) {
				if(err) {
					console.log('rename error:' + err);
				}else {
					console.log('rename ok');
				}
			})
		}
		res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
		res.write('received upload:\n\n');
		res.end(util.inspect({fields: fields, files: filesTemp}))
	})
})

module.exports = router;

```

