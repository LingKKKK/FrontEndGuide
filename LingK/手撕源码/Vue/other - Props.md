# Props
`Props`是Vue核心组件之一,它是我们做组件开发接触最多的一个组件,经常适用于数据传递,它是父子组件通信的一个渠道.

## Props的写法
数组写法
```js
props: ['title', 'likes', 'isPublished', 'commentIds', 'author']
```
对象写法(推荐)
```js
props: {
  aaa: {
    type: Number,
    default: () => {
      return 100
    }
  },
  bbb: {
    type: String,
    default: 'hello'
  }
}
```
### Props的类型
String | Number | Boolean | Object | Array | Function | Promise

### 规范化
在`初始化Props`之前,会对`Props`进行`normalize`,它发生在`mergeOptions`阶段
```js
// src/core/util/options.js
export function mergeOptions (
  /**
   * @合并配置 处理我们定义的对象option,然后将它挂载到 this.$options 中.
   */
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  // ...
  normalizeProps(child, vm)
  // ...
}

function normalizeProps (options: Object, vm: ?Component) {
  /**
   * @规范化Props 将Props转成对象格式; 因为Props不止是一个对象它可能是数组也可能是对象.
   * @Props是数组时 每一个数组元素的props只能是String表示prop的key转成驼峰格式 props的类型为空.
   * @Props是对象时  对于props中每个prop的key转成驼峰格式.value如果不是一个对象就把他规范化为对象.
   * @Props非数组对象时 抛出警告.
   */
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```
举例:
```js
// 输入
export default {
  props: ['name', 'nick-name']
}
// normalize ...
options.props = {
  name: { type: null },
  nickName: { type: null }
}
export default {
  props: {
    name: String,
    nickName: {
      type: Boolean
    }
  }
}
// 输出
options.props = {
  name: { type: String },
  nickName: { type: Boolean }
}
```

### 初始化
`Props`的初始化,发生在`initState`阶段,和`watch`,`computed`一样.
`initProps`的功能有三个: 校验、响应、处理
```js
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // 如果props是数组的话,需要将props中的key缓存起来,以便后续使用; 在对象形式的props中不需要存储
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // 如果是root实例props,需要被转化; 其他情况不需要被转换
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    /**
     * @校验 通过`validateProp`方法,对props进行校验
     * @todo1  处理Boolean类型数据
     * @todo2  处理默认数据
     * @todo3  断言props属性
     * @返回值  props值
     */
    const value = validateProp(key, propsOptions, propsData, vm)


    /**
     * @响应 通过`defineReactive`方法,对props属性进行响应式处理
     */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
        // 先校验props-key是否为html/js中的保留属性, 如果是保留属性就报错
        warn(`"${hyphenatedKey}" : 不允许使用保留属性.`, vm)
      }
      defineReactive(props, key, value, () => {
        // 绑定的时候,添加自定义的setter,直接对props进行赋值的时候,会警告
        // 因为初始化的时候,会自动将props进行覆盖,所以对props设置值是没有任何意义的
        if (!isRoot && !isUpdatingChildComponent) {
          warn(`不允许直接修改props属性: "${key}"`, vm)
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // 在`Vue.extend()`过程中, 静态props已经被转化为响应式的props. 只需要将props代理到这里即可使用.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```
#### 校验
校验的逻辑比较简单,遍历`propsOptions`,执行`validateProp(key, propsOptions, propsData, vm)`方法.
propsOptions: 定义的`props`在规范化之后生成的`options.props`对象;
propsData: 从父组件中传入的`props`对象;
#### 响应
通过`defineReactive`方法, 对已经校验通过的`props`进行响应式的处理.
所以,我们在项目中,直接修改`props`属性,就会有警告,因为`porps`会被自动覆盖,所以对`props`设置值是没有任何意义的.
#### 代理
在执行完`Vue.extend()`, `props`属性已经被挂载到`vm._props`中, 例如: key为name的prop,他的值是`vm._props.name`. 但是我们是可以通过 `this.name`访问到prop的值, 这就是代理的意义,简化我们的调用.


## Props的更新
`props`数据的变化是发生在父组件中的,在父组件`render`的过程中会访问到`props`数据,所以:`props`数据变化一定是父组件中的数据发生了变化.
在父组件数据更新,一直到渲染完成.会执行`patch`的过程,进而执行`patchVnode`函数.
函数的调用顺序是: `patchVnode` -> `prepatch` -> `updateChildComponent`.

Props更新的大致流程:
1. 在`initProps`中,将props的key进行遍历缓存(propKeys)
2. 在调用到`updateChildComponent`的过程中,会对`props`(propKeys)进行遍历, 重新校验`props`的`key`和`value`
3. 校验完毕`props`,会更新`vm._props`,这就是子组件中的`props`属性.
