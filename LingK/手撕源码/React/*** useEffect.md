# useEffect 描述

```js
//副作用函数
useEffect(() => {
  return () => {}; // 返回函数
}, [依赖参数]);
```

副作用钩子: 用于处理组件中的副作用,用来取代声明周期函数.
在 React 中, 副作用是一个函数, 它会在组件的生命周期中被调用.

# useEffect 作用

- 挂载阶段
  从上至下执行函数,如果碰到`useEffect`就执行,并将`useEffect`函数`推入队列`中(`hooks链表`);
  在组件挂载完成之后,将`队列(链表)`中的` 副作用函数``依次执行 `
  将执行完毕的`副作用函数`的`返回函数`推入到一个新的队列(链表)
- 更新阶段
  _取决于依赖的参数_
  从上至下执行函数,如果碰到`useEffect`就执行,并将`useEffect`函数`推入队列`中(`hooks链表`);
  在`组件更新完成`之后，找出之前的`返回函数队列`，依次`准备执行`
  在执行前会判断该`useEffect`的`依赖参数`，如果` 依赖参数``改变 `就执行，否则跳过当前项去看下一项
- 卸载阶段
  在组件卸载时,找到对应的返回函数队列,依次执行

_依赖参数不同,有不同的处理逻辑_

- 空
  组件的任何更新,都会执行该`useEffect`函数
- 空数组
  不监听组件的更新,只在挂载时执行一次
- 数组中有具体的值
  对应的依赖数据有变化时,才会执行

```js 组件挂载完之后执行
useEffect(() => {
  console.log("组件挂载完之后执行");
  return () => {};
}, []);
```

```js 组件挂载完成之后及更新完成之后执行
useEffect(() => {
  console.log("组件挂载完成之后及更新完成之后执行");
});
```

```js 组件更新完成
const isMounted = useRef(false);
useEffect(() => {
  if (isMounted.current) {
    console.log("组件更新完成");
  } else {
    isMounted.current = true;
  }
});
```

```js 组件即将卸载时执行
useEffect(() => {
  return () => {
    console.log("组件即将卸载时执行");
  };
}, []);
```

# useEffect 和 useLayoutEffect 的区别

本质上是一样的,调用的时机不同.
`useLayoutEffect`是 DOM 变更之后同步调用的`effect`,在执行时机上,早于`useEffect`;
`useLayoutEffect`是同步的. `useEffect`是异步的.

举例: 点击触发更新之后，如果 count 之前的状态是 0，我们随机生成一个数字，在阻塞一段时间，在设置 count 位随机值，看看在 useEffect 和 useLayoutEffect 这两种情况下会有什么不同

```js
import React, { useLayoutEffect, useState, useEffect } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  //用 useLayoutEffect 试试
  useEffect(() => {
    if (count === 0) {
      const randomNum = Math.random() * 100; //随机生成一个数字
      const now = performance.now();
      while (performance.now() - now < 100) {
        //阻塞一段时间
        console.log("blocking...");
      }
      setCount(randomNum); //重新设置状态，设置成随机数
    }
  }, [count]);
  return <div onClick={() => setCount(0)}>{count}</div>;
}
//在useEffect的情况下，不断点击触发更新，偶尔会显示0
//在useLayoutEffect的情况下，不断点击触发更新，不会偶现0
```

在执行过程中,不管`首次渲染`还是`更新`,都会经历`commit`阶段.

`commit`阶段的工作: 处理钩子函数,生命周期,遍历 render 阶段生成 Effect 链表,将带有副作用的 fiber 节点应用到 DOM 上.

`commit`阶段的执行流程:
`commitRootImpl`函数是`commit`流程的核心方法,在这个方法中分为三个部分:

- commit 阶段的前置工作
- mutation 阶段
  - 调用`commitBeforeMutationEffects`，`scheduleCallback`调度执行`flushPassiveEffects`
  - 调用`commitMutationEffects`，处理相关的副作用，操作真实节点`useLayoutEffect`的销毁函数在这个函数中执行
  - 调用`commitLayoutEffects`，调用`commitLayoutEffects`的回调函数，副作用应用到了真实的 DOM 上.
  - 在 commit 阶段结束之后`flushPassiveEffects`执行`useEffect`的销毁函数和回调函数.
- commit 阶段收尾工作

**在 commit 阶段不同时机执行，useEffect 在 commit 阶段结尾异步调用，useLayout/componentDidMount 同步调用**

# effect 实现流程

```js
export function useEffect (create: () = >(() = >void) | void, deps: Array < mixed > |void | null, ) : void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}
```

`useEffect`所产生的`hooks`会放置在`memoizedState`上,生成一个`effect`对象,与其他的`effect`对象形成链表.

- 单个`effect`对象包含:
  - `create`: 传入`effect`的第一个参数(`callback`)
  - `destory`: 回调函数中的 return 函数,在该`effect`销毁的时候执行.默认发生在第一次渲染后.
  - `deps`: 传入`effect`的第二个参数(`deps`) undefined | [] | [state,state,...]
    - 相当于`componentDidMount`和`componentDidUpdate`的组合
  - `next`: 指向下一个`effect`；
  - `tag`: `effect`的类型，区分 useEffect 和 useLayoputEffect。

hook 会挂载到 fiber.memoizedState 上
hook 按出现顺序进行存储，memoizedState 存储了 useEffect 的 effect 对象（effect1）
next 指向 useLayoutEffect 的 3effect 对象（effect2）
effect2 的 next 又会指向 effect1
_最终形成闭环_

**useEffect 执行顺序**
1、触发组件重新渲染（通过改变组件 state 或者组件的父组件重新渲染，导致子节点渲染）
2、组件函数执行
3、组件渲染后呈现到屏幕上
4、useEffect hook 执行

**useLayoutEffect 执行顺序**
1、触发组件重新渲染（通过改变组件 state 或者组件的父组件重新渲染，导致子组件渲染）
2、组件函数执行
3、useLayoutEffect hook 执行, React 等待 useLayoutEffect 的函数执行完毕
4、组件渲染后呈现到屏幕上

*useEffect 异步执行的优点是，react 渲染组件不必等待 useEffect 函数执行完毕，造成阻塞*
