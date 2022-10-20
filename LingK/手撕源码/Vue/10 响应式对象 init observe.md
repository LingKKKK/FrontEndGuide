

## 响应式对象

Vue响应式的核心, 是通过ES5的 Object.defineProperty 来实现的; 这也是Vue为什么不能支持`IE8-`的原因;

### Object.defineProperty
这个方法会在对象上创建一个新的方法,或者修改对象的属性,并返回这个对象;
`Object.defineProperty(obj, prop, descriptor)`
obj: 需要定义或修改属性的对象
prop: 需要定义和修改的属性名
descriptor: 对被定义和修改的属性的描述; 这是比较核心的内容, get set 都在这里设置

### initState
在Vue初始化的阶段, 会调用`initState(vm)`; 起作用是对:data props methods computed watch进行初始化
```js
    export function initState (vm: Component) {
      vm._watchers = []
      const opts = vm.$options
      /**
       * 所有的内容都在 opts 上,
       */
      if (opts.props) initProps(vm, opts.props)
      if (opts.methods) initMethods(vm, opts.methods)
      if (opts.data) {
        initData(vm)
      } else {
        observe(vm._data = {}, true /* asRootData */)
      }
      if (opts.computed) initComputed(vm, opts.computed)
      if (opts.watch && opts.watch !== nativeWatch) {
        initWatch(vm, opts.watch)
      }
    }
```
#### initProps
初始化props的内容: --> 响应式对象
1. 遍历每个props配置  -> vm._props.xxx 即可访问
2. 将props映射成响应式
   - 通过`defineReactive`将其值做成响应式;
   - 或者使用proxy的方式, 将 vm._props.xxx 代理到 vm.xxx

#### initData
初始化data的内容: --> 响应式对象
1. 对data函数返回的对象进行遍历
2. 将data映射成响应式
   - 通过`observe`对data进行观测
   - 或者使用proxy的方式, 将 vm._data.xxx 代理到 vm.xxx 上;

### proxy实现代理
通过`Object.defineProperty`将对`target[sourceKey][key]`的读写,代理成对`target[key]`的读写;
对props/data而言 vm._props/_data.xxx 就等于 vm.xxx, 可以理解成映射关系;
```js
    const sharedPropertyDefinition = {
      enumerable: true,
      configurable: true,
      get: noop,
      set: noop
    }
    export function proxy (target: Object, sourceKey: string, key: string) {
      sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
      }
      sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
      }
      Object.defineProperty(target, key, sharedPropertyDefinition)
    }
```

### observe
```js
/**
 * Attempt to create an observer instance for a value, returns the new observer if successfully observed, or the existing observer if the value already has one.
 * 如果对象有观察者, 就返回现有的观察者
 * 如果对象没有观察者, 就给这个对象创建一个观察者, 并返回这个新的观察者
 * __ob__, 就是观察者的键, 对象有__ob__就是有observe
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    // 仅作用于对象&&非Vnode类型
    return
  }
  let ob: Observer | void // => ob === observe
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
1. `observe` 方法用于检测数据的变化
2. `observe` 方法的作用就是给非 VNode 的对象类型数据添加一个 Observer
3. 如果已经添加过则直接返回，否则在满足一定条件下去实例化一个 Observer 对象实例。

### Observer 观察类的实现
`Observer`就是一个类,用来监听数据的变化; 给对象属性添加`getter`和`setter`,用来依赖收集和派发;
逻辑:
  1. 实例化`Dep`对象
  2. 通过执行`def`函数把自身实例添加到数据对象`value`的`__ob__`属性上
     这就data上面多了一个`__ob__`属性的原因

```js
  /**
   * @文件路径 src/core/util/lang.js
   * def函数, 是对`Object.defineProperty`进行简单的封装, 增加了`__ob__`属性
   */
  export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    })
  }
```
Observer类的实现

回到 Observer 的构造函数，接下来会对 value 做判断，对于数组会调用 observeArray 方法，否则对纯对象调用 walk 方法。可以看到 observeArray 是遍历数组再次调用 observe 方法，而 walk 方法是遍历对象的 key 调用 defineReactive 方法，那么我们来看一下这个方法是做什么的。

```js
/**
 * 每个observer观察者,都会继承于Observer类;
 * 继承之后, observer会将目标对象添加到`getter/setter`中, 用于收集依赖关系和派发更新;
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data
  // vmCount: 将此对象作为根$data的虚拟序数
  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this); // 对Object.defineProperty封装, 并未挂载getter/setter
    /**
     * Observer构造函数, 会对Value进行判断
     * 当`value == array` -> observerArray(遍历数组, 然后再调用 observer 方法)
     * 当`value == object` -> walk(遍历对象的key, 然后再调用 defineReactive 方法)
     */
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  /**
   * ! 对象递归调用observe方法
   * 不管层级有多深, 都能给属性添加observe; 达到深层次监听的效果
   */

  // observer -> object;
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  // observer -> array; 有点递归添加observe的感觉
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
  // 感觉最终不管数据类型, 都会走到 defineReactive 上
}
```


#### defineReactive 定义一个响应式对象
实例化Dep对象;
给对象动态添加`getter/setter`, 在`src/core/observer/index.js`中;

```js
    /**
     * Define a reactive property on an Object. -> 给对象添加响应式的属性
     */
    export function defineReactive (
      obj: Object,
      key: string,
      val: any,
      customSetter?: ?Function,
      shallow?: boolean
    ) {
      const dep = new Dep() // 定义了一个Dep实例
      const property = Object.getOwnPropertyDescriptor(obj, key) // -> 返回<属性/参数>列表
      if (property && property.configurable === false) {
        // 如果不可配置, 直接返回
        return
      }
      // 此时已经拿到了Obj的属性描述;
      const getter = property && property.get
      const setter = property && property.set
      if ((!getter || setter) && arguments.length === 2) {
        val = obj[key]
      }
      let childOb = !shallow && observe(val)
      /**
       * 给他Obj添加get/set, 进行数据劫持
       * ! getters的逻辑就是 依赖收集
       * ! 1. new Dep() 创建dep实例
       * ! 2. dep.append() 依赖收集
       */
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
          const value = getter ? getter.call(obj) : val
          if (Dep.target) {
            /**
             * 第一次触发get时, 会走到这一步
             * Dep.target && dep.depend() === dep.addSub(Dep.target);
             * 需要通过一个自增的 depid 来判断一下 => 避免重复添加watcher
             */
            dep.depend()
            if (childOb) {
              childOb.dep.depend()
              if (Array.isArray(value)) {
                dependArray(value)
              }
            }
          }
          return value
        },
        set: function reactiveSetter (newVal) {
          /**
           * 在set的时候, 会触发 watcher.update(), 也会触发一次 get;
           * 这里可能会重复向 subs 队列中, 添加了 watcher; 需要通过一个自增的 depid 来判断一下
           */
          const value = getter ? getter.call(obj) : val
          if (newVal === value || (newVal !== newVal && value !== value)) {
            return
          }
          if (process.env.NODE_ENV !== 'production' && customSetter) {
            customSetter()
          }
          if (setter) {
            setter.call(obj, newVal)
          } else {
            val = newVal
          }
          childOb = !shallow && observe(newVal)
          dep.notify() // 这个被触发才是关键
        }
      })
    }
```
