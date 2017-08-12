function findeMaxLength(str) {
	let count = 0;
	let max = 0;
	let first = 0;  //起始坐标
	let last = 0;   //结束坐标
	for(let i = 0; i < str.length; i++) {
		if (str.charAt(i) !== str.charAt(i+1)) {
			last = i+1;
			count = last - first + 1;
			max = count > max ? count : max;
		}else {
			first = i+1;
		}

	}
	return max;
}

let str = '10101010101';

console.log(findeMaxLength(str));