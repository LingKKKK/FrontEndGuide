# 定义
  官方文档: 计算属性的结果会被缓存,除非依赖的响应式property变化才会重新计算.注意,如果某个依赖(比如非响应式的property)在该实例范畴之外,则计算属性时不会被更新的.
  从官方文档中可以看出computed最关键的知识点是:
    1. computed会搜集并记录依赖; (通过getter函数的形参[依赖的属性名], 进行搜集)
    2. 依赖发生变化才会重新计算computed, 由于computed是有缓存的,所以当依赖发生变化之后,第一次访问computed属性才会重新计算值 (解耦的思想, 降低关联性)
    3. 只能搜集到响应式属性依赖,无法搜集到非响应式属性依赖
    4. 无法实现搜索当前vm实例之外的属性依赖
    5. 依赖是通过getter函数的形参(依赖属性名)来搜集的, 并且只能搜集到响应式属性的依赖

# computed工作原理
  1. 先执行`initMixin(Vue)`方法, 对数据进行初始化
  2. 调用`mergeOptions`方法,将child<自定义>和parent<实例>的options合并,挂载到vm上
  3. 调用`initState`方法, 判断实例的computed属性是否存在,如果存在,调用`initComputed`方法进行初始化
  4. 在`initComputed`方法中, 将computed属性的依赖收集器`_computedWatchers`挂载到实例上, 在此过程中, 对`computed`属性进行判断: 是否和data/props/methods冲突;; 然后调用`defineComputed`方法
  5. `defineComputed`方法, 将`computed`通过`Object.defineProperty`方法挂载到实例vm上; 便于后续访问
  6. computed的缓存原理, 依赖定义getter时的watcher.dirty属性 (dirty === true 重新计算;;; 数据劫持会将dirty改变为true)

# computed是否为响应式?
  从页面结构来看, 例如组件依赖computed, computed依赖data, 归根到底computed更像中间件, 并非直接影响;
  但是在定义`_computedWatchers`时, `new Watch`时定义{ lazy: true }, 所以computed是惰性的观察者;
  computed可以算是`惰性的响应式数据`

# computed是如何控制缓存的?
  Dep中的dirty属性;
  watcher继承于Dep实例

# 依赖的data发生变化时是如何更新的?
  组件C的显隐, 依赖计算属性A, 计算属性A依赖vm.data中的B, computed的更新步骤如下:
  1. 由于A依赖B, B可以收集到A的watcher >>> 当B发生变化时, A的watcher也会被触发(调用watcher.update方法)
  2. 当`B发生变化`时, 会`将watcher中的dirty属性标记为true`
  3. 同时B会`收集到页面P的watcher`, B通知P进行更新, 从而`组件C重新读取计算属性A`, 此时的`dirty为true`, 重新计算
  4. computed更新完毕, `dirty设置为false`
  5. 如果A不发生变化, 以后再读取都会使用缓存

# 举例
  在大巴三期开发过程中, 遇到一个问题, 我们在computed中, 返回sessionStorage中的某一个值
```js
  computed: {
    message: function () {
      return sessionStorage.getItem('message')
    },
  },
```
  这里的message仅在render中触发一次, 其原因就是dirty属性恒为true, 没有依赖其他属性, 所以不会触发更新
