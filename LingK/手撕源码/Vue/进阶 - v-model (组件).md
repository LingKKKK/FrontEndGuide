# 官方网站对于v-model组件使用的定义

```js v-demol组件的例子
  let Child = {
    template: '<div>'
    + '<input :value="value" @input="updateValue" placeholder="edit me">' +
    '</div>',
    props: ['value'],
    methods: {
      updateValue(e) {
        this.$emit('input', e.target.value)
      }
    }
  }

  let vm = new Vue({
    el: '#app',
    template: '<div>' +
    '<child v-model="message"></child>' +
    '<p>Message is: {{ message }}</p>' +
    '</div>',
    data() {
      return { message: '' }
    },
    components: { Child }
  })
```
从案例中可以看到,父组件引用子组件的地方,使用v-model关联了数据message; 子组件定义了一个value的props;并且在input事件中,使用`this.$emit('input', e.target.value)`派发了一个事件,从而让v-model生效. 实际上就是实现v-model的语法糖衣.

## 执行过程
对于父组件,在编译阶段会解析 v-model, 和表单一样的解析一样,执行 genData -> genDirectives 解析指令,得到指令json.

```js 父组件的render结果
  with(this){
    return _c('div',[_c('child',{
      model:{
        value:(message),
        callback:function ($$v) {
          message=$$v
        },
        expression:"message"
      }
    }),
    _c('p',[_v("Message is: "+_s(message))])],1)
  }
```
在创建子组件的 vNode 阶段,会执行 createComponent 函数.
```js createComponent
export function createComponent (
 Ctor: Class<Component> | Function | Object | void,
 data: ?VNodeData,
 context: Component,
 children: ?Array<VNode>,
 tag?: string
): VNode | Array<VNode> | void {
 // 添加props和绑定event到组件上
 if (isDef(data.model)) {
   transformModel(Ctor.options, data)
   /**
    * 相当于给子组件安装扩展
    * 给data.prop添加data.model.value
    * 给data.on添加data.model.callback
    */
 }

 // extract props
 const propsData = extractPropsFromVNodeData(data, Ctor, tag)
 // ...
 // extract listeners, since these needs to be treated as
 // child component listeners instead of DOM listeners
 const listeners = data.on
 // ...
 const vnode = new VNode(
   `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
   data, undefined, undefined, undefined, context,
   { Ctor, propsData, listeners, tag, children },
   asyncFactory
 )

 return vnode
}
```

```js transformModel => 给子组件安装扩展
  data.props = {
    value: (message),
  }
  data.on = {
    input: function ($$v) {
      message=$$v
    }
  }
```

子组件传递的value绑定到当前父组件的message, 同时监听input事件.
当子组件派发input的时候, 父组件会在事件回调函数中修改 message 的值. 同时 value 发生变化, 子组件input值更新.

## 可配置
```js 可配置model
  function transformModel (options, data: any) {
    const prop = (options.model && options.model.prop) || 'value'
    const event = (options.model && options.model.event) || 'input'
    // ...
  }
```
props: value && event: input 是可以配置的. 会替换掉默认的 value-input 这一组合.

```js v-model配置自定义value-input
  let Child = {
    template: '<div><input :value="msg" @input="updateValue" placeholder="edit me"></div>',
    props: ['msg'],
    model: { // 配置model中value和input的属性名; 在父组件中,并不关心子组件是如何使用的
      prop: 'msg',
      event: 'change'
    },
    methods: {
      updateValue(e) {
        this.$emit('change', e.target.value)
      }
    }
  }
  let vm = new Vue({
    el: '#app',
    template: '<div>' +
    '<child v-model="message"></child>' +
    '<p>Message is: {{ message }}</p>' +
    '</div>',
    data() {
      return {
        message: ''
      }
    },
    components: {
      Child
    }
  })
```
