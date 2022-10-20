
"CommonJS模块规范"和"ES6模块规范"是两种完全不同的概念

# CommonJS模块规范
Node应用由模块组成,遵循CommomJS模块规范;
每个文件都是一个模块,有自己单独的作用域;在一个文件中的变量,函数,类都是私有的,对其他文件不可见.

CommonJS规定,每个模块内部,`module`变量代表当前模块.
这个变量是一个对象,它的`exports`属性(module.exports),是对外接口.
加载某个模块时,其实就是在加载`module.exports`属性.

```js
    var x = 5;
    var addX = function (value) {
    return value + x;
    };
    module.exports.x = x;
    module.exports.addX = addX;
```

`require`方法用于加载模块
```js
    var example = require('./example.js');
    console.log(example.x); // 5
    console.log(example.addX(1)); // 6
```

## exports 和 module.exports
优先使用`module.exports`
为了方便,Node为每个模块默认一个变量`exports`指向`module.exports`
其实就是相当于在每一行代码前面加上`var exports = module.exports`

如果将`exports`指向一个值,就会将其阻断,无法继续赋值

```js
    // a.js
    exports = function a() {};
    // b.js
    const a = require('./a.js') // a 是一个空对象
```

# ES6模块规范
ES6使用`export`和`import`来实现模块的导入和导出

```js
    var firstName = 'Michael';
    var lastName = 'Jackson';
    var year = 1958;
    export {firstName, lastName, year};
```
`export`是对外的接口,必须和模块内部的变量建立一一对应的关系
```js
    // 写法一
    export var m = 1;
    // 写法二
    var m = 1;
    export {m};
    // 写法三
    var n = 1;
    export {n as m};
```

## export default
`export default`是一个特殊的`export`,意味模块指定默认输出
一个文件只能有一个default, 引用的时候不需要使用`{}`
```js
    // export-default.js
    export default function () {
    console.log('foo');
    }
```
