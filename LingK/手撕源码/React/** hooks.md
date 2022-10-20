# Hook 简介

hook 是 16.8 新增特性,可以在不编写 class 的时候,使用 state 等 react 特性. (因为 React.FC 和 Class 最大的差别就是状态)

## 在组件之间复用状态逻辑

- React 没有将组件和复用性的逻辑连接在一起(store mixin 和 组件之间)
- 高阶函数可以解决这些逻辑性的问题,但是会破坏组件的结构,让代码变得不够简洁,降低了复用性
- provides cunstomers HOC render props 会形成嵌套地狱,很难将其抽象

## 复杂的逻辑难以理解和维护

我们在维护一些组件的时候,起初组件都是比较简单的,但是逐渐会被状态逻辑和副作用充斥.
每个声明周期中,常常包含一些不想管的逻辑:组件常在 componentDidMount 和 componentDidUpdate 中获取数据,可能同时包含其他的逻辑.
在绝大多数情况中,不能将组件拆分成更小的粒度,因为状态逻辑无处不在,所以需要和一些状态管理库一起维护数据状态.
所以需要:将逻辑拆分成函数的形式,再进行拼装复用.

# Hooks 规则

hooks 本身就是 JavaScript 函数,在使用的时候,需要遵循这两条规则:

1. 只在最顶层使用 Hooks (避免打乱 hooks 顺序)
2. 只在 React 函数中调用 Hooks (因为 Hooks 只能作用于函数组件)
   **使用 ESLint 插件:eslint-plugin-react-hooks 进行代码约束**

例如 useState,React 如何辨别 state 对应哪个 useState?
答案是 React 靠的是 Hook 调用的顺序。这也是为什么 hooks 需要在顶层调用,而不能在一些循环和逻辑判断中进行调用.
如果在 if 条件判断中跳过了某个 hooks,后面的所有 hooks 顺序都会乱,导致页面渲染出错.

hooks 函数,减少了很多代码,不需要维护复杂的生命周期,也不需要关心 this 的指向问题.

# 思考

React引入了hooks之后,解决了class组件的一些弊端,例如:逻辑复用需要通过高阶函数来层层嵌套,函数组件没有state等问题.
同时也引入了一些问题: hooks带来的闭包问题.
*闭包问题*
hooks引发的闭包问题,是 `Function Component State` 管理导致的.
