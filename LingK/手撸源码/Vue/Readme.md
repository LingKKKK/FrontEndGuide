# Vue的核心 1-4
- 数据驱动
- 组件化
- 响应式原理

准备工作: Flow 目录结构 源码构建
数据驱动: 数据 -> DOM创建完整流程 [从new Vue() 开始到渲染完毕]
组件化: 组件创建, 组件相关核心概念 [组件的生命周期, 配置, 组件注册, 异步组件]
响应式原理: 数据和视图更新的关系, 对比计算属性和属性的实现

# 编译 5
- parse [pɑːz]
- optimize [ˈɒptɪmaɪz]
- codegen

抽象语法树（Abstract Syntax Tree，AST）
Abstract 抽象 | Syntax [ˈsɪntæks] 规则,语法
parse: 把模板解析成AST树
optimize: 优化AST树
codegen: 把AST树转化成代码

# 扩展 6
- event, v-model 实现的原理
- slot, keep-aliv 实现的原理
- transition 过渡实现原理
- ...

# 生态 7-8
- Vue-Router 实现原理
- Vuex 实现原理, 初始化过程/常用的插件/api管理

# 收获
对Vue.js技术栈的理解更加深刻
Vue.js相关的bug快速定位, 工作效率提升
充分的认识原理
学习到了一些看源码的技巧, 个人技术的提升

# 要求
熟练的使用Vue.js
扎实的javascript基础

# Virtual Dom
Vue一个优秀的地方就是使用了Virtual DOM模型, 模拟DOM对象树来优化DOM操作.
Vue源码中虚拟DOM构建经历是: template --> AST语法树 --> render函数 --> vNode(Vue的虚拟DOM节点)

# 什么是AST
AST是抽象语法树, abstract syntax tree; 或者是语法树 syntax tree;
源代码的抽象语法结构的树状表现形式.
vue在mount的过程中, template会被编译成AST语法树.
然后经过generate(将AST语法树转化成render function)得到render函数, 返回vNode节点.
vNode节点是Vue虚拟DOM节点, 里面包含了标签节点文本信息等内容
