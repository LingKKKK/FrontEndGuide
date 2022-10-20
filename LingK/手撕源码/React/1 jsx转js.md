
# JS jsx

jsx和js的区别就是：jsx可以写一些附加的对象
使用Babel对jsx进行编译，变成js;最后这些附加的信息会以 key-value 的形式作为参数传入到API上面;

需要注意的点是: react会根据标签的大小写进行编译判断,如果标签首字母是大写,会视为一个组件,否则视为一个标签; (在写代码的时候要注意)

```jsx
  <div id="div">
    <span>1</span>
    <span>2</span>
  </div>

  function Comp() {
    return <div>123<div>
  }
  <Comp id="div">
    <span>1</span>
    <span>2</span>
  </Comp>
```
```JS
  React.createElement(
    'div',
    {id: 'div'},
    'hello'
  )

  function Comp() {
    return React.createElement('div', null, '123')
  }
  React.createElement(
    Comp,
    {id: 'div'},
    'hello'
  )
```
