Route中有一个比较重要的属性: matched
```JS
  function formatMatch (record: ?RouteRecord): Array<RouteRecord> {
    const res = []
    while (record) {
      res.unshift(record)
      record = record.parent
    }
    return res
  }
```
通过 record 循环向上查找 parent, 直到查询到最外层, 并把所有的 record 都push到一个数组中,最终返回的就是 reord 数组.
他记录了一条线上所有的 record, 为渲染组件提供了可靠的依据.


# 简介
Vue-Router和常见的SPA不同.
SPA提供2中路由模式 mode: history | hash
VueRouter提供3种路由模式 mode: history | hash | abstract
VueRouter提供2种组件 <router-link> 和 <router-view>

    1.定义路由组件
    2.定义路由
    3.创建router实例, 然后传入`routers`配置
    4.创建和挂载root实例

```JS vue-router示例
  import Vue from 'vue'
  import VueRouter from 'vue-router'
  import App from './App'

  Vue.use(VueRouter)

  // 1. 定义（路由）组件。
  // 可以从其他文件 import 进来
  const Foo = { template: '<div>foo</div>' }
  const Bar = { template: '<div>bar</div>' }

  // 2. 定义路由
  // 每个路由应该映射一个组件。 其中"component" 可以是
  // 通过 Vue.extend() 创建的组件构造器，
  // 或者，只是一个组件配置对象。
  // 我们晚点再讨论嵌套路由。
  const routes = [
    { path: '/foo', component: Foo },
    { path: '/bar', component: Bar }
  ]

  // 3. 创建 router 实例，然后传 `routes` 配置
  // 你还可以传别的配置参数, 不过先这么简单着吧。
  const router = new VueRouter({
    routes // （缩写）相当于 routes: routes
  })

  // 4. 创建和挂载根实例。
  // 记得要通过 router 配置参数注入路由，
  // 从而让整个应用都有路由功能
  const app = new Vue({
    el: '#app',
    render(h) {
      return h(App)
    },
    router
  })
```

```HTML app根实例挂载
  <div id="app">
    <h1>Hello App!</h1>
    <p>
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <router-link to="/foo">Go to Foo</router-link>
      <router-link to="/bar">Go to Bar</router-link>
    </p>
    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
  </div>
```

# 路由注册
  Vue从设计上来说就是一个 `渐进式` 的JS框架, 它本身的核心就是解决视图层的渲染问题, 其他的能力都是通过插件来解决的.
  Vue-Router是官方维护的路由插件, 分析一下 Vue 通用的插件注册原理.

  `Vue.use` 是全局的API,用于注册路由插件.

  ```JS   Vue.use -> vue/src/core/global-api/use.js
    /**
     * @参数 接受一个 plugin 参数, 并维护 _installedPlugins 数组
     */
    export function initUse (Vue: GlobalAPI) {
      Vue.use = function (plugin: Function | Object) {
        const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
        if (installedPlugins.indexOf(plugin) > -1) {
          return this
        }
        const args = toArray(arguments, 1)
        args.unshift(this)
        // 判断有没有定义install方法, 这个install方法的第一个参数就是 vue 实例
        if (typeof plugin.install === 'function') {
          plugin.install.apply(plugin, args)
        } else if (typeof plugin === 'function') {
          plugin.apply(null, args)
        }
        installedPlugins.push(plugin)
        return this
      }
    }
  ```

# 路由安装
  路由的 install 方法 `VueRouter.install = install`
  当执行 `Vue.use(VueRouter)` 的时候, 实际上是在执行 `route`的`install`方法.

  ```JS 路由安装的方法 router install
    export let _Vue
    export function install (Vue) {
      // 为了确保 `install` 方法只被执行一次, 使用 `install.installed` 作为已安装的标志.
      if (install.installed && _Vue === Vue) return
      install.installed = true

      //  使用变量 `_Vue` 指向参数 `Vue`, 因为插件们都对 `Vue` 有依赖,但是又不能使用 `import Vue`
      _Vue = Vue

      const isDef = v => v !== undefined

      const registerInstance = (vm, callVal) => {
        let i = vm.$options._parentVnode
        if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
          i(vm, callVal)
        }
      }
      /**
       * VueRouter安装最重要的一步就是 -> 使用 mixin 方法, 把 beforeCreate 和 destroy 方法注册到每一个钩子上
       * @beforeCreate
       *    1.定义了 this._routerRoot 表示自身.
       *    2.this._router 表示 VueRouter 的实例 router, 在 new Vue 阶段传入
       *    3.this._router.init() 初始化 router
       *    4.使用 @defineReactive 将 this._route 变成响应式对象.
       */
      Vue.mixin({
        beforeCreate () {
          // 如果传入 router 实例, 一定会执行 init 方法
          if (isDef(this.$options.router)) {
            this._routerRoot = this
            this._router = this.$options.router
            this._router.init(this)
            Vue.util.defineReactive(this, '_route', this._router.history.current)
          } else {
            this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
          }
          registerInstance(this, this)
        },
        destroyed () {
          registerInstance(this)
        }
      })

      /**
       * 给Vue原型定义了两个属性: $route 和 $router ; ->  可以打印看他们的prototype值
       * @$router
       *   1.是路由操作对象，只写对象
       *   2.是全局的路由对象, 是 vue-router 的实例
       *   3.提供了 init,addRoutes,back,go 等方法
       *   4.相当于路由的管理角色
       * @$route
       *   1.路由信息对象，只读对象
       *   2.是当前的路由对象
       *   3.包含路由名称,path,query,params,meta等属性
       *   4.是routes(new Router时声明的routes)里面一条具体的路由
       */
      Object.defineProperty(Vue.prototype, '$router', {
        get () { return this._routerRoot._router }
      })
      Object.defineProperty(Vue.prototype, '$route', {
        get () { return this._routerRoot._route }
      })
      /**
       * 定义了 @RouterView 和 @RouterLink 两种标签
       */
      Vue.component('RouterView', View)
      Vue.component('RouterLink', Link)

      const strats = Vue.config.optionMergeStrategies
      strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
    }
  ```

  ```JS Vue.mixin() => 混入钩子
    /**
     * 通过 mergeOptions 方法, 将option混入到Vue的options上. 相当于每个组件都定义了mixin定义的项
     */
    export function initMixin (Vue: GlobalAPI) {
      Vue.mixin = function (mixin: Object) {
        this.options = mergeOptions(this.options, mixin)
        return this
      }
    }
  ```


# VueRouter对象

  ```JS VueRouter类
    export default class VueRouter {
      static install: () => void;
      static version: string;

      app: any;
      apps: Array<any>;
      ready: boolean;
      readyCbs: Array<Function>;
      options: RouterOptions;
      mode: string;
      history: HashHistory | HTML5History | AbstractHistory;
      matcher: Matcher;
      fallback: boolean;
      beforeHooks: Array<?NavigationGuard>;
      resolveHooks: Array<?NavigationGuard>;
      afterHooks: Array<?AfterNavigationHook>;

      constructor (options: RouterOptions = {}) {
        // 初始化时, 会先执行构造方法
        this.app = null // Vue根实例
        this.apps = [] // 持有$options.router属性的Vue实例
        this.options = options // 保存传入的路由配置
        this.beforeHooks = [] // 前置钩子?
        this.resolveHooks = [] // 解析钩子?
        this.afterHooks = [] // 后置钩子?
        this.matcher = createMatcher(options.routes || [], this) // 路由匹配器

        let mode = options.mode || 'hash' // 路由模式, 默认hash模式
        // callback vs fallback -> fallback 路由创建失败的回调函数
        this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
        if (this.fallback) {
          // 在浏览器不支持 history.pushState 的时候<!supportsPushState>, 决定退回 hash 模式
          mode = 'hash'
        }
        if (!inBrowser) {
          mode = 'abstract'
        }
        this.mode = mode

        switch (mode) {
          case 'history':
            this.history = new HTML5History(this, options.base)
            break
          case 'hash':
            this.history = new HashHistory(this, options.base, this.fallback)
            break
          case 'abstract':
            this.history = new AbstractHistory(this, options.base)
            break
          default:
            if (process.env.NODE_ENV !== 'production') {
              assert(false, `invalid mode: ${mode}`)
            }
        }
        // 不同的 history 都是继承 History 类
      }

      match (
        raw: RawLocation,
        current?: Route,
        redirectedFrom?: Location
      ): Route {
        return this.matcher.match(raw, current, redirectedFrom)
      }

      get currentRoute (): ?Route {
        return this.history && this.history.current
      }

      init (app: any) { // 参数 app 就是 Vue 实例
        this.apps.push(app) // 将实例存储在apps中
        if (this.app) return
        this.app = app
        const history = this.history
        // 只有根实例会保存到 this.app 中, 并且会拿到当前的 history
        if (history instanceof HTML5History) {
          // mode === 'history'
          history.transitionTo(history.getCurrentLocation())
        } else if (history instanceof HashHistory) {
          // mode === 'hash'
          const setupHashListener = () => {
            history.setupListeners()
          }
          // 使用 matcher 方法匹配 route, 然后添加监听
          history.transitionTo(
            history.getCurrentLocation(),
            setupHashListener,
            setupHashListener
          )
        }

        history.listen(route => {
          this.apps.forEach((app) => {
            app._route = route
          })
        })
      }

      beforeEach (fn: Function): Function {
        return registerHook(this.beforeHooks, fn)
      }

      beforeResolve (fn: Function): Function {
        return registerHook(this.resolveHooks, fn)
      }

      afterEach (fn: Function): Function {
        return registerHook(this.afterHooks, fn)
      }

      onReady (cb: Function, errorCb?: Function) {
        this.history.onReady(cb, errorCb)
      }

      onError (errorCb: Function) {
        this.history.onError(errorCb)
      }

      push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
        this.history.push(location, onComplete, onAbort)
      }

      replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
        this.history.replace(location, onComplete, onAbort)
      }

      go (n: number) {
        this.history.go(n)
      }

      back () {
        this.go(-1)
      }

      forward () {
        this.go(1)
      }

      getMatchedComponents (to?: RawLocation | Route): Array<any> {
        const route: any = to
          ? to.matched
            ? to
            : this.resolve(to).route
          : this.currentRoute
        if (!route) {
          return []
        }
        return [].concat.apply([], route.matched.map(m => {
          return Object.keys(m.components).map(key => {
            return m.components[key]
          })
        }))
      }

      resolve (
        to: RawLocation,
        current?: Route,
        append?: boolean
      ): {
        location: Location,
        route: Route,
        href: string,
        normalizedTo: Location,
        resolved: Route
      } {
        const location = normalizeLocation(
          to,
          current || this.history.current,
          append,
          this
        )
        const route = this.match(location, current)
        const fullPath = route.redirectedFrom || route.fullPath
        const base = this.history.base
        const href = createHref(base, fullPath, this.mode)
        return {
          location,
          route,
          href,
          normalizedTo: location,
          resolved: route
        }
      }

      addRoutes (routes: Array<RouteConfig>) {
        this.matcher.addRoutes(routes)
        if (this.history.current !== START) {
          this.history.transitionTo(this.history.getCurrentLocation())
        }
      }
    }
  ```

  ## Matcher
  Matcher 是做匹配用的, 它返回两个类: match addRouters
  ```JS Matcher类 src/create-matcher.js
    export type Matcher = {
      match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
      addRoutes: (routes: Array<RouteConfig>) => void;
    };
  ```
  ### match
  匹配
  接受三个参数:
    raw: RawLocation -> 可以是一个url字符串,也可以是Location对象
    currentRoute?: Route -> Route类型, 表示当前的路径
    redirectedFrom?: Location -> 重定向, 接受Location对象
  ### addRoutes
  动态添加路由配置,有些场景是无法把路由写死的,需要根据动态的条件添加路由


  ## Location
  Location的数据结构, 和浏览器提供的 window.location 数据结构十分类似; 都是url结构化的描述信息
  ```JS
    declare type Location = {
      _normalized?: boolean;
      name?: string;
      path?: string;
      hash?: string;
      query?: Dictionary<string>;
      params?: Dictionary<string>;
      append?: boolean;
      replace?: boolean;
    }
  ```
  ## Route
  Route表示路由中的一条路线,内容比Location更多;
  ```JS
    declare type Route = {
      path: string;
      name: ?string;
      hash: string;
      query: Dictionary<string>;
      params: Dictionary<string>;
      fullPath: string;
      matched: Array<RouteRecord>; // 匹配到所有的<RouteRecord>
      redirectedFrom?: string;
      meta?: any;
    }
  ```
  ## RouteRecord
  路由记录: 遍历 routes 中每一个 route的时候, 会通过 `addRouteRecord` 方法生成一条记录
  理解: 每渲染一层, 添加一条记录

  ```JS
    declare type RouteRecord = {
      path: string;
      regex: RouteRegExp;
      components: Dictionary<any>;
      instances: Dictionary<any>;
      name: ?string;
      parent: ?RouteRecord;
      redirect: ?RedirectOption;
      matchAs: ?string;
      beforeEnter: ?NavigationGuard;
      meta: any;
      props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
    }

    eg. {
      beforeEnter: undefined,
      components: {default: ƒ},
      enteredCbs: {},
      instances: {},
      matchAs: undefined,
      meta: {keepAlive: true},
      name: "MixShare",
      parent: {path: '', regex: /^(?:\/(?=$))?$/i, components: {…}, instances: {…}, enteredCbs: {…}, …},
      path: "/mixshare",
      props: {},
      redirect: undefined,
      regex: /^\/mixshare(?:\/(?=$))?$/i,
    }
  ```
  ## createMatcher
  ```JS Matcher的创建过程
    export function createMatcher (
      routes: Array<RouteConfig>, // 用户定义的 RouteConfig
      router: VueRouter // new VueRouter 返回的实例
    ): Matcher {
      /**
       * @createRouteMap 将"用户的配置"转换成"路由映射表"
       * @pathList 储存所有的 path
       * @pathMap 表示从 path 到 RouteRecord 的映射关系
       * @nameMap 表示从 name 到 RouteRecord 的映射关系
       * @目的 通过 name 和 path 能快速定位到 RouteRecord
       */
      const { pathList, pathMap, nameMap } = createRouteMap(routes)

      function addRoutes (routes) {
        createRouteMap(routes, pathList, pathMap, nameMap)
      }

      function match (
        raw: RawLocation,
        currentRoute?: Route,
        redirectedFrom?: Location
      ): Route {
        const location = normalizeLocation(raw, currentRoute, false, router)
        const { name } = location

        if (name) {
          const record = nameMap[name]
          if (process.env.NODE_ENV !== 'production') {
            warn(record, `Route with name '${name}' does not exist`)
          }
          if (!record) return _createRoute(null, location)
          const paramNames = record.regex.keys
            .filter(key => !key.optional)
            .map(key => key.name)

          if (typeof location.params !== 'object') {
            location.params = {}
          }

          if (currentRoute && typeof currentRoute.params === 'object') {
            for (const key in currentRoute.params) {
              if (!(key in location.params) && paramNames.indexOf(key) > -1) {
                location.params[key] = currentRoute.params[key]
              }
            }
          }

          if (record) {
            location.path = fillParams(record.path, location.params, `named route "${name}"`)
            return _createRoute(record, location, redirectedFrom)
          }
        } else if (location.path) {
          location.params = {}
          for (let i = 0; i < pathList.length; i++) {
            const path = pathList[i]
            const record = pathMap[path]
            if (matchRoute(record.regex, location.path, location.params)) {
              return _createRoute(record, location, redirectedFrom)
            }
          }
        }
        return _createRoute(null, location)
      }

      // ...

      function _createRoute (
        record: ?RouteRecord,
        location: Location,
        redirectedFrom?: Location
      ): Route {
        if (record && record.redirect) {
          return redirect(record, redirectedFrom || location)
        }
        if (record && record.matchAs) {
          return alias(record, location, record.matchAs)
        }
        return createRoute(record, location, redirectedFrom, router)
      }

      return {
        match,
        addRoutes
      }
    }
  ```
