# postmate vs postMessage

postMessage解决了通信的问题, 但是postMessage只管发起通知,能否成功接收到通知就不再考虑了
这样的方案和广播/异步事件类似, 只管发不管接受.
对于部分需要返回值的场景不太友好,对于通信的质量也无法把控.

# postmate

[参考](https://juejin.cn/post/6895502625970585607)
基于Promise的postmessage库.允许父页面以最小的成本和子页面进行交互
**特性**
  - 基于Promise的API,实现更为优雅
  - 使用消息验证来保护双方的通信安全
  - 子对象可派发父对象监听的事件
  - 父对象可以调用子对象中的函数
  - 零依赖(promise和polyfill)
  - 轻量(1.6k)

TCP建立连接,需要三次握手.同样当父页面与子页面进行通信时,postMate也是通过握手来保证正常通信的.
postmate的通信是基于postMessage建立的.

**握手的意义** 用于达成参数,如信息传输率,字母表,奇偶校验,中断过程,以及其他特性.
1. 父页面通过postMessage发送handshake消息给子页面
2. 子页面通过postMessage发送handshake-reply消息给父页面

握手是由父页面发起的,要发起握手信息,需要先创建postmate对象:
```js 父页面创建postmate对象
const postmate = new Postmate({
  container: document.getElementById('some-div'), // 子iframe的容器
  url: 'http://child.com/page.html', // 包含postmate.js的iframe子页面地址
  name: 'my-iframe-name' // 用于设置iframe元素的name属性
});
// 在这个对象中,会触发`this.sendHandshakeReply`方法,开始握手
```
*父页面先注册, 等子页面加载完毕, 发送handshake请求握手, 子页面收到请求后, 发起handshake-reply返回给父页面消息*
