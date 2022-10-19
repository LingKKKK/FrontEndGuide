# 初始化的流程

/**
  * ! init函数的作用:
  * 1）给私有属性_uid自增1，每个组件每一次初始化时做的一个唯一的私有属性标识
  * 2）合并options，并赋值给实例属性$options
  * 3）定义实例私有属性vm._self = vm ，用于访问实例的数据和方法
  * 4）调用initLifecycle(vm) ：确认组件的父子关系；初始化实例属性vm.$parent、 vm.$root 、vm.$children、 vm.$refs；初识化内部相关属性
  * 5）调用initEvents(vm) ：将父组件的自定义事件传递给子组件；初始化实例内部属性_events（事件中心）、_hasHookEvent；
  * 6）调用initRender(vm) ：提供将render函数转为vnode的方法；初始化实例属性$slots、$scopedSlots；定义实例方法$createElement；定义响应式属性：$attrs、$listeners；
  * 7）调用callHook(vm, 'beforeCreate') ， 执行组件的beforeCreate钩子
  * 8）调用initInjections(vm) ，resolve injections before data/props
  * 9）调用initState(vm) ，对实例的选项props、data、computed、watch、methods初始化
  * 10）调用initProvide(vm) ， resolve provide after data/props
  * 11）调用callHook(vm, 'created')
  * 12）如果选项有提供挂载钩子，则执行挂载；$options.el：vm.$mount(vm.$options.el)
*/

[参考](https://github.com/maomao93/vue-2.x/tree/master/personal)
[参考](https://blog.csdn.net/tangxiujiang/article/details/116094614)
