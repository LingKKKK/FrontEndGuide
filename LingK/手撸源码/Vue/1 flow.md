## Flow
[官方网站](https://flow.org)
Flow是facebook开源的一个插件,主要用于类型检查;和ts一样,可以视为强类型的js;

## 特点
1. 提升效率
   减少了很多不必要的错误,提升了开发效率
2. 可以放心的重构
3. 利于耦合编程,语义化较高

## 工作方式
类型推断: 通过变量的上下文来推断变量, 从而推断检查类型
类型注释: 事先注释我们期望的类型, flow会根据这些注释进行判断
```js
  // 类型推断: 只有string才有split
  function split(str) {
    return str.split(' ')
  }
  split(11)
  // 类型注释: 和ts一样, 预先写好类型
  function add(x: number, y: number): number {
    return x + y
  }
  add('Hello', 11)
```

## Flow在源码中的应用
在我们引用三方库的时候,或者自定义一些类型,但是Flow并不认识,因此检查的时候会报错,为此Flow提出了一个概念:libdef,可以用来识别这些第三方库的自定义类型.
在Vue.js目录下,有一个.flowconfig文件,它是flow的配置文件

```shell
flow
├── compiler.js        # 编译相关
├── component.js       # 组件数据结构
├── global-api.js      # Global API 结构
├── modules.js         # 第三方库定义
├── options.js         # 选项相关
├── ssr.js             # 服务端渲染相关
├── vnode.js           # 虚拟 node 相关
```

在阅读源码的时候,如果遇到某个类型并想了解它完整的数据结构时,可以从flowconfig中查询

### config
- [include] 引入文件
- [ignore] 忽略文件
- [libs] 指定库的定义

# 总结
Flow和TypeScript一样, 都是对js弱类型的加强, 本质上没有太多的区别;
