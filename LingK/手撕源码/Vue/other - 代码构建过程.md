# runtime
`runtime`封装了运行时环境: 环境变量和配置文件等;

# 构建脚本
通常一个基于NPM托管的项目,都会有一个`package.json`文件,它是项目的描述文件,它的内容实际上是一个标准的JSON对象.
在`package.json`中,通常会使用`script`字段作为NPM的执行脚本, 例如:
```json
{
  "script": {
    "build": "node scripts/build.js",
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer",
    "build:weex": "npm run build -- weex"
  }
}
```

# Runtime Only VS Runtime + Compiler
通常利用`vue-cli`去初始化我们的Vue项目的时候, 会询问使用哪种构建方式.

## Runtime Only (推荐)
在使用该版本的vue时,通常需要借助工具,如`webpack`的`vue-loader`把`.vue`文件编译成`JavaScript`.
因为是在编译阶段做的,所以他是包含运行时的`Vue.js`代码,因此代码体积会更小.

## Runtime + Compiler
没有对代码做预编译,单又使用了Vue的`templete`属性,并传入一个字符串,则需要在客户端编译模板,如下:
```js
// 需要编译器的版本
new Vue({
  template: '<div>{{ hi }}</div>'
})
// 这种情况不需要
new Vue({
  render (h) {
    return h('div', this.hi)
  }
})
```
在`Vue 2.0`版本中,最终的渲染都是通过`render`函数, 如果写`templete`属性, 则需要编译成`render`函数.
这样一来,这个编译过程会发生在运行时(runtime), 所以需要选择有编译器的版本.

有性能损耗,我们再选择的时候尽量避免使用`Runtime + Compiler`的编译模式
