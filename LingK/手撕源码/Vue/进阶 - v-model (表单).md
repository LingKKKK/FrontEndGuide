
很长一段时间,都将vue的数据响应式实现原理理解成双向绑定,实际上有一些不准确.
数据响应 都是通过数据的改变驱动DOM视图变化的, 而双向绑定除了数据驱动DOM视图变化外, 还存在DOM变化反过来影响数据, 是双向关系.
在Vue中, 可以通过 v-model 来实现双向绑定.

v-model 既可以作用在普通的表单上, 也可以作用在组件上, 实际上就是一个简单的语法糖. JQ react 都可以实现此类效果.


# 表单元素
```js demo -> v-model
    let vm = new Vue({
      el: '#app',
      template: '<div>'
      + '<input v-model="message" placeholder="edit me">' +
      '<p>Message is: {{ message }}</p>' +
      '</div>',
      data() { return { message: '' } }
    })
```
在表单元素中设置了 v-model 属性, 绑定了 message 值, 当我们在input上输入内容的时候,message也会同步的发生变化.
☆☆☆
从编译阶段进行分析, 编译可以分为三个阶段: 解析(parse) 优化(optimize) 编码(codegen)
1. 首先在 parse 阶段, v-model 会被当做普通指令解析到 el.directives 中.
2. 然后在 codegen 阶段执行 getData 的时候, 会执行`const dirs = genDirectives(el, state)` 解析挂载指令,生成所需的json
3. 将解析的代码挂载到AST元素上, 等待编译阶段的编译.

指令的实现原理，可以从编译原理=>代码生成=>指令钩子实现进行概述
  1.在生成ast语法树时，遇到指令会给当前元素添加directives属性
  2.通过genDirectives生成指令代码; 调用 -> genAssignmentCode 生成代码
  3.在patch前将指令的钩子提取到cbs中,在patch过程中调用对应的钩子
  4.当执行指令对应钩子函数时，调用对应指令定义的方法

```js func -> genDirectives
function genDirectives (el: ASTElement, state: CodegenState): string | void {
  /**
   * @el ASTElement 元素节点 => 目标节点
   * @state codegenState对象  => 绑定的属性
   * @return 返回一个包含 directive 信息的 json 对象
   */
  const dirs = el.directives
  if (!dirs) return // 如果没有绑定指令就跳过
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  // 取到 el.directives 然后做遍历
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    const gen: DirectiveFunction = state.directives[dir.name]
    if (gen) {
      // 编译AST语法树, 生成指令代码; 如果需要runtime就返回true
      needRuntime = !!gen(el, dir, state.warn) // ☆ 执行 model/directive 函数
    }
    if (needRuntime) {
      hasRuntime = true
      // 将指令生成字符串 directives:[{name:'def',rawName:'v-def'}]...
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:"${dir.arg}"` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}
```

```js Class -> CodegenState
  export class CodegenState {
    options: CompilerOptions;
    warn: Function;
    transforms: Array<TransformFunction>;
    dataGenFns: Array<DataGenFunction>;
    directives: { [key: string]: DirectiveFunction };
    maybeComponent: (el: ASTElement) => boolean;
    onceId: number;
    staticRenderFns: Array<string>;

    constructor (options: CompilerOptions) {
      this.options = options
      this.warn = options.warn || baseWarn
      this.transforms = pluckModuleFunction(options.modules, 'transformCode')
      this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
      this.directives = extend(extend({}, baseDirectives), options.directives)
      const isReservedTag = options.isReservedTag || no
      this.maybeComponent = (el: ASTElement) => !isReservedTag(el.tag)
      this.onceId = 0
      this.staticRenderFns = []
    }
  }
```

```js 指令处理函数 -> directive -> src/platforms/web/compiler/directives/model.js
  export default function model (
    el: ASTElement,
    dir: ASTDirective,
    _warn: Function
  ): ?boolean {
    warn = _warn
    const value = dir.value
    const modifiers = dir.modifiers
    const tag = el.tag
    const type = el.attrsMap.type

    if (process.env.NODE_ENV !== 'production') {
      // inputs with type="file" are read only and setting the input's
      // value will throw an error.
      if (tag === 'input' && type === 'file') {
        warn(
          `<${el.tag} v-model="${value}" type="file">:\n` +
          `File inputs are read only. Use a v-on:change listener instead.`
        )
      }
    }

    if (el.component) {
      genComponentModel(el, value, modifiers)
      // component v-model doesn't need extra runtime
      return false
    } else if (tag === 'select') {
      genSelect(el, value, modifiers)
    } else if (tag === 'input' && type === 'checkbox') {
      genCheckboxModel(el, value, modifiers)
    } else if (tag === 'input' && type === 'radio') {
      genRadioModel(el, value, modifiers)
    } else if (tag === 'input' || tag === 'textarea') {
      genDefaultModel(el, value, modifiers)
    } else if (!config.isReservedTag(tag)) {
      genComponentModel(el, value, modifiers)
      // component v-model doesn't need extra runtime
      return false
    } else if (process.env.NODE_ENV !== 'production') {
      warn(
        `<${el.tag} v-model="${value}">: ` +
        `v-model is not supported on this element type. ` +
        'If you are working with contenteditable, it\'s recommended to ' +
        'wrap a library dedicated for that purpose inside a custom component.'
      )
    }

    // ensure runtime directive metadata
    return true
  }
```

genAssignmentCode函数
对 v-model 对应的 value 进行了解析, 对于我们的例子来说, value 就是 message, 所以返回的 res.key = null
我们得到了: ${value}=${assignment}  => message=$event.target.value
```js 将v-model解析
  export function genAssignmentCode (
    value: string,
    assignment: string
  ): string {
    const res = parseModel(value)
    if (res.key === null) {
      return `${value}=${assignment}`
    } else {
      return `$set(${res.exp}, ${res.key}, ${assignment})`
    }
  }
```

# ☆☆☆☆☆

```js 双向绑定的精髓
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code, null, true)
```
通过修改AST元素, 给el添加一个props,相当于我们在input上动态绑定了value;
又给el添加了处理事件,相当于绑定了了input函数.
最终转义的模板如下:
<input v-bind:value="message" v-on:input="message=$event.target.value">

```js 最终生成的render函数如下
  with(this) {
    return _c('div',[_c('input',{
      directives:[{
        name:"model",
        rawName:"v-model",
        value:(message),
        expression:"message"
      }],
      attrs:{"placeholder":"edit me"},
      domProps:{"value":(message)},
      on:{"input":function($event){
        if($event.target.composing)
          return;
        message=$event.target.value
      }}}),_c('p',[_v("Message is: "+_s(message))])
      ])
  }
```
