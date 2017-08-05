var i = 1;
(function () {
	var start = new Date().getTime();
	var si = setInterval(function () {
		var now = new Date().getTime();
		if(now < (start + 100)){
			i++;
		}else {
			console.log(i);
			clearInterval(si);
		}
	})
})();