# new Vue 发生了什么

new Vue()
- 实例化封装好的Vue类
- 调用init方法, 对Vue实例进行初始化
  - 合并配置
  - 初始化生命周期
  - 初始化事件中心
  - 初始化渲染
  - 初始化: data props computed watcher等 (数据的绑定 Observer Dep Watcher)
- 最后返回的实例是已经绑定好各种依赖关系的;

new关键字在JS中代码初始化一个实例对象;
```js
  // js实现new关键字的方法
  function _new(constructor, ...arg) {
    var obj = {};
    obj.__proto__ = constructor.prototype;
    var res = constructor.apply(obj, arg);
    return Object.prototype.toString.call(res) === '[object Object]' ? res : obj;
  }
```
Vue是一个封装的类; 是通过Function来实现的; 在`src/core/instance/index.js`中
```js
  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue必须通过new关键字来实例化')
    }
    this._init(options) // 初始化配置项
  }
```
初始化init方法, 在`src/core/instance/init.js`中实现
```js
  Vue.prototype._init = function (options?: Object) {
    /**
     * init初始化
     * 1. 设置uid
     * 2. 合并配置项
     * ...
     * n. 判断el选项, mount到el选项上
     */
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
    /**
     * 如果存在el选项, 就调用 vm.$mount 挂载到el上
     * 这是生命周期中, created之后准备挂载的判断
     */

    // 进入实例的挂载过程 ⬇️
  }
```
- 在init方法中, 将`不同的逻辑功能, 拆分成单独的函数`执行; 让主线的逻辑一目了然, 这种思想和写法值得学习和借鉴;
- 在初始化的最后，检测到如果有`el`属性，则调用 vm.$mount 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM

# Vue实例挂载的实现

在Vue中, 通过`$mount`来挂载实例化vm的;`$mount`在很多文件中都有定义;
`$mount`这个方法和平台、构建方式相关的;
着重分析: compiler版本的'$mount',这是抛弃webpack的vue-loader,在纯粹的前端环境分析Vue工作原理;

```js
    // src/platform/web/entry-runtime-with-compiler.js
    const mount = Vue.prototype.$mount // 缓存原型上的 $mount, 并对其进行重构
    Vue.prototype.$mount = function (
      el?: string | Element,
      hydrating?: boolean
    ): Component {
      el = el && query(el)
      // 对el选项进行限制, 禁止使用html,body等非常规的dom节点
      if (el === document.body || el === document.documentElement) {
        process.env.NODE_ENV !== 'production' && warn('不能绑定到html/body等非常规的节点')
        return this
      }
      const options = this.$options
      // resolve template/el and convert to render function
      // 所有的Vue组件的渲染,都需要使用render function; 这是 Vue 在线编译的过程;
      if (!options.render) { // 如果不存在render方法
        let template = options.template
        if (template) {
          if (typeof template === 'string') {
            if (template.charAt(0) === '#') {
              template = idToTemplate(template)
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' && !template) {
                warn(
                  `Template element not found or is empty: ${options.template}`,
                  this
                )
              }
            }
          } else if (template.nodeType) {
            template = template.innerHTML
          } else {
            if (process.env.NODE_ENV !== 'production') {
              warn('invalid template option:' + template, this)
            }
            return this
          }
        } else if (el) {
          template = getOuterHTML(el)
        }
        if (template) {
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            mark('compile')
          }
          // 使用 compileToFunctions 这个方法, 实现Vue的在线编译转换
          const { render, staticRenderFns } = compileToFunctions(template, {
            shouldDecodeNewlines,
            shouldDecodeNewlinesForHref,
            delimiters: options.delimiters,
            comments: options.comments
          }, this)
          options.render = render
          options.staticRenderFns = staticRenderFns
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            mark('compile end')
            measure(`vue ${this._name} compile`, 'compile', 'compile end')
          }
        }
      }
      return mount.call(this, el, hydrating)
    }
    // 重写 Vue 原型上的 $mount 方法之后, 调用挂载;
```
最初挂载到原型上的$mount方法: `src/platform/web/runtime/index.js`
```js
    /**
     * 公用的mount方法
     * 第一个参数是el选项, 如果是浏览器端, 会被query方法转换成Dom对象;
     * 第二个参数是 hydrating ? hydrate ? SSR中的水车模型? 这个没有彻底理解
     *      这个参数是控制是否由服务端渲染, 应该是SSR时调用的配置;
     */
    Vue.prototype.$mount = function (
      el?: string | Element,
      hydrating?: boolean
    ): Component {
      el = el && inBrowser ? query(el) : undefined
      return mountComponent(this, el, hydrating)
    }
```
$mount会调用 `src/core/instance/lifecycle.js` 中的 `mountComponent` 方法:
```js
    从上面的代码可以看到，mountComponent 核心就是先实例化一个渲染Watcher，在它的回调函数中会调用 updateComponent 方法，在此方法中调用 vm._render 方法先生成虚拟 Node，最终调用 vm._update 更新 DOM。

Watcher 在这里起到两个作用，一个是初始化的时候会执行回调函数，另一个是当 vm 实例中的监测的数据发生变化的时候执行回调函数，这块儿我们会在之后的章节中介绍。

函数最后判断为根节点的时候设置 vm._isMounted 为 true， 表示这个实例已经挂载了，同时执行 mounted 钩子函数。 这里注意 vm.$vnode 表示 Vue 实例的父虚拟 Node，所以它为 Null 则表示当前是根 Vue 的实例。

    /**
     * mountComponent:
     * ! 核心: 实例化一个渲染Watcher (监听渲染)
     * ! 核心: vm._render() 生成虚拟node
     * ! 核心: vm._update() 进行渲染Dom
     * vm._isMounted() 判断是否挂载成功
     * callHook(xxx) 每执行一步,就执行对应的钩子函数
     */
    export function mountComponent (
      vm: Component,
      el: ?Element,
      hydrating?: boolean
    ): Component {
      /**
       * 传入组件, el选项, ssr 返回一个组件
       * 这是介于 @beforeMount @mounted 之间的过程节点: vm.$el 就是构建的vDom
       * 在这个过程中, 会分别调用渲染前后的钩子函数
       */
      vm.$el = el // 将当前的el绑到vm上
      if (!vm.$options.render) { // 如果不存在render function
        vm.$options.render = createEmptyVNode // createEmptyVNode: 创建一个空的Vnode节点
        if (process.env.NODE_ENV !== 'production') { // 非生产环境运行时
          if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') || vm.$options.el || el) {
            warn('当前为运行时的vue版本,无法调用模板编译器; 建议编译为渲染函数, 或者在生成器中编译@', vm)
          } else {
            warn('mount失败, 没有找到templete和render function', vm);
          }
        }
      }
      callHook(vm, 'beforeMount')

      let updateComponent
      /**
       * vm._render() -> 生成`虚拟node`
       * vm._update() -> 渲染, 更新Dom
       */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        updateComponent = () => {
          const name = vm._name
          const id = vm._uid
          const startTag = `vue-perf-start:${id}`
          const endTag = `vue-perf-end:${id}`

          mark(startTag)
          const vnode = vm._render()
          mark(endTag)
          measure(`vue ${name} render`, startTag, endTag)

          mark(startTag)
          vm._update(vnode, hydrating)
          mark(endTag)
          measure(`vue ${name} patch`, startTag, endTag)
        }
      } else {
        updateComponent = () => {
          vm._update(vm._render(), hydrating)
        }
      }
      /**
       * 创建一个新的观察者绑定到vm上;
       * 作用1: 初始化的时候, 会执行回调函数
       * 作用2: 监听到数据变化时, 会执行回调函数
       * 可以看到, 钩子函数, 都是在watcher中执行的, 顺序: data changes -> watcher -> hooks
       */
      new Watcher(vm, updateComponent, noop, {
        before () {
          if (vm._isMounted) {
            callHook(vm, 'beforeUpdate')
          }
        }
      }, true); // 第二个参数: 是否渲染已声明的Watcher
      hydrating = false // false --> 在浏览器中运行
      /**
       * 在钩子函数中, 调用 mounted 来注册渲染子组件
       * vm.$vnode == null 判断出当前为根节点, 从下到上挂载, 根节点挂载完毕就callHook
       */
      if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
      }
      return vm
    }
    /**
     * callHook: 调用钩子函数;
     * @beforeCreate   创建之前
     * @created        创建完毕
     * @beforeMount    挂载之前
     * @mounted        挂载完毕
     * @beforeUpdate   更新之前
     * @updated        更新完毕
     * @beforeDestroy  销毁之前
     * @destroyed      销毁完毕
     * @activated      激活(从第二次开始, 打开keep-alive组件触发)
     * @deactivated    激活完毕(从第二次开始, 打开keep-alive组件触发)
     * @errorCaptured  错误处理
     * @serverPrefetch SSR的渲染函数
     */
```

# render

`vm._render`调用的是实例的一个私有方法, 作用就是生成 node节点;
在 `src/core/instance/render.js` 中定义:
```js
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options // 获取配置中的 render, 上层节点
    // 遍历 重置 插槽上的标识
    if (process.env.NODE_ENV !== 'production') {
      for (const key in vm.$slots) {
        // $flow-disable-line -> 禁止flow语法检查 ??? 没看懂
        vm.$slots[key]._rendered = false
      }
    }
    if (_parentVnode) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
    }
    /**
     * 设置父级vnode, 允许所有的render function访问
     * slot的数据进行填充占位
     */
    vm.$vnode = _parentVnode
    // render self -> 渲染本vnode节点
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
      // << 调用render方法 >>
    } catch (e) {
      handleError(e, vm, `render`)
      /**
       * 返回错误的渲染结果
       * 或者返回上一个vnode节点, 避免渲染错误产生空白组件
       */
      if (process.env.NODE_ENV !== 'production') {
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          } catch (e) {
            handleError(e, vm, `renderError`)
            vnode = vm._vnode
          }
        } else {
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    }
    /**
     * 渲染出错时, 返回空的vNode
     */
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn('Render function 应该返回一个根节点, 允许多个子节点',vm)
      }
      vnode = createEmptyVNode()
    }
    /**
     * 绑定上层节点, 并返回当前的vNode
     */
    vnode.parent = _parentVnode
    return vnode
  }
```
```js
  <div id="app">
    {{ message }}
  </div>
  // 编写render function
  render: function (createElement) {
    return createElement('div', {
      attrs: {
        id: 'app'
      },
    }, this.message)
  }
  // vnode = render.call(vm._renderProxy, vm.$createElement)
```
手动实现的 createElement 方法, 就是 vm.$createElement 方法;
vm._render的作用就是: 调用createElement, 生成vNode节点 (这是virtual Dom的基础组成)

# Virtual Dom

Dom元素在浏览器中频繁操作时, 对资源的占用是比较大的; 造成性能问题;
∆ CPU/GPU都可以进行渲染; 具体的流程没有深入研究 ????
在`src/core/vdom/vnode.js`中, 有对virtual dom流程的描述
```js
  export default class VNode {
    tag: string | void;
    data: VNodeData | void;
    children: ?Array<VNode>;
    text: string | void;
    elm: Node | void;
    ns: string | void;
    context: Component | void; // rendered in this component's scope
    key: string | number | void;
    componentOptions: VNodeComponentOptions | void;
    componentInstance: Component | void; // component instance
    parent: VNode | void; // component placeholder node
    // strictly internal
    raw: boolean; // contains raw HTML? (server only)
    isStatic: boolean; // hoisted static node
    isRootInsert: boolean; // necessary for enter transition check
    isComment: boolean; // empty comment placeholder?
    isCloned: boolean; // is a cloned node?
    isOnce: boolean; // is a v-once node?
    asyncFactory: Function | void; // async component factory function
    asyncMeta: Object | void;
    isAsyncPlaceholder: boolean;
    ssrContext: Object | void;
    fnContext: Component | void; // real context vm for functional nodes
    fnOptions: ?ComponentOptions; // for SSR caching
    fnScopeId: ?string; // functional scope id support

    constructor (
      tag?: string,
      data?: VNodeData,
      children?: ?Array<VNode>,
      text?: string,
      elm?: Node,
      context?: Component,
      componentOptions?: VNodeComponentOptions,
      asyncFactory?: Function
    ) {
      this.tag = tag
      this.data = data
      this.children = children
      this.text = text
      this.elm = elm
      this.ns = undefined
      this.context = context
      this.fnContext = undefined
      this.fnOptions = undefined
      this.fnScopeId = undefined
      this.key = data && data.key
      this.componentOptions = componentOptions
      this.componentInstance = undefined
      this.parent = undefined
      this.raw = false
      this.isStatic = false
      this.isRootInsert = true
      this.isComment = false
      this.isCloned = false
      this.isOnce = false
      this.asyncFactory = asyncFactory
      this.asyncMeta = undefined
      this.isAsyncPlaceholder = false
    }
    /**
     * DEPRECATED: alias for componentInstance for backwards compat.
     * 不推荐使用：用于向后兼容的componentInstance的别名。
     */
    get child (): Component | void {
      return this.componentInstance
    }
  }
```
Vue使用 `snabbdom` 这个库, 来实现 `virtual dom`;
核心的内容是: 关键属性, 标签名, 数据, 子节点, 键值对;;;
核心的方法有: create, diff, patch, h()

# createElement

调用createElement方法, 生成vNode节点; 同时这个vNode节点也有他的children, 这样一层层向下查找;
形成了一个系统的`vNode tree`;

# update

和`vm._render`一样,`_update`也是vue私有的方法;
有两种调用的情况:
- 首次调用
- 检测到数据更新时调用

_update的核心就是:`vm.__patch__`; 对比节点的异同, 然后patch补丁;
