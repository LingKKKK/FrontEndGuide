# 基础
## 定义函数
    let add:(x: number, y: number) => number
# 拓展
## as 和 ? !
    as 断言他的类型
    ! 确定存在
    ? 不确定是否存在
## type interface 对比
    type aliases: 类型别名
    interfaces: 接口
    type拥有interfaces的绝大多数特征;
    1. interface是可拓展的, type不能重新打开添加新属性; interfaces-extend/type-&-|实现拓展
    2. type拥有typeof keyof in 等拓展功能
    ※ 尽量使用interfaces, 因为interfaces更符合js对象的工作性质
    ※ 当无法通过interfaces来描述某些形状, 或者需要使用联合类型元组类型时, 使用type来进行表达
    ※ interfaces是最佳选择, type是最次方案
[参考](https://blog.csdn.net/weixin_42321819/article/details/119982289)
```ts
  // 声明一个类型时 interface 和 type 没有区别;
  // 都可以进行接口类型的定义, readonly public ? ! [] 用法都相同
  interface Point = {
    a: number;
  }
  type Point = {
    a: number;
  }
  // 类型别名时, 只能使用 type, 不能使用 interface
  type ID = number | string;
  type ID = number;
  // 拓展类型
  // interface可以通过extend来拓展类型, 允许interface/type aliases
  interface Super {
    a: string;
  }
  interface Sub extends Super {
    b: number;
  }
  // type 通过交叉类型 & 来实现拓展 (测试发现 & | 都可以实现)
  type Super = {
    a: string;
  };
  type Sub = Super & {
    b: number
  };
  // type aliases 有很多扩展语法 typeof keyof in
  interface A {
    x: number;
    y: string;
  }
  // 拿到 A 类型的 key 字面量枚举类型，相当于 type B = 'x' | 'y'
  type B = keyof A;
  const json = { foo: 1, bar: 'hi' };
  // 根据 ts 的类型推论生成一个类型。此时 C 的类型为 { foo: number; bar: string; }
  type C = typeof json;
  // 根据已有类型生成相关新类型，此处将 A 类型的所有成员变成了可选项，相当于 type D = { x?: number; y?: string; };
  type D = {
    [T in keyof A]?: A[T];
  };
```
## 基础类型
```ts
    // 布尔值
    let isClick:boolean = false
    // 数字
    let num:number = 0; // 允许 2 8 10 16 进制
    // 字符串
    let str:string = "嗯" // 允许使用字符串模板
    // 数组: 合并相同类型
    let arr1:number[] = [1,2,3] // 使用类型
    let arr2:Array<number> =[1,2,3] // 使用泛型
    interface arr { [index: number]: number } // 使用接口定义
    // 元组: 合并不同类型
    let tuple:[string, number] = ['1', 2];
    // 枚举
    enum Color {Red, Blue, Yellow}
    let color:Color = Color.Red
    // 特殊类型
    any(任意类型) / 没有类型(void) [含义相反]
    null & undefined [类型]
    // never 永远不存在的类型
    function error(message: string): never { // 永远不会走到头, 会抛出异常
      throw new Error(message)
    }
    // object 非原始类型: 除了基本类型之外的类型
    declare function create(o: object | null): void // 只能传入"非基本|null"类型的参数
    create({ prop: 0 }) // OK
    create(null) // OK
    create(42) // Error
    create('string') // Error
```
## 基础类型 对象类型 高级类型
    基础类型: string number boolean null undefined bigint symbol
    对象类型: object
    高级类型: 联合类型(Unions Type ) 泛型(Generics)
## 对象的类型 - 接口
    在ts中使用接口(Interface)来定义对象的类型
    类似声明一个约定(描述接口的形状), 接口声明和使用时要遵循这个约定
```ts
    interface Person {
      readonly id: number;
      name: string;
      age?: number;
      [propName: string]: string | number; // 一旦定义, 所有的属性必须都遵循这个原则 (其他设置会失效)
    }
    // 定义的变量要和接口一致, 不能多也不能少
    // 如果存在任意属性, 需要加上 null undefined
```
## 数组的类型
1.「类型 + 方括号」表示法
      let fibonacci: number[] = [1, 1, 2, 3, 5];
      不允许出现其他类型，在设定的时候，会对类型加以约束
2.数组泛型
			Array<elemType>
      let fibonacci: Array<number> = [1, 1, 2, 3, 5];
3.用接口表示
```ts
    interface NumberArray {
      [index: number]: number;
    }
    let fibonacci: NumberArray = [1, 1, 2, 3, 5];
```
4.类数组
```ts
    function sum() {
      let args: {
        [index: number]: number;
        length: number;
        callee: Function;
      } = arguments;
    }
    // 提前定义好类数组
    interface IArguments {
      [index: number]: any;
      length: number;
      callee: Function;
    }
    let args: IArguments = arguments;
```

## 函数的类型

    定义函数的方式：函数的声明 / 函数表达式
    可选参数、默认参数、剩余参数
    * 函数有输入（参数）也有输出（返回值），需要对这两个值进行约束
    * 给函数表达式，如果只设置邮编的类型，左边的变量会推断类型，是无法接收到右侧的约束信息的
    * TS中的箭头函数和ES6中的箭头函数不是一个意义，TS中：(输入类型) => 输出类型 「左侧必须要使用括号」
    使用接口定义函数的形状

```ts
    // 声明的方式定义
    // 参数多一个少一个都不允许，除非使用可选参数
    function sum(x: number, y: number): number {
      return x + y;
    }
    // 函数表达式的形式，左右两侧都需要进行定义
    let mySum: (x: number, y: number) => number = function (
      x: number,
      y: number
    ): number {
      return x + y;
    };
    // 使用接口来定义函数的形状
    interface SearchFunc {
      (source: string, subString: string): boolean;
    }
    let mySearch: SearchFunc;
    mySearch = function (source: string, subString: string) {
      return source.search(subString) !== -1;
    };
    // 需要对联合类型的输入和输出加以限制的时候，需要多次定义，这样函数就可以进行匹配
    function reverse(x: number): number; // 定义输入number，输出number
    function reverse(x: string): string; // 定义输入string，输出string
    function reverse(x: number | string): number | string | void {
      if (typeof x === "number") {
        return Number(x.toString().split("").reverse().join(""));
      } else if (typeof x === "string") {
        return x.split("").reverse().join("");
      }
    }
```

## 类型断言
    类型断言：用来手动指定一个值的类型 <类型>值 : 当已经明确某一个值类型时
    ※ 使用断言类型来欺骗编辑器，避免了因为类型产生的报错
    ※ 断言只会影响编译的过程，在编译完毕之后，会将断言的内容删掉
    ※ 断言，不同于：类型转换、类型声明、泛型
    断言只有两种形式:
      1. 值as类型
      2. <类型>值
      tips: 在jsx中, 只允许使用as
```ts
    // <> 尖括号语法
    let someValue: any = 'this is a string'
    let strLength: number = (<string>someValue).length
    // as 语法
    let soValue: any = 'this is a string'
    let soLength: number = (soValue as string).length
```
    ※
    1. 联合类型可以被断言成其中的一个类型
    2. 父类可以被断言成子类
    3. 任何类型都可以被断言成any
    4. any可以被断言成各种类型
    5. 如果让A断言成B，需要让A兼容B，或者B兼容A

## 声明文件 declare [dɪˈkleə(r)]

    * 必须以 ".d.ts" 结尾.
    当一个第三方库没有提供声明文件时, 需要手动添加声明.
    在不同场景下, 声明文件的内容和使用有所不同
    全局变量的声明文件有下面几种:
      declare var 声明全局变量
      declare function 声明全局方法
      declare class 声明全局类
      declare enum 声明全局枚举类型
      declare namespace 声明（含有子属性的）全局对象
    		interface 和 type 声明全局类型
    	※ 全局定义的变量, 多数使用const, 不允许再被修改

## 内置对象
		Error Date RegExp

# 进阶

## 类型别名 Type Aliases
    用于给一个类型起一个新的名称; 起一个新的名字, 并非定义新类型, 原来的也可以使用
    常用于: 基础类型 / 联合类型
```ts
    type Name = string;
    type NameResolver = () => string;
    type NameOrResolver = Name | NameResolver;
    function getName(n: NameOrResolver): Name {
      if (typeof n === "string") {
        return n;
      } else {
        return n();
      }
    }
```

## 字符串字面量类型
    用来约束取值只能是某几个字符串中的一个;
```ts
    type EventNames = 'click' | 'scroll' | 'mousemove';
    function handleEvent(ele: Element, event: EventNames) {}
    handleEvent(document.getElementById('hello'), 'scroll');  // 没问题
    handleEvent(document.getElementById('world'), 'dblclick'); // 报错，event 不能为 'dblclick'
    // index.ts(7,47): error TS2345: Argument of type '"dblclick"' is not assignable to parameter of type 'EventNames'.
```

## 元组
    数组合并了相同类型的对象, 而元组(tuple)合并了不同类型的对象.
    初始化和赋值的时候, 需要提供元组所有的指定向.
    添加的时候, 添加项必须为元组中每个类型的联合类型
```ts
    let tom: [string, number];
    tom = ['Tom', 25]; // 必须按照要求赋值
    tom.push('male');
    tom.push(true);
    // Argument of type 'true' is not assignable to parameter of type 'string | number'.
```

## 枚举 enum [ˈæno]
    取值被限定在一定的范围之内.
```ts
    enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat};
    // 枚举对象的成员的值, 会从0开始递增, 可以手动进行赋值
    enum Days {Sun = 7, Mon = 1, Tue, Wed, Thu, Fri, Sat};
```
    常数枚举: 是使用 "const enum" 定义的枚举类型 (在编译阶段被删除, 不能包含计算成员)
```ts
    const enum Directions {Up,Down,Left,Right}
    let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right];
```
    外部枚举: 使用 "declare enum" 的方式定义枚举类型 (用于编译检查, 编译之后会被删除)
```ts
    declare enum Directions {Up,Down,Left,Right}
    let directions = [Directions.Up, Directions.Down, Directions.Left, Directions.Right];
```
## 类
JS通过构造函数实现类, 通过原型链实现继承. 在ES6中有了class.

- 类（Class）：定义了一件事物的抽象特点，包含它的属性和方法
- 对象（Object）：类的实例，通过 new 生成
- 面向对象（OOP）的三大特性：封装、继承、多态
- 封装（Encapsulation）：将对数据的操作细节隐藏起来，只暴露对外的接口。外界调用端不需要（也不可能）知道细节，就能通过对外提供的接口来访问该对象，同时也保证了外界无法任意更改对象内部的数据
- 继承（Inheritance）：子类继承父类，子类除了拥有父类的所有特性外，还有一些更具体的特性
- 多态（Polymorphism）：由继承而产生了相关的不同的类，对同一个方法可以有不同的响应。比如 Cat 和 Dog 都继承自 Animal，但是分别实现了自己的 eat 方法。此时针对某一个实例，我们无需了解它是 Cat 还是 Dog，就可以直接调用 eat 方法，程序会自动判断出来应该如何执行 eat
- 存取器（getter & setter）：用以改变属性的读取和赋值行为
- 修饰符（Modifiers）：修饰符是一些关键字，用于限定成员或类型的性质。比如 public 表示公有属性或方法
- 抽象类（Abstract Class）：抽象类是供其他类继承的基类，抽象类不允许被实例化。抽象类中的抽象方法必须在子类中被实现
- 接口（Interfaces）：不同类之间公有的属性或方法，可以抽象成一个接口。接口可以被类实现（implements）。一个类只能继承自另一个类，但是可以实现多个接口

-  属性和方法
      使用class定义类, 使用constructor来定义构造函数
      使用new来生成新实例的时候, 会自动调用构造函数.

## 类与接口
```ts
      class Animal {
        public name;
        constructor(name) {
          this.name = name;
        }
        sayHi() {
          return `My name is ${this.name}`;
        }
      }
      let a = new Animal('Jack');
      console.log(a.sayHi()); // My name is Jack
```
    类的继承
      使用extend关键字来实现继承, 子类中使用super关键字来调用父类的构造函数和方法.
```ts
      class Cat extends Animal {
        constructor(name) {
          super(name); // 调用父类的 constructor(name)
          console.log(this.name);
        }
        sayHi() {
          return 'Meow, ' + super.sayHi(); // 调用父类的 sayHi()
        }
      }
      let c = new Cat('Tom'); // Tom
      console.log(c.sayHi()); // Meow, My name is Tom
```
    存取器
      使用getter, setter可以改变属性的赋值和读取行为
```ts
      class Animal {
        constructor(name) {
          this.name = name;
        }
        get name() {
          return 'Jack';
        }
        set name(value) {
          console.log('setter: ' + value);
        }
      }
      let a = new Animal('Kitty'); // setter: Kitty
      a.name = 'Tom'; // setter: Tom
      console.log(a.name); // Jack
```
    静态方法
      static关键字声明的是静态方法, 不需要实例化, 直接通过类进行调用. {必须通过类进行调用}
```ts
      class Animal {
        static isAnimal(a) {
          return a instanceof Animal;
        }
      }
      let a = new Animal('Jack');
      Animal.isAnimal(a); // true
      a.isAnimal(a); // TypeError: a.isAnimal is not a function
```
    TS中的类方法
      修饰符
        public: 修饰的属性和方法是共有的, 在任何地方都允许访问到, 所有默认的属性和方法都是public的.
        privite: 修饰的属性和方法是私有的, 不能在类的外部访问
        protected: 修饰的属性和方法是受保护的, 他和private类似, 在子类中允许访问.
      readonly: 只读关键字, 不允许修改, 只允许声明调用
      abstract: 抽象类, 不允许被实例化, 且子类必须实现抽象类.
```ts
      class Animal {
        public name;
        public constructor(name) {
          this.name = name;
        }
      }
      let a = new Animal('Jack');
      console.log(a.name); // Jack
      a.name = 'Tom';
      console.log(a.name); // Tom

      abstract class Animal {
        public name;
        public constructor(name) {
          this.name = name;
        }
        public abstract sayHi();
      }
      let a = new Animal('Jack');
      // index.ts(9,11): error TS2511: Cannot create an instance of the abstract class 'Animal'.

      abstract class Animal {
        public name;
        public constructor(name) {
          this.name = name;
        }
        public abstract sayHi();
      }

      class Cat extends Animal {
        public eat() {
          console.log(`${this.name} is eating.`);
        }
      }
      let cat = Wnew Cat('Tom');
      // index.ts(9,7): error TS2515: Non-abstract class 'Cat' does not implement inherited abstract member 'sayHi' from class 'Animal'.
```

## 类与接口
    把接口提取成特性, 在继承类的时候, 可以 实现(implements)这些特性(interface)
    eg. 门是一个大类, 防盗门是门的子类, 在做防盗门的时候, 可以实现报警,指纹识别等功能

## 泛型 Generics  [dʒɪˈnɛrɪks]

在定义函数, 接口, 类的时候, 不预先指定具体的类型, 在使用的时候再去指定的一种特性.

```ts
    // 数组的泛型 [能成功返回, 无法精确的要求输入和输出的类型相同]
    function createArray(length: number, value: any): Array<any> {
      let result = [];
      for (let i = 0; i < length; i++) {
        result[i] = value;
      }
      return result;
    }
    createArray(3, 'x'); // ['x', 'x', 'x']

    function createArray<T>(length: number, value: T): Array<T> {
      let result: T[] = [];
      for (let i = 0; i < length; i++) {
        result[i] = value;
      }
      return result;
    }
    createArray<string>(3, 'x'); // ['x', 'x', 'x']
    createArray(3, 'x'); // ['x', 'x', 'x'] // 可以不指定返回值, 让函数自己进行判断

函数名后添加了 <T>，其中 T 用来指代任意输入的类型，在后面的输入 value: T 和输出 Array<T\> 中即可使用
```

### 多类型参数: 在定义泛型的时候, 可以一次性定义多个参数
```ts
    function swap<T, U>(tuple: [T, U]): [U, T] {
      return [tuple[1], tuple[0]];
    }
    swap([7, 'seven']); // ['seven', 7]
```
### 泛型约束: 使用泛型变量时, 可以对泛型进行约束, 否则可能会存在一些报错信息(eg. 某些api无法调用, length push 等)
```ts
    interface Lengthwise {
      length: number;
    }
    // 预先定义好length这个变量, 确保泛型包含这个属性
    function loggingIdentity<T extends Lengthwise>(arg: T): T {
      console.log(arg.length);
      return arg;
    }
    // 多个类型之间也可以相互约束 => 要求 T 继承 U，这样就保证了 U 上不会出现 T 中不存在的字段
    function copyFields<T extends U, U>(target: T, source: U): T {
      for (let id in source) {
        // 应为target是T类型,所以一定要约束成T
        target[id] = (<T>source)[id];
      }
      return target;
    }
    let x = { a: 1, b: 2, c: 3, d: 4 };
    copyFields(x, { b: 10, d: 20 });
```
### 泛型接口:
      使用接口的形式, 来定义一个函数的形状. 也可以使用接口的泛型来定义
```ts
    interface CreateArrayFunc {
      <T>(length: number, value: T): Array<T>; // 将泛型参数写在接口内部
    }
    let createArray: CreateArrayFunc;
    createArray = function<T>(length: number, value: T): Array<T> {
      let result: T[] = [];
      for (let i = 0; i < length; i++) {
        result[i] = value;
      }
      return result;
    }
    createArray(3, 'x'); // ['x', 'x', 'x']
// †††††††††††††††††††††††††††††††††††††††††††††††††††††††
    interface CreateArrayFunc<T> { // 将泛型参数写在接口名上
      (length: number, value: T): Array<T>;
    }
    let createArray: CreateArrayFunc<any>;
    createArray = function<T>(length: number, value: T): Array<T> {
      let result: T[] = [];
      for (let i = 0; i < length; i++) {
        result[i] = value;
      }
      return result;
    }
    createArray(3, 'x'); // ['x', 'x', 'x']
```
### 泛型接口:
```ts
    class GenericNumber<T> {
      zeroValue: T;
      add: (x: T, y: T) => T;
    }
    let myGenericNumber = new GenericNumber<number>();
    myGenericNumber.zeroValue = 0;
    myGenericNumber.add = function(x, y) { return x + y; };
```
### 泛型参数的默认类型
    如果在代码中没有明确的定义类型, 且无法推断出参数类型. 此时默认类型就会起到作用.
```ts
    function createArray<T = string>(length: number, value: T): Array<T> {
      let result: T[] = [];
      for (let i = 0; i < length; i++) {
        result[i] = value;
      }
      return result;
    }
```
## 声明合并
    如果定义了两个相同名称的函数,接口或者类, 它们会被合并成一个类型.
    合并规则:
      1. 允许重复, 但是重复属性对应的值必须相同(不能先定义string, 再定义number)
      2. 类的合并和函数的合并规则一样
```ts
    // 函数的合并
    function reverse(x: number): number;
    function reverse(x: string): string;
    function reverse(x: number | string): number | string {
      if (typeof x === 'number') {
        return Number(x.toString().split('').reverse().join(''));
      } else if (typeof x === 'string') {
        return x.split('').reverse().join('');
      }
    }
    // 对象的合并
    interface Alarm {
      price: number;
    }
    interface Alarm {
      weight: number;
    }
```

# 扩展
## 一些拓展语法
```ts
  & 交集: [A, B] & [B, C] => [B]
  | 并集: [A, B] | [C, D] => [A,B,C,D]
  ! 用在变量前: 取反 let a = !b;
    用在变量后: 赋值其他类型, 并确保编译通过
      let a = number;
      a = null! undefined! (正常情况下null undefined是不允许编译通过的)
    断言变量: A!.B 断言A一定不为空, 可以向下取B值
  ? 可选参数: { x?: number }
    无法确定是否为空: A?.B (对于一个可能未空的属性进行断言,确保可以运行通过)
  ?? 三目运算: a.b ?? [] --> a.b ? a.b : []
```

TypeScript 混入、类型推断、交叉类型、联合类型、声明合并、类型兼容性
https://www.jianshu.com/p/e354de8a7ade
