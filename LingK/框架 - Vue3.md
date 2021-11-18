# Vue3.0 和 Vue2.0 对比

    对数组的监听:
      Vue2中,必须传入对应的key才能够进行数据拦截, 但是数组Array没有key,所以无法监听
      Vue3中传入data即可监听数组内的变化;

```JavaScript
  // Vue2
  Object.defineProperty(data, 'count', {
    get() {},
    set() {}
  })
  // Vue3
  new Proxy(data, {
    get() {},
    set() {}
  })
```

# Vue3.0 新增的内容
    1. Vue升级的内容
      使用ts重构部分代码
      性能提升, 代码量减少
      调整了部分api
    2. 优化Object.defineProperty的缺点
      深度监听需要进行一次递归deep来控制
      无法监听新增和删除的属性 [Vue.$set Vue.$delete]
      无法原生对数组进行监听, 需要重构
    3. 对一些 api 进行了更新
      eg. v-model value/input 这边redircte进行了修改

参考文档: [https://www.jianshu.com/p/65c679b15a42]

# _ $ 开头的内容, 不会被 Vue 实例代理, 不会受用户操作影响
    _update: 更新方法
    _ob_: observer 实例对象

# Vue 实例化一个对象的过程
    1.新创建一个实例后, Vue 调用 compile 将 el 转换成 vnode.
    2.调用 initState, 创建 props,data 的钩子以及其对象成员的 Observer(添加 getter 和 setter).
    3.执行 mount 挂载, 在挂载时建立一个直接对应 render 的 Watcher, 并编译模板生成 render 函数.
    4.执行 vm.update 来更新 DOM.
    5.每当数据发生改变时, 都将通知响应的 watcher 执行回调函数, 驱动视图的更新.
      - 给对象的某个属性赋值时, 会触发 set 方法
      - set 函数调用, 触发 Dep 的 notify(), 向对应的 watcher 通知变化
      - watcher 会调用 update 方法, 从而达到视图的更新

    关键的节点: Object.defineProperty、Observer、Dep(notify)、new Vue()、Compile、Watcher、_update

# Vue 实例化对象的流程
    Object.defineProperty →→→→→→→→→→
                                    ↓
                          劫持个属性的 getter setter
                                    ↓
                 →→→→→→→→→→→→→→  Observer →→→→→→→ 消息通知 →→→→→→→→ Dep  →→→→→→→→→→
                ↑                                              Dep.target()       ↓
           触发 set 方法                                            ↑       notify()变化通知
                ↑                                              添加订阅者           ↓
                ↑                                                  ↑              ↓
            new Vue()                            →→→→→→→→→→→→→→→→→→ <-------->  Watcher
                ↓                                ↑       订阅数据变化               ↓
                →→→→触发解析指令→→→→→→ Compile →→→→→→→→→→→  _update ←←←←← 更新视图 ←←←
                                                 ↑
                                        initState 视图初始化

    在 VM 运行的过程中: [响应式的构建 → VM 就是 M 和 V 之间通信的桥梁]
      1. Observer 是用来给数据添加 Dep 依赖的
      2. Dep 是 data 每个对象包括子对象都绑定的一个方法;
         - 在绑定的数据有更新的时候, 通过 dep.notify()告知 Watcher
      3. Compile 是 HTML 指令解析器, 对每个节点进行扫码和解析, 替换模板语法, 绑定更新函数
      4. Watcher 是连接 Compile 和 Observer 的桥梁;
         Compile 指令会创建对应的 Watcher 并绑定 _update 方法, 添加一个新的 Dep 对象;

                            ↗→→→→  watcher1 → directive
      Data →→→→→→→→→→ Dep   →→→→→  watcher2 → directive
                            ↘→→→→  watcher3 → directive

    ** Observer: 观察者, 建立响应式;

# Vue 依赖收集的过程
    1._init初始化,调用initState(),这个方法主要对props,methods,data,computed,watcher进行初始化.
    2.initData数据初始化,调用observer方法,遍历data判断是否绑定_ob_对象,有就返回,否则调用new Observer(data).
    3.observer()方法触发,遍历所有子元素触发 defineReactive() 注册订阅器 new Dep().
    4.所有的属性通过 Object.defineProperty(). get:依赖收集, set:派发更新.

    _init →→→ initData →→→ Observer →→→ Dep →→→ Object.defineProperty →→→ set/get

# Vue 派发更新的过程
    基于 Observer 绑定的数据依赖关系.
    改变值 →→→ 调用set方法 →→→ 对新值进行 observer() →→→ dep.notify()   <<< dep.notify()就是派发更新 >>>
    调用 dep.notify() 之后, 触发 Watcher.run(), 再触发 _update().
    _update: 调用 queueWatcher() 将 watcher 推送到 queue 中, 再依次执行.

# Vue 订阅器(管理订阅者) Dep
    defineReactive() 中会 new Dep(). 这里面就是一些属性和方法, target notify 等方法.
    (dep 中有添加, 移除, 触发的api)
    当全局的 Watcher 被计算时, 其子 watcher 也会被计算, 从而触发更新 notify

# Vue 订阅者 watcher
    ## watcher 实例化的过程
    ## 派发更新的过程
