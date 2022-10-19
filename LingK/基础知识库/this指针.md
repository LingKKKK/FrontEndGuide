## this

- 在 js 中, this 是一个关键字, 在不同的场景下, 有不同的指向;
- this, 存在链式调用, 指向最后别调用的所属对象, 返回 xxx/undefined
- this: 包含他的函数, 作为方法被调用时所属的对象; 一般指向语法环境;
- 场景:
  1. 普通的函数,和定时器中,this 指向 window (匿名函数, 自运行函数)
  2. 对象方法中的 this,指向方法所属的对象
  3. 构造函数中,this 指向实例
  4. 在事件绑定的方法中,this 指向被绑定的 dom 元素
  5. 在箭头函数中,this 指向父级作用域的上下文 (在 react vue 中绑定的时候, 为什么要 bind(this))
  6. 在$.each()中,this 指向被遍历到的元素
  7. 对象的内部, this 永远指向这个对象
- 修改:
  - 通过 call apply 来修改 this 的指向
  - [指针的修改](https://blog.csdn.net/ihtml5/article/details/115265460)
- 上下文:
  - js 的执行环境
  - 当 js 执行一段有效代码的时候,会先创建对应的上下文,包含了 this VO 作用域链 闭包等内容

# 为什么要修改 this 指针?

```js
var name = "lucy";
let obj = {
  name: "martin",
  say: function () {
    console.log(this.name);
  },
};
obj.say(); // martin，this指向obj对象
setTimeout(obj.say, 0); // lucy，this指向window对象
```
正常情况下,say方法中this的指向调用它的obj对象,而定时器中的say方法,指向window对象,因为定时器中的say是作为回调函数来执行的.
因为执行say方法的this,是从当前的上下文取的,不同的场景对应不同的值.
想要this指针恒指向某个变量或者环境,需要使用apply和call修改指针的指向.

# 场景

    1. 方法调用模式
    	当函数被保存为一个对象的属性时, 他就是这个对象的方法. 当方法被调用时, this会被绑定到这个对象上;

```JavaScript
	var name = "window";
	var obj = {
	    name: "obj",
	    sayName: function() {
	        console.log(this.name);
	    }
	};
	obj.sayName();  //obj 如果使用箭头函数, 就打印window
```

    2. 函数调用模式
    	函数中的this, 都是默认绑定到window对象上的;

```JavaScript
	var name = "window";
	function sayName() {
	    console.log(this.name);
	}
	sayName();
```

    3. 构造函数模式
    	使用new实例化时, 会创建一个连接到该函数prototype成员的新对象, this会绑定到这个新对象上;

```JavaScript
	function Obj() {
		console.log(this);
    this.name = "kxy";
	}
	var person = new Obj();
	console.log(person.name);   //kxy
```

    4. apply 调用模式
    	this的指向会被修改

```javascript
var name = "window";
var person = {
  name: "kxy",
};
function sayName() {
  console.log(this.name);
}
sayName(); //window
sayName.apply(person); //kxy
sayName.apply(); //window
```

# 常见的案例

```JavaScript
	//1.普通函数中的this------------window
	function f1() {
	  console.log(this);
	}
	f1(); // Window
	//2.定时器中的this---------------window
	setInterval(function () {
	  console.log(this); // Window
	}, 1500)
	//3.构造函数中的this------------实例对象
	//4.对象。方法中的this----------当前的实例对象
	//5.原型方法中的this----------实例对象
	function Person() {
	  this.name = name;
	  this.show1 = function () {
	    console.log(this);
	  }
	}
	Person.prototype.show2 = function () {
	  console.log(this);
	}
	var per = new Person("小明");
	per.show1(); // Person {name: "", show1: ƒ}
	per.show2(); // Person {name: "", show1: ƒ}
	//6.严格模式下的this-----------undefined
	function f2() {
	  "use strict";
	  console.log(this);
	}
	f2(); // undefined

	function Foo() {
		/**
		 * ! 静态方法 a, 在构造没有实例化之前, 这个静态方法是无法调用的
		 * ! 实例化之后, 这个静态方法的优先级比较高, 会覆盖实例化之前的静态设置
		 */
	  Foo.a = function () {
	    console.log(1);
	  }
	  this.a = function () {
	    console.log(2)
	  }
	} // Foo 是一个函数, 还没有执行, 也没有产生实例
	Foo.prototype.a = function () {
	  console.log(3);
	} // 在 Foo 上挂载了原型方法 a
	Foo.a = function () {
	  console.log(4);
	} // 在 Foo 上挂载了静态方法 a
	Foo.a(); // 4 立即执行 Foo 上的静态方法, Foo 还未执行,也未实例化
	let obj = new Foo();
	/**
	 * 将 Foo 实例化,主要做了两件事:
	 * 1. 在全局的 Foo 上, 将静态方法(4), 替换成原有的静态方法(输出 1)
	 * 2. 在实例化对象 foo 上, 挂载了 a 方法(输出 2)
	 */
	obj.a(); // 2
	/**
	 * ! 自身属性优先级级，要高于原型额外附加的属性, 所以不会访问原型上添加的 a 方法
	 * * 因为 obj 上挂载了一个方法(this.a), 所以不会访问它的原型对象上的方法(Foo.prototype.a)
	 */
	Foo.a(); // 1
	/**
	 * 构建实例时, 已经将构造函数内部的静态方法(1), 覆盖原来设定的静态方法(4)
	 */
```
