[参考](https://zhuanlan.zhihu.com/p/432726048)

# MessageChannel
MessageChannel允许我们再不同的浏览上下文中,建立通信管道,并通过两端的端口(port1,port2)发送消息.
MessageChannel以DOM Event的形式发送消息,属于宏任务.

# 基本用法
```js onmessage 写法
  const { port1, port2 } = new MessageChannel();
  port1.onmessage = function (event) {
    console.log('收到来自port2的消息：', event.data); // 收到来自port2的消息： pong
  };
  port2.onmessage = function (event) {
    console.log('收到来自port1的消息：', event.data); // 收到来自port1的消息： ping
    port2.postMessage('pong');
  };
  port1.postMessage('ping');
```
```js addEventListener 写法
  const { port1, port2 } = new MessageChannel();
  port1.addEventListener('message', function (event) {
    console.log('收到来自port2的消息：', event.data); // 收到来自port2的消息： pong
  });
  port1.start();
  port2.addEventListener('message', function (event) {
    console.log('收到来自port1的消息：', event.data); // 收到来自port1的消息： ping
    port2.postMessage('pong');
  });
  port2.start();
  port1.postMessage('ping');
```
管道默认是关闭的状态,需要使用start来触发一下
*onmessage*隐式调用了start方法
*addEventListener*方法监听之前,需要调用start方法来触发

port1 和 port2 都是*MessagePort*
*close* 用于断开message连接
*onmessageerror* 用于异常(消息不能反序列化)时触发

# 使用场景

**EventEmitter**
MessageChannel可以作为简单的EventEmitter做事件的订阅发布,来实现不同脚本之间的交互.
```js
  // a.js
  export default function a(port) {
    port.postMessage({ from: 'a', message: 'ping' });
  }
  // b.js
  export default function b(port) {
    port.onmessage = (e) => {
      console.log(e.data); // {from: 'a', message: 'ping'}
    };
  }
  // index.js
  import a from './a.js';
  import b from './b.js';
  const { port1, port2 } = new MessageChannel();
  b(port2);
  a(port1);
```

**iframe**
window与单个iframe和多个iframe之间的通信可以使用MessageChannel,只暴露有限的能力从而保证了安全性.
当iframe和服务端的通信要从原来的XHR改造成websocket,但是MessageChannel的通信方式不需要改动.

**webworker**
```js webworker进程和主进程的通信方式
  // worker1.js
  self.onmessage = function (e) {
    console.log('receive a message from main window', e.data); // { command: 'connect' }
    if (e.data.command === 'connect') {
      self.postMessage({ message: 'connected' });
    }
  };
  // index.js
  const worker1 = new Worker('worker1.js');
  worker1.postMessage({ command: 'connect' });
  worker1.onmessage = function (e) {
    console.log('receive a message from worker1', e.data); // { message: 'connected' }
  };
```
此时,如果想要增加一个webworker(worker2),想让worker1和worker2进行通信,比较粗暴的方式就是以主进程为桥梁.
*思考一下, 微前端是不是也需要规避这样的坑*
worker1和worker2的消息,都需要通过主线程转发给对方.
另一个思路就是:*通过MessageChannel实现两个worker的通信*
worker的postMessage方法,接受一个`Transferable Objects`组成的数组作为参数,而MessageChannel导出的MessagePort就是`Transferable Objects`格式的.
这样一来,在主进程就监听不到这两个worker的消息了,利用MessageChannel直接进行通信.
```js MessageChannel优化worker通信
// worker1.js
let port1;
self.onmessage = function (event) { // 监听来自主线程的消息
  switch (event.data.command) {
    case 'connect':
      port1 = event.ports[0]; // MessageChannel的port1
      port1.onmessage = function (event) { // 监听来自port2的消息
        console.log('worker1收到来自worker2的消息: ', event.data); // pong
      };
      break;
    case 'forward':
      port1.postMessage(event.data.message); // 消息转发给port2
      break;
    default:
      console.log('worker1收到来自主线程的消息：', event.data);
  }
};
// worker2.js
let port2;
self.onmessage = function (event) { // 监听来自主线程的消息
  switch (event.data.command) {
    case 'connect':
      port2 = event.ports[0]; // MessageChannel的port2
      port2.onmessage = function (event) { // 监听来自port1的消息
        console.log('worker2收到来自worker1的消息: ', event.data); // ping
      };
      port2.postMessage('pong'); // 消息转发给port1
      break;
    case 'forward':
      port2.postMessage(event.data.message); // 消息转发给port1
      break;
    default:
      console.log('worker2收到来自主线程的消息：', event.data);
  }
};
// index.js
const { port1, port2 } = new MessageChannel();
const worker1 = new Worker('worker1.js');
const worker2 = new Worker('worker2.js');

port1.onmessage = function (e) {
  console.log('port1在主线程收到消息：', e.data); // 不会打印
};

// 向worker1发送connect的信息
worker1.postMessage(
  {
    command: 'connect',
  },
  [port1]
);

// 向worker2发送connect的信息
worker2.postMessage(
  {
    command: 'connect',
  },
  [port2]
);

// 向worker1发送forward的消息
worker1.postMessage({
  command: 'forward',
  message: 'ping',
});
```

**在Vue中使用**
处理nextTick的时候, MessageChannel >>> setImmediate >>> setTimeout

**在React中使用**
在请求一帧渲染的时候, 使用到的 MessageChannel
