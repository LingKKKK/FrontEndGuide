


Vuex 是一个专为 Vue.js 应用程序开发的`状态管理模式`。 (数结构、状态管理模式 + 库)
它采用`集中式存储管理应用`的所有组件的状态，并`以相应的规则`保证`状态`以一种`可预测`的方式发生变化。

# 状态管理模式
  当我们的应用遇到多个组件共享状态时, 单向数据流的简洁性容易被破坏.
  1. 多个视图组件依赖同一个状态时,传参的方法会根据组件层级的加深而变得繁琐, 并且对于兄弟组件之间的传递是无效的.
  2. 不同的视图行为需要统一变更时, 通常会采用父子组件直接引用, 这样一来维护的成本比较大, 动辄就需要修改很多内容.
  比较理想的方式就是: 把组件的共享状态抽取出来, 以一个全局单例模式进行管理. 类似之前在即刻小程序中写的`global.js`. 这样组件树就构成了一张巨大的视图网络,不管哪个视图发生变化,不管那个数据发生改变, 任何模块任何组件都能够获取到状态或触发行为.

# Vuex 核心思想
  Vuex的应用核心就是`store`仓库. `store`就是一个容器, 包含了应用中大部分的状态.
  这个和`全局对象`(定义一个全局对象,然后对外暴露接口)是比较形似.
  `Vuex`和`全局对象`的区别:
    1. `Vuex`的状态存储是响应式的, 当存入的数值发生变化时, 所依赖的视图会自动更新
    2. 不能直接改变`store`中的状态, 修改数据的唯一途径就是显示的提交`commit(mutation)`, 这样更方便我们跟踪每此修改
    3. `Vuex`从定义到隔离状态管理, 各种概念都是清晰的. 强制统一规则, 让代码的可维护性和结构性更强.

  ☆☆☆ 换言之: 自己定义的`全局对象`如果能解决: 1.reactive 2.规则 就可以做到完全替代

# Vuex 初始化

## 安装 install
  在项目中引用vuex, ` import Vuex from 'vuex' `, 实际上就是引用了一个 vuex 对象.
  Vuex的install方法 >>> applyMxin方法
  混入Vuex的实例对象, 将options下的store属性挂载到Vue实例上, 通过 this.$store 访问.


## Store 实例化
  在项目中引入Vuex后, 会对`Store对象`进行实例化, 实例化的结果`store`会传入`new Vue()`的options中.
  Store对象中比较重要的属性就是: state,getters,mutations,actions,modules; `这是Vuex的核心属性`
  Store类中分为三个部分:
    1. 初始化模块
       因为使用了单一状态树,所以当所有的状态都集中在一起就十分不便于管理.
       所以Vuex提供了module属性,每个模块都拥有自己的 state、mutation、action、getter; 自上到下进行分割.
    2. 安装模块和初始化
       初始化module树, 让state getters mutations actions初始化
    3. store._vm
       建立getters和state之间的联系

  把store想象成一个数据仓库,为了方便管理仓库,我们将一个大仓库拆分成很多小仓库(store → module).
  所有的仓库组合在一起,就是树形结构,每个仓库又可以向下拆分成state、getters、mutations、actions等.
  小仓库有很强的封装性和复用性,都有属于自己的spaceName.
  定义了一个内部的Vue实例,用于建立state到getters之间的联系.
  修改state的唯一途径就是显示的提交mutation,逻辑性更强一点.

# 插件
  Vuex可以使用插件辅助, 来做更多的事情, 例如监控state的变化,和webpack的plugin能力类似.





# 备注

```JS Vuex的install方法
  export function install (_Vue) {
    if (Vue && _Vue === Vue) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.')
      }
      return
    }
    Vue = _Vue // 将传入的 _Vue 赋值给 Vue
    applyMixin(Vue) // 执行applyMixin, 将Vuex应用到Vue中
  }
```

```JS applyMxin方法
  export default function (Vue) {
    const version = Number(Vue.version.split('.')[0])

    if (version >= 2) {
      Vue.mixin({ beforeCreate: vuexInit }) // 在Vue中混入了 beforeCreate 钩子函数
    } else {
      // override init and inject vuex init procedure
      // for 1.x backwards compatibility.
      const _init = Vue.prototype._init
      Vue.prototype._init = function (options = {}) {
        options.init = options.init
          ? [vuexInit].concat(options.init)
          : vuexInit
        _init.call(this, options)
      }
    }

    /**
    * Vuex init hook, injected into each instances init hooks list.
    */
    function vuexInit () {
      /**
       * @Vuex的核心内容
       * 将所有的 options.store 挂载到 this.$store 上; 这个就是我们实例化的 Store 对象
       * 在vue实例化组件中, 可以通过 this.$store 访问到 Store 对象
       */
      const options = this.$options
      // store injection
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store // 逐层向上读取store,并合并到自身. 确保取到所有的store
      }
    }
  }
```

```JS Store对象示例
  export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    modules
    // ...
  })
```


```JS Store对象
  export class Store {
    constructor (options = {}) {
      // Auto install if it is not done yet and `window` has `Vue`.
      // To allow users to avoid auto-installation in some cases,
      // this code should be placed here. See #731
      if (!Vue && typeof window !== 'undefined' && window.Vue) {
        install(window.Vue)
      }

      if (process.env.NODE_ENV !== 'production') {
        assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
        assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
        assert(this instanceof Store, `Store must be called with the new operator.`)
      }

      const {
        plugins = [],
        strict = false
      } = options

      // 仓库内部的state数据; 初始化数据?
      this._committing = false
      this._actions = Object.create(null)
      this._actionSubscribers = []
      this._mutations = Object.create(null)
      this._wrappedGetters = Object.create(null)
      this._modules = new ModuleCollection(options) // 构建Vuex的树形结构,树形结构体现在modules的层级关系中
      this._modulesNamespaceMap = Object.create(null) // 每个module的命名空间
      this._subscribers = []
      this._watcherVM = new Vue()

      // 绑定 dispatch 和 commit 方法
      const store = this
      const { dispatch, commit } = this
      this.dispatch = function boundDispatch (type, payload) {
        return dispatch.call(store, type, payload)
      }
      this.commit = function boundCommit (type, payload, options) {
        return commit.call(store, type, payload, options)
      }

      // strict mode
      this.strict = strict

      const state = this._modules.root.state

      // 根据path确定spaceName
      // 搜集到所有的modules, 然后 install + init;
      // 让state getter mutation action进行初始化工作
      installModule(this, state, [], this._modules.root)

      // 初始化 store._vm; 建立 getters 和 state 之间的联系
      resetStoreVM(this, state)

      // apply plugins
      plugins.forEach(plugin => plugin(this))

      if (Vue.config.devtools) {
        devtoolPlugin(this)
      }
    }
  }
```

```JS ModuleCollection >>> 生成Vuex的属性关系
  // 每个子模块根据路径找到它的父级, 然后父级通过 addChild 方法确定父子关系, 这样就能构成一张关系网络
  export default class ModuleCollection {
    constructor (rawRootModule) {
      // register root module (Vuex.Store options)
      this.register([], rawRootModule, false)
    }

    get (path) {
      return path.reduce((module, key) => {
        return module.getChild(key)
      }, this.root)
    }

    getNamespace (path) {
      let module = this.root
      return path.reduce((namespace, key) => {
        module = module.getChild(key)
        return namespace + (module.namespaced ? key + '/' : '')
      }, '')
    }

    update (rawRootModule) {
      update([], this.root, rawRootModule)
    }

    register (path, rawModule, runtime = true) { // runtime >>> 是否是运行时创建的模块
      if (process.env.NODE_ENV !== 'production') {
        assertRawModule(path, rawModule)
      }

      const newModule = new Module(rawModule, runtime)
      if (path.length === 0) {
        this.root = newModule
      } else {
        const parent = this.get(path.slice(0, -1))
        parent.addChild(path[path.length - 1], newModule)
      }

      // register nested modules
      if (rawModule.modules) {
        forEachValue(rawModule.modules, (rawChildModule, key) => {
          this.register(path.concat(key), rawChildModule, runtime)
        })
      }
    }

    unregister (path) {
      const parent = this.get(path.slice(0, -1))
      const key = path[path.length - 1]
      if (!parent.getChild(key).runtime) return

      parent.removeChild(key)
    }
  }
```
