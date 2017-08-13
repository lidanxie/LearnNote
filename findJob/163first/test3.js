function maxDay( x, f, d, p) {
	let temp = Math.floor(d/x);
	if(temp <= f) return temp;
	d -= f*x;
	return Math.floor(f+d/(x+p));
}
let x = 3;  
let f =5;
let d = 100;
let p = 10;
console.log(maxDay(x,f,d,p));