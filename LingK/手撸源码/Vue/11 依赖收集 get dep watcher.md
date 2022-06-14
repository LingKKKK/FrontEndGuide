
# getters

## 依赖收集
1. Vue会将普通对象变成响应式对象(observe + watcher + dep)
2. 在Dep实例中, 给对象添加响应式收集(Object.defineProperty中的getters相关逻辑)
```js
    export function defineReactive (
      obj: Object,
      key: string,
      val: any,
      customSetter?: ?Function,
      shallow?: boolean
    ) {
      const dep = new Dep()
      /**
       * * 省略部分内容
       * 拿到 property
       * 给子属性添加 observe
       */
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
          const value = getter ? getter.call(obj) : val
          if (Dep.target) {
            dep.depend() // 进行收集依赖
            // ...判断子属性的ob
          }
          return value
        },
        // ...
      })
    }
```
在`defineReactive`中, 需要注意的内容是:
1. `const dep = new Dep()` 实例化 Dep 类
2. 在get函数中, 通过 `dep.depend` 做依赖收集

### Dep
Dep实例是getters的核心内容;
1. Dep 是一个类, 其中定义了很多属性和方法, target 就是一个静态属性(全局唯一的 watcher )
2. Dep 中的subs属性( watcher 队列), 存放着多个 watcher ,但是在同一时间,仅允许一个 watcher 被计算
3. Dep 实际上是对 Watcher 的一种管理方案, Dep 脱离 Watcher 毫无意义; 如果没有 Dep, Watcher 会比较混乱;
```js
    import type Watcher from './watcher'
    import { remove } from '../util/index'
    let uid = 0 // 自增的 depid 用于区分
    /**
     * A dep is an observable that can have multiple directives subscribing to it.
     * dep是一个可观察的对象, 有很多指令可以调用它
     */
    export default class Dep {
      static target: ?Watcher;
      id: number;
      subs: Array<Watcher>;
      /**
       * 静态属性 target: 是全局唯一的 Watcher
       * id: 是自增属性, 用于判断 depid 执行的唯一
       * subs: 是watcher执行的队列, 和 event 的队列一样(FIFO)
       */
      constructor () {
        this.id = uid++  // 确保了每次实例化的时候, depid 的值都不同
        this.subs = [] // 初始化空队列
      }
      addSub (sub: Watcher) { // 添加观察者集合
        this.subs.push(sub)
      }
      removeSub (sub: Watcher) { // 移除观察者对象
        remove(this.subs, sub)
      }
      depend () { // 依赖收集, 当Watcher实例存在时, 将它添加到观察者列表中
        if (Dep.target) {
          Dep.target.addDep(this)
        }
      }
      notify () { // 通知所有调用者 -> 调用的顺序 FIFO
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
          subs[i].update()
        }
      }
    }
    // the current target watcher being evaluated. >>> 当前已添加的 watcher 被计算
    // this is globally unique because there could be only one >>> 全局只能有一个 Watcher
    // watcher being evaluated at any time. >>> watcher 可以在任意节点被计算
    Dep.target = null
    const targetStack = [] // watcher-stack
    export function pushTarget (_target: ?Watcher) { // 添加
      if (Dep.target) targetStack.push(Dep.target)
      Dep.target = _target
    }
    export function popTarget () {
      Dep.target = targetStack.pop() // 得到最后一个 Watcher(订阅者), 使用完毕就更新targetStack
    }
```

### Watcher
Watcher 的定义在 `src/core/observer/watcher.js`,

#
```js
    let uid = 0
    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     * 通过 $watcher() 和其他的 api 触发依赖收集的回调; 解析观察者的表达式
     */
    export default class Watcher {
      vm: Component;
      expression: string;
      cb: Function;
      id: number;
      deep: boolean;
      user: boolean;
      computed: boolean;
      sync: boolean;
      dirty: boolean;
      active: boolean;
      dep: Dep;
      deps: Array<Dep>;
      newDeps: Array<Dep>;
      depIds: SimpleSet;
      newDepIds: SimpleSet;
      before: ?Function;
      getter: Function;
      value: any;

      constructor (
        vm: Component,
        expOrFn: string | Function,
        cb: Function,
        options?: ?Object,
        isRenderWatcher?: boolean // isRenderWatcher: 渲染 Watcher 的判断
      ) {
        this.vm = vm // Vue 实例
        if (isRenderWatcher) {
          vm._watcher = this
        }
        vm._watchers.push(this)
        // 将 Watcher 映射到全局
        // options
        if (options) {
          this.deep = !!options.deep
          this.user = !!options.user
          this.computed = !!options.computed
          this.sync = !!options.sync
          this.before = options.before
        } else {
          this.deep = this.user = this.computed = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.computed // for computed watchers

        // 这些是和 Dep 相关的属性
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()

        this.expression = process.env.NODE_ENV !== 'production'
          ? expOrFn.toString()
          : ''
        // parse expression for getter
        if (typeof expOrFn === 'function') {
          this.getter = expOrFn
        } else {
          this.getter = parsePath(expOrFn)
          if (!this.getter) {
            this.getter = function () {}
            process.env.NODE_ENV !== 'production' && warn(
              `Failed watching path: "${expOrFn}" ` +
              'Watcher only accepts simple dot-delimited paths. ' +
              'For full control, use a function instead.',
              vm
            )
          }
        }
        if (this.computed) {
          this.value = undefined
          this.dep = new Dep()
        } else {
          this.value = this.get()
        }
      }
      /**
       * getters
       * 当实例化渲染 watcher 的时候, 会首先触发 get 方法
       */
      get () {
        pushTarget(this) // 将 Watcher 赋值为当前的 Dep.target, 并压栈(入栈)
        // 和 updateComponent 方法一样
        let value
        const vm = this.vm
        try {
          value = this.getter.call(vm, vm)
        } catch (e) {
          if (this.user) {
            handleError(e, vm, `getter for watcher "${this.expression}"`)
          } else {
            throw e
          }
        } finally {
          // "touch" every property so they are all tracked as
          // dependencies for deep watching
          if (this.deep) {
            traverse(value)
          }
          popTarget()
          this.cleanupDeps()
        }
        return value
      }
      // 添加依赖收集
      addDep (dep: Dep) { // 渲染当前的 Watcher 时, 会触发 addDep 函数
        const id = dep.id
        if (!this.newDepIds.has(id)) {
          this.newDepIds.add(id)
          this.newDeps.push(dep)
          if (!this.depIds.has(id)) {
            dep.addSub(this)
          }
        }
      }
      // 清除依赖收集
      cleanupDeps () {
        let i = this.deps.length
        while (i--) {
          const dep = this.deps[i]
          if (!this.newDepIds.has(dep.id)) {
            dep.removeSub(this)
          }
        }
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
      }
      // ...
    }
```

# 总结

Observer 给对象添加数据劫持
Watcher 用于观察一个属性的更新和获取的类
Dep 一个用于管理 Watcher 的类

在执行 cleanupDeps 函数的时候，会首先遍历 deps，移除对 dep.subs 数组中 Watcher 的订阅，然后把 newDepIds 和 depIds 交换，newDeps 和 deps 交换，并把 newDepIds 和 newDeps 清空。

那么为什么需要做 deps 订阅的移除呢，在添加 deps 的订阅过程，已经能通过 id 去重避免重复订阅了。

考虑到一种场景，我们的模板会根据 v-if 去渲染不同子模板 a 和 b，当我们满足某种条件的时候渲染 a 的时候，会访问到 a 中的数据，这时候我们对 a 使用的数据添加了 getter，做了依赖收集，那么当我们去修改 a 的数据的时候，理应通知到这些订阅者。那么如果我们一旦改变了条件渲染了 b 模板，又会对 b 使用的数据添加了 getter，如果我们没有依赖移除的过程，那么这时候我去修改 a 模板的数据，会通知 a 数据的订阅的回调，这显然是有浪费的。

因此 Vue 设计了在每次添加完新的订阅，会移除掉旧的订阅，这样就保证了在我们刚才的场景中，如果渲染 b 模板的时候去修改 a 模板的数据，a 数据订阅回调已经被移除了，所以不会有任何浪费，真的是非常赞叹 Vue 对一些细节上的处理。

# 疑问: 关于Dep实例中的target属性的用法
1. Dep.target是全局变量上的属性么? 如果是, 收集不同的key的依赖会有影响么? 怎么避免?
2. Watcher和Dep中都有depend()方法, 他们的作用分别是什么?

1.target是Dep实例的静态属性, 初始值为null;
2.作为中间变量, 缓存已有的target;
3.调用get时,通过pushTarget方法,将Watcher赋值到当前的Dep.target,并入栈
4.调用之后,使用popTarget方法还原Dep.target值, 相当于临时插入一个任务, 执行完毕之后将其恢复; Watcher不能并行;
5.为了Observer的get方法中,存在watcher(Dep.target), 如果值为true, 就执行 Dep.target.depend(), 从而更新依赖

dep.depend: 在observer的set方法中,收集依赖; 如果dep.target存在将它添加到观察者依赖中
watcher.depend: 收集watcher的所有deps依赖, 只有计算属性使用;

# 依赖收集的流程
  1.当渲染watcher实例的时候, 首先执行this.get方法. `调用Watcher下面的get方法`
  2.get函数中会执行pushTarget方法,将Dep.target赋值为当前渲染的watcher并压栈.
  3.执行`value=this.getter.call(vm, vm)`; 实际上是调用getter方法, 从而调用dep.depend方法, 执行Dep.target.addDep(this)
  * 做逻辑判断(保证不会重复添加多次)
  4.执行dep.addSub(this), 从而触发 this.sub.push(sub); 把当前的watcher订阅到这个数据持有的dep和sub中,为了后续通知sub.
