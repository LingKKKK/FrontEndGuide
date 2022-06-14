## 观察者 vs 发布者-订阅者
《Head first设计模式》中说: Publishers + Subscribers = Observer Pattern;
即: 发布者 + 订阅者 = 观察者模式; 但是他们略有不同;

#### 观察者模式（Observer pattern）
- 观察者模式：观察者（Observer）直接订阅（Subscribe）主题（Subject）,而当主题被激活的时候,会触发（Fire Event）观察者里的事件。
- 松耦合
```shell
    Observer  →→→ subscriber →→→ Subject
     (观察者)   ←←← 触发事件  ←←←  (目标)
    # 直接交互. 主动触发
    # addEventListener就是一个js中常用的观察者
```

#### 发布订阅模式（Publish–subscribe pattern）
- 订阅者（Subscriber）把自己想订阅的事件注册（Subscribe）到调度中心（Event Channel）,当发布者（Publisher）发布该事件（Publish Event）到调度中心,也就是该事件触发时,由调度中心统一调度（Fire Event）订阅者注册到调度中心的处理代码。
- 也就是说,发布订阅模式里,发布者和订阅者,不是松耦合,而是完全解耦的。

```shell
    Producer  →→→  发布消息   →→→     Broker     ←←←     订阅     ←←←   Consumer
  (生产商/发布者)                 (经纪人/调度中心)  →→→  触发事件  →→→  (消费者/订阅者)
  # 不直接交互, 通过"调度中心"进行通信
```

#### 对比
[参考](https://segmentfault.com/a/1190000019260857)
- 结构
  - 观察者有两个角色: 观察者 + 被观察者
  - 发布订阅者有三个角色: 发布者 + 订阅者 + 调度中心/经纪人
- 关系
  - 观察者: 松耦合关系
  - 发布订阅者: 完全不存在耦合关系
- 应用场景
  - 观察者用于应用内部
  - 发布订阅者是跨应用的模式(中间件)

## 实现
#### Observer pattern
包含的模块: 被观察者(目标) 观察者
```js
    /**
     * 观察者要观察的目标对象(Subject)
     * 需要在目标对象中, 预留一些事件供观察者调用
     */
    function Subject() {
      this.observerList = []; // 观察者列表
      this.registerObserver = function(ob) { // 订阅目标事件
        this.observerList.push(ob);
      }
      this.unRegisterObserver = function(ob) { // 取消订阅
        this.observerList.remove(ob);
      }
      this.notifyAllObserver = function() { // 变更通知
        let obList = this.observerList;
        for (var observer of this.observerList) {
          observer.update();
        }
      }
    }
    /**
     * 观察者(Observer)
     */
    function Observer(name, subject) {
      this.name = name;
      this.subject = subject;
      this.subject.registerObserver(this); // 观察者 >> 开始订阅
      // this.subject.unRegisterObserver(this); // 观察者 >> 取消订阅
      this.update = function() {
        // TODO: >>> callback()
        console.log(`${this.name} 收到更新提示`);
      }
    }
    /**
     * 应用(Observer)
     * Vue中的数据劫持, 也是观察者的实现; get/set都会监听到
     */
    var subject = new Subject();
    var Observer1 = new Observer("Observer1", subject);
    var Observer2 = new Observer("Observer2", subject);
    subject.notifyAllObserver(); // 模拟通知变化
```
#### Publisher-Subscribe pattern
包含的模块: 订阅者 发布者 调度中心
```js
    /**
     * 创建调度中心 Broker
     * 实现基本的发布-订阅的功能
     */
    class Broker {
      constructor () {};
      handlers = {}; // 定义一个容器(handlers), 用来装事件的数组, 因为订阅者的数量没有限制
      addEventListener (type, handle) { // 添加绑定
        if (!this.handlers[type] || this.handlers[type].length == 0) {
          this.handlers[type] = []
        }
        this.handlers[type].push(handle);
      }
      removeEventListener (type, handle) { // 解除绑定
        if (!this.handlers[type] || this.handlers[type].length == 0) {
          return new Error("未注册该事件");
        }
        if (!handle) {
          delete this.handlers[type]; // 移除所有事件
        } else {
          let index = this.handlers[type].findIndex(e => e === handle);
          if (!index) return new Error("未注册该事件");
          this.handlers[type].splice(index, 1);
          if (!this.handlers[type].length) delete this.handlers[type]; // 移除单个事件
        }
      }
      dispatchEvent(type, ...params) { // 触发事件
        if (!this.handlers[type] || this.handlers[type].length == 0) {
          return new Error("未注册该事件");
        }
        this.handlers[type].forEach(handler => {
          handler(...params);
        })
      }
    }
    /**
     * 应用场景
     */
    var broker = new Broker() // 实例化调度中心

    function load (params) {
      console.log('load', params)
    }
    function load2 (params) {
      console.log('load2', params)
    }
    broker.addEventListener('load', load) // 订阅
    broker.addEventListener('load', load2) // 订阅

    // 当发布者变化消息时, 触发调度中心的 dispatchEvent 方法, 通知订阅者
    broker.dispatchEvent('load', 'load事件触发') // 触发
    broker.removeEventListener('load', load2) // 移除
    broker.removeEventListener('load') // 移除
```

## 思考: Vue中使用的是 Observer 还是 Publish-subscriber
场景
- 视图更新 ▶️ 驱动 ▶️ 模型更新
  - Publish-subscriber模式; 视图作为发布者, 模型作为订阅者
  - eventTarget.addEventListener('eventType', callback) callback是模型更新的回调
- 模型更新 ◀️ 驱动 ◀️ 视图更新
  - 模型作为观察者, 视图作为目标对象(被观察者);
  - 视图维护模型的观察列表, 当视图更新时, 通知模型进行变更;
  - Vue使用Dep来管理观察者列表
  - 内部解耦为Observer和Dep, 然后通过Watcher相联系;

Dep的作用
- 收集依赖（观察者）
  - 收集依赖是在 getter 函数中完成的
  - 当模型属性被访问的时候,代表观察者关心属性的变化,通过 getter 将依赖（观察者）加入 Dep
- 通知更新
  - 通知更新是在 setter 函数中完成的,
  - 当模型属性改变的时候,遍历所有 Dep 中的依赖（观察者）,并调用观察者的 update 方法通知视图更新

[Vue响应式原理-理解Observer、Dep、Watcher (juejin.cn)](https://juejin.cn/post/6844903858850758670)

所以Vue中, 使用是混合的模式, 并非单纯地使用其中一种;

[作者：贺师俊](https://www.zhihu.com/question/419154194/answer/1451429671)

"设计模式"都是针对OO(object oriented)的, 所以很难适用于响应式编程的规范;
设计模式规范 !== 响应式编程规范  >>> 设计模式无关乎语言,编程范式关乎语言,对语言有要求。

Q: Vue到底使用了哪种设计模式
A: observer和publish-subscriber都被Vue借鉴了;
   设计模式 !== 代码实现

数据绑定不必太过关心其过程, 无所谓观察者模式还是发布订阅模式, 数据绑定可以任意使用两者其一;
有区别的地方就是: 订阅发布解耦, 观察者松耦;
官方对数据的绑定和流向称之为: "反应式系统"或"响应式系统" (Reactivity System);
设计模式重点在思想而非实现, Vue的响应式和传统的设计模式都有区别; 单不完全适用(有特征, 但是不吻合);
Vue既可以找到Observer的特征: 视图流向模型; 也可以找到发布订阅的特征: 模型流向视图;
e.g. 数据劫持是observer的实现, computed也是一个惰性观察者;


如果一定要做区分,那么就是,发布订阅模式中发布者和订阅者是解耦的。数据绑定这个具体场景本身并不必然要求解耦,但解耦可能有好处（比如性能）。然后具体到Vue的实现原理（尤其是Vue3）。Vue对其数据绑定的底层实现的官方称谓是反应式系统（Reactivity System）。此系统其实和经典的观察者模式或发布订阅模式相当不同。无论用哪个模式来比较都有很多关键特征不吻合。相比较而言,Rx或许更接近观察者模式或发布订阅模式,但严格说来也都不是。因为Rx的重点是流的处理和变换。一定要说的话,算是一个糅合了传统观察者模式或发布订阅模式的新模式。Vue的反应式系统也是类似的,只不过缺少像Rx那样普遍的跨语言实现,因此还难以成为一个普适的「模式」。部分原因可能是大部分语言并没有类似JS的Proxy机制,即使有也相当不同,所以移植起来不容易,但长期看来是有可能的。另外,Rx或Vue反应式系统的这种「模式」实际上已经脱离了「设计模式」的定义（针对特定问题的通用解法）,而更接近编程范式了。
