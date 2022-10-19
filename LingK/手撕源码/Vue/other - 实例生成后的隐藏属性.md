# 一个实例的生成后的一些隐藏所有属性

```js
  vm = {
    _renderProxy: vm,
    _self: vm,
    $options: {
        _parentListeners: {}, // 所有父组件作用于该组件的监听函数集合
    }, // 用户可配置的属性和一些不可配置的属性
    $parent, // 实例的父组件
    $children: [], // 子组件集合
    $root, // 根组件一般为App
    $refs:{}, // 存放该组件中所有存在`ref`属性的节点
    _watcher, // 该实例渲染函数的数据的订阅者
    _inactive, // 表示该组件是否激活, `false`代表激活  `true`或`null`代表未激活
    _directInactive, // 表示`keep-alive`中组件状态的属性,表示是否要激活 比如父组件未激活 那么其也不会激活
    _isMounted, // 用于表示该组件是否已挂载
    _isDestroyed, // 表示该组件是否已销毁
    _isBeingDestroyed, // 表示该组件是否正在销毁中
    _events, // 组件的所有监听函数集合
    _hasHookEvent, // 父组件是否有监听子组件的生命周期钩子
  }
```

[参考(https://www.cnblogs.com/maomao93/p/14166613.html)
