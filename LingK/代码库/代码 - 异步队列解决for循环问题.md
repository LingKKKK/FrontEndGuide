## 大量的异步如何顺序执行

```javascript
// 大量的注册会存在调用栈溢出的问题, 注册了大量的异步事件, 会造成报错

// 输出5个5, for循环比较快, 在注册函数的时候, 已经输出到5, 且值会覆盖
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000)
}
// 使用let, let是块作用域, 注册事件时, 不会被覆盖
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000)
}
// 使用闭包
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);
    }, 1000)
  })(i)
}

// 利用尾递归, 解决调用栈溢出的问题
var i = 0;
var timer = null;
function print() {
  clearTimeout(timer);
  if (i < 5) {
    timer = setTimeout(() => {
      console.log(i);
      i++;
      print();
    }, 1000)
  }
}
print();

// Promise代替尾递归
const task = [];
const output = (i) => new Promise(resolve => {
  setTimeout(() => {
    cosnole.log(i);
    resolve();
  }, 1000)
}, e => {
  console.log(e);
})
for (var i = 0; i < 5; i++) {
  task.push(output(i));
}
Promise.all(task).then(() => {
  console.log('success!')
})

// 使用 Async/Await 中断
const sleep = timeoutMS => new Promise(resolve => {
  setTimeout(resolve, timeoutMS);
});
(async () => {
  for (var i = 0; i < 5; i++) {
    console.log('??? ', i);
    if (i > 0) {
      await sleep(1000);
    }
    console.log(i);
  }
})()
```
