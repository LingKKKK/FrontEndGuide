# catch then

    Q: catch捕获到异常之后, 是否继续执行后面的then?
    A: 1. 捕获到catch, 执行完catch之后, 会继续执行then
       2, 如果 throw Error() 或者 Promise.reject() 就不会继续向下执行了

# Async/Await

    1. 对Promise的写法进行了优化, 写法更为简洁, 避免then catch 过多
    2. 必须配对使用, 否则会报错, 类似koa中的洋葱模型

```JavaScript
  function* _generator() {
    console.log(yield Promise.resolve(1)); // 1
    console.log(yield Promise.resolve(2)); // 2
    console.log(yield Promise.resolve(3)); // 3
  }
  function run(myGenerator) {
    var g = gen();
    function step(val) {  //封装一个方法, 递归执行next()
      var res = g.next(val)  //获取迭代器对象，并返回resolve的值
      if (res.done) return res.value; //递归终止条件
      res.value.then(val => {  //Promise的then方法是实现自动迭代的前提
        step(val)   //等待Promise完成就自动执行下一个next，并传入resolve的值
      })
    }
    step(); //第一次执行
  }
```


[循环中使用](https://www.it1352.com/2622156.html)
