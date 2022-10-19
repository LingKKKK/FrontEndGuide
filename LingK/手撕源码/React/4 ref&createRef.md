

# ref

在某些场景,我们需要自己手动定位到一个DOM,并往上绑定一些属性和事件,这样使用ref更好,否则还要向JQ一样添加,或者提前定义.

React提供的Ref属性,表示对真实组件实例的引用,其实就是 `ReactDOM.render()` 返回的组件实例.
补充: 渲染dom元素时,返回的是具体的dom节点; `ReactDOM.render()`返回的是组件实例.

React不提倡大量的使用Ref; Ref所提供的是React数据流不太适用情况下的组件交互.

# 三种方式

```jsx
  return(
    <>
      <p ref='stringRef'>span1</p>
      <p ref={ele => (this.methodRef = ele)}>span2</p>
      <p ref={this.objRef}>span3</p>
    </>
  )
```

1. 字符串形式 (不推荐使用)
```jsx
  constructor(props) {
      super(props);
      this.showInput = this.showInput.bind(this);
  }
  showInput () {
      const input = this.refs.content;//ref第一种用法
      alert(input.value);
  }
  <input type={'text'} ref={'content'}></input>
```

2. 设置回调函数
函数的执行时机为:
  1.组件被挂载后,回调函数会立即执行
  2.组件被卸载或者原有的ref属性本身发生变化时,回调函数也会被立即执行,此时的参数为null,避免内存泄漏
```jsx
constructor(props) {
		super(props);
		this.showInput = this.showInput.bind(this);
}
showInput () {
		alert(this.inputs.value);//this指向组件对象的inputs属性的值
}
//this指向组件对象，把input保存到组件对象上,属性名叫inputs
<input type={'text'} ref={(inputData) => this.inputs = inputData}></input>
```
3. React.createRef
在react中,使用createRef创建一些变量,可以将这些变量绑定在标签的ref中
```jsx
constructor(props) {
  super(props);
  this.myRef = React.createRef();
  this.showInput = this.showInput.bind(this);
}
showInput () {
  //该变量的current则指向绑定的标签dom
  alert(this.myRef.current.value);
}
<input type={'text'} ref={this.myRef}></input>
```
