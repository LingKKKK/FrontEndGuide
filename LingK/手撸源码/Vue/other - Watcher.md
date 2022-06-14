# Watcher


Vue中watcher主要分为三类：
https://zhuanlan.zhihu.com/p/393555067

https://juejin.cn/post/6844904128435453966
  https://ustbhuangyi.github.io/vue-analysis/v2/reactive/computed-watcher.html#watch

# 初始化watcher的地方

https://www.jianshu.com/p/a7849885c6ee/



# 类型
Watcher对option做了如下处理:
```js
  if (options) {
    this.deep = !!options.deep
    this.user = !!options.user
    this.computed = !!options.computed
    this.sync = !!options.sync
    // ...
  } else {
    this.deep = this.user = this.computed = this.sync = false
  }
```
Watcher分为四类: deep watcher、user watcher、computed watcher、sync watcher

## deep watcher
通常我们要对一个对象进行深度观测的时候,需要让这个属性为true
考虑到这样的情况:
```js
  var vm = new Vue({
    data() {
      a: {
        b: 1
      }
    },
    watch: {
      a: {
        handler(newVal) {
          console.log(newVal)
        },
        // deep: true
      }
    }
  })
  vm.a.b = 2 // 我们不会检测到a的变化;
```
我们只触发了`a.getter`, 并没有触发`a.b.getter`; 所以在`vm.a.b = 2`时触发了`a.b.setter`但是没有通知对象

当`deep=true`时, Watcher执行get的逻辑如下:
```js
  get() {
    let value = this.getter.call(vm, vm)
    // ...
    if (this.deep) {
      traverse(value)
    }
  }
```

```js
  // traverse
  // ...
  const seenObjects = new Set()
  /**
   * 递归遍历对象, 以便于调用所有的getter, 对子对象的依赖做"深度"依赖收集
   */
  export function traverse (val: any) {
    _traverse(val, seenObjects)
    seenObjects.clear()
  }

  function _traverse (val: any, seen: SimpleSet) {
    let i, keys
    const isA = Array.isArray(val)
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      const depId = val.__ob__.dep.id
      if (seen.has(depId)) {
        return
      }
      seen.add(depId)
      // 将depId存入seenObjects, 保证不会重复执行, 保证不会有任何遗漏
    }
    if (isA) {
      i = val.length
      while (i--) _traverse(val[i], seen)
    } else {
      keys = Object.keys(val)
      i = keys.length
      while (i--) _traverse(val[keys[i]], seen)
    }
  }
```
`traverse`方法的逻辑是对对象做`深层的递归遍历`,因为遍历过程就是对`子对象`的访问,会触发`子对象的getter`;这样会收集到依赖,也就是订阅他们变化的watcher; 这会造成一部分的性能开销, 需要权衡利弊. 越复杂的对象开销越大

## user watcher
我们通过`vm.$watch`方法创建的watcher, 它是一个user watcher; 其功能比较简单, 在对watcher求值,以及执行回调函数的时候,做一下错误处理
```js
  get() {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  },
  getAndInvoke() {
    // ...
    if (this.user) {
      try {
        this.cb.call(this.vm, value, oldValue)
      } catch (e) {
        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
      }
    } else {
      this.cb.call(this.vm, value, oldValue)
    }
  }
```
`handleError`是由Vue暴露给用户的错误捕获方法

## computed watcher
为计算属性创建watcher, 其功能比较复杂

## sync watcher
在我们之前对`setter`的分析过程知道，当响应式数据发送变化后，触发了`watcher.update()`，只是把这个`watcher`推送到一个队列中，在`nextTick`后才会真正执行`watcher`的回调函数。而一旦我们设置了`sync`，就可以在当前`Tick`中同步执行`watcher`的回调函数。
```js
  update () {
    if (this.computed) {
      // ...
    } else if (this.sync) {
      // 在这里定义了同异步
      this.run() // 如果是sync watcher, 就直接执行
    } else {
      queueWatcher(this)
    }
  }
```
