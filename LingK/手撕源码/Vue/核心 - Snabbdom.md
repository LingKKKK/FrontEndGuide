# Vue的虚拟DOM是基于Snabbdom

Snabbdom提供了一下方法,用于更新虚拟DOM:

## 6种模块钩子数组
    create
    update
    remove
    destroy
    pre
    post

## 8个功能辅助函数

  emptyNodeAt
    参数：(elm: Element)
    作用：将真实dom元素转换为虚拟dom节点。
    返回值：虚拟dom节点

  createRmCb
    creat real dom ballback
    参数：(childElm: Node, listeners: number)
    作用：创建删除真实dom节点的回调函数
    返回值：删除真实dom节点的回调函数

  createElm -> 将虚拟节点转换成真实的DOM节点,并挂载到DOM树上
    参数：(vnode: VNode, insertedVnodeQueue: VNodeQueue)
    insertedVnodeQueue
      语义：已插入的虚拟dom节点队列。
      来源：patch函数执行时创建。
      作用：用于缓存已新增的虚拟dom节点。
    作用：创建真实dom元素，并且更新参数vnode的elm属性。
    返回值：真实dom元素

  addVnodes
    参数：
    ( parentElm: Node, before: Node | null, vnodes: VNode[], startIdx: number, endIdx: number, insertedVnodeQueue: VNodeQueue )
    insertedVnodeQueue
    用于收集已插入的虚拟dom节点
    作用：用于将vnodes中指定开始索引startIdx和结束索引endIdx的虚拟dom节点添加到指定的父真实dom节点parentElm下的before真实dom节点之前。
    返回值：void

  invokeDestroyHook -> 遍历触发节点的销毁钩子函数
    参数：(vnode: VNode)
    作用：用于触发用户挂载的destroy钩子任务
    返回值：void
      涉及到1个用户钩子：vnode.data.hook.destroy
        最先被调用
        实参：(vnode)
        若用户挂载了destroy钩子任务，就会被触发。
      同时会触发模块destroy钩子任务
        实参：(vnode)

  removeVnodes -> 移除虚拟dom节点
    参数: ( parentElm: Node, vnodes: VNode[], startIdx: number, endIdx: number )
    作用：用于删除父元素parentElm（真实dom元素）下指定vnodes中开始索引startIdx到结束索引endIdx的之间的虚拟dom节点s对应的真实dom元素s。
    返回值：void

  updateChildren -> 对比更新虚拟dom节点
    参数:
      ( parentElm: Node, oldCh: VNode[], newCh: VNode[], insertedVnodeQueue: VNodeQueue )
      insertedVnodeQueue
        用于收集已插入的虚拟dom节点
      oldCh
        parentElm元素下旧的真实dom节点对应的虚拟dom节点对象数组
      newCh
        parentElm元素下应该有的真实dom节点对应的虚拟dom节点对象数组。
    作用：用于更新父元素parentElm（真实dom元素）下的真实dom元素。
    返回值：void
  ```js
    arr: ['a', 'b', 'c', 'd'],
    this.arr.splice(1, 0, 'x');
    // 如果数组key值,调用`updateChildren`方法会执行`3`次更新和`1`次插入操作
    // 如果存在key值,因为key值相同只会比较,没有更新不做操作,所以只会做一次插入操作
  ```

  patchVnode -> 对比新旧节点的差异,并更新
    参数：(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue)
    insertedVnodeQueue
      用于收集已插入的虚拟dom节点
    作用：用于对比新旧虚拟dom节点并将差异更新到真实dom中
    返回值：void

  patch函数 -> 对比更新vnode对象
    参数：(oldVnode: VNode | Element, vnode: VNode)
    作用：用于比较新虚拟dom节点跟旧真实dom元素或旧虚拟dom节点之间的差异，并将其更新到真实的dom树中。
    返回值：更新所有差异后的vnode对象
