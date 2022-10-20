

# React.createElement API

在jsx转js的时候,我们调用api`React.createElement`来创建节点,这个api的作用是: 转为一个DOM节点,并且返回这个节点.

在`react/packages/react/`目录下就是React所有可以使用的API,分析组件的时候,要从这个目录下的 `index.js` 进行分析. 进而追踪到到 `react.js`.

在`/react/packages/react/src/React.js`这个文件中,定义了一个React对象,在这个对象上,暴露出来的所有方法都是我们要使用的API.



# 备注

```JSX createElement
  export function createElement(type, config, children) {
    let propName;

    // Reserved names are extracted
    const props = {};

    let key = null;
    let ref = null;
    let self = null;
    let source = null;

    if (config != null) {
      if (hasValidRef(config)) { // 有没有合理的Ref, 单独存放变量
        ref = config.ref;
      }
      if (hasValidKey(config)) { // 有没有合理的Key, 单独存放变量
        key = '' + config.key;
      }

      self = config.__self === undefined ? null : config.__self;
      source = config.__source === undefined ? null : config.__source;

      // 对Props对象做处理
      for (propName in config) {
        if (
          hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)
          // 判断是否为内嵌的props: ref key _selft _source 如果是, 则不做处理
          // 我们处理props不会包含这些内置的内容, 这些内容也不会被添加到props中
        ) {
          props[propName] = config[propName]; // 将props中提取出来,放到一个新的对象上
        }
      }
    }

    // children是可传入多个的,需要遍历处理并存放到一个数组
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      const childArray = Array(childrenLength);
      for (let i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      if (__DEV__) {
        if (Object.freeze) {
          Object.freeze(childArray);
        }
      }
      props.children = childArray; // 最后将children数组放在props中
    }

    // Resolve default props
    if (type && type.defaultProps) {
      const defaultProps = type.defaultProps;
      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }
    if (__DEV__) {
      if (key || ref) {
        const displayName =
          typeof type === 'function'
            ? type.displayName || type.name || 'Unknown'
            : type;
        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
    return ReactElement(// 将这个方法抛出
      type,
      key,
      ref,
      self,
      source,
      ReactCurrentOwner.current,
      props,
    );
  }
```


```JSX ReactElement 最后api的抛出的对象
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 因为在react中,所有的dom都是通过reacapi来创建的,所以类型是恒定的
    // 这个恒定的值和创建的方法有关系, 就比如 createElement 和 portal 的返回类型就不同
    $$typeof: REACT_ELEMENT_TYPE,

    // 下面这几个是附加在dom上的基本属性
    type: type, // 用来记录节点的类型
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  if (__DEV__) {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};
```
