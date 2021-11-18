## ES6 中的箭头函数

es6 中的箭头函数 () => {}
箭头函数没有自己的:this, arguments, super/new.target(值为:构造函数或者 undefined)

- 它的 this 和 arguments 都是在封装的时候,绑定外层的 this 和 arguments(父级的 this,arguments);
- 如果想使用参数,必须使用剩余参数表示法(枚举展示) (...params) => {}
- 箭头函数不能作为构造函数,所以在需要匿名的地方使用更好

# Array 新增 API

    1.Array.of(arg)
      将一些数据转化成一个新的数组
      Array.of(1,2,3,4,5) => [1,2,3,4,5]
    2. Array.from(arg)
      将类数组对象转化成一个新的数组
      let arrayLike = {0: 'tom',  1: '65', 'length': 2 }
      Array.from(arrayLike) => ['tom','65']
    3.find
      查询到对应的值
    4.findIndex
      查询到对应的序号
    5.includes
      判断数组中是否包含某个值
      类似 Object.is

# Object 新增 API

    1.Object.assign
      对象合并/深拷贝
      如果对象是简单类型(number string), 得到的新对象为深拷贝;
      如果对象是复杂类型(object array等引用那类型), 得到的新对象为浅拷贝;
    2.Object.keys()
      遍历所有的键, 返回一个新数组
    3.Object.values()
      遍历所有的值, 返回一个新数组
    4.Object.getOwnPropertyNames
      展示可枚举的属性, 以数组的形式进行排序并返回;
      * 打印所有的键
    5.Object.setPrototypeOf
      设置对象的隐式原型
      Object.setPrototypeOf(obj1 ,obj2) --> obj1.__proto__ == obj2;

# Set Map Symbol

    如何遍历?
    Set/Map 可以通过 for...of / forEach 的方式进行遍历
    Symbol 使用 for...in 的方式进行遍历

# 遍历的方法

    ES5:  forEach、every 、some、 filter、map、reduce、reduceRight
    ES6:  find、findIndex、keys、values、entries

    forEach: 无法停止循环, 返回值就是undefined, 在原数组上进行操作
    every: 判断所有元素是否都符合条件
    some: 判断是否有符合条件的元素
    filter: 过滤元素, 返回一个满足过滤条件的数组
    map: 遍历元素, 返回一个新数组
    reduce: 累加器, 从做向右 [旧值, 当前值, 数组, 回调]
    reduceRight: 累加器, 从右向左
    find: 查询元素
    findIndex: 查询序号
    keys: 遍历键, 返回一个新数组
    values: 遍历值, 返回一个新数组
    entries: 遍历键值对, 返回一个新数组

    for in 遍历键
    for of 遍历值; 也可以使用 解构的方式, 对键值对进行遍历
        for (var [key, value] of phoneBookMap) {
          console.log(key + "'s phone number is: " + value);
        }

# 对字符串的操作

# 对数组的操作
