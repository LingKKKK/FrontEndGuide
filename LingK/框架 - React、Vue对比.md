# React Vue diff 算法对比

    [https://juejin.cn/post/6878892606307172365]

    相同:
      1. diff优化的策略相同, 只做同层级对比, 不做跨层级对比;
      2. 内容相似, 都是vNode节点, h函数, patch方法;
      3. 流程相似: 查询tag/key(非index), 最小化操作dom元素;
      4. 虚拟dom包含的属性:
        sel     : 选择器(sellect)
        data    : 绑定的数据(attr/props/event/class/hook)
        children: 子节点数组
        text    : 当前节点的内容
        elm     : 对真实dom element的引用
        key     : 优化dom操作
      5. diff算法运行在render之后, 触发了render方法, 就执行了diff算法, 驱动视图更新

    不同
      1. 变量比较
        -> Vue维护4个变量
          oldStartIndex => 旧头索引
          oldEndIndex   => 旧尾索引
          newStartIndex => 新头索引
          newEndIndex   => 新尾索引
          ∆ 两头同时对比, 由新的位置获取dom元素; 老的先走完就添加, 新的先走完就删除;
        -> React维护3个变量:
          nextIndex      => 遍历nextChildren时的index, 节点数
          lastPlaceIndex => 上次的元素在本地遍历的index (新index)
          oldIndex       => 元素在旧节点中的index (旧index)
          ∆ 当oldIndex < lastPlaceIndex 时, 才会把节点向前移
          ∆ 移动原则: 以首个节点为原点, 其他元素都通过新旧index计算位置
      2. 对比方式
        列表=>Vue: 从两端到中间开始对比; React: 从做到右一次进行对比;
             当一个集合, 只把最后一个节点移动到第一个时, React会移动所有的节点, Vue只移动末尾节点
           Vue更高效
        节点=>className不同时, Vue会认定为不同的元素; React不对className进行对比, 只关注tag,key;
           React对比: tag/key !! Vue对比:tag/key/attr
      3. 遍历的原理
        React: 首位作为原点, 依次对内容遍历
        Vue  : 使用双向链表, 边对比边更新Dom
      4. 更新Dom的逻辑
        React: 使用diff算法队列保存需要更新的dom, 得到patch树, 最后进行批量操作
        Vue: 基于snabbdom库, 调用库中的api, 双链表同时进行对比和更新

# React Vue 对比

    [https://www.sohu.com/a/406399943_283613]
    [https://juejin.cn/post/6844904158093377549#heading-10]
    [https://juejin.cn/post/6844903607913938951]
    [https://juejin.cn/post/6844904182949019656]

    相同:
      1. 都是使用虚拟dom
      2. 都是用组件化的思想, 流程基本一直
      3. 都是mvvm响应式, 推崇单向数据流
      4. 社区成熟, 都支持服务端的渲染(SSR)
    不同:
      1. 核心思想不同
        Vue: 推崇灵活易用(渐进式开发体验), 数据可变, 双向数据绑定; => 降低前端开发的门槛
        React: 推崇函数组件化编程(纯组件), 数据不可变, 单项数据流; => 颠覆传统的开发模式

        1. 核心思想不同 -> 写法的差别
           Vue简单易懂, 所以推崇templete写法, 单文件vue; (Vue支持jsx, babel编译, 但是官方不推荐)
           React推崇 jsx, hoc, all in js
        2. 核心思想不同 -> api差异
           Vue定位是易于上手, 所以有大量的api, watch computed等
           React的api比较少, 使用一个setState就可以进行开发
        3. 核心思想 -> 未来升级方向不同
           Vue: 更侧重通过依赖收集来实现数据的可变, Vue3.0 tempelte 基本不变, 增加了部分 api
           React: 依然是纯函数, 组件化, 应该还是在这些基础上进行优化
      2. 组件实现的方式不同
        Vue: 把options挂载到Vue核心类上, 然后再new Vue({options})拿到实例
             大部分api是不透明的, 用户无法直接使用, vue在初始化的时候替用户做的大量的工作
        React: 内部结构简单, 透明, 流程基本固定, 都是依赖于React.Component
      3. 响应式的原理不同
        Vue:
          依赖数据搜集, 自动优化, 数据可变 (2/3基本类似, Vue3使用Proxy的方式)
          vue递归监听data的变化, 可直接修改
          当数据变化时, 自动追踪到组件驱动更新
        React:
          基于状态机, 手动优化, 数据不可变, 新的state替换旧的state
          数据改变时, 以组件为根目录, 默认全部更换组件
      4. diff算法的不同
      5. 事件机制的不同
        Vue:
          原生事件使用标准的web事件
          自定义组件机制, 父子组件实现通信
          利用的snabbdom库中的插件
        React:
          原生的时间被包装, 所有的事件都冒泡到顶层document监听, 然后再合成事件下发;
          可以使用跨端的事件机制, 而不是和dom紧紧绑定在一起
          组件上无事件, 父子通信使用props
