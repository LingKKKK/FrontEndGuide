# useReducer 的使用

*可以理解成 useReducer 是 useState 的升级版, 用来实践 redux/flux 思想的手段*
`useReducer`的作用是提高应用性能,当更新逻辑比较复杂时,可以考虑使用`useReducer`
`useReducer`和`redux`的区别:

- `useReducer`是`useState`的替代方案,用于`state`复杂变化
- `useReducer`是单个组件的状态管理(hooks),组件之间的传参依然需要使用`props`
- `redux`是全局的,做组件共享的数据变量

# useReducer vs useState

`useReducer`是`useState`的替代方案; 和`redux`的工作方式一样.

- 第一个参数: `reducer函数`
- 第二个参数: 初始化的 state.
- 返回值: 最新的 state,以及 dispatch 函数(用于触发 reducer 函数,修改 state 内容)

在某些场景下,`useReducer`比`useState`更适用.
例如: state 的逻辑复杂,并且包含了多个子值; 或者下一个 state 依赖前一个 state 值.

**使用`useReducer`,可以给触发深更新的组件做性能优化, 因为可以向子组件传递*dispatch*方法, 而不是回调函数**

# useReducer vs other hooks

`useReducer`是 React 提供的一个`高级Hook`,和其他的 hooks 不同,不使用`useReducer`依然可以正常的完成开发.
使用`useReducer`可以让代码提升: 可读性,可维护性,可预测性.

# 基础内容

## 什么是 reducer?

`reducer`是伴随着`redux`的出现,逐步在 js 中流行起来.
简单来说`reducer`就是一个函数 _(state, action) => newState_ ,接受当前应用的`state`和触发动作`action`,然后返回一个新的`state`.

```js
// 举个栗子 计算器reducer，根据state（当前状态）和action（触发的动作加、减）参数，计算返回newState
function countReducer(state, action) {
  switch (action.type) {
    case "add":
      return state + 1;
    case "sub":
      return state - 1;
    default:
      return state;
  }
}
```

## reducer 的幂等性

`reducer`的本质是一个纯函数,没有任何`UI层逻辑`和`副作用`.
相同的输入`(state, action)`,不管经过错少次,最后`reducer`处理的结果都是一样的.
所以: `reducer`函数,很容易的就可以预测到`state`的变化,从而更加适合`单元测试`,这就是`可预测性`.

```js
expect(countReducer(1, { type: "add" })).equal(2); // 成功
expect(countReducer(1, { type: "add" })).equal(2); // 成功
expect(countReducer(1, { type: "sub" })).equal(0); // 成功
```

## 总结 reducer 函数

`reducer`函数就是一个利用`action`提供的信息,将`state`值进行变更的一个`纯函数`.

- 语法: (state, action) => newState
- Immutable: 每次都返回`newState`,但是不允许直接修改
- Action: 操作; 由 type 和 payload 组成
- type: 本次操作类型(String),是 reducer 的判断依据
- payload: 提供操作附带的信息

# 使用

使用`reducer`的场景:

- 如果你的 state 是一个数组或者对象
- 如果你的 state 变化很复杂，经常一个操作需要修改很多 state
- 如果你希望构建自动化测试用例来保证程序的稳定性
- 如果你需要在深层子组件里面去修改一些状态（关于这点我们下篇文章会详细介绍）
- 如果你用应用程序比较大，希望 UI 和业务能够分开维护

`reducer`可以帮助我们集中式的处理复杂的`state`管理.

## 示例

```js 使用 useState 封装登录框
function LoginPage() {
  const [name, setName] = useState(''); // 用户名
  const [pwd, setPwd] = useState(''); // 密码
  const [isLoading, setIsLoading] = useState(false); // 是否展示loading，发送请求中
  const [error, setError] = useState(''); // 错误信息
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 是否登录

  const login = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    login({ name, pwd })
      .then(() => {
        setIsLoggedIn(true);
        setIsLoading(false);
      })
      .catch((error) => {
        // 登录失败: 显示错误信息、清空输入框用户名、密码、清除loading标识
        setError(error.message);
        setName('');
        setPwd('');
        setIsLoading(false);
      });
  }
  return (
    // 返回页面JSX Element
  )
}
```

在这个`useState`维护的登录逻辑中,用 5 个 state 对状态进行维护: 用户名/密码/loading/错误信息/状态.
每次修改登录状态和信息的时候,都需要考虑这 5 个 state 的修改和调用. 十分不利于后期的维护和迭代,逻辑过于复杂.

```js 使用useReducer改造登录逻辑

const initState = {
  name: '',
  pwd: '',
  isLoading: false,
  error: '',
  isLoggedIn: false,
}
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
  return (
    // 返回页面JSX Element
  )
}
```

从改造函数来看, `useReducer` 的代码更长,但是可读性更强,更加清晰的反映各 `state` 之间的联系和修改逻辑.
`reducer` 不关心 `UI层`和 `state` 之外的逻辑,将所有的 `state` 都集中起来管理,对 `state` 的变化会更有掌控力.
将 `reducer` 单独抽离,让代码解耦,同时也方便了单元测试
[参考](https://zhuanlan.zhihu.com/p/69622832)

# useReducer 配合 useContext 使用

例如 useContext 中的登录框, 比 useState 更适合使用.
