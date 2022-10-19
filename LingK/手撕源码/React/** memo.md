# React.Component

在谈及`react.meno`原理之前,需要先了解`React.Component`和`React.PureComponent`.
React 允许一个`class`或者`function`作为组件.如果定义一个组件,需要继承`React.component`.

```js >>> Welcome是承于React.component
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

- 继承`React.Component`的组件,一定要包含`render()`方法,其他内容都是可选项.

# React.PureComponent

`React.Component`和`React.PureComponent`类似,都是定义一个组件类,不同的是:

- `React.Component`没有实现`shouldComponentUpdate()`.
- `React.PureComponent`实现了`props`和`state`的浅比较.

如果组件的`prop`和`state`相同时,`render`的内容也一致.可以使用`React.PureComponent`这样可以提高组件的性能.

```js
class Welcome extends React.PureComponent {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

- state 和 props 简单时比较适用`React.PureComponent`,如果内容比较复杂,没办法浅比较就不适用.

# React.memo

`React.memo`是一个高阶组件,和`React.PureComponent`类似;
不同的是`React.PureComponent`是`class`组件;`React.memo`是`function`组件.

```js
const MyComponent = React.memo(props => {
  /* render using props */
  return ();
});
```

这种方式,依然是对象的`浅比较`,有复杂逻辑时,无法`render`.
在`React.memo`中,可以` 自定义``比较方式 `的实现.

```js
function MyComponent(props) {
  return <p>It is {props.name}</p>;
}
function areEqual(prevProps, nextProps) {
  console.log(prevProps, "prevProps"); // {name: "a"} "prevProps"
  console.log(nextProps, "nextProps"); // {name: "b"} "nextProps"
  return true; //true则不重新渲染， 相反则重新渲染
}
export default React.memo(MyComponent, areEqual);
```

\*\* 所以,对于渲染父组件时,没必要重新渲染的子组件都可以使用`React.memo`或者`React.PureComponent`包裹起来

```js
function Child(props) {
  console.log("Child");
  return <button>Child</button>;
}
// memo：如果你想让一个函数组件有一个功能，如果属性不变，就不要刷新。
Child = React.memo(Child);
function App() {
  let [name, setName] = React.useState("zhufeng");
  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      <Child />
    </div>
  );
}
```

```js >>> memo简单实现
function memo(OldComponent) {
  return class extends React.PureComponent {
    render() {
      return <OldComponent {...this.props} />;
    }
  };
}
```

# React 中的浅比较是如何实现的?

从页面的渲染流程上来分析:

- 先渲染了`父组件`,然后再渲染`子组件A`和`子组件B`
- 当数据更新了,`父组件`需要重新渲染,从而驱动`子组件A`和`子组件B`重新渲染

* 如果`子组件A`和`子组件B`和`父组件`的数据没有直接的关系,这就是**无效的渲染,损耗性能**

## 为什么会造成无效的渲染损耗?

函数组件本身是没有识别`prop`的能力,每次父组件传入`prop`时,子组件都会将其视为新的`prop`.
简言之:函数组件不会识别`prop`,只要`prop`更新,组件就会重新渲染一遍.

## 如何解决无效渲染带来的损耗?

- 使用`React.Component`中的`shouldComponentUpdate`方法来手动处理渲染逻辑
- 使用`React.PureComponent`来进行浅监听 (Class Component)
- 使用`React.memo`来进行浅监听 (Function Component)

# memo 需要注意的点

`memo`存在的一些问题:
- 被`memo`包裹的组件,即使`props`改变了,其内部的渲染也不会发生改变
  - 和浅拷贝类似,修改array和object的时候,只会改变引用地址,堆中的内存监听不到变化.
- 不适合大量的使用
  - 既然`memo`缓存好用,为什么不把所有的组件全包裹起来?
  - 为什么不把`memo`设置为默认的选项?
  - 因为:做`缓存`也是有`性能损耗`的,每个组件都缓存`给浏览器的压力`还是比较大的.
  - 所以:在开发的过程中,我们需要挑选一些`经常使用`并且`被重复渲染`的`组件`进行`memo`包裹.
- 总结
  - 父组件数据发生改变,不受`memo`保护的子组件会重新渲染
  - 被`memo`包裹的组件,只有自身`prop`发生改变时,才会重新渲染
  - 因为是浅拷贝,浅比较.在修改`数组`和`对象`的时候,需要返回一个新的`prop`
  - 宁缺毋滥,选择有需要的组件进行`memo`包裹.滥用会让性能下降.

[参考](https://blog.csdn.net/qq_48637854/article/details/125135034)

# React.memo 实现原理(源码简析)

```js packages/shared/shallowEqual.js
function shallowEqual(objA: mixed, objB: mixed): boolean {
  /**
   * react中封装了is判断,判断两个值是否相等
   * 对基本类型和引用类型都进行了判断 undefined null '' 等情况
   */
  if (is(objA, objB)) {
    return true;
  }

  // 判断是否为对象
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  // 比较两个对象的属性数量是否相等
  if (keysA.length !== keysB.length) {
    return false;
  }
  // 比较两个对象中的值是否一一对应
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }
  // 如果两个对象全等返回true,否则返回false;
  // 浅比较就是通过返回的boolean值进行判断的
  return true;
}
```
