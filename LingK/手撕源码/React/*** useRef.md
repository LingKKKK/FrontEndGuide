# useRef

useRef 的两个用法:

- 操作 DOM
- 永久存储数据

useRef 的返回值是一个可变的对象,并且这个对象的值发生改变时不会引发页面的渲染. 同样页面的渲染也不会直接触发这个对象变更.
useRef 可以存储不需要一起页面渲染的数据;
修改 useRef 值的唯一方法是修改 useRef 的 `current`,并且修改后不会引发重新渲染.

```js
const DemoRef = memo(() => {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    inputEl.current.focus();
    inputEl.current.value = "自定义";
  };
  return (
    <>
      <div className={`${classPrefix}-title`}>---useRef---</div>
      {(() => {
        console.log("render");
        return null;
      })()}
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>click</button>
    </>
  );
});
// render
// 点击click:
```

useRef 可以用来做锚点跳转; >>> 操作 DOM

```js
const scrollRef = useRef(null)
const scrollToRef = (ref) = >{ // 跳转
  if (!ref) return
    ref.current.scrollIntoView({
    behavior: 'smooth'
  })
}
// ...
<>
  <div onClick = { () = >scrollToRef(scrollRef) }> 航行进度 </div>
  <span ref={scrollRef}></span>
</>
```

# 使用

使用 `useRef` 可以获取到被绑定元素.
使用 `ref` 对其进行指定,对象内部有 `current` 属性,这个属性就对应我们需要访问的`元素对象`.

```js 记录DOM
import React, { useRef } from "react";
function Ref() {
  const box = useRef();
  return (
    <div>
      <div ref={box}>useRef</div>
      <button onClick={() => console.log(box)}>+1</button>
    </div>
  );
}
export default Ref;
```

useRef 保存的数据不会因为组件的更新而丢失,例如我们获取到一个列表数据,我们肯定是不希望每次组件刷新都重新获取的.要么绑定在全局,要么使用 useRef 将它存起来. 所以 useRef 使用的场景也比较明确: *长缓存数据*.

```js 使用 useRef 保存数据
import React, { useRef, useEffect, useState } from "react";

function Ref() {
  let timerId = useRef();
  const [count, setCount] = useState(0);
  useEffect(() => {
    timerId.current = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);
  }, []);
  const stop = () => {
    console.log(timerId);
    clearInterval(timerId.current);
  };
  return (
    <div>
      <div>{count}</div>
      <button onClick={stop}>停止</button>
    </div>
  );
}
export default Ref;
```
