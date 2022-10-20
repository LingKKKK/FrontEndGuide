# context 对象

_context 的作用就是对它所包含的组件树,提供全局共享数据的一种技术_

## context 是什么?

在 react 中,属性一般都是通过 props 自上而下的进行传递.但是对于某些类型的属性是比较繁琐的(例如:地区/时区/主题等).
这些应用程序都需要的属性会在大量的组件中使用,如果一层层传递 props 十分麻烦.
context 提供了一个无需为每层组件手动添加 props 就可以在组件树之间进行数据传递的方法.
context 提供了一个在组件之间共享某值的方式,不需要将这个值通过 props 逐层传递.

## context 什么时候⽤?

context 的服务对象是, 共享那些对于`组件树`而言的`全局数据`.
例如: 当前认证的用户、主题、地区、语言、首选项等.

```js 使用props传值
class App extends React.Component {
  render() {
    return <Toolbar theme="dark" />;
  }
}
function Toolbar(props) {
  // Toolbar 组件接受⼀个额外的“theme”属性，然后传递给 ThemedButton 组件。
  // 如果应⽤中每⼀个单独的按钮都需要知道 theme 的值，这会是件很⿇烦的事，
  // 因为必须将这个值层层传递所有组件。
  return (
    <div>
      <ThemedButton theme={props.theme} />
    </div>
  );
}
class ThemedButton extends React.Component {
  render() {
    return <Button theme={this.props.theme} />;
  }
}
// 通过props传递：App -> Toolbar -> ThemedButton
// 如果嵌套很深，那么需要逐层传递props，即使中间不需要该props，显得很繁琐
```

```js 使用context传值
// Context 可以让我们⽆须明确地传遍每⼀个组件，就能将值深⼊传递进组件树。
// 为当前的 theme 创建⼀个 context（"light"为默认值）。
const ThemeContext = React.createContext("light");
class App extends React.Component {
  render() {
    // 使⽤⼀个 Provider 来将当前的 theme 传递给以下的组件树。
    // ⽆论多深，任何组件都能读取这个值。
    // 在这个例⼦中，我们将 “dark” 作为当前的值传递下去。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}
class ThemedButton extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使⽤它的值。
  // 在这个例⼦中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
// 也可以使⽤ ThemedButto.contextType = ThemeContext;
```

# useContext

`跨组件共享数据`的钩子函数，接收一个 `context` 对象，并返回该对象的当前值。

当前的 context 值由上层组件中距离当前组件最近的<MyContext.Provider>的 value 决定，并且父组件的 context 发生改变是，子组件都会重新渲染。

_和对调函数的自定义命名相比_
context-api 的优势更加明显,可以清晰的知道哪些组件使用了 dispatch,应用中的数据流动和变化.这是 react 单向数据流的优势.
_性能_
如果使用回调函数作为参数传递的话,每次 render 都会发生变化,也可以使用 useCallback 来解决持续 render 的问题.

```js 使用useContext改造
// 第一步：创建需要共享的context
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    // 第二步：使用 Provider 提供 ThemeContext 的值，Provider所包含的子树都可以直接访问ThemeContext的值
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
// Toolbar 组件并不需要透传 ThemeContext
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton(props) {
  // 第三步：使用共享 Context
  const theme = useContext(ThemeContext);
  render() {
    return <Button theme={theme} />;
  }
}
```

_当 Context Provide 的 value 发生变化时,所有的子级消费者都会 reRender_

```js 使用useContext改造登录框逻辑
// 定义初始化值
const initState = {
  name: '',
  pwd: '',
  isLoading: false,
  error: '',
  isLoggedIn: false,
}
// 定义state[业务]处理逻辑 reducer函数
function loginReducer(state, action) {
  switch(action.type) {
    case 'login':
      return {
        ...state,
        isLoading: true,
        error: '',
      }
    case 'success':
      return {
        ...state,
        isLoggedIn: true,
        isLoading: false,
      }
    case 'error':
      return {
        ...state,
        error: action.payload.error,
        name: '',
        pwd: '',
        isLoading: false,
      }
    default:
      return state;
  }
}
// 定义 context函数
const LoginContext = React.createContext();
function LoginPage() {
  const [state, dispatch] = useReducer(loginReducer, initState);
  const { name, pwd, isLoading, error, isLoggedIn } = state;
  const login = (event) => {
    event.preventDefault();
    dispatch({ type: 'login' });
    login({ name, pwd })
      .then(() => {
        dispatch({ type: 'success' });
      })
      .catch((error) => {
        dispatch({
          type: 'error'
          payload: { error: error.message }
        });
      });
  }
  // 利用 context 共享dispatch
  return (
    <LoginContext.Provider value={{dispatch}}>
      <...>
      <LoginButton />
    </LoginContext.Provider>
  )
}
function LoginButton() {
  // 子组件中直接通过context拿到dispatch，出发reducer操作state
  const dispatch = useContext(LoginContext);
  const click = () => {
    if (error) {
      // 子组件可以直接 dispatch action
      dispatch({
        type: 'error'
        payload: { error: error.message }
      });
    }
  }
}
```
