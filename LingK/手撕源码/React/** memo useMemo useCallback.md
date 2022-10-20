# React.memo 配合 useMemo 和 useCallback

https://baijiahao.baidu.com/s?id=1688962444591273494&wfr=spider&for=pc
https://blog.csdn.net/qq_45022698/article/details/125839109

举例:

## React.memo

```js
// 子组件
function ChildComp() {
  console.log("render child-comp ...");
  return <div>Child Comp ...</div>;
}
// 父组件
function ParentComp() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp />
    </div>
  );
}
```

当父组件对按钮进行点击,会改变 state,子组件也会被重新渲染;实际的业务场景中,并不需要这样渲染.
使用`React.memo`对子组件进行优化,将其缓存起来

```js
import React, { memo } from "react";
let ChildComp = function () {
  console.log("render child-comp ...");
  return <div>Child Comp ...</div>;
};
ChildComp = memo(ChildComp);
```

## useCallback

父组件给子组件传递一些 props

```js
import React, { memo } from "react";
// 子组件
const ChildComp = memo(function ({ name, onClick }) {
  console.log("render child-comp ...");
  return (
    <>
      <div>Child Comp ... {name}</div>
      <button onClick={() => onClick("hello")}>改变 name 值</button>
    </>
  );
});
// 父组件
function ParentComp() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
  const [name, setName] = useState("hi~");
  const changeName = (newName) => setName(newName); // 父组件渲染时会创建一个新的函数
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp name={name} onClick={changeName} />
    </div>
  );
}
```

在父组件中点击按钮,子组件的打印信息会触发
父组件点击按钮,会重新生成`changeName`函数,并传递给子组件
子组件接收的`onClick`方法发生了改变,导致页面重新渲染了.
**所以这里不属于 bug,memo 确实监听到了子组件接受 prop 改变才去渲染的;**

思考:仅点击按钮,并未对子组件做任何操作,不希望子组件发生变化,能否把`onClick`也进行包裹缓存?

```js
import React, { useCallback } from "react";

function ParentComp() {
  const [name, setName] = useState("hi~");
  // 每次父组件渲染，返回的是同一个函数引用
  const changeName = useCallback((newName) => setName(newName), []);
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp name={name} onClick={changeName} />
    </div>
  );
}
```

`useCallback`起到了缓存的作用,即便父组件进行了渲染,`useCallback`包裹的函数也不会重新生成了.返回上一次函数引用.

# useMemo

当父组件通过对象的形式将数据传递给子组件时

```js
import React, { useCallback } from "react";
function ParentComp() {
  // ...
  const [name, setName] = useState("hi~");
  const [age, setAge] = useState(20);
  const changeName = useCallback((newName) => setName(newName), []);
  const info = { name, age }; // 复杂数据类型属性
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp info={info} onClick={changeName} />
    </div>
  );
}
```

这里 memo 未拦截的原因和回调函数一样,引用地址发生了改变,视为新的 prop 值.
useMemo第一个参数是一个函数,返回的对象都指向同一个引用,不会创建新的对象.
useMemo第二个参数是一个数组,只有当数组改变时,才会重新生成一个引用.

```js
function ParentComp() {
  // ....
  const [name, setName] = useState("hi~");
  const [age, setAge] = useState(20);
  const changeName = useCallback((newName) => setName(newName), []);
  const info = useMemo(() => ({ name, age }), [name, age]); // 包一层
  return (
    <div>
      <button onClick={increment}>点击次数：{count}</button>
      <ChildComp info={info} onClick={changeName} />
    </div>
  );
}
```
