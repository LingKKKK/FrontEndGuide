# 准备工作
## Flow
JS是动态类型的语言,以为过于灵活,所以很容易写出隐蔽的bug;
**比如'+', 不光number可以使用,string也可以使用;编译的时候并不会提示;**
类型检查是动态类语言的发展趋势,像TS一样既可以检查代码的错误,又不影响编译;
Vue2.0在重构时,在ES2015的基础上,除了使用ESlint之外,还引入了Flow做静态类型检查(因为ESlint和Babel都有Flow对应的插件,成本较低)

## Vue.js源码目录设计
## Vue.js源码构建
## 从入口开始


# 编译
## 编译入口
## parse
## optimize
## codegen


# 数据驱动
## new Vue 发生了什么
## Vue实例挂载的实现
## render
## Virtual Dom
## createElement
## update


# 组件化
## createComponent
## patch
## 合并配置
## 声明周期
## 组件注册
## 异步组件


# 深入响应式原理
## 响应式对象
## 依赖收集
## 派发更新
## nextTick
## 检测变化的注意事项
## 计算属性 vs 侦听属性
## 组件更新
## 原理图


# Vuex
## Vuex初始化
## API
## 插件


# Vue-Router
## 路由注册
## VueRouter对象
## matcher
## 路径切换


# 扩展
## event
## v-model
## slot
## keep-alive
## transition
## transition-group


