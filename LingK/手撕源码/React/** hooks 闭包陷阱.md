# 什么是闭包?

闭包是指有权访问另一个函数作用域中变量的函数.
创建闭包的最常见的方式就是在一个函数内创建另一个函数，通过另一个函数访问这个函数的局部变量,利用闭包可以突破作用链域

闭包的特性：

- 函数内再嵌套函数
- 内部函数可以引用外层的参数和变量
- 参数和变量不会被垃圾回收机制回收

# hooks 闭包陷阱

[闭包陷阱 1](https://segmentfault.com/a/1190000041798153)

```js 闭包陷阱1: useCallback
function Chat() {
  const [text, setText] = useState("");
  const onClick = useCallback(() => {
    sendMessage(text);
  }, []);
  return <SendButton onClick={onClick} />;
}
/**
 * 我们期望的流程是: 点击 SendButton 按钮,触发 onClick 方法, 给 sendMessage 传递最新的值.
 * 实际上,由于 useCallback 将回调函数缓存起来形成了 闭包 ,所以点击时, 始终触发 sendMessage("")
 *
 */

// 尝试给useCallback增加依赖项
const onClick = useCallback(() => {
  sendMessage(text);
}, [text]);
/**
 * 这样改造之后,每当依赖项[text]变化时,useCallback都会返回一个全新的onClick引用.
 * 这样就失去了 useCallback 缓存函数引用的作用了.
 */

// React官方提供的解决方案是: useEvent
function Chat() {
  const [text, setText] = useState("");
  const onClick = useEvent(() => {
    sendMessage(text);
  });
  return <SendButton onClick={onClick} />;
}
/** useEvent >>> 封装事件处理函数
 * 特性1: 在组件中多次引用时,保持一致(和callback一样)
 * 特性2: 函数内部始终能获取到最新的 props 和 state (相对于callback新增功能)
 * ** 每次页面渲染的时候,更新了引用信息,确保每次调用都能访问到最新的值.
 * useEvent能否获取到最新的state与props取决于handlerRef.current更新的时机
 *
 * 对比ahooks-useMemoizedFn缓存函数:hooks/packages/hooks/src/useMemoizedFn/index.ts
 */
function useEvent(handler) {
  const handlerRef = useRef(null);
  useLayoutEffect(() => {
    // 保证了handlerRef.current始终在视图完成渲染后再更新
    handlerRef.current = handler;
  });
  // 用useCallback包裹，使得render时返回的函数引用一致
  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}
```

[闭包陷阱 2](https://juejin.cn/post/6844904193044512782)

```js 闭包陷阱2 useEffect
function App() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    setInterval(() => {
      console.log(count);
    }, 1000);
  }, []);
}
/**
 * 在这个定时器中打印 count, 期望的结果是 count 内容被修改之后, 打印最新的count值.
 * 实际上,定时器中打印count,只会打印初始值1.
 * 变量以闭包的形式一直存在于函数中,不会随着外部的内容更新而更新. 这个和 经典的for循环闭包 一样.
 */

// 使用useRef就能每次拿到最新的值; 同一个对象,不同闭包时机的变量进行联系. 引用地址,引用对象.
function App() {
  // return <Demo1 />
  return <Demo2 />;
}
function Demo2() {
  const [obj, setObj] = useState({ name: "chechengyi" });
  useEffect(() => {
    setInterval(() => {
      console.log(obj);
    }, 2000);
  }, []);
  function handClick() {
    setObj((prevState) => {
      var nowObj = Object.assign(prevState, {
        name: "baobao",
        age: 24,
      });
      console.log(nowObj == prevState);
      return nowObj;
    });
  }
  return (
    <div>
      <div>
        <span>
          name: {obj.name} | age: {obj.age}
        </span>
        <div>
          <button onClick={handClick}>click!</button>
        </div>
      </div>
    </div>
  );
}
```

[参考文档](https://developer.51cto.com/article/711011.html)
