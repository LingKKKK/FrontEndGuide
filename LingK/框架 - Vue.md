# 工作机制

    1. 初始化 init
       在new Vue()之后, 内部会首先执行初始化的方法;
       初始化基本内容: 生命周期, Props, Data, 数据收集
       初始化重要内容: 发布者-订阅者关联, Object.defineProperty设置getter setter函数
    2. $.mount() 挂载函数
       $.mount方法 指定的: 可以是目标节点, 也可能是一个dom元素
       $.mount作用 将定义好的模板挂载到目标节点
    3. 编译器 compile
       在挂载节点完毕之后, 会自动启动编译器compile
       a. 将templete扫描一遍: 解析语法树, 标记静态节点, 生成渲染函数
       b. 生成虚拟dom节点, 调用渲染函数
       c. 激活观察者模式, 追踪数据的变化
    4. 调用render渲染函数
       a. 渲染dom tree
       b. 调用watcher,监听update
       c. patch函数更新dom数据

# MVVM 数据驱动视图

    是MVC的升级版; 改进了核心思想
    MVC: model view control
    MVVM: model view ViewModel(ViewControl)
      1. ViewModel抽离了大量的control逻辑, 更加利于维护,
      2. 大量的bug可能出现在逻辑层, 可以对ViewModel进行单元测试
      3. 利于开发解耦, 让UI和逻辑抽离的更彻底
      4. 代码量可能比mvc多, 但是逻辑更为清晰, 是思想核心升级版

# Vue 响应式的原理

    利用Object.defineProperty属性, 对data中的属性进行 get set监听
    发生变化时, 发布者和订阅者都会产生印象;

# Vue 的编译 compile

    templete无法直接被浏览器识别, 需要转换成可识别的dom结构, 并且挂载钩子函数和依赖关系;
    需要利用到的插件是: vue-templete-compile
    流程: 1. 便利dom, 获取属性和dom结构, 截获响应式
         2. 修改代码片段, 减少dom操作
         3. 把编译的结果追加到宿主对象上
    数据驱动视图, 就是编译的过程;

# 渲染的过程

    1. 在Create阶段, 会判断是否有el选项[el: '#app']
       a. 有el, 判断是否存在templete模板
       b. 无el, 调用vm.$(el) 生成默认的templete
       c. 渲染的优先级是: render > templete > el
    2. 异步渲染
       对所有的修改进行整合, 一次性修改
       减少dom操作, 提升框架性能
    3. 流程
       初次渲染 - 更新过程 - 异步渲染

    ```JavaScript
      new Vue({
        el: "#app",
        data: {
          info: '通过el挂载的方式来添加'
        },
        templete: '<div>templete模板的方式来渲染</div>',
        render: function(h) {
          return h('div', {}, '使用render的方式进行渲染')
        }
      })
    ```

# 双向绑定的原理

    做双向绑定的时候, 通常会使用v-mode绑定在input上
    编译的时候, 可以解析v-model, 会给该属性添加监听;
    值变化时候, 会触发 Object.defineProperty 调用setter函数, 触发依赖关系
    从而达到和这个属性相关的依赖都能保持更新;

# 虚拟 DOM 和 Diff 算法

    虚拟dom:
      1. 是实现vue react的基石, 为了避免大量dom操作影响性能而提出的一个内容;
      2. 其核心就是js, json的形式来模拟的dom结构, 经过编译处理, 最终渲染在页面上
      3. 虚拟dom的核心就是: vnode节点, h函数, diff算法, patch合并
    diff算法:
      1. 是优化vdom的主要手段, 将重绘降到最低, 对比差异打补丁(patch)
      2. 算法优化:
         a. 比较同层级, 不同层级不进行比较 [从上到下对比]
         b. tag不同直接删除, 不进行比较 [节省时间]
         c. tag和key都相同, 不进行比较 [确认无变化]
      3. diff策略:
         a. dom的跨层操作比较少, 可忽略不计
         b. 相同类的组件生成的树形机构也是相似的
         c. 同层组件通过uuid来进行区分
      4. 对比的粒度:
         a. Dom 层级
         b. Component 层级
         c. element 层级

# key 值的作用

    1. 在diff算法中, 使用到key值做对比, 如果没有key值, 就需要逐层分析, 增加性能损耗
    2. 在循环对比中, 遍历的效率要远低于映射, 有key值会优先查询出来
       相当于重新渲染的了一遍dom结构, 再分别进行赋值, 效率远低于针对性的查询替换;

# Vuex

    构成:
      state: 是vuex的基本数据格式, 存放变量
      getters: 是state的计算方法
      actions: 提交数据的方法, 必须是异步 [先整合所有的异步操作, 然后commit 提交到 mutation处理]
      mutation: 提交数据的方法, 必须是同步 [第一个参数是字符串, 自定义的内容, 第二个参数是回调]
        是原子操作, 不会被任何调度中断
      modules: 将vuex模块化, 让项目的结构更加清晰, 有调理, 让项目更利于维护

    vuex中的方法:
      dispatch: 通过dispatch方法来驱动action
      commit: actions 通过 commit 进行异步整合, 提交给mutation
      mapState: 是state的辅助函数, 自动生成计算属性
      mapGetters: 将store中的getters映射到局部计算属性中
      mapActions: 将组件的methods方法映射为 store.dispatch()
      mapMutations: 将组件的methods方法映射为 store.commit()

    vuex的操作流程 / 驱动流程:
      在vue中, 通过dispatch来驱动actions: 提交数据的更新修改操作
      通过action中的commit来触发mutations: 修改数据(原子操作)
      mutations接受commit请求, 通过mutate来修改数据:
        如果是异步操作: dispatch > actions > commit > ***
        如果是同步操作: commit > ***
      执行完毕之后, store中存储的数据变化, 然后其相应依赖的内容也进行更新 [数据驱动视图]

# Props 定义

    1. 数组-字符串的形式定义: 不检测类型, 全部可用
    2. 对象的形式定义: 规范类型, 可以设定默认值

    ```JavaScript
    props: ['params1', 'params2', 'params3' ... ]
    props: {
      value: {
        type: String,
        default: ''
      }
    }
    ```

# v-model

    实际上是一层语法糖衣, 为了实现双向数据绑定; v-bind: 绑定value值, v-on: 绑定更新函数的回调
    1. 在input组件上使用
    2. 在自定义的组件上使用
       默认是value作为props, input作为event触发事件 [props和event可以自定义]

       ```JavaScript
        model: {
          props: 'name',
          event: 'changeName'
        },
        props: ["value"]
        this.$emit('changeName'); // 修改时触发
       ```
    3. 组件上可以绑定多个v-model, 写法没有区别

# .sync 修饰符 [https://www.jianshu.com/p/6b062af8cf01]

    某些情况下, 需要对props进行双向绑定; 通过 update:props 来回调触发

    ```JavaScript
      // 原始写法
      <comp :foo.sync="bar"></comp>
      // 扩展为
      <comp :foo="bar" @update:foo="val => bar = val"></comp>
      // 需要更新时
      this.$emit('update:foo', newValue)

      // 案例
      <template>
      <div class="details">
          <myComponent :show.sync='valueChild'></myComponent>
          <button @click="changeValue">toggle</button>
      </div>
      </template>
      <script>
      import Vue from 'vue'
      Vue.component('myComponent', {
        template: `<div v-if="show">
                      <p>默认初始值是{{show}}，所以是显示的</p>
                      <button @click.stop="closeDiv">关闭</button>
                  </div>`,
        props:['show'],
        methods: {
          closeDiv() {
            this.$emit('update:show', false); //触发 input 事件，并传入新值
          }
        }
      })
      export default{
          data(){
            return{
              valueChild:true,
            }
          },
          methods:{
            changeValue(){
              this.valueChild = !this.valueChild
            }
          }
      }
      </script>
    ```

# $nextTick

    等待本轮DOM渲染循环, 完毕之后, 执行里面的回调函数
    结束上次render循环, 类似 async/await
    eg. 每次添加元素之后立即打印, 无法打印出准确数量; 使用nextTick可以打印出正确的值;

# 插槽 slot

    根据变量和组件的传值来控制 slot 的显示也隐藏;
    1. 具名插槽
    2. 作用域插槽

# 动态组件

    组件需要根据变量来确定内容; (无法确定状态及内容)
    <component :is="component_name" /> -> 通过component_name来控制组件的显示和隐藏

# 异步组件

    1. 在路由中, 使用懒加载的方式, 异步引用组件
    2. 在templete中, 使用v-if来控制组件的加载 [注意v-if v-show的区别]
    * 尽量避免同步加载大量的组件, 也出于性能问题

# keep-alive 缓存组件

    1. 在频繁切换时, 使用缓存组件, 会节省很多内容存
    2. 最简单的案例就是v-show, 不删除, 仅隐藏
    3. 使用keep-alive将组件包裹起来, 就是对该组件的缓存

# mixin

    1. 是vue的一种优化方案, 将逻辑都抽离到mixin中, 便于维护,
    2. 适用于较为复杂的项目, 简单的项目没有必要使用;
    3. mixin 中的属性, 方法可以和组件融合, 可以直接调用
    4. 内容会比较庞大, 命名需要规范; 来源不好追踪, 尽量避免被覆盖;
       属性冲突时, 会进行融合(组件的数据优先)
       方法重复时, 会将方法合并到一个数组中, 依次进行调用, mixin中的方法优先执行; 类似 Promise.allSettled(mixin, comp);

# 依赖注入 provide inject

    依赖注入和props传值一样, 但是写法更为简洁; 但是追踪来源比较麻烦;

    使用场景:
      1. 大范围, 大量的获取 props
      2. 组件嵌套的层级比较深, 使用props较麻烦
      3. 继承中有断层, 中间组件有的不需要调用props
      4. 子组件不需要追溯来源

    $parent的用法: $parent调用了父组件的实例; 多层级时: this.$parent.$parent...

    ```JavaScript
      // 在根组件中, provide
      provide: function () {
        return {
          getMap: this.getMap
        }
      }
      // 在子组件中, inject
      inject: ['getMap']
    ```

# watch computed 对比

    watch:
      1. 默认是浅监听
      2. watch监听引用类型, 无法获取到oldValue, 因为只能追到地址, 无法追到值
      3. 自动触发
      4. 挂载在this下的所有属性都可以监听
      5. 适用于data变化后执行异步操作, 或者开销比较大的操作
      6. 占用的资源比较大
    computed:
      1. 自动触发
      2. 基于响应式的依赖. [多了一层依赖关系]
      3. 值不在data中, 设置的话会报错
      4. 适用于简单的计算

    ```JavaScript
    computed: {
      aaa: function() {
        return this.bbb + this.ccc
      }
    },
    watch: {
      aaa: {
        handle (val, oldVal) {
          console.log(val, oldVal);
        },
        deep: true, // 深度监听
        immediate: true // 是否立即执行
      }
    }
    ```

# 如何给目标添加监视器 ?

    等同于watch监听

    ```JavaScript
      Vue.prototype.$watch = function (exp, fn, config) {
        new Watch(this, exp, fn)
      }
      vm.$watch('dataName', function(val, oldVal) {
        console.log(val, oldVal);
      })
    ```

# Vue3.0 新增的内容

    1. Vue升级的内容
      使用ts重构部分代码
      性能提升, 代码量减少
      调整了部分api
    2. 优化Object.defineProperty的缺点
      深度监听需要进行一次递归deep来控制
      无法监听新增和删除的属性 [Vue.$set Vue.$delete]
      无法原生对数组进行监听, 需要重构

# 双向绑定 单项数据流

    单向:
      1. 一般都是绑定监听的数据, 将data绑定到view上
      2. 使用js代码更新data时, view会自动更新, 不需要进行额外的操作
    双向:
      1. 把Model绑定到View的同时, 也将View绑定到Data上; 达到了双向驱动的效果
