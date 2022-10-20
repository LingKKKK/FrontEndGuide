# 定义
  官方文档: Vue通过`watch`提供了一个比较通用的方法, 来响应数据变化; 当数据变化时需要`执行异步操作`,或者开销比较大的操作使用`watch`比较合适

# watch工作原理
其本质是`user watcher`

一、初始化/挂载机制
  1. 先执行`initMixin(Vue)`方法,对数据进行初始化
  2. 调用`mergeOptions`方法,将child<自定义>和parent<实例>的options合并,挂载到vm上
  3. 调用`initState`方法,判断实例的computed属性是否存在,如果存在,调用`initWatch`方法进行初始化
  4. 在`initWatch`方法中,对`watch`做遍历,拿到每一个`handler`,因为Vue支持同一个`key`对应多个`handler`; 所以在Vue中,`handler`是一个数组,对其遍历调用`createWatcher`方法
  5. 在`createWatcher`方法中,首先对`handler`类型做判断<isObj?>,拿到他最终的回调函数,执行vm.$watch方法
  6. vm上的`$watch`方法`stateMixin`阶段声明;挂载成功之后,一旦数据变化,会执行watcher中的run方法,执行回调函数
  * 到此,完成了watch的初始化工作
二、触发流程
  1. 响应式数据发生变化时, 先触发`Watcher.prototype.get`, 获取到更新的值
  2. 再触发`Watcher.prototype.update`更新数据; 将watcher推送到一个队列中<会单独判断lazy和sync等特殊情况>; 在`nextTick`阶段再去执行回调函数
  3. 最后触发`Watcher.prototype.run`, 执行callback
  *. update(),实际上是`同步/异步`调用run方法, run方法就是watcher对象中保存的callback

# 为什么watch适合开销比较大的操作?

在Vue中,提供了两种方式实现数据的观察和响应: `computed`和`watch`
`computed`: 其他变量影响自身,这是一个同步的计算过程; 更适合用在模板渲染中;
`watch`:自身影响其他变量,这是一个异步的过程; 更适合观测某个值的变化, 从而做出一系列复杂的操作;

javascript的开销并不直观(网络请求/加载/执行/编译等),需要借助一些工具展示分析. 可以在控制台-性能中, 查看调用树和日志等信息.
这些耗时比较久的大多数都是开销大的操作. 我认为,在浏览器渲染阶段,只要对dom增删改查动作都属于开销比较大的操作.
开销比较大的操作执行的时间会更长一点或者渲染的频率更高一些,都是一些单线程,并不能很好的支持异步,从而影响渲染的效率. 这也是`computed`使用缓存和惰性求值的原因.

就应用场景而言，`计算属性`适合用在`模板渲染`中，某个值是`依赖了其它的响应式对象`甚至是`计算属性计算`而来；而`侦听属性`适用于`观测某个值的变化`去完成一段`复杂的业务逻辑`。
