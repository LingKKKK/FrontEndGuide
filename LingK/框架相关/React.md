# 生命周期 v16.2-

    挂载卸载过程
      1. constructor: 构造函数, 仅在创建的时候调用
      2. componentWillMount: 挂载前, 仅调用一次, 可以调用 setState render等api
      3. componentDidMount: 挂载之后, 仅调用一次, 可以调用 refs方法
      4. componentWillUmmount: 组件被卸载时调用
    更新渲染过程
      1. componentReveiveProps: 父组件发生render时, 子组件会触发; 禁止使用setState
      2. shouleComponentUpdate: 更新组件时调用; 禁止使用setState
      3. componentWillUpdate: 组件接受props时触发;
      4. render 渲染
      5. componentDidUpdate: 完成渲染之后调用

# 生命周期 v16.3

    废弃的生命周期: componentWillReveiveProps / componentWillMount / componentReveiveProps
    新增的生命周期: getDerivedStateFromProps / getDerivedStateFromProps

    挂载卸载过程:
      1. constructor: 构造函数, 初始化
      2. getDerivedStateFromProps: 用于替换 componentWillReveiveProps
      3. componentDidMount
      4. componentWillUmmount
    更新渲染过程
      1. shouleComponentUpdate
      2. getDerivedStateFromProps: 合并 componentWillMount / componentReveiveProps
      3. render 渲染
      4. componentDidUpdate: 完成渲染之后调用

# 生命周期 v16.4+

    和16.3的周期一样, 只是更新的时候触发的流程有差异;
    v16.3
      new props   -> getDerivedStateFromProps -> shouleComponentUpdate -> render
      setState    -----------------------------> shouleComponentUpdate -> render
      forcrUpdate ------------------------------------------------------> render
    v16.4
      new props   -> getDerivedStateFromProps -> shouleComponentUpdate -> render
      setState    -> getDerivedStateFromProps -> shouleComponentUpdate -> render
      forcrUpdate -> getDerivedStateFromProps ->------------------------> render

# 钩子函数执行的流程

    挂载时
      constructor -> getDerivedStateFromProps -> render -> React更新Dom/Refs -> componentDidMount
    更新时
      props       -> getDerivedStateFromProps -> shouleComponentUpdate -> render -> getDerivedStateFromProps -> React更新Dom/Refs -> componentDidUpdate
      setState    -> getDerivedStateFromProps -> shouleComponentUpdate -> render -> getDerivedStateFromProps -> React更新Dom/Refs -> componentDidUpdate
      forcrUpdate -> getDerivedStateFromProps --------------------------> render -> getDerivedStateFromProps -> React更新Dom/Refs -> componentDidUpdate
    卸载时
      componentWillUmmount

# React 中的事件

    平常使用的事件, 基本上都是合成事件, 都是经 react 进行封装之后返回的, 受 react 监控.
    原生事件:
      通过addEventListener、onMouseOver等原生js提供的事件
    合成事件:
      使用onClick提供的事件, 除了js提供的原生之外的所有事件

# React 的合成事件

    [ https://blog.csdn.net/qq_34273059/article/details/119206660 ]
    [ https://juejin.cn/post/6844903988794671117 ]
    React 在内部, 通过 "冒泡" 实现一套完整的事件触发机制.
    合成事件和原生事件的区别:
      原生事件: js 自带的事件, onMouseOver onMouseOut addEventListener等.
      合成事件: 平常用的比较多的 api → onClick/onChange 等.
    合成事件:
      1. React 做了一个事件层, 消除不同浏览器之间事件机制不同的问题, 保证使用的事件机制统一.
      2. 事件最终绑定在 document 上, 并非绑定在节点. (减少内存的消耗)
      3. 使用 event.stopPropagation(); 无法阻止冒泡
      4. 通过队列的形式执行, 从触发组件向父组件回溯, 执行对应的回调.
      5. React 通过事件池的形式对合成事件的创建和销毁进行管理. 较少垃圾的生成, 减少内存的占用, 提高资源分配效率.

    合成事件的机制和原理:
      基于浏览器的冒泡, 从底层冒泡到顶层, 再统一( dispatchEvent )分发处理.
    阻止冒泡:
      合成事件: e.stopPropagation();
      合成事件和外层 document 的冒泡: e.nativeEvent.stopImmediatePropagation();
      合成事件和外层 document 上原生事件的冒泡: 通过 e.target 进行判断.
      (原生事件和合成事件最好不要混用)
    添加监听:
      在合成触发的时候, 因为合成事件要晚于原生事件的执行, 所以绑定之后再触发时, 外层的已经被执行了, 所以绑定失效.
      将 document.body.addEventListener 改成 window.addEventListener 就可以了

    eg. 在 onClick 时阻止冒泡为什么不生效? 以为合成的时候, 事件已经被触发了.

# React 事件机制

    [ https://juejin.cn/post/6844903988794671117 ]
    1. 事件注册
    2. 事件存储 (放置在队列中)
    3. 事件分发
    4. 事件执行

# React 的调和过程

    调和的过程就是实现 UI 更新的过程.
    目的就是在用户无感知的情况下, 将数据的更新体现在 UI 上.
    合并多次 setState, 一次性更新完毕.

    * 调和过程: Reconciliation 高效的对比渲染vdom, 性能方面考虑

```JavaScript
    setState({counter: counter + 1})
    setState({counter: counter + 1})
    /**
     * ! 同时存在多个 setState, 会被浅合并, 合并之后再一次性执行
    */
    () => {setState({counter: counter + 1})}
    () => {setState({counter: counter + 1})}
    /**
     * ! 多个 function 中都有 setState 时
     *  1. function 会被存入队列(queue)
     *  2. 每个 function 会依次执行, 每个 setState 接收到的 state 都是前一个 function 处理完毕的.
     *  * 保证每个 state 都是最新的
    */
    setState({
       history: history.concat([1]),
       current: history.length
    })
    /**
     * * setState 也是按照顺序执行的, 先执行 history, 值完毕之后再计算下一步的内容
     */
```

# React 的 setState 是同步还是异步?

    在合成事件中, 异步
      1. 并非使用了异步代码实现, 其本生的代码和执行过程都是同步的
      2. 因为合成事件和钩子函数都在更新之前, 无法立即获取到; (如果添加回调就可以立即获取)
      3. setState之后, react会有调和的过程, 合并多次更改, 一次执行; (框架的优化手段)
    在原生事件和定时器中, 同步
      1. 在addEventListener、onMouseOver、定时器中都是同步的

# React 中如何进行性能优化的?

    1. react fiber 框架层面的, 减少组件层级不必要的更新
    2. shouldComponendUpdate 中添加判断
    3. 组件懒加载 React.lazy, 让页面更加平滑
    4. pure Component 纯组件, 部分props不做对比
    5. react.memo 创建一个纯组件, 而不是一个类
    6. immutable 定义不可变值, 减少不必要的更新
    7. 每个组件中，尽量减少不必要的state

# React 上下文: Context Props Provide

    Context
      1. 类似koa中的ctx
      2. 避免大量使用props
      3. 比redux更简洁
      4. 公用的类, 信息, 资源
      * 通过 React.createContext 创建上下文

# Context

    Context提供了一个无需为每层组件手动添加props，就能在组件树间进行数据传递的方式。「解决了Props传递繁琐的问题」
    * Context是将值深入传递到组件树中。
    使用Context的场景：为了共享一些对于组件树来说是全局的数据，例如：主题选择，用户认证信息等。
    使用Context的优势：避免了通过中间元素传递props，更为简洁。
    劣势：会让组件的复用性变差。（如何只是想传递参数，避免过多的props，组件组合component composition是更优的方案）
    组件组合：将组件自身进行向下传递，不管层级和其他因素，组件和最后渲染的UI存在直接的关系。

```jsx
// 使用props进行传递
class App extends React.Component {
  render() {
    return <Toolbar theme="dark" />;
  }
}
function Toolbar(props) {
  return (
    <div>
      <ThemedButton theme={props.theme} />{" "}
      {/* props.theme是额外的属性，需要传递给下层 */}
    </div>
  );
}
class ThemedButton extends React.Component {
  render() {
    return <Button theme={this.props.theme} />;
  }
}
// 使用context进行传递
const ThemeContext = React.createContext("light"); // 为当前的theme创建一个context（light为默认值）
class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树 && 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
function Toolbar() {
  return (
    <div>
      <ThemedButton /> {/* 组件中也不需要指明props来传递值 */}
    </div>
  );
}
class ThemedButton extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  static contextType = ThemeContext; // contextType = 'dark';
  render() {
    return <Button theme={this.context} />;
  }
}
// 组件组合 component composition
function Page(props) {
  const user = props.user;
  const userLink = <Link href={user.permalink}></Link>;
  return <PageLayout userLink={userLink} />;
}
{
  props.userLink;
}
```

## Context.API

    React.createContext:创建context实例
    React.Provide:将context映射出去，供内部消费
    Class.contextType:在class中定义context的类型
    Context.Consumer:消费组件，获取Provide中的value值
    Context.displayName:在React devTool中展示

    1. React.createContext:
      创建一个context对象。
      当React订阅这个Context对象的组件，这个组件会从最近的Provide中读取Context值。
      当没有匹配到Provide时候，才会使用设置的”defaultValue“。
      * 如果将undefined传递给Provide的value时，消费组件的”defaultValue“不会生效。

```jsx
const MyContext = React.createContext(defaultValue);
```

    2. React.Provide
      每一个React对象，都会返回一个Provide React组件，它允许消费组件订阅context的变化。
      Provide接收一个value属性，传递给消费组件。一个Provide可以和多个消费组件有对应关系。
      多个Provide可以嵌套使用，但是里层会覆盖外层的数据（查询的时候向上就近获取值）。
      当Provide的value值发生变化时，内部所有的消费组件都会重新渲染（从Provide到内部的consumer组件），不管shouldComponentUpdate是否执行，脱离了父子之间的同步刷新。
      通过Object.is来判断值是否进行了更新。

```jsx
    <MyContext.Provider value={/* 某个值 */}>
```

    3. Class.contextType
      挂载在class上的contextType属性，可以赋值为由React.createContext创建的Context对象。
      这个属性可以让class使用 this.context 来获取最近Context上的值，在任何周期内均可访问到。
      * contextType可以在class之外指定，也可以在内部指定(通过static来初始化contextType)

```jsx
class MyClass extends React.Component {
  // static contextType = MyContext;
  componentDidMount() {
    let value = this.context;
  }
  render() {
    let value = this.context;
  }
}
MyClass.contextType = MyContext;
```

    4. Context.Consumer
      在函数组件中对Context完成订阅。返回一个React节点。
      传递给函数的value值等同于上级组件树离context最近的Provide提供的value值。
      如果没有对应的Provide，value就等于createContext时设置的defaultValue值。

```jsx
    <MyContext.Consumer>
      {value => /* 基于 context 值进行渲染*/}
    </MyContext.Consumer>
```

    5. Context.displayName
      displayName是Context上挂载的一个类，字符串类型的。
      用于在react devtool中展示(区分不同的Context)，相当于给Context起了一个简称。

```jsx
    const MyContext = React.createContext(/* some value */);
    MyContext.displayName = 'MyDisplayName';
    <MyContext.Provider> // "MyDisplayName.Provider" 在 DevTools 中
    <MyContext.Consumer> // "MyDisplayName.Consumer" 在 DevTools 中
```

    eg.
      1.动态的 Context：通过组件的click事件，toggle切换theme中的key值，然后根据key-value切换
      2.在嵌套组件中更新 Context：将value和event同时映射出去，点击的时候调用event实现动态修改的功能
      3.消费多个Context：为了确保允许多个consumer能同时消费渲染，需要每个comsumer都是单独的节点。

```jsx
// ProfilePage同时消费了2个Provide，嵌套写法
function Content() {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <UserContext.Consumer>
          {(user) => <ProfilePage user={user} theme={theme} />}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

## Context 注意事项

    1. 消费组件Context.Comsumer存在意外触发渲染的情况
      每一次的Provide重新渲染的时候，value值发生了变化，comsumer组件都会重新渲染，因为复杂类型的指向问题
      * 将object提升到父节点，就不会出现引用类型导致的bug

```jsx
// Bugs:
class App extends React.Component {
  render() {
    return (
      <MyContext.Provider value={{ something: "something" }}>
        <Toolbar />
      </MyContext.Provider>
    );
  }
}
// Fixed:
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: { something: "something" },
    };
  }
  render() {
    return (
      <Provider value={this.state.value}>
        <Toolbar />
      </Provider>
    );
  }
}
```

# Ref 转发

    * 将ref转发出去，可以让其他的组件和引用能够获取到这个被转发的DOM结构。
    * 透传属性时，ref不会被透传。因为ref和props本质上就有区别，无法透传

```jsx
function FancyButton(props) {
  return <button className="FancyButton">{props.children}</button>;
}
// †††††††††††††††††††††††††
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));
// 你可以直接获取 DOM button 的 ref：
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

    步骤分析：
      1. 通过调用React.createRef来创建一个React333 Ref并将其赋值给ref变量
      2. 我们通过指定ref为jsx属性，将其向下传递给 <FancyButton ref={ref} />
      3. React将ref作为第二个参数，传递给forwardRef
      4. 向下转发ref参数到 <button ref={ref}>，将其定义为jsx属性
      5. 当ref挂载完成， ref.current 将指向<button>DOM节点

    * HOC中如何将ref像props一样进行透传
    * 如果需要给HOC添加Ref，就在外层的组件添加ref，不能在内层组件添加ref。「返回的是外层而不是内层」
    * 使用 API: React.forwardRef 可以将ref深入到子组件上。

```jsx
// 高阶组件-logProps
function logProps(WrappedComponent) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log(" old props: ", prevProps, "; new props: ", this.props);
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return LogProps;
}
class FancyButton extends React.Component {
  focus() {}
}
export default logProps(FancyButton); // ‘FancyButton’ 作为参数仅仅被渲染，导出的依然只是 “logProps”
// 引用&使用高阶组件组件
import FancyButton from "./FancyButton";
const ref = React.createRef();
// 无法调用 ref.current.focus() ，因为ref没有透传，指向HOC而不是内部组件。
<FancyButton label="Click Me" handleClick={handleClick} ref={ref} />;
// 使用 forwardRef 来透传 ref
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log("old props:", prevProps);
      console.log("new props:", this.props);
    }
    render() {
      const { forwardedRef, ...rest } = this.props;
      // 将自定义的 prop 属性 “forwardedRef” 定义为 ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }
  // 注意 React.forwardRef 回调的第二个参数 “ref”。
  // 我们可以将其作为常规 prop 属性传递给 LogProps，例如 “forwardedRef”
  // 然后它就可以被挂载到被 LogProps 包裹的子组件上。
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```

# Redux

    1. 解决了平级组件中传参麻烦的问题
    2. 将整个状态存入store中, 里面保存了一个 store tree;
       组件可 派发[dispatch] 行为[action] 给store, 不是直接接受
    3. 组件内部, 通过订阅store, 来访问stroe tree上的某个值
    4. redux的三个原则:
      a. 唯一数据源: 所有的state都存在store tree中, 必须是唯一的
      b. 只读性: store是能靠action修改(只能靠纯函数方式来调取改变)

    内容构成:
      store: 类似globalData
      state: store.getState()取值
      action: setState
      dispatch: 派发action
      reducer: 修改state的计算过程

# React.memo

    react memo是高阶组件。
    如果组件在相同的props下渲染相同的结果，那么就可以将它们包裹在React.memo中调用。
    * 类似缓存，相同的props会跳过中间的过程，显示上一次的渲染结果。
    React.memo 仅检查props的变更。默认情况下，只会对复杂对象做浅层比较，也可以通过第二参数控制比较流程。
    * 如果函数组件被React.memo包裹，且它的实现中有hook，当state和context变化时，仍会重新渲染。

```jsx
// 写法1
const MyComponent = React.memo(function MyComponent(props) {
  /* 使用 props 渲染 */
});
// 写法2
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  // 对比新旧props，结果：true就渲染，false就不渲染
}
export default React.memo(MyComponent, areEqual);
```

# pureComponent

    不能调用PureComponent, 会报错;
    纯组件, 通过props state浅对比来实现shouleComponentUpdate(监听: state, props)
    尽量展示静态文件, 如果是频繁切换的组件, 使用pureComponent会带来大量的比较, 性能降低;

# 纯组件

    组件中只有一个render函数, 返回静态内容;
    可以提升组件的性能, 没有生成任何生命周期的代码;
    直接接受props参数, 根据props切换内容;

# React 为什么分成 react react-dom 两个包?

    1. react 只负责 web mobile 端的核心内容 (称之为 react-core 更合适)
    2. react-dom 负责 dom 操作
    3. react-native 负责移动端的操作

# React 调用函数为什么必须要 bind(this) ?

    1. javascript 自身特性
      如果传递一个函数名给变量, 之后通过 "函数名()" 的方式进行调用, 内部的 this 会丢失.

```JavaScript
      /**
       * ! 未直接调用,给了一个中间变量, this 失去指向, 指向 undefined.
       * * 如果使用 node 环境, 会输出 node 相关信息. js 中,会指向 window 对象
       */
      const test = {
          name:'jack',
          getJack:function(){
              console.log(this.name)
          }
      }
      const func = test.getJack;
      func();
```

    2. React 事件绑定 (2种实现方式)
      react 中 bind 和上面的中间量一样,在 jsx 中传递的时间不是一个字符串, 而是一个函数.
      即 → onClick={this.handleClick}, 此时 onClick 就是中间变量, this 会丢失.
      需要给这个中间变量 bind(this) →→ 无论事件如何处理, this 总会指向当前的实例化对象.
      也可以利用箭头函数中 this 指向父级上下文的特性. 箭头函数中 this 永远指向实例化对象.

# state和props的区别?

    「https://segmentfault.com/a/1190000011184076」
    「https://react.docschina.org/docs/thinking-in-react.html」

    props和state都是react中用来保存信息的，都可以控制组件的渲染。
    props: 属性，传递给组件，类似函数的参数（由外部传入）「在defaultProps中设置初始值」
    state: 状态，组件内部的状态，类似函数的变量（由自己设定） 「在constructor内初始化state」

                                props	state
    是否可以从父组件获取初始值?	     Yes   Yes
    是否可以由父组件更改?		     	  Yes   No
    是否可以在组件内设置默认值?      Yes   Yes
    是否可以在组件内更改?		        No	  Yes
    是否可以设置子组件的初始值?		   Yes	 Yes
    是否可以由子组件更改?		        Yes	  No

    判断一个变量是否需要存入 state ?
      1.该变量是否通过父组件的props传递而来？如果是，不存入state。
      2.该变量是否随着声明周期保持不变？如果不变，不存入state。
      3.该变量是否可以根据其他的state或者props计算得来？如果可以，不存入state。
      ** 并非组件中用到的变量都属于状态，有的是props，有的是静态的，有的是可计算的.

    Props:
      React 的核心思想就是组件化思想, 页面会被切成一些独立的, 可复用的组件.
      组件从概念上来看就是函数, 接受参数(Props)传入, 所以 Props 就是外部传入组件内部的数据.
      React 是单向数据流, 所以 Props 基本上就是父组件向子组件传值.
      Props 经常被用作渲染组件和初始化状态, 当一个组件被实例化时, 他的 props 是只读的.
      默认参数: defaultProps: 定义 props 的类型. propsType
    State:
      1. 找到根据这个state进行渲染的所有组件
      2. 找到共同所有的组件
      3. 找到最适合放置state的地方

# Render Props (数据传递)

    术语‘render props’是指一种在React组件之间，使用一个值为函数的props共享代码技术。
    * 并非必须使用”render“和”props“，render是组件外部提供的方法，不代表具体。（key-value）
    * 将props值用return的方法返回出来，这样其他组件均可以获取到props值。
    * 这个组件接受一个：返回React元素的函数，在组件内部通过调用该函数实现逻辑渲染。

```javascript
<DataProvider render={(data) => <h1>Hello {data.target}</h1>} />
```

    * 使用Render Props的库：React Router、Downshift、Formik
    ## Render Props解决了 ‘横向切面关注点’ 的问题 『 Cross-Cutting Concerns 』AOP面向切面编程
       eg. 在组件中，获取到鼠标的xy坐标，如何将坐标信息给其他的组件复用？
           - 将鼠标坐标所监听的mouseover事件和存储鼠标(x,y)位置的行为封装到组件上。
           - 以render的形式，将xy坐标返回出去
       提供了一个render方法，让组件来决定需要做什么操作，而不是将state克隆组件。

```jsx
      // 在Mouse组件中
      render() {
        return (
          <div onMouseMove={this.handleMouseMove}>
            {/* 使用 `render`prop 动态决定要渲染的内容，而不是给出一个 <Mouse> 渲染结果的静态表示 */}
            {this.props.render(this.state)}
          </div>
        );
      }
      // 在其他组件中的调用
      <Mouse render={mouse => (
        <Cat mouse={mouse} />
      )}/>
```

# 为什么要放弃 minxin？

    之前使用mixin来解决横切关注点相关的问题。但是minxin会产生一些问题。
    对于复用比较频繁的逻辑，处理起来会相对麻烦，可能会存在声明周期的冲突。

# HOC

    High Order Component（高阶组件）
    HOC是React中用于复用组件逻辑的一种高级技巧。
    HOC自身不是React API的一部分，它是基于React的组合特性而形成的一个设计模式。
    组件是将props转成UI，而HOC是将组件转换成另一个组件。同样也是props转换成UI「只不过多了一层调用」
    ** 传入组件, 封装之后返回一个新组件「将不相关的props传递给组件」
    ** redux-content 就是一个hoc;
    ** ref属性不会被传递，和props有本质上的区别

    ```jsx
      const HocFactory = (Component) => {
        return class HOC extends React.Component {
          render() {
            return <Component {...this.props} />
          }
        }
      }
      // 对参数和组件进行了二次加工，在组件上面追加了一些参数
      function logProps(WrappedComponent) {
        return class extends React.Component {
          componentDidUpdate(prevProps) {
            console.log('Current props: ', this.props);
            console.log('Previous props: ', prevProps);
          }
          render() {
            // 将 input 组件包装在容器中，而不对其进行修改。Good!
            return <WrappedComponent {...this.props} />;
          }
        }
      }
    ```
    优势:
      1. 支持es6语法
      2. 复用性比较强, 纯组件
      3. 适用的范围比较广, 可自定义传参
    存在的问题:
      1. props较多, 会覆盖, 不容易追踪
      2. 会产生一些无用组件, 加深了组件的层级

    ## HOC为组件添加特性，自身不应该有大幅度的改动；HOC返回的组件应该和原组件保持类似的接口。
    ## HOC应该“透传”与自身无关的“props”。大多数HOC都应该包含一个透传参数的render方法

```jsx
    render() {
      // 过滤掉非此 HOC 额外的 props，且不要进行透传
      const { extraProp, ...passThroughProps } = this.props;
      // 将 props 注入到被包装的组件中。
      // 通常为 state 的值或者实例方法。
      const injectedProp = someStateOrInstanceMethod;
      // 将 props 传递给被包装组件
      return (
        <WrappedComponent
          injectedProp={injectedProp}
          {/* 将无关的属性透传出去，在HOC中不做处理 */}
          {...passThroughProps}
        />
      );
    }
```
