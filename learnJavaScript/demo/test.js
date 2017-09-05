function sortBy(array,key,order){
	var createCompare = function(key,order) {
		return function(object1,object2){
			let value1 = object1[key];
			let value2 = object2[key];
			return order ? (value1 - value2) : (value2 - value1);
		}
		
	}
	return array.sort(createCompare(key,order));
} 

let array = [{'name': '小麦','age':18},{'name': '小明','age':15},{'name': '小红','age':20}];
console.log(sortBy(array,'age'));
console.log(sortBy(array,'age',true));