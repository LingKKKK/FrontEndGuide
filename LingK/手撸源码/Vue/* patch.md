## patch

通过`createComponent`创建了组件的vNode, 接下来会调用`vm._update`(渲染dom), 执行`vm._patch`;
`vm._patch`方法才是吧vNode转化成真正的DOM节点;

对创建节点元素的流程:
- 调用`createElm`创建元素节点 `src/core/vdom/patch.js`
- 调用`vm._update`
  - 执行`vm._patch`

```js
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
    // ...
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }
    // ...
  }
```

对创建组件的流程
- 调用`createComponent`创建组件 `src/core/vdom/create-component.js`
- 调用`vm._update`
  - 执行`vm._patch`

```js
  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    /**
     * 对vnode.data多了一些判断.
     * 确保vnode是一个组件的vnode
     * 得到的i, 就是init钩子函数
     * @insertedVnodeQueue 插入队列??? 将事件/队列插入vNode中
     */
    let i = vnode.data
    if (isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */)
      }
      /**
       * 在调用过init hook(初始化钩子)之后, 如果vNode是一个子组件,它应该创建一个子实例并挂载它;
       * 如果这个子组件设置了占位vNode的节点的element; 只需要返回这个element即可;
       * @initComponent 初始化组件
       * @isDef == is defined => {return params !== null/undefined}
       * @reactivateComponent 激活组件?? 挂载组件??
       */
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }
```
init钩子函数: `src/core/vdom/create-component.js`
```js
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // keep-alive组件
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      /**
       * 不考虑keep-alive的情况下
       * @createComponentInstanceForVnode 创建一个Vue的实例 (vNode)
       * 这个方法将options合并到了$options上, 后面的init和merge option会用到的
       * 通过调用$mount来挂载子组件
       */
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // 实例化完成之后执行
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },
```
实例化组件的vNode: `createComponentInstanceForVnode`
```js
    /**
     * @createComponentInstanceForVnode 构造内部组件的参数
     * vnode.componentOptions.Ctor ==> 子组件的构造函数 就是继承Vue的Sub(Vue子类)
     */
    export function createComponentInstanceForVnode (
      vnode: any, // 我们知晓其为`挂载组件的vnode`, 但是flow不知道, 需要特殊设置
      parent: any, // activeInstance in lifecycle state -> 当前激活的组件实例
    ): Component {
      const options: InternalComponentOptions = {
        _isComponent: true, // 代表他是一个组件
        _parentVnode: vnode, // 上层的vNode
        parent
      }
      // check inline-template render functions
      const inlineTemplate = vnode.data.inlineTemplate
      if (isDef(inlineTemplate)) {
        options.render = inlineTemplate.render
        options.staticRenderFns = inlineTemplate.staticRenderFns
      }
      return new vnode.componentOptions.Ctor(options)
      // 子组件的实例化就是在这一步进行
    }
```
在`createComponentInstanceForVnode`方法的结尾, 会调用`_init`方法, 完成初始化
```js
    // src/core/instance/init.js
    Vue.prototype._init = function (options?: Object) {
      const vm: Component = this
      // 合并options
      if (options && options._isComponent) {
        /**
         * optimize internal component instantiation, since dynamic options merging is pretty slow, and none of the internal component options needs special treatment.
         * 优化内部组件实例化，因为动态选项合并非常慢，并且没有任何内部组件选项需要特殊处理。
         * @initInternalComponent 通过赋值, 合并options方法, 没有深入的了解
         */
        initInternalComponent(vm, options)
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        )
      }
      // ...
      if (vm.$options.el) {
        vm.$mount(vm.$options.el)
      }
      /**
       * 由于组件是不传el的, 所以组件是自己接管了$mount的过程;
       * _init中调用$mount, 进而执行了 vm._render()
       */
    }
```

render中调用了_update, _update中调用了 vm.__patch__;
render执行完毕, 会生成DOM;
然后再调用insert方法, 完成DOM的插入;

## 插入DOM的顺序
如果组件patch的过程中,又创建了子组件, DOM的插入顺序是: 先子后父
