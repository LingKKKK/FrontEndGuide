# 定义类型 type interface

    type可以声明基本类型, 联合类型, 元组的别名; interface不行
    type语句中,可以使用 typeof 获取实例类型; interface不支持
    type支持类型映射; interface不支持
    type不支持合并声明; interface支持

# 定义函数

    let add:(x: number, y: number) => number

# 泛型

    function identity<T>(arg: T): T {
      return arg;
    }

# as 和 ? !

    as 断言他的类型
    ! 确定存在
    ? 不确定是否存在

# 基础类型

    定义最简单的数据单元：数字、字符串、结构体、布尔值等
    boolean、number、string、null、undefined
    number[]、Array<number> 定义内容为number的数组结构
    数组：数组合并了“相同类型”的对象
    元组：元组合并了“不同类型”的对象
    void：无任何返回值
    任意值：any，在any上访问任何属性都是允许的，也允许调用任何方法；且所有的返回值都是any
          如果声明变量的时候未指定类型，默认是any类型。
    联合类型：取值为多种类型中的一种。使用分隔符"|"将类型隔开。
    接口：Interfaces，用来定义对象的类型。接口的首字母一般都是大写的；

```ts
    let bool: boolean = true;
    let tuple: [string, number] = ["aa", 11];
    let anyThing: any = "hello";
    let a = "string"; // a 是string类型
    let a; a = "string"; // a 是any类型
    let bbb: string | number; bbb = "seven"; bbb = 7;
    // 定义了基本的类型，必须按照接口定义好的数据声明；
    interface Person { name: string; age: number; }
    // 定义了任意属性和可选属性，name必须存在，age可以存在，其他的不确定元素必须都是字符串
    interface Person {
      name: string;
      age?: number;
      [propName: string]: string;
    }
```

# 数组的类型
    1.「类型 + 方括号」表示法
      let fibonacci: number[] = [1, 1, 2, 3, 5];
      不允许出现其他类型，在设定的时候，会对类型加以约束
    2. 数组泛型： Array<elemType>
      let fibonacci: Array<number> = [1, 1, 2, 3, 5];
    3. 用接口表示
```ts
      interface NumberArray {
        [index: number]: number;
      }
      let fibonacci: NumberArray = [1, 1, 2, 3, 5];
```
    4. 类数组
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

# 函数的类型
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
    let mySum: (x: number, y: number) => number = function (x: number, y: number): number {
      return x + y;
    };
    // 使用接口来定义函数的形状
    interface SearchFunc {
      (source: string, subString: string): boolean;
    }
    let mySearch: SearchFunc;
    mySearch = function(source: string, subString: string) {
      return source.search(subString) !== -1;
    }
    // 需要对联合类型的输入和输出加以限制的时候，需要多次定义，这样函数就可以进行匹配
    function reverse(x: number): number; // 定义输入number，输出number
    function reverse(x: string): string; // 定义输入string，输出string
    function reverse(x: number | string): number | string | void {
        if (typeof x === 'number') {
            return Number(x.toString().split('').reverse().join(''));
        } else if (typeof x === 'string') {
            return x.split('').reverse().join('');
        }
    }
```

# 类型断言
    类型断言：用来手动指定一个值的类型 <类型>值
    * 使用断言类型来欺骗编辑器，避免了因为类型产生的报错
    * 断言只会影响编译的过程，在编译完毕之后，会将断言的内容删掉
    * 断言，不同于：类型转换、类型声明、泛型
```ts
    interface Cat { name: string; run(): void; }
    interface Fish { name: string; swim(): void; }
    function isFish(animal: Cat | Fish) {
        if (typeof (animal as Fish).swim === 'function') {
            return true;
        }
        return false;
    }
```
    ***
    1. 联合类型可以被断言成其中的一个类型
    2. 父类可以被断言成子类
    3. 任何类型都可以被断言成any
    4. any可以被断言成各种类型
    5. 如果让A断言成B，需要让A兼容B，或者B兼容A

# 声明文件 declare [dɪˈkleə(r)]

# type interface
    interface: 接口；对类的一部分进行抽象，也可以对「对象的形状」进行描述
      当定义对象结构时：
        定义的类型不能多也不能少。赋值的时候，变量必须和接口设定的形状保持一致。
        可以使用“？”来定义可选属性
        可以使用“[propName: string]: any;”来定义任意属性
        可以使用“readonly”来定义只读属性；「允许get，不允许set」
      当定义函数结构时：

