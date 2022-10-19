
# Componet,pureComponent,statelessComponent

`import {Component, PureComponent} from './ReactBaseClasses'`

之前用过 Component 和 PureComponent, 差别就是对一些props的处理;;;
通过props和state的浅对比来实现shouldComponentUpdate, 如果返回false, 就不会调用render方法了;
Component没有实现浅对比,需要手动设置过滤条件

如果定义了 shouldComponentUpdate 方法,不论Component或者PureComponent,都会调用这个方法并执行.

在`package/ReactBaseClasses`中,`component`和`pureComponent`仅仅做了承载的作用,承载函数体.
具体的更新和渲染,需要结合react整体的流程; 这两个常用的函数, 并没有想象中的复杂

## Component
```JSX
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject; // 节点实例的挂载
    // We initialize the default updater but the real one gets injected by the
    // renderer.
    this.updater = updater || ReactNoopUpdateQueue;
  }
```

## PureComponent
```JSX
  const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
  pureComponentPrototype.constructor = PureComponent;
  // Avoid an extra prototype jump for these methods.
  Object.assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;

  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    // If a component has string refs, we will assign a different object later.
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
```

## setState
```jsx
  Component.prototype.setState = function(partialState, callback) {
    invariant(
      typeof partialState === 'object' || typeof partialState === 'function' || partialState == null,
      'setState(...): takes an object of state variables to update or a ' +
        'function which returns an object of state variables.',
      // 这里提示setState需要给属性或者函数赋值,应该是其他的类型都不会加以判断
    );

    /**
     * 上描述做了一个对比, 这里才是更新的核心内容
     * @todo 调用了 updater中的enqueueSetState方法, 从命名上来看,应该是队列的更新state方法; 这里可能是需要区分原生合成事件
     * @enqueueSetState 这个方法在 react-dom 中使用.
     * * 在react中,调用一些api的内容是根据平台有关系的,并非所有的方法都封装在react中
     */
    this.updater.enqueueSetState(this, partialState, callback, 'setState');
  };
```

# forceUpdate 强制更新State
这里就不校验state是否更新了, setState是校验state,如果有更新就执行render方法,如果没更新就不执行
forceUpdate是强制更新
```jsx
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
  };
```
