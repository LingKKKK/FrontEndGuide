# useState

可配合`useRef`使用,获取到最新的值

```js
const [count, setCount] = useState(initialCount);
```

useState 返回了一个`状态`和一个`修改状态的方法`;
`initialCount`是传入的初始状态,是惰性的,可以通过变量赋值,也可以通过函数返回值赋值.

```js
const [count, setCount] = useState(() => {
  const initialCount = someExpensiveComputation();
  return initialCount;
});
```

## 执行逻辑

`useState`的核心在`dispatcher`上,`dispatcher`通过`resolveDispatcher`方法来获取.
最终的效果是: `ReactCurrentDispatcher.current`值赋予给了`dispatcher`
∴ `useState(xxx)` === `ReactCurrentDispatcher.current.useState(xxx)`

1.首次渲染时,会从`beginWork`开始解析
2.在`beginWork`中,通过`fiber.tag`的类型,判断执行`函数式组件/类组件`
  调用`updateFunctionComponent`或者`updateClassComponent`
  (因为react-hooks一定是`函数式`,所以看`updateFunctionComponent`中的逻辑即可)
3.在`updateFunctionComponent`中,调用`renderWithHooks`方法
4.`renderWithHooks`这是react-hooks的核心逻辑;
  初始化`Dispatcher`
5.在`renderWithHooks`中,通过`memoizedState`变量判断是否已经初始化.
  `memoizedState`在函数式组件中的作用: 存放hooks; 等于`null`就是未曾初始化.
  如果`memoizedState === null`执行`mount`,否则执行`update`; (为初始化就执行挂载,否则执行更新)
6.执行`函数式组件`
  - `mount`
    挂载时, `ReactCurrentDispatcher.current` = `HooksDispatcherOnMount`
    被调用时 -> 初始化hooks链表 -> initialState -> dispatch函数 -> return
  - `update`
    挂载时, `ReactCurrentDispatcher.current` = `HooksDispatcherOnUpdate`
    被调用时 -> 判断执行的优先级 -> 遍历执行hooks链表的update方法 -> return
7.执行完毕之后,会返回`当前状态`和`修改状态的方法`.

**初次渲染时**
按照声明的顺序,依次执行`hooks`,将`state`,`deps`按照顺序添加到`memoizedState`中;共享链表,共享执行顺序;
**更新时**
按照`memoizedState`中的顺序,将上一次的值拿出来,执行完毕并更新返回新值.

**state在class和function中有什么不同, 连续触发的结果为什么不一致**
*结果*
在类组件中,页面中的state随着change事件依次累加;
在函数组件中,多次调用setState只会执行最后一次的setState;
*原因*
在类组件中,每次`this.state`引用的`count`,每一次通过`setTimeout`都能拿到上一次最新的`count`;
在函数组件中,每一次更新都是重新执行当前的函数,引用的`count`都指向同一个值;(像是引用地址和内存地址的关系);

## setCount 是同步还是异步?

```js
const handleClick = () => {
  console.log("value1: ", count);
  setCount((count) => count + 1);
  console.log("value2: ", count);
};
```

这个和 react 的事件机制有关系,合成事件均为异步,原生事件均为同步

## 连续调用 setCount 会发生什么?

```js 如果传入的值为普通值,经过 react 的调和,只会执行最后一次操作;
const handleClick = () => {
  console.log("value1: ", count);
  setCount(count + 1);
  console.log("value2: ", count);
  setCount(count + 1);
  console.log("value3: ", count);
};
```

```js 推荐使用函数进行修改
const handleClick = () => {
  console.log("value1: ", count);
  setCount((count) => count + 1);
  console.log("value2: ", count);
  setCount((count) => count + 1);
  console.log("value3: ", count);
};
```

## 修改复杂内容

react 对组件的更新使用的是浅对比,对于复杂类型的更新,只要引用地址没变就不视为变更.

```js
function App() {
  const [arr, setArr] = useState([1])
  const pushData = () => { // 引用地址没变,无法更新UI层
    arr.push(4)
    setArr(arr)
  }
  const pushData = () => { // 引用地址改变,可更新UI层
    setArr([...arr, 4])
  }
  return (
    <div
      <h4>{arr.join("-")}</h4>
      <button onClick={pushData}>点击添加数组</button>
    </div>
  )
}
```

# 源码简析

```js path:packages/react/src/ReactHooks.js
export function useState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return ((dispatcher: any): Dispatcher);
}
```

```js path:packages/react-reconciler/src/ReactFiberBeginWork.js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  /**
   * 在开始阶段之前,清除挂起的优先级状态. 重新更新任务队列
   */
  workInProgress.lanes = NoLanes;

  /**
   * 通过 fiber.tag 判断; 不同的`tag`走入不同的逻辑
   * 判断执行: 组件式/函数式 的更新
   */
  switch (workInProgress.tag) {
    // ...
    case FunctionComponent: {
      // 函数组件
      // hooks都是函数组件,都会走这个逻辑
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    case ClassComponent: {
      // 类组件
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    // ...
  }
}
```

```js path: packages/react-reconciler/src/ReactFiberBeginWork.js
// updateFunctionComponent 中处理方法
nextChildren = renderWithHooks(
  current,
  workInProgress,
  Component,
  nextProps,
  context,
  renderExpirationTime
);
```

```js
export function renderWithHooks < Props, SecondArg > (current: Fiber | null, workInProgress: Fiber,
             Component: (p: Props, arg: SecondArg) = >any, props: Props, secondArg: SecondArg, nextRenderLanes: Lanes, ) : any {
	// 若Fiber为空，则认为是首次加载
	ReactCurrentDispatcher.current =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;
	// 挂载时的Dispatcher
	const HooksDispatcherOnMount: Dispatcher = {
		readContext,
		// ...
		useCallback: mountCallback,
		useContext: readContext,
		useEffect: mountEffect,
		useMemo: mountMemo,
		useState: mountState,
		// ...
	};
	// 更新时的Dispatcher
	const HooksDispatcherOnUpdate: Dispatcher = {
		readContext,
		// ...
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useMemo: updateMemo,
		useRef: updateRef,
		useState: updateState,
		// ....
	};
}
```
