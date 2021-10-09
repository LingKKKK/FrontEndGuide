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

    原生事件:
      通过addEventListener、onMouseOver等原生js提供的事件
    合成事件:
      使用onClick提供的事件, 除了js提供的原生之外的所有事件

# React 的 setState 是同步还是异步?

    在合成事件中, 异步
      1. 并非使用了异步代码实现, 其本生的代码和执行过程都是同步的
      2. 因为合成事件和钩子函数都在更新之前, 无法立即获取到; (如果添加回调就可以立即获取)
      3. setState之后, react会有调和的过程, 合并多次更改, 一次执行; (框架的优化手段)
    在原生事件和定时器中, 同步
      1. 在addEventListener、onMouseOver、定时器中都是同步的

    * 调和过程: Reconciliation 高效的对比渲染vdom, 性能方面考虑

# React 中如何进行性能优化的?

    1. react fiber 框架层面的, 减少组件层级不必要的更新
    2. shouldComponendUpdate 中添加判断
    3. 组件懒加载 React.lazy, 让页面更加平滑
    4. pure Component 纯组件, 部分props不做对比
    5. react.memo 创建一个纯组件, 而不是一个类
    6. immutable 定义不可变值, 减少不必要的更新

# React content

    1. 类似koa中的ctx
    2. 避免大量使用props
    3. 比redux更简洁
    4. 公用的类, 信息, 资源

# HOC

    redux-content 就是一个hoc; 传入组件, 封装之后返回一个新组件

    ```JavaScript
      const HocFactory = (Component) => {
        return class HOC extends React.Component {
          render() {
            return <Component {...this.props} />
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

# Hook

    1. 函数组件的写法, 更为轻量, 灵活
    2. 解决了函数组件没有生命周期的问题 => 优化了react.memo pureComponent
    3. 解决了组件不灵活的问题, 之前的组件需要注入状态和参数;
    4. 函数的写法, 参数和回调都传入; 使用更简单

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
