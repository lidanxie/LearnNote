function findeDouble(str) {
	var Str = new Set();
	for(let i = 0; i < str.length; i++) {
		Str.add(str[i]);
	}
	let ans = Str.size;
	if(ans > 2) ans = 0;
	return ans;
}
let str = 'ABAB';
console.log(findeDouble(str));