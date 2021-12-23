# Hook

    是React16.8新增的特性。
    它可以在不编写class的情况下，使用state以及其他的react特性。
    ** React(16.8)/ React Native(0.59) 是支持hook的第一个版本
    ** Hook是完全可以和class兼容的，升级的话不需要重新改写class，在新的组件中使用hook即可

    特性：
      1. 函数组件的写法, 更为轻量, 灵活
      2. 解决了函数组件没有生命周期的问题 => 优化了react.memo pureComponent
      3. 解决了组件不灵活的问题, 之前的组件需要注入状态和参数;
      4. 函数的写法, 参数和回调都传入; 使用更简单

# 什么是 Hook ?

    在函数组件里”钩入“React state及生命周期等特性的函数。
    Hook不能在class组件中使用。
    不使用class组件，也能够在函数组件中使用生命周期等特性。

# Hook 解决的问题

    1.在组件之间复用状态逻辑比较困难
    2.复杂组件比较难以理解
    3.简化了class

    ≥≤ 状态逻辑复用困难：
      React没有将”可复用“的行为附加到组件的途径（eg. 把组件链接到store上）。
      Render Props 、Hoc可以实现，但是使用和重构都比较复杂
      * 在Hook中，可以从组件中提取复用逻辑，这些复用逻辑可以单独测试和复用
      * Hook无需修改组件结构的情况下使用状态逻辑，这样组件间复用hook比较方便。
    ≥≤ 复杂组件难以理解：
      随着组件功能的丰富，会组件增加比较多状态逻辑和副作用，每个声明周期会包含一些不相关的逻辑。（在多个生命周期中分别处理state）
      在大多数情况下，不能将组件拆分成更小的粒度，因为状态逻辑无处不在。使用React和状态管理Redux结合使用，需要来回切换。
      ** Hook将组件中相关联的部分拆分成更小的函数，而非强制按照生命周期划分，也可以使用状态管理库。
    ≥≤ hook解决了class复杂的屏障：
      hook可以在非class的情况下，使用更多的react特性。react的思想就是组件函数化，react组件更像是函数。

\*\* 【https://react.docschina.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes】
在写完 hook 之后，需要测试一下 hook 的可用性，测试首次加载和二次、三次加载的逻辑、事件是否有问题

# State Hook

    useState只接受唯一参数，切只有初始化的时候，才会用到这个参数

```JavaScript
    import React, { useState } from 'react';
    function Example() {
      // 声明一个叫 “count” 的 state 变量。初始值为0。
      const [count, setCount] = useState(0);
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
```

# Effect Hook

    effect: 效应，作用。在React组件中执行过数据获取、订阅、修改DOM等操作。（副作用/作用）
    useEffect就是一个Effect的Hook，给组件添加了操作副作用（回调）的能力。
    这是一个合成的API，作用等同于：componentDidMount、componentDidUpdate、componentWillUnmount。
    * useEffect的参数: 传空时，在初始化的时候触发一次；传入值时，值发生变化就触发。
    * 在调用useEffect时，就是注册一个”完成更新DOM之后会触发的回调“。
    * useEffect可以访问到props和state，他是根据props和state来进行触发的。
    * 可以根据不同的情况筛选出不同的条件（将组件内相关的副作用组合在一起）
    useEffect参数为空时, 每次渲染的时候, 都会执行一次; 容易造成死循环.

```JavaScript
    import React, { useState, useEffect } from 'react';
    function Example() {
      const [count, setCount] = useState(0);
      // 相当于 componentDidMount 和 componentDidUpdate:
      useEffect(() => {
        // 使用浏览器的 API 更新页面标题
        document.title = `You clicked ${count} times`;
      });
      return (
        <div>
          <p>You clicked {count} times</p>
          <button onClick={() => setCount(count + 1)}>
            Click me
          </button>
        </div>
      );
    }
```

# Context Hook

    接受一个Context对象（React.createContext的返回值），并返回该context的当前值。
    当前值：由上层距离最近的 <MyContext.Provide> 中的value props决定。
    当<MyContext.Provide>中的value props发生变化时，组件不会考虑其他情况，一定会重新渲染使用最新的value props。

# hook 使用规则

    * hook就是js函数
    * 在函数最外层调用hook，不能在循环，条件判断或者子函数中调用hook。（可能会导致堆栈溢出，写法和逻辑也无法理解，可以将条件放外面判断）
    * 相关的副作用尽可能的组织在一起，最好不要分开进行判断，这样写法和逻辑会更麻烦

# 自定义 Hook
  文档地址：「https://react.docschina.org/docs/hooks-custom.html」
