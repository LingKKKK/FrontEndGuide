# 工作机制

    初始化数据结构 -> 查询挂载的目标节点 -> 编译数据结构 -> 将vDom输出为Dom
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

    这是 Vue 独有的特性, 其他实现响应式的都是侵入性响应式. 并非原始的响应式...
    响应: 一部分内容改变, 从而达到局部/全局更新 →→→ 发生变化时, 发布者和订阅者都会产生影响;
    其核心的内容是 data添加的 Observer 和 Dep, 核心的方法是 dep.notify() ;;;; [notify → 通知/通告]
    利用Object.defineProperty属性, 对data中的属性进行 get set监听, 在发生变化时, 触发 dep.notify(), 调用对应 watcher 的 _update 方法;

        init 初始化
            ⬇️
    Observer建立响应式的对象 ➡️ Dep {} ➡️ 每次创建Observer实例, 同时会创建一个Dep实例
            ⬇️                         并让get中的watcher和dep相互记录 → 多对多/观察者
            ⬇️                         此时get/set并未执行, 所以不是真正的记录
            ⬇️
    交给 Object.defineProperty() 进行响应式化
            ⬇️ ➡️ ➡️ ➡️ 依赖收集(Dep)
    渲染 Watcher, 给 Data 数据添加 Dep 依赖
            ⬇️
            ⬇️ ➡️ ➡️ ➡️ 派发更新(render)
            ⬇️
    Dep.notify() ➡️ ➡️ ➡️ Watch.run() ➡️ ➡️ ➡️ _update

    1. 对数据进行了拦截：对象劫持（Object.defineProperty） 数组（AOP切面编程，对七个能改变数组方法进行拓展）
    2. 统一render，通过template模板解析成AST语法树（描述语法）
    3. 通过AST语法树生成render函数（可被执行的js字符串），使用with添加词法作用域，使用new Function()来执行render函数，生成虚拟Dom
    4. 当new Vue时会产生一个watcher（渲染watcher），该watcher主要有两个功能，调用vm._update(vm._render())来创建真实节点


    1. 初始化数据时，会生成一个Observer实例
    2. Observer实例生成时，会产生一个Dep实例，并在get方法中让watcher与dep的相互记录（多对多关系，观察者模式，此时get/set并未执行，所以此时并未真正相互记录）
    3. 组件挂载，执行mountComponent，此时会创建一个watcher（渲染watcher）
    4. 执行Watcher.get方法，该方法处理三个步骤：将Dep中的target设置为该Watcher，执行渲染函数（此时会取值，触发2步骤中get，watcher与dep的相互记录），渲染之后移除Dep.target
    5. 4步骤时，dep与Watcher已相互记录，当属性发生改变时，dep中的notify方法会将自己记录到的所有watcher都执行一次update方法，也就是触发视图更新（这里只实现到渲染watcher，所以只会记录到一个）
    6. 视图更新，又会重新触发watcher.get方法，依赖将会重新收集（页面可能存在有v-if/v-else，所以需要重新收集）



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
      3. 虚拟dom的核心就是: vNode节点, h函数, diff算法, patch合并
    diff算法:
      1. 是优化vDom的主要手段, 将重绘降到最低, 对比差异打补丁(patch)
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

# 为什么vue的for循环中,不推荐使用index作为key值
    使用index作为key值,在做破坏顺序的操作时,因为index随顺序变更,所每一个节点都找不到对应的key值.
    导致部分节点没办法复用,所有新的vnode都需要重新创建,造成性能损耗.
    例如,当我们在列表中插入一条数据时,后面的所有数据都找不到对应的key,都需要重新创建,性能损耗.如果存在固定的key值,那么就可以做简单的插入操作,而不是重建节点进行批量渲染.

# vue中的data为什么是函数的形式
    * 让数据相互隔离, 仅存在于当前的组件中
```ts
    // 原型链的知识
    function Component(){
      this.data = this.data
    }
    Component.prototype.data = {
        name:'jack',
        age:22,
    }
    /**
     * 需要达成的共识:
     * 1. 实例的构造函数内部的this内容是不一样的
     * 2. Component.prototype 这类底下的方法或者值都是所有实例公用的
     */
```

# VueX

    适用于多组件之间的通信, 某些变量需要在多个组件中公用;
    高效,同步,响应

    构成:
      state: 是VueX的基本数据格式, 存放变量
      getters: 是state的计算方法
      actions: 提交数据的方法, 必须是异步 [先整合所有的异步操作, 然后commit 提交到 mutation处理]
      mutation: 提交数据的方法, 必须是同步 [第一个参数是字符串, 自定义的内容, 第二个参数是回调]
        是原子操作, 不会被任何调度中断
      modules: 将VueX模块化, 让项目的结构更加清晰, 有调理, 让项目更利于维护

    VueX中的方法:
      dispatch: 通过dispatch方法来驱动action
      commit: actions 通过 commit 进行异步整合, 提交给mutation
      mapState: 是state的辅助函数, 自动生成计算属性
      mapGetters: 将store中的getters映射到局部计算属性中
      mapActions: 将组件的methods方法映射为 store.dispatch()
      mapMutations: 将组件的methods方法映射为 store.commit()

    VueX的操作流程 / 驱动流程:
      在vue中, 通过dispatch来驱动actions: 提交数据的更新修改操作
      通过action中的commit来触发mutations: 修改数据(原子操作)
      mutations接受commit请求, 通过mutate来修改数据:
        如果是异步操作: dispatch > actions > commit > _event
        如果是同步操作: commit > _event
      执行完毕之后, store中存储的数据变化, 然后其相应依赖的内容也进行更新 [数据驱动视图]

## VueX action | mutations 对比
```ts
    const store = new Vuex.Store({
    　　state: {
    　　　　count: 0
    　　},
    　　mutations: {
    　　　　increment (state) {
    　　　　　　state.count++
    　　　　}
    　　},
    　　actions: {
    　　　　increment (context) {
    　　　　　　context.commit('increment')
    　　　　}
    　　}
    })
    // 流程顺序
    '响应的操作' ▶️ '修改state'  ▶️ 操作触发"action" ▶️ "action"触发"mutations"
    // 角色定位
    Mutations: 专注于state的修改, 是修改state的唯一途径
    Actions: 企业代码, 异步请求, commit触发mutations
    // 限制
    Mutations: 必须同步执行
    Actions: 允许异步, 但是不能直接操作state
```

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

# v-bind
作用: 绑定值(数据/元素属性)
使用: v-bind 或者 : (简写)

1 绑定class
```html
  <div :class="{ classA: isA }"></div>
  isA为真时, 渲染结果是: class="classA"

  <div :class="[classA, classB]"></div>
  变量classA="aaa" && 变量classB="bbb"时, 渲染结果是: class="aaa bbb"

  <div :class="[classA, { classB: isB, classC: isC }]">
  classA为变量, classB,classC为常量
  classA="aaa" && isB,isC为真时, 渲染结果是: class="aaa classB classC"

  <div :class="classA"></div>
  变量classA为'xxx'时, 渲染结果是: class="xxx"
```

2 绑定style
```html
  <div :style="{ fontSize: size + 'px' }"></div>
  css属性要是用驼峰命名, font-size >> fontSize; z-index >> zIndex

  <div :style="styleObjectA"></div>
  styleObjectA: {color: 'red'}

  <div :style="[styleObjectA, styleObjectB]"></div>
  数组语法可以将多个样式对象应用到一个元素上
```

3 绑定一些变量 (绑定字面量)
```html
  <img :src="xxx">
  <a :href="xxx"></a>
  对变量xxx取值赋值;
```

4 传参绑定
  用于组件之间的传递
```js
  //用于父子组件传参
  // data.params = {"a": "123", "b": []}
  <component v-bind="params"/>
  // 子组件必须要声明接受
  props: {
    a: {
      type: String,
      default: ""
    },
    b: {
      type: Array,
      default: function() {
        return []
      }
    }
  }
```
举例:
```shell
  在组件components/page/self.vue中
  1. 导入static/js/mixin/context-menu.js
  2. 给子组件<context-menu>绑定mixin导入的属性menuData >>> v-bind="menuData"
  3. 在子组件 context-menu.vue 中声明变量menuData >>> props: {contextMenu: Object}
  4. 子组件就可以其使用传递过来的变量menuData
```

5 v-bind="$attrs" 做多层组件的监听
- 组件之间的通信有很多方式: vuex(太重), props(层级多时太麻烦)
- vue从2.4版本提供了一个新的方法: ```vm.$attrs```
  - 将父组件的属性（除去在props中传入的属性）传递给子组件
  - 是一种优化手段
- 扩展: v-on="$listeners"
-
```html
拿element-ui中input举例:
父: <el-input maxlength="20"></el-input>
子: <input v-bind="$attrs" />
未使用props和vuex, 依然可以将追加的属性maxlength传递给子组件中
>>> 通过这种方法, 实现组件属性的透传
```

思考: 我们是否有必要使用vm.$attrs?

[参考](https://www.cnblogs.com/jin-zhe/p/13099416.html)


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

```Vue
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

    本质就是设定一个回调函数(异步), 这个回调函数的执行时机就是: 等待本轮DOM渲染循环完毕.

    在Vue中,可能会涉及访问Dom的情景; $nextTick就是一个桥梁,确保访问的是Render之后最新的DOM
    $nextTick事件的原理:
      1. Vue通过异步队列的方式来控制Dom更新和nextTick回调的执行先后顺序.
      2. microTask因为优先级较高, 所以能确保队列中的微任务能在循环执行完毕之后第一时间调用.
      ** 在事件循环的阶段, 将回到任务, 以微任务的形式添加到循环之后.
    实现原理:
      * 优先级判断顺序, 有一个支持就直接进行调用
      1. Promise
      2. MutationOberver
      3. 验证是否支持: setImmediate (IE Node) setImmediate是window中存放定时任务的回调.
      4. 使用setTimeout实现

# 插槽 slot

    根据变量和组件的传值来控制 slot 的显示也隐藏;
    1. 具名插槽
    2. 作用域插槽

[参考](https://juejin.cn/post/6844903555837493256)

# 动态组件

    组件需要根据变量来确定内容; (无法确定状态及内容)
    <component :is="component_name" /> -> 通过component_name来控制组件的显示和隐藏

# 异步组件

    1. 在路由中, 使用懒加载的方式, 异步引用组件
    2. 在templete中, 使用v-if来控制组件的加载 [注意v-if v-show的区别]
    * 尽量避免同步加载大量的组件, 也出于性能问题

# v-if | v-show
- 共同点: 都能控制组件的显示和隐藏
- 不同点:
      1. v-show: 控制display属性; v-if: 控制组件的渲染和销毁
      2. v-show: 首次渲染的开销较大, 之后的开销较小; v-if: 首次渲染的开销很小
      3. v-show: 切换开销较小; v-if: 切换开销较大
      4. v-if: 有对应的v-else-if/v-else命令; v-show没有
      5. v-if: 可以搭配templete使用; v-show不行

# keep-alive 缓存组件

    1. 在频繁切换时, 使用缓存组件, 会节省很多内容存
    2. 最简单的案例就是v-show, 不删除, 仅隐藏
    3. 使用keep-alive将组件包裹起来, 就是对该组件的缓存
    * 保存组件的状态,避免被频繁渲染
    * include:包含的组件 exclude:排除的组件 max:缓存的最大数量
    keep-alive的生命周期:
      首次打开的时候会触发 created mounted
      再次打开的时候会触发 activated(触发) deactivated(销毁)
    不使用keep-alive: beforeRouterEnter --> created --> mounted --> destory
    使用keep-alive: beforeRouterEnter --> created --> mounted --> activated --> deactivated
    使用keep-alive并再次进入: beforeRouterEnter --> activated --> deactivated
    删除keep-alive: 可以使用exclude来动态移除,v-if动态删除

# mixin

    1. 是vue的一种优化方案, 将逻辑都抽离到mixin中, 便于维护,
    2. 适用于较为复杂的项目, 简单的项目没有必要使用;
    3. mixin 中的属性, 方法可以和组件融合, 可以直接调用
    4. 内容会比较庞大, 命名需要规范; 来源不好追踪, 尽量避免被覆盖;

    ** 属性冲突时, 组件的属性会覆盖 mixin 中的属性. (优先级: 组件 >>> mixin)
    ** 方法冲突时, 会将 mixin 和组件的方法
    属性冲突时, 会进行融合(优先级: 组件 >> mixin)
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

# Computed
  官方文档: 计算属性的结果会被缓存,除非依赖的响应式property变化才会重新计算.注意,如果某个依赖(比如非响应式的property)在该实例范畴之外,则计算属性时不会被更新的.
  从官方文档中可以看出computed最关键的知识点是:
    1. computed会搜集并记录依赖
    2. 依赖发生变化才会重新计算computed, 由于computed是有缓存的,所以当依赖发生变化之后,第一次访问computed属性才会重新计算值 (解耦的思想, 降低关联性)
    3. 只能搜集到响应式属性依赖,无法搜集到非响应式属性依赖
    4. 无法实现搜索当前vm实例之外的属性依赖

  计算的流程: 当首次访问的时候,Vue会立即计算出新的computed属性,并将其缓存起来; 当依赖发生变化时,Vue内部不会立即更新computed属性, 而是会将其标记为dirty(脏数据); 当下一次访问computed属性的时候,Vue会检查dirty标记,如果dirty标记为true,则会再次计算computed属性,并将其缓存起来;

# watch computed 对比
  Computed: 计算属性
    创建vue实例中的计算属性, 属性值为一个对象, 对象里是各种计算, 最后将结果return出来.
    值可以不设置在data中, 设置也不报错
    和data里面的属性一样, 有依赖关系, 依赖不变计算属性就不触发.
    是同步的过程, 可以触发其他的方法, 但是不能写异步的逻辑, 因为计算是同步的
  Watch: 侦听器
    在data中必须设置值, 否则会报错
    是监听的意思, 对data中的数据进行监听, 触发一些操作, 允许处理异步逻辑.
    开销较大
    默认是浅监听, 可以配置 immediate/deep 属性

  * computed watch 可以同时对一个值进行监听, 执行顺序: computed > watch
  * 可以配合使用, computed监听值变化, watch执行事件(同步/异步)

```js
  computed: {
    aaa: function() { // 默认
      return this.bbb + this.ccc
    },
    aaa: { // 拓展
      get: function() { // getter
        return this.bbb + this.ccc
      },
      set: function() { // setter
        this.ddd = this.aaa
      }
    }
  },
  watch: {
    aaa: function(val, oldVal) { // 默认
      console.log(val, oldVal);
    }
    aaa: { // 拓展
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

# 双向绑定 单项数据流

    单向:
      1. 一般都是绑定监听的数据, 将data绑定到view上
      2. 使用js代码更新data时, view会自动更新, 不需要进行额外的操作
    双向:
      1. 把Model绑定到View的同时, 也将View绑定到Data上; 达到了双向驱动的效果

## 自定义指令 directive

```JavaScript
  Vue.directive('my-click',{
      bind:function(el, binding, vnode, oldVnode){
          el.addEventListener('click',function(){
              console.log(el, binding.value)
          })
      }
  })
```

## v-html 引用了富文本, 里面的点击事件不生效怎么处理?

    [https://blog.csdn.net/weixin_42633131/article/details/100579381]
    在富文本中的click等事件,都是指向window的; 需要将window.xxx指向this.xxx
    不生效的原因就是: window中的方法, 并未挂载到vue方法中

# Vue 中的 “属性透传”

    如何实现组件属性透传？
        以elementUI二次封装一个Input组件为例：
        ```vue
          <template>
            <div>
              <!-- 我们希望 placeholder、clearable 等属性透传 -->
              <el-input v-model="myc"></el-input>
            </div>
          </template>
        ```
        1.直接设置，通过 “props” 透传，然后一个一个进行设置；「可读性差、不便维护、易遗漏属性」
        ```vue
          <template>
            <div>
              <el-input v-model="myc" :placeholder="configProps.placeholder"></el-input>
            </div>
          </template>
        ```
        2.通过v-bind=“$attr”，来进行透传
          如果组件内部没有声明任何props时，调用该组件，传入相关的属性，属性会被传递到根节点上。
          - 属性会被vdom渲染最外层的div上，不会在el-input组件上生效。「class和style以外的其他属性」
          vm.$attr
            包含了负作用域中不作为props被识别（捕获）的attribute绑定。通过$attr将属性传入内部。

    动态组件如何透传？
        1.可以使用设定props来传递
        2.可以使用渲染函数（render）来进行渲染 [https://cn.vuejs.org/v2/guide/render-function.html]
          渲染函数可以解决标签中无法结构属性的问题。
          第一个参数是：createElement。这个createElement接受的第一个参数是Html标签、组件选择对象、resolve的一个async函数（必填项）。
          第二个参数是：对象，里面包含了class、style、attr等属性 + 组件的props属性。「可以将props结构赋值到这里即可」

          ```javascript
            {
              // 与 `v-bind:class` 的 API 相同，
              // 接受一个字符串、对象或字符串和对象组成的数组
              'class': { foo: true, bar: false},
              // 与 `v-bind:style` 的 API 相同，
              // 接受一个字符串、对象，或对象组成的数组
              style: {color: 'red', fontSize: '14px'},
              // 普通的 HTML attribute
              attrs: {id: 'foo'},
              // 组件 prop
              props: {myProp: 'bar'},
              // DOM property
              domProps: {innerHTML: 'baz'},
              // 事件监听器在 `on` 内，
              // 但不再支持如 `v-on:keyup.enter` 这样的修饰器。
              // 需要在处理函数中手动检查 keyCode。
              on: {click: this.clickHandler},
              // 仅用于组件，用于监听原生事件，而不是组件内部使用
              // `vm.$emit` 触发的事件。
              nativeOn: {click: this.nativeClickHandler},
              // 自定义指令。注意，你无法对 `binding` 中的 `oldValue`
              // 赋值，因为 Vue 已经自动为你进行了同步。
              directives: [
                {
                  name: 'my-custom-directive',
                  value: '2',
                  expression: '1 + 1',
                  arg: 'foo',
                  modifiers: {
                    bar: true
                  }
                }
              ],
              // 作用域插槽的格式为
              // { name: props => VNode | Array<VNode> }
              scopedSlots: {default: props => createElement('span', props.text)},
              // 如果组件是其它组件的子组件，需为插槽指定名称
              slot: 'name-of-slot',
              // 其它特殊顶层 property
              key: 'myKey',
              ref: 'myRef',
              // 如果你在渲染函数中给多个元素都应用了相同的 ref 名，
              // 那么 `$refs.myRef` 会变成一个数组。
              refInFor: true
            }
          ```
