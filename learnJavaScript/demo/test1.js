// 工厂模式创建对象
function creatPerson(name,age,job){
	var o = new Object();
	o.name = name;
	o.age = age;
	o.job = job;
	o.sayName = function(){
		console.log(this.name);
	}
	return o;
}

// 构造函数创建对象:每个方法都要再每个实例上重新创建
function Person(name,age,job){
	this.name = name;
	this.age = age;
	this.job = job;
	this.sayName = function(){
		console.log(this.name);
	}
}

// 原型模式
function Person = {};
Person.prototype = {
	constructor: Person,
	name: 'lidan',
	age: 18,
	job:'wwww',
	sayName: function(){
		console.log(this.name);
	}
}

// 重设构造函数
Object.defineProperty(Person.prototype, "constructor",{
	enumerable: false,
	value: Person
})


// 组合使用构造函数模式和原型模式创建对象：可向构造函数传递参数
function Person(name,age,job){
	this.name = name;
	this.age = age;
	this.job = job;
	this.friends = ["lidan", "xie"];
}

Person.prototype = {
	constructor: Person,
	sayName:function(){
		console.log(this.name);
	}
}

// 动态原型模式：在构造函数中初始化原型

function Person(name,age,job){
	this.name = name;
	this.age = age;
	this.job = job;
	if(typeof this.sayName != "fuction"){
		Person.prototype.sayName = function() {
			console.log(this.name);
		}
	}
}

// 寄生构造函数模式创建对像：类似于工厂模式
function Person(name,age,job){
	var o = new Object();
	o.name = name;
	o.age = age;
	o.job = job;
	o.sayName = function() {
		console.log(this.name);
	}
	return o;
}


/*
* 继承方法
 */

// 借用构造函数:在子类型构造函数内部调用超类型构造函数，使用apply或者call方法，优点：可以在子类型构造函数中向超类型构造函数中传递参数
function SuperType(name){
	this.name = name;
}

fuction SubType(){
	// 继承了superType,同时还传递了参数
	SuperType.call(this,"lidan");
	// 实例属性
	this.age = 29;
}

var instance = new SubType();


/**
 * 组合继承
 * 将原型链和借用构造函数组合到一起，
 * 使用原型链实现对原型属性和方法的继承，
 * 通过借用构造函数实现对实例属性的继承。
 */

function SuperType(name){
	this.name = name;
	this.colors = ["red","blue","green"];
}

SuperType.prototype.sayName = function() {
	console.log(this.name);
}

function SubType(name, age) {
	// 继承属性
	SuperType.call(this, name);

	this.age = age;
}

// 继承原型中的方法
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function() {
	console.log(this.age);
}

var instance = new SubType('lidan',19);


/**
 * 原型式继承：借助原型可以基于已有的对象创建新对象
 * 函数内部，先创建一个临时性的构造函数，然后将传入的对象作为这个构造函数的原型，最后返回这个临时类型的一个新实例
 */
function object(o){
	fuction F(){}
	F.prototype = o;
	return new F();
}

// es5中新增了Object.create()实现原型式继承

var person = {  //作为新对象的原型传入
	name: 'xie',
	friends: ["lidan", "xie"]
};

var anotherPerson = Object.create(person,{
	name:{   //设置新属性
		value: "lidan"
	}
})

/**
 * 寄生式继承：创建一个仅用于封装继承过程的函数，该函数在内部以某种方式来增强对象，最后再像真的是它做了所有工作一样返回对象
 * 
 */
function createAnother(original){
	var clone = object(original);
	clone.sayHi = function(){
		console.log("hi");
	}
	return clone;
}

/**
 * 寄生组合继承：通过借用构造函数来继承属性，通过原型链的混成形式来继承方法
 * 基本思路是：不必为了指定子类型的原型而调用超类型的构造函数，我们需要的无非就是超类型原型的一个副本而已。
 */

function inheritPrototype(subType, superType){
	var prototype = object(superType.prototype);
	prototype.constructor = subType;
	subType.prototype = prototype;
}


// 闭包
function createFunction(){
	var result = new Array();
	for(var i=0; i < 10; i++){
		result[i] = function(num) {
			return function(){
				return num
			}
		}(i);
	}
} 