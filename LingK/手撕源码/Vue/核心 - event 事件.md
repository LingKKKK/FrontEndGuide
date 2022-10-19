# 事件
在开发过程中,处理组件之间的通信,原生的交互,以及自定义操作都离不开事件.
对于一个组件元素,不仅可以绑定原生的event事件,也可以绑定自定义事件,比较灵活方便.
∴ 事件只分两种: 原生DOM事件 + 用户自定义事件

## 编译
编译时, 在`parse`阶段,会先执行`processAttrs`方法;;;
parse => 分析,语法分析,解析
```js
    // 以这个父子组件为例, 对其进行编译
    let Child = {
      template: '<button @click="clickHandler($event)">' +
      'click me' +
      '</button>',
      methods: {
        clickHandler(e) {
          console.log('Button clicked!', e)
          this.$emit('select')
        }
      }
    }

    let vm = new Vue({
      el: '#app',
      template: '<div>' +
      '<child @select="selectHandler" @click.native.prevent="clickHandler"></child>' +
      '</div>',
      methods: {
        clickHandler() {
          console.log('Child clicked!')
        },
        selectHandler() {
          console.log('Child select!')
        }
      },
      components: {
        Child
      }
    })
```


### 解析事件属性
```js
  // src/compiler/parser/index.js

  export const onRE = /^@|^v-on:/
  export const dirRE = /^v-|^@|^:/
  export const bindRE = /^:|^v-bind:/
  export const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g; // 匹配.后面的字符串

  /**
   * @processAttrs 解析事件属性
   * @todo1 首先调用`parseModifiers`方法解析出修饰符
   * @todo2 如果是修饰符, 执行`addHandler`方法
   * 以 @click='todo' 为例
   */
  function processAttrs (el) {
    const list = el.attrsList // 获取所有的属性列表
    let i, l, name, rawName, value, modifiers, isProp
    for (i = 0, l = list.length; i < l; i++) {
      name = rawName = list[i].name // 这里获取到的属性名为: click
      value = list[i].value // 这里是属性对应的值: todo
      if (dirRE.test(name)) { // 匹配 `v-` 或 `@` 或 `:`
        el.hasBindings = true // 将元素标记为动态元素
        modifiers = parseModifiers(name) // 解析修饰符; 例如: xxx.lazy xxx.once 等
        if (modifiers) {
          name = name.replace(modifierRE, '')
          // 去除修饰符 => 暂时去除, 后面再处理 => 得到一个干净的属性名
        }
        if (bindRE.test(name)) { // 匹配 `:` 或 `v-bind:`
          // ..
        } else if (onRE.test(name)) { // 匹配 `@` 或 `v-on:`
          name = name.replace(onRE, '')
          addHandler(el, name, value, modifiers, false, warn)
        } else {
          // ...
        }
      } else {
        // ...
      }
    }
  }

  function parseModifiers (name: string): Object | void {
    const match = name.match(modifierRE)
    if (match) {
      const ret = {}
      match.forEach(m => { ret[m.slice(1)] = true })
      return ret
    }
  }
```

### 处理事件属性
```js
/**
   * @addHandler 处理事件属性
   * @todo1 根据 modifier 修饰符, 对属性名 name 做处理
   * @todo2 根据 .native 判断是否是原生事件 => 分别对应 e.events 和 e.nativeEvents
   * @todo3 按照 name 对事件进行归类, 把回调函数对应的字符串保留到对应的事件中
   */
  export function addHandler (
    el: ASTElement, // AST对象
    name: string, // 属性名,事件名
    value: string, // 属性值,事件函数
    modifiers: ?ASTModifiers, // 修饰符
    important?: boolean, // 优先 | 重要
    warn?: Function
  ) {
    modifiers = modifiers || emptyObject
    // modifiers 修复符是一个对象
    // 如果没有传入值, 会赋予一个被冻结的空对象

    if (
      process.env.NODE_ENV !== 'production' && warn &&
      modifiers.prevent && modifiers.passive
    ) warn('prevent和passive不能同时使用')

    if (modifiers.capture) {
      delete modifiers.capture
      name = '!' + name // 将!添加到事件名前面 => 即: !click => 代表capture修饰符
    }
    if (modifiers.once) {
      delete modifiers.once
      name = '~' + name // 将~添加到事件名前面 => 即: ~click => 代表once修饰符
    }
    if (modifiers.passive) {
      delete modifiers.passive
      name = '&' + name // 将&添加到事件名前面 => 即: &click => 代表passive修饰符
    }

    if (name === 'click') {
      if (modifiers.right) { // 鼠标右键
        name = 'contextmenu'
        delete modifiers.right
      } else if (modifiers.middle) { // 鼠标中键 | 鼠标滚轮
        name = 'mouseup'
      }
    }

    let events // 用来记录绑定的事件

    if (modifiers.native) {
      delete modifiers.native
      // native修饰符 => 监听组件根元素的原生事件 => 将事件存放到 el.nativeEvents 对象上
      events = el.nativeEvents || (el.nativeEvents = {})
    } else {
      events = el.events || (el.events = {})
    }

    const newHandler: any = {
      value: value.trim()
    }
    if (modifiers !== emptyObject) {
      // 存在修饰符 => 将修饰符写入到 newHandler 对象上
      newHandler.modifiers = modifiers
      // { value, dynamic, start, end, modifiers }
    }

    const handlers = events[name]
    // 绑定的事件可能不存在 || 也可能存在多个 ==> 按照顺序进行处理
    if (Array.isArray(handlers)) {
      important ? handlers.unshift(newHandler) : handlers.push(newHandler)
    } else if (handlers) {
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
    } else {
      events[name] = newHandler
    }

    el.plain = false
  }

  // 原生事件和合成事件分别对应下面的两个对象
  el.events = {
    select: {
      value: 'selectHandler'
    }
  }
  el.nativeEvents = {
    click: {
      value: 'clickHandler',
      modifiers: {
        prevent: true
      }
    }
  }
```

### 生成代码
```js
  /**
   * @genData 根据AST对象上的events和nativeEvents属性生成data数据
   * @todo 调用genHandlers方法解析返回data数据
   */
  export function genData (el: ASTElement, state: CodegenState): string {
    let data = '{'
    // ... 拼接evnets和nativeEvents内容
    if (el.events) {
      data += `${genHandlers(el.events, false, state.warn)},`
    }
    if (el.nativeEvents) {
      data += `${genHandlers(el.nativeEvents, true, state.warn)},`
    }
    // ... 拼接完毕
    return data
  }

  /**
   * @genHandlers 遍历事件对象的event,对同一个事件名称调用 @genHandler 方法
   * @todo1 判断: 如果handler是数组 => 递归调用getHandler方法
   * @todo2 判断: handler.value 是一个函数调用路径还是函数表达式
   * @todo3 判断: 判断modifiers(修饰对象集合)
   *             如果不存在,根据handler.value判断,直接返回|返回表达式
   *             如果存在,针对不同的modifier做不同的处理,分别拼接响应的代码串
   */
  export function genHandlers (
    events: ASTElementHandlers,
    isNative: boolean,
    warn: Function
  ): string {
    let res = isNative ? 'nativeOn:{' : 'on:{'
    for (const name in events) {
      res += `"${name}":${genHandler(name, events[name])},`
    }
    return res.slice(0, -1) + '}'
  }

  const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/ // 匹配函数 => 或者 函数表达式
  const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/

  function genHandler (
    name: string,
    handler: ASTElementHandler | Array<ASTElementHandler>
  ): string {
    if (!handler) {
      return 'function(){}'
    }

    if (Array.isArray(handler)) {
      return `[${handler.map(handler => genHandler(name, handler)).join(',')}]`
    }

    const isMethodPath = simplePathRE.test(handler.value) // 解析 => 如果是路径
    const isFunctionExpression = fnExpRE.test(handler.value) // 解析 => 如果是函数表达式
    // 这里应该还有一个 Invocation => 函数调用

    if (!handler.modifiers) {
      if (isMethodPath || isFunctionExpression) {
        return handler.value
      }
      /* istanbul ignore if */
      if (__WEEX__ && handler.params) {
        return genWeexHandler(handler.params, handler.value)
      }
      return `function($event){${handler.value}}` // inline statement
    } else {
      let code = ''
      let genModifierCode = ''
      const keys = []
      for (const key in handler.modifiers) {
        if (modifierCode[key]) {
          genModifierCode += modifierCode[key]
          // left/right
          if (keyCodes[key]) {
            keys.push(key)
          }
        } else if (key === 'exact') {
          const modifiers: ASTModifiers = (handler.modifiers: any)
          genModifierCode += genGuard(
            ['ctrl', 'shift', 'alt', 'meta']
              .filter(keyModifier => !modifiers[keyModifier])
              .map(keyModifier => `$event.${keyModifier}Key`)
              .join('||')
          )
        } else {
          keys.push(key)
        }
      }
      if (keys.length) {
        code += genKeyFilter(keys)
      }
      // Make sure modifiers like prevent and stop get executed after key filtering
      if (genModifierCode) {
        code += genModifierCode
      }
      const handlerCode = isMethodPath
        ? `return ${handler.value}($event)`
        : isFunctionExpression
          ? `return (${handler.value})($event)`
          : handler.value
      /* istanbul ignore if */
      if (__WEEX__ && handler.params) {
        return genWeexHandler(handler.params, code + handlerCode)
      }
      return `function($event){${code}${handlerCode}}`
    }
  }
```
### 输出结果
```js
    // 那么对于我们的例子而言，父组件生成的 data 串为 =>
    {
      on: {"select": selectHandler},
      nativeOn: {"click": function($event) {
          $event.preventDefault();
          return clickHandler($event)
        }
      }
    }
    // 子组件生成的 data 串为 =>
    {
      on: {"click": function($event) {
          clickHandler($event)
        }
      }
    }
```

## DOM事件
在`patch`的过程中,会执行各种`module`钩子;
DOM的属性样式和事件都是通过这些`module`钩子来实现的.

所有和web相关的`module`钩子都在`src/platforms/web/runtime/modules`目录下.
DOM事件相关的是: events.js

### 流程
一.在patch的过程中,DOM的创建和更新阶段都会调用`updateDOMListeners`方法
  理解: 每次调用dom更新,一定会触发事件的更新,因为事件都是挂载在dom节点上的.
```js
    /**
     * @触发时机 因为创建和更新的过程都会触发 @patch 方法,进而执行 @updateDOMListeners 方法
     */
    let target: any // 占位
    function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
      // oldVnode.data.on -> 生成的事件对象
      /**
       * @生成的事件对象 oldVnode.data.on == 点击事件 -> getHandlers方法中的首参(AST)
       */
      if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
        // 如果search不到event, 就不向下执行; 如果存在event一定会挂载到vnode.data.on上
        return
      }
      const on = vnode.data.on || {}
      const oldOn = oldVnode.data.on || {}
      target = vnode.elm
      // 赋值: on/oldOn指向event && target指向DOM节点

      normalizeEvents(on) // 格式化事件对象 -> 对v-model进行处理(处理on change/input 等回调)
      updateListeners(on, oldOn, add, remove, vnode.context) // 处理事件对象 -> 对on添加监听 & 对oldOn移除监听

      /**
       * @normalizeEvents 对后缀标识进行处理, 和上面的normalizeEvents方法不是同一个函数
       * @updateListeners 遍历on添加监听事件;遍历oldOn移除监听事件; 对 @原生 和 @自定义 的事件进行添加和删除
       */
      target = undefined
    }
```
二.添加和移除 "监听事件/回调函数"
  add和remove方法都是通过`addEventListener`和`removeEventListener`来实现的.
  根据参数信息传递一些配置.
```js
    function add (
      event: string,
      handler: Function,
      once: boolean,
      capture: boolean,
      passive: boolean
    ) {
      handler = withMacroTask(handler)
      /**
       * @handler 使用宏任务队列来处理事件回调
       * @todo 强制在DOM时间的回调执行期间,如果修改了数据,那么将这些数据更改推入的队列被当做 macroTask 在 nextTick 后执行
       */
      if (once) handler = createOnceHandler(handler, event, capture)
      target.addEventListener(
        event,
        handler,
        supportsPassive
          ? { capture, passive }
          : capture
      )
    }
    function remove (
      event: string,
      handler: Function,
      capture: boolean,
      _target?: HTMLElement
    ) {
      (_target || target).removeEventListener(
        event,
        handler._withTask || handler,
        capture
      )
    }
```

## 自定义事件
自定义事件只能作用在组件上,如果在组件上使用原生事件,需要添加`.native`修饰符.
在普通元素上,使用`.native`无效.

### 实现流程
1. 在`render`阶段,如果是一个组件节点,会调用`createComponent`方法创建一个组件`vNode`
```js
    export function createComponent (
      Ctor: Class<Component> | Function | Object | void,
      data: ?VNodeData,
      context: Component,
      children: ?Array<VNode>,
      tag?: string
    ): VNode | Array<VNode> | void {
      // ...

      /**
       * @自定义事件 @合成事件 存储到 listeners 中
       * @原生事件 存储到 data.on 中
       */
      const listeners = data.on // 首先将 绑定的事件 存储到 listeners 中
      data.on = data.nativeOn // 将 绑定的原生事件 存储到 data.on 中

      // ...
      const name = Ctor.options.name || tag
      const vnode = new VNode(
        `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
        data, undefined, undefined, undefined, context,
        { Ctor, propsData, listeners, tag, children },
        asyncFactory
      )

      // 创建组件时,将 listeners 作为 vnode 的 componentOptions 传入,它是在子组件初始化阶段中处理的，所以它的处理环境是子组件

      return vnode
    }
```
2.组件初始化时, 会初始化事件
   `initEvents` `updateComponentListeners` ... 等方法都是对事件进行处理

### ☆ Vue的事件中心
```js
    /**
     * @eventsMixin 十分经典的数据中心, 等同于之前写的事件派发中心
     * @todo1 当执行 vm.$on(event, fn) 时, 就会把事件存储到 vm._events 中 => vm._events[event].push(fn)
     *        把所有的事件用 vm._events 存储起来
     * @todo2 当执行 vm.$emit(event, ...args) 时, 根据事件名 event 找到所有的回调函数
     *        let cbs = vm._events[event]
     *        然后遍历执行所有的回调函数
     * @todo3 当执行 vm.$off(event, fn) 时, 会移除指定事件名 event 或者 指定的 function
     * @todo4 当执行 vm.$once(event, fn) 时, 内部的顺序是: 执行 vm.$on --> vm.$off; 确保仅执行一次
     * @场景 用户常用的就是这几个API, $emit $on $off $once
     */
    export function eventsMixin (Vue: Class<Component>) {
      const hookRE = /^hook:/
      Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
        const vm: Component = this
        if (Array.isArray(event)) {
          for (let i = 0, l = event.length; i < l; i++) {
            this.$on(event[i], fn)
          }
        } else {
          (vm._events[event] || (vm._events[event] = [])).push(fn)
          // optimize hook:event cost by using a boolean flag marked at registration
          // instead of a hash lookup
          if (hookRE.test(event)) {
            vm._hasHookEvent = true
          }
        }
        return vm
      }

      Vue.prototype.$once = function (event: string, fn: Function): Component {
        const vm: Component = this
        function on () {
          vm.$off(event, on)
          fn.apply(vm, arguments)
        }
        on.fn = fn
        vm.$on(event, on)
        return vm
      }

      Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
        const vm: Component = this
        // all
        if (!arguments.length) {
          vm._events = Object.create(null)
          return vm
        }
        // array of events
        if (Array.isArray(event)) {
          for (let i = 0, l = event.length; i < l; i++) {
            this.$off(event[i], fn)
          }
          return vm
        }
        // specific event
        const cbs = vm._events[event]
        if (!cbs) {
          return vm
        }
        if (!fn) {
          vm._events[event] = null
          return vm
        }
        if (fn) {
          // specific handler
          let cb
          let i = cbs.length
          while (i--) {
            cb = cbs[i]
            if (cb === fn || cb.fn === fn) {
              cbs.splice(i, 1)
              break
            }
          }
        }
        return vm
      }

      Vue.prototype.$emit = function (event: string): Component {
        const vm: Component = this
        if (process.env.NODE_ENV !== 'production') {
          const lowerCaseEvent = event.toLowerCase()
          if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
            tip(
              `Event "${lowerCaseEvent}" is emitted in component ` +
              `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
              `Note that HTML attributes are case-insensitive and you cannot use ` +
              `v-on to listen to camelCase events when using in-DOM templates. ` +
              `You should probably use "${hyphenate(event)}" instead of "${event}".`
            )
          }
        }
        let cbs = vm._events[event]
        if (cbs) {
          cbs = cbs.length > 1 ? toArray(cbs) : cbs
          const args = toArray(arguments, 1)
          for (let i = 0, l = cbs.length; i < l; i++) {
            try {
              cbs[i].apply(vm, args)
            } catch (e) {
              handleError(e, vm, `event handler for "${event}"`)
            }
          }
        }
        return vm
      }
    }
```

## 事件的绑定有几种
  1.原生事件的DOM绑定,是通过`addEventListener`实现的
  2.组件的事件绑定,是通过`$on`实现的
```js
  let compiler = require('vue-template-compiler'); // vue loader中的包
  let r1 = compiler.compile('<div @click="fn()"></div>'); // 给普通标签绑定click事件
  // 给组件绑定一个事件，有两种绑定方法
  // 一种@click.native，这个绑定的就是原生事件
  // 另一种@click，这个绑定的就是组件自定义事件
  let r2 = compiler.compile('<my-component @click.native="fn" @click="fn1"></mycomponent>');
  console.log(r1.render); // {on:{click}}
  console.log(r2.render); // {nativeOn:{click},on:{click}}
  // 为什么组件要加native？因为组件最终会把nativeOn属性放到on的属性中去，这个on会单独处理
  // 组件中的nativeOn 等价于 普通元素on，组件on会单独处理
```

一.在Vue中,事件绑定有两种,一种是原生事件,一种是组件事件.
  1.原生事件通过@click绑定在普通元素上;
  2.组件事件通过@click.native绑定在组件上;
  3.在原生事件中,最终被解析成 { on:{click} } 挂载到普通元素上. 普通元素的on最终通过`addEventListener`进行事件监听触发回调.
  4.在组件中,原生事件会被解析成 { nativeOn:{click}, on:{click} }挂载到组件上, 组件中的nativeOn, 等同于普通事件的on. 组件on会单独处理.

二.原生事件的绑定原理
  runtime中,通过patch方法调用event.js对事件进行: 解析/处理/生成代码/输出结果.
  解析完绑定的事件之后,通过`invokeCreateHooks`方法,触发`updateDOMListeners`方法给元素添加事件监听器.
  通过`updateListeners`方法,调用`addEventListener`和`removeEventListener`对元素进行添加和移除监听

  patch -> createPatchFunction -> event.js -> updateDOMListeners -> updateDOMListeners -> add/remove

三.组件事件的绑定原理
  1. 在组件初始化的过程中, 会调用 initMixin 方法中的 Vue.prototype._init方法, 在这个方法中,会初始化组件信息.
  2. 调用initEvent方法初始化组件事件, 将`自定义事件`存放到 _events 属性中.
  3. 获取父组件给子组件绑定的`自定义方法`, 将这类事件放到 _parentListeners 属性中. -> vm.$options._parentListeners == 自定义事件
  4. 对自定义的事件调用 updateComponentListeners 方法进行`事件绑定`
  5. 调用 updateListeners 方法, 传入add方法($on)对事件进行回调执行

[流程图](./事件绑定差异.png)

[参考](https://blog.csdn.net/qq_42072086/article/details/108063281)


# .sync 修饰符
