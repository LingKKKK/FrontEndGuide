# React API

## 组件的声明

    使用react组件，可以将UI拆分为独立、可复用的代码片段，每部分都可独立维护。

    1.如果不使用es6, 使用 create-react-class 模块，调用render方法来声明。
    2.React.Component 声明组件
    3.React.PureComponent 声明组件 「props, state」
    4.React.memo 定义组件包装函数 「props」

## 创建 React 元素

    使用JSX语法，通过React.createElement()创建并返回React元素
    不使用JSX时，通过createElement()、createFactory()来创建并返回React元素
    * createElement 「第一个参数是标签」

## 操作元素的 api

    cloneElement
      * 第一个参数是React元素
      * 属性会被合并，旧的元素会被替代，保留原始的键和引用
      ∆ 这也是区别createElement的地方
    isValidElement
      * 验证是否为React元素，返回true、false
    React.Children
      * 提供了一个处理 this.props.child 不透明数据结构的方法
      * map、forEach等方法，获取子元素的所有方法，类似透传

## 代码片段 、 组件嵌套

    React.Fragment
    * 能够在不建立DOM元素的情况下，让render函数返回多个元素
    * 简洁的语法就是 <>...</>

## Refs

    React.createRef: 创建react元素的ref属性
    React.forwardRef: 创建一个可接受ref属性转发的React组件

## Suspense 等待条件

    Suspense：使组件可以“等待”某些操作结束后，再进行渲染。
    * 目前仅支持的场景是：React.lazy动态加载组件。
    React.lazy: 动态加载组件
    React.Suspense: 等待渲染

```jsx
// 这个组件是动态加载的
const SomeComponent = React.lazy(() => import("./SomeComponent"));

// 该组件是动态加载的
const OtherComponent = React.lazy(() => import("./OtherComponent"));
function MyComponent() {
  return (
    // 显示 <Spinner> 组件直至 OtherComponent 加载完成
    <React.Suspense fallback={<Spinner />}>
      <div>
        <OtherComponent />
      </div>
    </React.Suspense>
  );
}
```

## Hooks
    「https://react.docschina.org/docs/hooks-reference.html」

    基础 Hook
      useState：state
      useEffect：副作用（回调）
      useContext：接受React.Context对象
    额外的 Hook
      useReducer：useState的替代方案，更适合做复杂的state监控 「向下传递dispatch，而非事件」
      useCallback：返回一个memoized回调函数，和react.memo一样，简化props渲染，浅对比
        * useCallback(fn, deps) 相当于 useMemo(() => fn, deps)
```jsx
        const memoizedCallback = useCallback(
          () => {
            doSomething(a, b);
          },
          [a, b],
        );
```
      useMemo：创建函数和依赖项的关系，区别于Effect的依赖关系。
```jsx
        const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
        /**
         * ! useMemo 和 useCallback 接收的参数都是一样,第一个参数为回调 第二个参数为要依赖的数据
         * 共同：依赖数据发生变化的时候，才会重新计算结果，起到了缓存的作用
         * 区别：1.useMemo计算结果是return回来的值，用户缓存计算结果的值
         *      2.useCallBack计算结果是函数，主要用户缓存函数（函数组件，函数包裹的组件），提升新能。
         */
```
      useRef：返回React.Ref对象
      useImperativeHandle：使用ref时，自定义暴露给父组件的实例值
        * 与 forwardRef 一起使用
```jsx
        function FancyInput(props, ref) {
          const inputRef = useRef();
          useImperativeHandle(ref, () => ({
            focus: () => {
              inputRef.current.focus();
            }
          }));
          return <input ref={inputRef} ... />;
        }
        // 渲染 <FancyInput ref={inputRef} /> 的父组件可以调用 inputRef.current.focus()
        FancyInput = forwardRef(FancyInput);
```
      useLayoutEffect：等同于Effect，针对于整个模板的渲染来说
        * 和componentDidMount、componentDidUpdate的调用时间是一样的
        * 尽量使用useEffect，出现问题的时候再使用useLayoutEffect
      useDebugValue：自定义hook的时候使用

# Hook FAQ
    「https://react.docschina.org/docs/hooks-faq.html」
