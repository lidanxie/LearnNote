function findeMaxLength(str) {
	let count = 1;
	let max = 0;
	let first = 1;  //起始坐标
	for(let i = 1; i < str.length; i++) {
		if (str.charAt(i) !== str.charAt(i-1)) {
			count ++;
		}else {
			count = 1;
		}
		max = count > first ? count : first;

	}
	return max;
}

let str = '1110';

console.log(findeMaxLength(str));