# Store

`createStore` -> 创建一个`store`实例

```js
import { createStore } from "vuex";
const store = createStore({ ...options });
```

# Store构造器选项

*state*
  类型: Object | Function
  作用: VueX store 实例的根对象
*mutations*
  类型: { [type: string]: Function }
  作用: 修改state, 接受两个参数: state/payload
*actions*
  类型: { [type: string]: Function }
  作用: 触发mutation, 接受两个参数: content/payload
  content: {
    state,      // 等同于 `store.state`，若在模块中则为局部状态
    rootState,  // 等同于 `store.state`，只存在于模块中
    commit,     // 等同于 `store.commit`
    dispatch,   // 等同于 `store.dispatch`
    getters,    // 等同于 `store.getters`
    rootGetters // 等同于 `store.getters`，只存在于模块中
  }
*getters*
*modules*
  类型: Object
  作用: 包含了子模块对象,最终会被合并到store中
  ```js
    {
      key: {
        state,
        namespaced?,
        mutations?,
        actions?,
        getters?,
        modules?
      },
      ...
    }
  ```
  和根store是一模一样的,具有的属性也是相似的,可以一层一层的传递分解下去
*plugin*
  类型: Array<Function>
  作用: 一个数组，包含应用在 store 上的插件方法。这些插件直接接收 store 作为唯一参数，可以监听 mutation（用于外部地数据持久化、记录或调试）或者提交 mutation （用于内部数据，例如 websocket 或 某些观察者）
*strict*
  类型: Boolean
  作用: 是否启用严格模式,任何mutation之外的处理都会抛出异常

# Store实例
## 属性
*state*
  类型: Object
  状态: 只读
*getters*
  类型: Object
  状态: 只读
## 方法
*commit*
  ```js
  store.commit('initConfig/updateIsPrivate', data, {root: true})
  // 调用 initConfig 空间下的 updateIsPrivate
  // 传参 payload: data
  // root: true 可以调用根空间的 mutation
  ```
*dispatch*
  `dispatch(type: string, payload?: any, options?: Object): Promise<any>`
  `dispatch(action: Object, options?: Object): Promise<any>`
  options { root: true }, 同样可以触发根store中的方法
  ```js
  store.dispatch('axios', { url: `/v2/account/info/get` }, {root: true})
  // 调用 axios 模块, 传入 url 作为参数
  // 本身是一个 Promise, 可以跟 then, await等

  store.dispatch('getCancelTokenSource').then(async ax => {})
  // ...
  actions: {
    getCancelTokenSource: () => axios.CancelToken.source(),
  }
  ```
*replaceState*
  ```js
  store.replaceState(state)
  // 替换store的根状态, 仅用于合并状态和时光旅行
  ```
*watch*
  响应式的侦听 fn 的返回值, 当值改变时调用回调函数
  `watch(fn: Function, callback: Function, options?: Object): Function`
  ```js
  // 错误的写法
  this.$store.watch(this.$store.getters.loading, () => {
    console.log('loaded')
    console.log('onSIgnin error', this.error.code)
  })
  this.$store.watch((state, getters) => getters.loading, () => {
    console.log('loaded')
    console.log('onSIgnin error', this.error.code)
  })
  // 正确的写法
  // 监听一个函数(的返回值), 当其发生变化时, 触发回调函数
  // ! 最后一个可选项 options, 表示 Vue 的 vm.$watch 方法
  ```
  没用过,
*subscribe*
  `subscribe(handler: Function, options?: Object): Function`
  订阅store的mutation. handler会在每个mutation完成之后调用,接受mutation和经过mutation后的的状态作为参数
  ```js
  const unsubscribe = store.subscribe((mutation, state) => {
    console.log(mutation.type)
    console.log(mutation.payload)
  })
  // 你可以调用 unsubscribe 来停止订阅。
  unsubscribe()
  ```
  默认情况下, 新的处理函数会被添加到调用链的末端. 所以会在其他处理函数之后执行.
  使用 { prepend: true } 就是为了将其放置在调用链的开头
  `store.subscribe(handler, { prepend: true })`
  **subscribe**方法会返回一个**unsubscribe**方法,用于取消订阅该回调函数.
  e.g. 使用subscribe订阅一个vuex模块,当该模块被取消或者不使用时,调用unsubscribe方法来取消订阅. (需要手动注销调用,否则持续执行)
*subScribeAction*
  `subscribeAction(handler: Function, options?: Object): Function`
  订阅store的actions. handler会在每个actions分发的时候调用,并接受action描述和当前store的state这两个参数(actions + state).
  同样,subscribeAction方法也会返回一个unsubscribeAction方法,用于取消改订阅动作.
  ```js
  const unsubscribeAction = store.subscribeAction((mutation, state) => {
    console.log(mutation.type)
    console.log(mutation.payload)
  })
  // 你可以调用 unsubscribeAction 来停止订阅。
  unsubscribeAction()
  ```
  默认情况下, 新的处理函数会被添加到调用链的末端. 所以会在其他处理函数之后执行.
  使用 { prepend: true } 就是为了将其放置在调用链的开头
  `store.subscribeAction(handler, { prepend: true })`
  和subscribe相比,subscribeAction可以指定订阅处理函数的调用机制应用的时机,默认在分发之前,可以按需设置.
  同时还可以捕获到处理异常,并抛出.
  ```js
  store.subscribeAction({
    before: (action, state) => {
      console.log(`before action ${action.type}`)
    },
    after: (action, state) => {
      console.log(`after action ${action.type}`)
    },
    error: (action, state, error) => {
      console.log(`after action ${action.type}`)
      console.error(error)
    }
  })
  ```
*registerModule*
  `registerModule(path: string | Array<string>, module: Module, options?: Object)`
  注册一个动态模块
  ```js
  // 根据文件信息,注册动态vuex-module模块
  const services = require.context('@/services/', true, /index\.js$/)
  services.keys().forEach(key => {
    const name = camelCase(key.split(/\//).reverse()[1])
    store.registerModule(name, services(key).default)
  })
  ```
*unregisterModule*
  `unregisterModule(path: string | Array<string>)`
  卸载动态模块
*hasModule*
  `hasModule(path: string | Array<string>): boolean`
  检查该模块的name是否被占用
*hotUpdate*
  `otUpdate(newOptions: Object)`
  热替换新的action和mutation

# 辅助函数
*mapState*
  `mapState(namespace?: string, map: Array<string> | Object<string | function>): Object`
  为组件创建计算属性,以返回 vuex store 中的状态
  第一个参数是可选的,可以是一个命名空间字符串;第二个参数可以是一个对象(由计算属性组成)
*mapGetters*
  `mapGetters(namespace?: string, map: Array<string> | Object<string>): Object`
  为组件创建计算属性,以返回 getter 的返回值
  第一个参数是可选的,可以是一个命名空间的字符串;
*mapActions*
  `mapActions(namespace?: string, map: Array<string> | Object<string | function>): Object`
  创建组件的方法,并分发action
  第一个参数是可选的,可以是一个命名空间的字符串;
  其实就是将actions,复制给组件的methods,方便组件调用
*mapMutation*
  类似 Actions
*createNamespacedHelpers*
  `createNamespacedHelpers(namespace: string): Object`
  创建基于`命名空间`的组件绑定辅助函数. 返回一个包含`mapState`,`mapGetters`,`mapActions`,`mapMutations`的对象.
  它们都已经绑定到了对应的命名空间下. (生成辅助函数,并将其暴露出来)
# 组合式函数
*useStore*
  `useStore<S = any>(injectKey?: InjectionKey<Store<S>> | string): Store<S>;`
  在`setup`钩子函数中调用该方法,可以获取注入的`store`.
  ```js 基础用法
  import { useStore } from 'vuex'
  export default {
    setup () {
      const store = useStore() // 注入的store都被获取到了
    }
  }
  ```

  使用`injection key`来检索已经定义好的`store`.
  将`store`实例安装到`vue应用`的时候, 定义`injection key`,并和`store`一起传递给`vue应用`
  ```ts 声明 injection key
  // store.ts
  import { InjectionKey } from 'vue'
  import { createStore, Store } from 'vuex'

  export interface State {
    count: number
  }

  export const key: InjectionKey<Store<State>> = Symbol()

  export const store = createStore<State>({
    state: {
      count: 0
    }
  })
  ```
  ```ts 将定义好的key作为第二参数, 传递给vue
  // main.ts
  import { createApp } from 'vue'
  import { store, key } from './store'
  const app = createApp({ ... })
  app.use(store, key)
  app.mount('#app')
  ```
  ```ts 将key传递给useStore,获取对应的实例
  // 在 vue 组件内
  import { useStore } from 'vuex'
  import { key } from './store'
  export default {
    setup () {
      const store = useStore(key)
      store.state.count // 类型为 number
    }
  }
  ```
