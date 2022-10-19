# useCallback

参数是内联回调函数和依赖项数组，
返回值是回调函数的 memoized 版，该回调函数仅在某个依赖项改变时才会更新。
结论：返回一个缓存的函数，添加依赖项数组可以避免函数的无意义计算，降低了子组件的渲染开销。

```js
const set = new Set();
const DemoCallback = memo(() => {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(2);

  const callback = useCallback(() => {
    // 这里做复杂运算
    return num1;
  }, [num1]);
  set.add(callback);
  const handleClick1 = () => {
    setNum1(num1 + 1);
  };
  const handleClick2 = () => {
    setNum2(num2 + 1);
  };
  console.log("demo-callback", set.size);
  return (
    <div>
      <div className={`${classPrefix}-title`}>---useCallback---</div>
      <div className={`${classPrefix}-text`}>当前num1：{num1}</div>
      <Child callback={callback} />
      <div>
        <button onClick={handleClick1}>num1++</button>
        <button onClick={handleClick2}>num2++</button>
      </div>
    </div>
  );
});

const Child = memo(({ callback }) => {
  console.log("---child render");
  return (
    <div>
      <div className={`${classPrefix}-text`}>
        child刷新(仅依赖num1)：{set.size}
      </div>
    </div>
  );
});
// demo-callback 1 => ---child render
// 点击num1++:  demo-callback 2 => ---child render
// 点击num2++:  demo-callback 2
```
