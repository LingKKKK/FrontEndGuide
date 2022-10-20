
# 方法调用过程
  1. 点击`router-link`
  2. router-link 中触发点击事件，从而触发 Router 的 push 事件
  3. push 事件中调用了 transitionTo 方法
  4. transitionTo 主要执行 confirmTransition 方法
  5. confirmTransition 方法内首先通过 resolveQueue 方法拿到需要更新的组件、激活的组件以及废弃的组件对象
  6. 再将不同的钩子函数以及异步组件加载存入到数组 queue
  7. 通过 runQueue 方法顺序执行 queue 里的函数
  8. 整个执行完后调用 runQueue 中的回调执行 resolve、after 钩子
  9. 触发DOM 更新
  10. 将创建好的实例传递到 beforeRouterEnter 的回调里

# 完整的导航流程分析
  1. 导航被触发
  2. 在失活的组件中, 调用组件内的离开守卫 beforeRouterLeave
  3. 调用全局前置守卫 beforeEach
  4. 在重用的组件中, 调用组件内的更新守卫 beforeRouteUpdate
  5. 在路由配置中, 调用路由独享守卫 beforeEnter
  6. 解析异步路由组件 >>>
  ------ 解析完毕, 进入到组件内部 ------
  7. 在激活的组件中, 调用组件内的进入守卫 beforeRouterEnter
  8. 调用全局解析守卫 beforeResolve
  9. 导航被确认完毕
  10. 调用全局后置守卫 afterEach(导航已经渲染完毕,可利用路由渲染一些DOM,不需要再调用next方法)
  11. DOM更新渲染

# 路由守卫的内容
  全局前置守卫 beforeEach <针对所有路由>
  全局后置守卫 afterEach <针对当前路由>
  全局解析守卫 beforeResolve
  路由独享守卫 beforeEnter
  组件内的守卫 beforeRouteEnter beforeRouteUpdate beforeRouteLeave

# 导航守卫的执行顺序
  1. 全局前置守卫; 跳转路由之前,针对所有路由.
  2. 路由独享守卫; 进入某个路由时触发.
  ---- 解析完毕, 进入到组件内部 -----
  3. 组件内的守卫-beforeRouteEnter; 进入到组件内部之后触发.
  4. 全局解析守卫; 组件内的守卫和异步路由被解析之后才会触发.
  5. 全局后置守卫; 最后触发, 不受next控制.

# next
  next()
    没有参数，表示可以进入到to的路由中；
  next(false)
    参数为一个布尔值false，中断当前的导航，回到from路由；
  next(’/’) 或 next({ path: ‘/’ })
    参数为一个路径，相当于执行了this.$router.push(’/’)
  next(error)
    参数为error，中断当前导航，将该错误传递给router.onError()注册过的回调。

# 路径切换
`history.transitionTo`是Vue-Router中比较重要的方法,处理页面之间的跳转.
根据目标的`location`和当前的路径`this.current`,执行了`this.router.match`方法去匹配目标路径.

```JS 页面跳转方法
  transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    /**
     * @location   Location实例, 要跳转的目标
     * @onComplete 完成调用的函数 ballback
     * @onAbort    终止调用的函数 fallback
     */
    const route = this.router.match(location, this.current) // 匹配到目标路径
    // this.current 是history维护的当前路径
    // this.current = START 这是初始化的时候定义的路径信息

    // confirmTransition 方法是做真正的切换. go/push/replace -> transitionTo -> confirmTransition
    this.confirmTransition(route, () => {
      // 可能存在一些异步操作 -> 类似异步组件
      // 在这里更新函数, 执行回调
      this.updateRoute(route)
      onComplete && onComplete(route)
      this.ensureURL()

      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => { cb(route) })
      }
    }, err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
  }
```

# 导航守卫 NavigationGuard
  官方成为`导航守卫(NavigationGuard)`, 实际上就是发生在路由切换的时候, 执行的一系列钩子函数

  分析一下这些钩子函数的执行逻辑:
    1.构造了一个队列`queue`,它实际上就是一个数组;
    2.在定义一个迭代器`iterator`
    3.再执行`runQueue`方法, 来执行这个队列 <迭代器 + 按序执行>



# 备注

```JS confirmTransition -> 路由真正的切换
  confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    /**
     * @route 目标地址
     * @onComplete callback
     * @onAbort fallback
     */
    const current = this.current
    const abort = err => {
      if (isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => { cb(err) })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    // 如果是相同路径的话,就调用 this.ensureUrl 和 abort
    if (
      isSameRoute(route, current) &&
      route.matched.length === current.matched.length
    ) {
      this.ensureURL()
      return abort()
    }

    const {
      updated,
      deactivated,
      activated
    } = resolveQueue(this.current.matched, route.matched)
    // 根据 urrent.matched 和 route.matched, 解析队列`resolveQueue`
    // 这个方法主要是获取到: 更新的记录, 激活的记录, 停用的记录

    const queue: Array<?NavigationGuard> = [].concat( // concat 会拍平里面的一维数组,更多维度不受影响
      // in-component leave guards --> 在失活的组件中调用离开守卫
      extractLeaveGuards(deactivated),
      // global before hooks --> 调用全局的 beforeEach 守卫
      this.router.beforeHooks,
      // in-component update hooks --> 在更新(重用)的组件中调用 beforeRouteUpdate 守卫
      extractUpdateHooks(updated),
      // in-config enter guards --> 在路由配置中调用 beforeEnter 守卫
      activated.map(m => m.beforeEnter),
      // async components --> 解析异步路由组件
      resolveAsyncComponents(activated)
    )

    this.pending = route
    // iterator 迭代器, 用于执行 queue[index]

    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) {
        return abort()
      }
      try {
        // 这里面的箭头函数, 就是我们要执行 next()
        hook(route, current, (to: any) => {
          if (to === false || isError(to)) {
            this.ensureURL(true)
            abort(to)
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' && (
              typeof to.path === 'string' ||
              typeof to.name === 'string'
            ))
          ) {
            abort()
            if (typeof to === 'object' && to.replace) {
              this.replace(to)
            } else {
              this.push(to)
            }
          } else {
            next(to)
          }
        })
      } catch (e) {
        abort(e)
      }
    }

    runQueue(queue, iterator, () => {
      const postEnterCbs = [] // 回调函数的数组
      const isValid = () => this.current === route // 标记当前路由是否是有效
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid) // 提取进入守卫
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        // 这里是迭代器执行完毕调用的callback

    当正跳转的路由不是当前传入的路由则 abort 掉，pending 路由设置为 null，执行 onComplete 方法，也就是transitionTo函数的第二个参数，最后在nextTick中将前面 push的 cb 进行执行。

        if (this.pending !== route) {
          // 判断: 如果正在跳转的路由不是当前路由, 就终止操作
          return abort()
        }
        this.pending = null // 将pedding路由设置为null --> 表示当前无路由跳转
        onComplete(route) // 执行complete的callback
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => { cb() })
          })
        }
      })
    })
  }
```


```TS 解析队列
  function resolveQueue (
    current: Array<RouteRecord>, // 当前路由
    next: Array<RouteRecord> // 目标路由
  ): {
    updated: Array<RouteRecord>,
    activated: Array<RouteRecord>,
    deactivated: Array<RouteRecord>
  } {
    let i
    const max = Math.max(current.length, next.length)
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    /**
     * 遍历对比两边的 RouteRecord, 找到不一样的位置 i
     * 那么从0~i两边都是相同的, 这部分就是更新的部分 updated
     * 从i开始, 到最后都是next独有的 activated
     * current中, 从i到最后都是没有的部分 deactivated
     */
    // 可以理解为: 路由的渲染是一层一层的,把每一层都作为一个record放在数组里面, 然后对新旧数组做对比
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }
```

```TS 守卫的类型
  /**
   * 和route的回调函数内容一样
   */
  declare type NavigationGuard = (
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | Function | void) => void
  ) => any
```

```JS 执行
  /**
   * @参数 传入queue数组,和iterator迭代器,以及一个回调函数
   * 1. 自身定义了一个step函数, 然后立即执行step函数, 传入索引 0
   * 2. step函数执行的时候, 进行如下判断:
   *      如果索引无效,执行callback
   *      如果索引有效,如果 queue[index] 存在就执行
   * 3. 继续执行step函数, 传入索引 +1
   *
   * 因为queue中, 可能存在异步组件, 这样能保证 `按序执行`
   * 应用到代码层就是我们定义路由守卫钩子的时候, 为什么一定要执行next的原因. 不然step不执行路由也就没法继续了.
   */
  export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
    const step = index => {
      if (index >= queue.length) {
        cb()
      } else {
        if (queue[index]) {
          fn(queue[index], () => {
            step(index + 1)
          })
        } else {
          step(index + 1)
        }
      }
    }
    step(0)
  }
```

```JS 提取进入守卫 enterGuards 所调用的函数
  function extractEnterGuards (
    activated: Array<RouteRecord>,
    cbs: Array<Function>,
    isValid: () => boolean
  ): Array<?Function> {
    /**
     * guard：我们在extractGuards函数里得到的 guards 数组里的钩子函数
     * _：instance 实例，由于我们现在还没有进入到组件，也就无法获得对应的实例
     * match：当前路由匹配到的 record
     * key：component 的属性名
     * @return 返回bindEnterGuard函数执行结果。
     */
    return extractGuards(
      activated,
      'beforeRouteEnter',
      (guard, _, match, key) => {
        return bindEnterGuard(guard, match, key, cbs, isValid)
      }
    )
  }

  function bindEnterGuard (
    guard: NavigationGuard,
    match: RouteRecord,
    key: string,
    cbs: Array<Function>,
    isValid: () => boolean
  ): NavigationGuard {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, cb => {
        if (typeof cb === 'function') {
          cbs.push(() => {
            poll(cb, match.instances, key, isValid)
          })
        }
        next(cb)
      })
    }
  }
```

```JS 轮询执行的函数 poll
  // 一旦获取到实例, 就执行callback, 否则一直轮询获取实例
  function poll (
    cb: any, // somehow flow cannot infer this is a function
    instances: Object,
    key: string,
    isValid: () => boolean
  ) {
    if (
      instances[key] &&
      !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
    ) {
      cb(instances[key])
    } else if (isValid()) {
      setTimeout(() => {
        poll(cb, instances, key, isValid)
      }, 16)
    }
  }
```
