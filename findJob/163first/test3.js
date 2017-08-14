function maxDay( x, f, d, p) {
	let temp = Math.floor(d/x);
	if(temp <= f) return temp;
	return Math.floor(d -= f*x);
}
let x = 3;  
let f =5;
let d = 100;
let p = 10;
console.log(maxDay(x,f,d,p));