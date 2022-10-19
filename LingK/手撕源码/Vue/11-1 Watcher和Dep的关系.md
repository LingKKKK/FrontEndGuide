
# 理解 Dep
[参考](https://blog.csdn.net/swallowblank/article/details/107542882)

需要理解:
- Dep的作用
- Dep和watcher的关系
- Dep是怎么保存Watcher的
- Dep和变量的关系
- 访问子变量时，如何触发父变量收集依赖

Dep的作用: 对 Watcher 进行管理

一、什么是响应式系统的 Watcher ?
  - 响应式系统中的 Watcher 是系统的观察者, 是观察者模式的载体, 当系统中的数据发生变化时, 它能够知道并执行响应的逻辑;
  - 整个系统视为商家, 需要寄一批货给不同的客户(业务逻辑), Watcher 就是一个个快递员, 系统只需要发货(change data)给快递员(Watcher)即可; 如何送达是 Watcher 考虑的事情;
  - Watcher 和数据的关系是: 1对多, 或者 多对多
  - Watcher 和逻辑的关系是: 1对1

二、Watcher 的类型
  - 普通型 Watcher: 和数据`1对1`关系;
  - lazy 型 Watcher: 和数据`1对1`关系; 但是他是一个惰性的观察者(computed),赋值不会改变它的值,当获取的时候,才会更新到最新的值; << 惰性求值 >>
  - render 型 Watcher: 和数据`1对多`关系; 在组件中, 渲染函数观察者一定是最后生成的, 所以执行观察队列时, 它是最后一个生成和执行;

三、Watcher 和 Dep 的关系
  在源码的 `defineReactive` 方法中, 每一个被观察者都有一个 `Dep` 依赖筐,来存放所有观察它的 `Watcher`.
  `defineReactive`: 定义响应式关系, 这是响应式原理的核心点;
  Vue使用全局变量 Dep.target(watcher 类型的变量), 将 Dep 和 Watcher 进行互相绑定;

  创建一个观察者 Watcher, 将这个观察者的引用给 Dep.target;
  1. $watch 定义, 使用 Dep.target
     1. 传进来是一个字符串'a','b','c'
     2. 将字符串解析成路径并调用
     3. 在解析成路径的时候会触发属性的 getter 方法; 属性依赖筐执行 addSub,即 sub 数组添加 target, 然后当前 target 的 dep 会添加到 Dep 上;
  2. 渲染函数自动生成, 使用 Dep.target
     1. 传进来的是渲染函数
     2. 执行渲染函数
     3. 渲染函数会解析成一个方法, 这个方法访问我们设定的属性, 从而触发 getter 方法, 完成 dep 绑定
  3. computed 属性
     1. 传进来的是属性名和计算方法
     2. 执行这个计算方法
     3. 计算方法里面存在对数据的调用, 会访问到 getter 方法, 从而实现数据的绑定; (这也是为什么 computed 不需要设置的原因)

四、观察者执行队列机制
  - 观察者设置执行队列, 批量执行
    - `export const MAX_UPDATE_COUNT = 100` -> 最大的数量为 100
    - 未执行时: 如果有更改过的数据,将对应的观察者直接推进队列中, 根据 id 升序排列(对所有的内容进行排序)
    - 在执行的时候: 如果有新的观察者进入, 按照 id 升序进行插入(对未执行的进行排序)
  - diff 算法减少渲染开支

五、问题
  - Vue 数据响应式系统中, Dep 和 Watcher 各自分担什么任务?
    - Dep 负责存放数据所绑定所有观察者的对象的容器, 只要数据发生改变, 就通知这个 Dep, 从而通知观察者;
    - 每个数据都有独一无二的 Dep
    - Watcher 更偏向一个动作, 也就是观察者 + 执行者, 更贴近业务逻辑;
  - Vue 数据响应式系统的核心是 Object.defineProperty一定是最好的么? 有什么弊端和漏洞?
    - 在 ES5 中使用没有任何问题, 但是在 ES6 中就不太完美了; Proxy 是完全可以取而代之的;
    - 弊端:
      - 如果一个数据有 1000 个属性,就需要给这 1000 个属性都使用 Object.defineProperty ,开销太大;
      - 如果使用 Proxy 的话, 仅操作一次即可
    - 漏洞:
      - 拿到了 vm 实例,用户通过修改属性的描述来修改对象; 造成系统的不确定性;
      - 因为响应式系统的 `configurable:true`, 所以运行时一定能进行修改;
