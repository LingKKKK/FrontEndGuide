# WebWorker
js的语言采用的是单线程模型,所有的任务只能在同一个线程上执行.
随着计算机能力的增强,多核CPU的出现,单线程会造成阻碍,无法彻底发挥计算机的计算能力.
**在HTML5的规范中,提出了一个多线程的解决方案: Web-Worker**
Web-worker允许js*创造多线程环境*,允许*主线程*创建*worker线程*,将任务分配在后台运行.
这样高延迟,密集的任务可以由*worker*线程负担,主线程负责UI交互就会很流程,不会阻塞或者拖延.
## 如何使用WebWorker?
- 在主线程中,使用*new*命令调用*Worker()*构造函数创建一个*worker线程*
  - `var worker = new Worker('xxx.js')`
  - Worker构造函数接收参数为脚本文件路径
- 主线程指定监听函数,来监听Worker线程的返回消息
  - `worker.onmessage = function(event){console.log(event.data)}`
  - data为Worker发来的数据
- 由于主线程和worker线程存在通信限制,不在同一个上下文中,所以只能通过消息完成
  - worker.postMessage('hello world')
  - worker.postMessage({action: "ajax", url: "xxxxx", method: "post"})
- 当使用完毕之后,如果不再需要使用,可以在主线程中关闭worker
  - worker.terminate()
  - worker也可以关闭自身,在worker脚本中执行`self.close()`
- 错误的监听
  ```js
    worker.onerror(function (evet) {})
  ```
## 数据通信
  主线程与worker之间的通信是深拷贝的方式进行.所以对通信数据的修改并不会影响任何进程.
  事实上,浏览器内部运行机制是,现将通信内容串行化,然后把字符串发送给worker,再将其进行还原.
  *拷贝数据传输会造成性能问题*
  如果主线程向worker发送几百M几个G的数据,默认情况下,浏览器会生成一份拷贝,十分影响性能.
  *js允许主进程将二进制数据,直接转移给worker*
  转交控制权后,主线程就不能再使用这些数据,这也是为了防止多个线程同时进行修改.
## 应用场景
  *心跳检测*
  前端会定期的检测后端服务的可用性,一般情况下,都是用过开启定时轮询发送ajax检测,这就占用了主线程资源.
  可以放在worker中进行处理,等到出现异常再通知主线程渲染UI.
## 比较
  - 优点
    - 独立于主线程,不造成阻塞
    - 非常适合处理高频、高延时的任务
    - 可以内部做队列机制,做为延时任务的缓冲层
  - 缺点
    - 无法操作DOM,无法获取window, document, parent等对象
    - 遵守同源限制, Worker线程的脚本文件，必须于主线程同源。并且加载脚本文件是阻塞的
    - 不当的操作或者疏忽容易引起性能问题

```js 示例
  // 主线程 main.js
  var worker = new Worker("worker.js");
  worker.onmessage = function(event){
      // 主线程收到子线程的消息
  };
  // 主线程向子线程发送消息
  worker.postMessage({
      type: "start",
      value: 12345
  });

  // web worker.js
  onmessage = function(event){
    // 收到
  };
  postMessage({
      type: "debug",
      message: "Starting processing..."
  });
```

是通常目的是让我们减轻主线程中的密集处理工作的脚本。

# service Worker
浏览器和网络间的代理。通过拦截文档中发出的请求，service worker 可以直接请求缓存中的数据，达到离线运行的目的。
[参考](https://blog.csdn.net/web_zhouliang/article/details/109292807)
可以实现请求拦截,懒加载页面.

# Worklets
Worklet 是浏览器渲染流中的钩子，可以让我们有浏览器渲染线程中底层的权限，比如样式和布局。

[参考](https://juejin.cn/post/6906714992071213064)
# 困在笼中的 webWorker
*webworker的边界限制*
1.同源限制
2.DOM和BOM限制
3.通信限制(UI线程和WebWorker线程必须通过消息机制进行通信)

# 作用
解决页面阻塞的问题;
1.利用WebWorker解决线程的问题
2.利用serviceWorker来解决请求的问题
深拷贝
传递的值就是深拷贝的结果,比deepClone和JSON.parse(JSON.stringify(xxx))更可靠
