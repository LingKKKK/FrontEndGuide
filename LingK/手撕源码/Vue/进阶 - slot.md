

# slot
slot插槽, 是Vue提供的十分有用的特性.
我们日常开发组件的时候,为了让组件更加灵活可用,经常使用插槽,让用户可以自定义内容.

插槽分为: 普通插槽和作用域插槽;

插槽的目的都是生成一个占位符, 占位符的内容由父元素来决定. 但是作用域会因为他们的vNode渲染时机的不同而不同.


## 普通插槽

☆☆☆
父组件应用到子组件插槽中的数据, 都是绑定在父组件的作用域中.
因为它渲染成vNode的时机的上下文是父组件实例.

在调用`vm.$mount`的时候, 先编译父组件再编译子组件;

1. 首先编译父组件, 在 parse 阶段, 会执行 processSlot 来处理 slot. 解析到slot标签,会给标签上添加 slotTarget 属性
2. 在 codegen阶段, 对 slotTarget 属性进行处理.
3. 调用 resolveSlots 方法, 解析到 slot 对象.
4. 将 slot 对象, 渲染成vNode, 作为当前组件的children.

```js 普通插槽
  let AppLayout = {
    template: '<div class="container">' +
    '<header><slot name="header"></slot></header>' +
    '<main><slot>默认内容</slot></main>' +
    '<footer><slot name="footer"></slot></footer>' +
    '</div>'
  }

  let vm = new Vue({
    el: '#app',
    template: '<div>' +
    '<app-layout>' +
    '<h1 slot="header">{{title}}</h1>' +
    '<p>{{msg}}</p>' +
    '<p slot="footer">{{desc}}</p>' +
    '</app-layout>' +
    '</div>',
    data() {
      return {
        title: '我是标题',
        msg: '我是内容',
        desc: '其它信息'
      }
    },
    components: {
      AppLayout
    }
  })
```
```js 最终输出结果
  <div>
    <div class="container">
      <header><h1>我是标题</h1></header>
      <main><p>我是内容</p></main>
      <footer><p>其它信息</p></footer>
    </div>
  </div>
```
具名查抄会找到对应的位置替换;
默认的内容会找到slot直接替换掉;

## 作用域插槽

☆☆☆
通过子组件的一些数据来决定父组件的数据或者视图结构. 需要借助`作用域插槽`来实现

```js 作用域插槽
  let Child = {
    template: '<div class="child">' +
    '<slot text="Hello " :msg="msg"></slot>' +
    '</div>',
    data() {
      return {
        msg: 'Vue'
      }
    }
  }

  let vm = new Vue({
    el: '#app',
    template: '<div>' +
    '<child>' +
    '<template slot-scope="props">' +
    '<p>Hello from parent</p>' +
    '<p>{{ props.text + props.msg}}</p>' +
    '</template>' +
    '</child>' +
    '</div>',
    components: {
      Child
    }
  })
```
```js 最终输出结果
  <div>
    <div class="child">
      <p>Hello from parent</p>
      <p>Hello Vue</p>
    </div>
  </div>
```


[举例](https://juejin.cn/post/6844903555837493256#heading-1)

单个插槽|默认插槽|匿名插槽
可以放在组件的任意一个位置,一个组件中只能有一个此类型的插槽.
```js 父组件
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <child>
        <div class="tmpl">
          <span>父元素设定的占位符</span>
        </div>
      </child>
    </div>
  </template>
```
```js 子组件
  <template>
    <div class="child">
      <h3>这里是子组件</h3>
      <slot></slot>
    </div>
  </template>
```
父组件引用child中,html模板, 会匹配到子组件的插槽中.
```js 输入结果
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <div class="child">
        <h3>这里是子组件</h3>
        // 替换slot
        <div class="tmpl">
          <span>父元素设定的占位符</span>
        </div>
        // 替换slot
      </div>
    </div>
  </template>
```

具名插槽
匿名插槽因为没有name属性,所以称之为匿名. 插槽添加了name属性就变成了具名插槽.
具名插槽可以在一个组件中出现N次,出现在不同的位置.
```js 父组件
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <child>
        <div class="tmpl" slot="up">
          <span>具名占位1</span>
        </div>
        <div class="tmpl" slot="down">
          <span>具名占位2</span>
        </div>
        <div class="tmpl">
          <span>匿名占位2</span>
        </div>
      </child>
    </div>
  </template>
```
```js 子组件
  <template>
    <div class="child">
      // 具名插槽
      <slot name="up"></slot>
      <h3>这里是子组件</h3>
      // 具名插槽
      <slot name="down"></slot>
      // 匿名插槽
      <slot></slot>
    </div>
  </template>
```
1. 父组件通过html模板上的slot属性关联具名插槽。
2. 没有slot属性的html模板默认关联匿名插槽。
```js 输出结果
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <div class="child">
        <div class="tmpl" slot="up">
          <span>具名占位1</span>
        </div>
        <h3>这里是子组件</h3>
        <div class="tmpl" slot="down">
          <span>具名占位2</span>
        </div>
        <div class="tmpl">
          <span>匿名占位2</span>
        </div>
      </div>
    </div>
  </template>
```

作用域插槽|带数据的插槽
作用域插槽上的数据是在slot上绑定的,而不是在组件上绑定的.
普通插槽data都在父组件上绑定, 作用域插槽data在子元素上绑定.
```js 作用域插槽 父组件
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <child>
        <template slot-scope="user">
          {{user.data}}
        </template>
      </child>
      <child>
        我就是模板
      </child>
    </div>
  </template>
```
```html 作用域插槽 子组件
  <template>
    <div class="child">
      <h3>这里是子组件</h3>
      // 作用域插槽
      <slot :data="data"></slot>
    </div>
  </template>
  export default {
      data: function(){
        return {
          data: ['zhangsan','lisi','wanwu','zhaoliu','tianqi','xiaoba']
        }
      }
  }
```
父组件中数据的展示可以判断一下,是否依赖子组件提供的数据.
```js 输出结果
  <template>
    <div class="father">
      <h3>这里是父组件</h3>
      <div class="child">
        <h3>这里是子组件</h3>
        `['zhangsan','lisi','wanwu','zhaoliu','tianqi','xiaoba']`
      </div>
      <div class="child">
        <h3>这里是子组件</h3>
        我就是模板
      </div>
    </div>
  </template>
```
