# JS的运行机制
js的执行是单线程的, 基于事件循环(event-loop).
事件大致分为以下步骤:
  ① 所有的同步任务都是在主线程上执行, 形成一个`执行栈`(stack)
  ② 主线程外, 还存在一个`任务队列`(task-queue),只要异步任务有了运行动作,就在`任务队列`之中放置一个事件
  ③ 一旦`执行栈`中所有同步任务执行完毕, 系统就会读取`任务队列`中的事件, 并且执行它们
  ... 主线程不断重复上面的过程, 直到`任务队列`中没有事件

事件循环:
  主线程的执行过程就是一个 tick，而所有的异步结果都是通过 “任务队列” 来调度。
  消息队列中存放的是一个个的任务（task）。
  规范中规定 task 分为两大类，分别是 macro task 和 micro task，并且每个 macro task 结束后，都要清空所有的 micro task。
  1. 先执行宏观任务，再执行微观任务，宏任务和微任务放置在不同的 event 队列中
  2. 同步任务进入主进程，异步进入 event 队列中，会注册函数，并将回调函数放在队列中
      「同步和异步是不同的 event 队列」
  3. 同步任务执行完毕后，从 event 队列中读取时间放在主进程中执行，回调函数可能还包含不同的任务
  4. 事件循环的过程，就是执行各种同步和异步的回调函数的过程
  * 重复上面的过程，所有的时间都会在这个循环内执行；
  * 一次循环: 执行任务, 删除任务, 继续向下执行


```js
  // task中的执行顺序
  for (macroTask of macroTaskQueue) {
    // 1. Handle current MACRO-TASK
    handleMacroTask();
    // 2. Handle all MICRO-TASK
    for (microTask of microTaskQueue) {
        handleMicroTask(microTask);
    }
  }
  // 在浏览器环境中，常见的 macro task 有 setTimeout、MessageChannel、postMessage、setImmediate；
  // 常见的 micro task 有 MutationObsever 和 Promise.then。
```

# nextTick
`Vue.nextTick`在文件`src/core/util/next-tick.js`中进行维护

```js
  import { noop } from 'shared/util'
  import { handleError } from './error'
  import { isIOS, isNative } from './env'

  const callbacks = []
  let pending = false
  /**
   * flush callbacks -> 执行回调函数
   */
  function flushCallbacks () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  /**
   * ~ async deferring wrappers
   * 异步延时包装器: 同时使用宏任务和微任务.
   * 在低于2.4的版本中,大量的使用到了微任务,但是微任务的优先级太高(应该介于两者之间, 例如连续事件(e.g. #4521, #6690)或者在同一事件中的冒泡事件(#6566))
   * 在特殊的场景中,使用宏任务处理更合适,例如`v-on`; 参考：#6813 在重回之前发生数据变更,在过渡中输出内容
   * ! 为了降低部分场景的nextTick优先级,默认使用微任务,部分场景使用宏任务
   */
  let microTimerFunc // 对应microTask
  let macroTimerFunc // 对应macroTask
  let useMacroTask = false // 是否使用宏任务

  /**
   * @宏任务执行方案
   * 思路:
   * ① setImmediate是最好的选择,但是只有IE支持.
   * ② 唯一一个始终在DOM事件之后排队的是polyfill, 它在同一循环中是通过MessageChannel触发
   * 方法:
   * 优先判断是否支持原生的 setImmediate 方法; 此方法支持高版本IE和低版本Edge
   * 在判断是否支持原生的 MessageChannel 方法; 此方法支持除了安卓QQ百度欧朋以外的所有高版本浏览器
   * 最后使用 setTimeout 方法兜底,
   */
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // setImmediate 中断操作并执行回调, 支持IE10+
    macroTimerFunc = () => {
      // 将回调函数放置在同步队列中
      setImmediate(flushCallbacks)
    }
  } else if (typeof MessageChannel !== 'undefined' && (
    isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]'
  )) {
    /**
     * MessageChannel: 异步通信API,兼容性较好
     * @作用 创建一个通信通道,通道的每一个端口都可以使用 postMessage 方法向另一个端口发送消息
     */
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = flushCallbacks
    macroTimerFunc = () => {
      port.postMessage(1)
    }
  } else {
    /* istanbul ignore next */
    macroTimerFunc = () => {
      setTimeout(flushCallbacks, 0)
    }
  }

  /**
   * @微任务执行方案
   * 判断是否支持Promise,如果支持Promise,则使用Promise的then方法,否则使用setTimeout
   */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve()
    microTimerFunc = () => {
      p.then(flushCallbacks)
      /**
       * 在网络视图中, Promise.then 不会被彻底阻断,但是会被推入到微任务队列中等待执行.
       * 可以通过 force MicroTask 来强制执行微任务
       */
      if (isIOS) setTimeout(noop)
    }
  } else {
    // fallback to macro
    microTimerFunc = macroTimerFunc
  }

  /**
   * 任何代码都会触发一个函数的状态变更, 都将使用宏任务
   */
  export function withMacroTask (fn: Function): Function {
    return fn._withTask || (fn._withTask = function () {
      useMacroTask = true
      const res = fn.apply(null, arguments)
      useMacroTask = false
      return res
    })
  }

  export function nextTick (cb?: Function, ctx?: Object) {
    let _resolve
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx)
        } catch (e) {
          handleError(e, ctx, 'nextTick')
        }
      } else if (_resolve) {
        _resolve(ctx)
      }
    })
    if (!pending) {
      pending = true
      if (useMacroTask) {
        macroTimerFunc()
      } else {
        microTimerFunc()
      }
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(resolve => {
        _resolve = resolve
      })
    }
  }
```
对外暴露了两个方法: `withMacroTask`, `nextTick`
## nextTick
  ① 将传入的回调函数放在`callbacks数组`中
  ② 根据`useMacroTask`的值来判断执行`宏任务`还是`微任务`
  ③ 当`nextTick`不传入参数的时候,会执行Promise.then的调用`nextTick().then(() => {})`
## withMacroTask
  对函数做了一层包装,对useMacroTask进行修改.
  在特定的场景中使用宏任务, 默认使用微任务

nextTick实现了Dom的异步更新渲染
主要解决了数据修改完毕,DOM还未更新的问题 -> 更新完数据,DOM不会立即挂载到页面上

## 场景分析
点击获取元素的宽度
  ```html
  <div id="app">
    <p ref="myWidth" v-if="showMe">{{ message }}</p>
    <button @click="getMyWidth">获取p元素宽度</button>
  </div>
  ```
  ```js
  getMyWidth() {
    this.showMe = true;
    //this.message = this.$refs.myWidth.offsetWidth;
    //报错 TypeError: this.$refs.myWidth is undefined
    this.$nextTick(()=>{
      //dom元素更新后执行，此时能拿到p元素的属性
      this.message = this.$refs.myWidth.offsetWidth;
    })
  }
  ```

## 执行过程
  `vm.message = changed`
  console.log(vm.$el.message) // undefined 得不到结果, 因为此时的DOM还没有更新
  ----DOM更新----
  nextTick的回调会执行到这里, 所以nextTick回调是微任务,等待DOM渲染完毕执行
  console.log(vm.$el.message) // changed 此时的DOM已经更新完毕,可以获取到值
  ----DOM渲染----
  console.log(vm.$el.message) // changed 此时的DOM已经渲染完毕,可以获取到值

### 如何证明DOM的渲染也是异步的过程?
  当我们更新data中的数据的时候,第二次的赋值会覆盖第一次的赋值;
  数据值更新到DOM重新渲染是异步的过程,发生在下一个tick中. 这个就像我们通过接口获取数据,然后通过数据渲染DOM. 内部也是通过nextTick来实现的.

  ```js
    getData(res).then(()=>{
      this.xxx = res.data
      this.$nextTick(() => {
        // 这里我们可以获取变化后的 DOM
      })
    })
  ```


