/**
 * promise 异步加载
 */
var promise = new Promise(function(resolve, reject) {
	if(/*异步操作成功*/){
		resolve(value);
	}else {
		reject(error);
	}
})

// 异步加载图片
function loadImageAsync(url) {
	return new Promise(function(resolve, reject) {
		var image = new Image();
		image.onload = function(){
			resolve(image);
		};

		image.onerror = function(){
			reject(new Error('不能加载图片'));
		};

		image.src = url;
	})
}

/**
 * 实现AJAX操作
 */
var getJSON = function(url) {
	var promise = new Promise(function(resolve, reject){
		var client = new XMLHttpRequest();
		client.open('GET', url);
		client.onreadystatechange = handler;
		client.responseType = 'json';
		client.setRequestHeader('Accept', 'application/json');
		client.send();

		function handler(){
			if( this.readyState !== 4){
				return;
			}
			if( this.status === 200){
				resolve(this.response);
			}else {
				reject(new Error(this.statusText));
			}
		}
	})
}
getJSON("post.json").then(function(json){
	console.log('content:' + json);
}, function(error){
	console.log("出错了");
})