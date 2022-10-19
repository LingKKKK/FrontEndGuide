# useMemo

参数是创建函数和依赖项数组。
返回值是一个带有 memoized 的值，发生在 render 之前， 并且这个值仅在依赖项改变时才重新计算。
结论：useMemo 发生在 render 前，返回一个缓存的数据，且仅在依赖项改变后变化。
使用 useMemo 可以避免多余的计算开销。

```js
const DemoMemo = memo(() => {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(2);
  const expensive = useMemo(() => {
    console.log("运算");
    let sum = 0;
    for (let i = 0; i < num1 * 100; i++) {
      sum += i;
    }
    return sum;
  }, [num1]);
  const handleClick1 = () => {
    console.log("num1++");
    setNum1(num1 + 1);
  };
  const handleClick2 = () => {
    console.log("num2++");
    setNum2(num2 + 1);
  };
  return (
    <div>
      <div className={`${classPrefix}-title`}>---useMemo---</div>
      <div className={`${classPrefix}-text`}>当前num1：{num1}</div>
      <div className={`${classPrefix}-text`}>当前num2：{num2}</div>
      <div className={`${classPrefix}-text`}>
        当前expensive(仅依赖num1)：{expensive}
      </div>
      <div>
        {(() => {
          console.log("render");
          return null;
        })()}
        <button onClick={handleClick1}>num1++</button>
        <button onClick={handleClick2}>num2++</button>
      </div>
    </div>
  );
});
// 运算 => render
// 点击num1++:  num1++ => 运算 => render
// 点击num2++:  num1++ => render
```
