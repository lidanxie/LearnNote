const nodemailer = require('nodemailer');

//开启SMTP连接池
let transporter = nodemailer.createTransport({
	host: 'smtp.qq.com',
	secureConnection: true,  //use SSL
	port: 465,
	secure: true,  //secure: true for port 465, secure:false for port 587
	auth: {
		user: '987905457@qq.com',
		pass: 'rjtexjiwkidcbcgi'  //授权码
	}
});

//设置邮件内容（谁发送什么给谁）
let mailOptions = {
	from: '"谢丽丹"<987905457@qq.com>',  //发件人
	to: 'xingxi.xie@gmail.com',   //收件人
	subject: 'Hello',  //主题
	text: '这是一封来自nodejs的测试邮件',  //文本内容
	html: '<b>这是一封来自nodejs的测试邮件</b>',  //html body
	//下面是发送附件，不需要就注释掉
	attachments: [{
		filename: 'test.txt',
		path: './test.txt',
	},
	{
		filename: 'content',
		content: '发送内容'
	}]
};

//使用先前创建的传输器的sendMail方法传递消息对象
transporter.sendMail(mailOptions, (error, info) => {
	if(error) {
		return console.log(error);
	}
	console.log('message: ${info.messageId}');
	console.log('sent: ${info.response}');
});
