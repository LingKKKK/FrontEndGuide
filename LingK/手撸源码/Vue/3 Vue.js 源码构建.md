## 什么是rollup
- vue和react都是使用rollup来打包的.
- rollup是一个js模块打包器, 可以将小块代码, 编译成大块复杂代码(library/应用程序);
- rollup最大的特点就是tree-shaking, 可以静态分析代码中的import依赖,排除未使用的代码;
- webpack也可以实现tree-shaking,需要自己配置,且打包出的代码比较臃肿.
- 对于库文件,和UI组件 rollup更合适
- 在rollup.config.js配置打包项

## 前端打包、构建工具都有哪些?
- Npm Script
- Fis3 ✅
- grunt
- gulp
- webpack ✅
- rollup ✅
有时间可以进行一个横向的对比

## Vue.js源码构建
因为vue是基于rollup构建的, 相关的构建配置都在script目录下;

#### 构建脚本
基于npm/yarn委托的项目,都是在package.json中做配置

#### 构建过程
1.打开入口构建的js `scripts/build.js`
2.读取相关的引用 `base.config/prod/dev等`
  对于单个配置, 遵循rollup的构建规则
  `entry`: 构建的入口文件
  `dest`: 构建后js文件的地址
  `format`: 构建的格式
  `cjs`: 遵循的CommonJS规范
  `es`: 遵循的ES module规范
  `umd`: 遵循的UMD规范
打包完毕在dist目录输出`xxx.js`文件

#### Runtime Only vs Runtime + Compiler
在使用vue-cli的时候, 需要关注`Runtime Only`和`Runtime Compiler`版本
在脚手架初始化的时候,webpack会安装一些loader和plugin,其中就有vue-loader和vue-template-compiler;
vue-loader是导入vue文件,vue-template-compiler是将vue文件编译(成不包含模板)

```js
  # Runtime Only
  在编译vue的时候,通常需要借用webpack的loader把vue文件编译成js;
  因为仅在编译阶段,所以只会包含运行时的vue,代码体积较轻
  // 不需要编译器
  new Vue({
    render (h) {
      return h('div', this.hi)
    }
  })
  编译过程: render ▶️ Virtual Dom ▶️ UI

  # Runtime Compiler
  如果对代码没有进行预编译, 但是又使用了template模板引入变量, 需要在客户端编译模板 ⬇️
  // 需要编译器: 因为最后都需要render渲染, 所以必须通过编译器输出; 存在一定的损耗
  new Vue({
    template: '<div>{{ hi }}</div>'
  })
  编译过程: template ▶️ AST ▶️ render ▶️ Virtual Dom ▶️ UI

  最终的结果都是为了将vue文件输出成js文件
```

所以, 比较推荐使用`Runtime Only`; 省去AST转换的过程

[参考](https://www.cnblogs.com/zhouzhiqin/p/12021972.html)

## 入口
真正初始化Vue的地方是: ` src/core/index.js `

```js
  // 源码
  import { initMixin } from './init'
  import { stateMixin } from './state'
  import { renderMixin } from './render'
  import { eventsMixin } from './events'
  import { lifecycleMixin } from './lifecycle'
  import { warn } from '../util/index'

  function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
  }

  initMixin(Vue)
  stateMixin(Vue)
  eventsMixin(Vue)
  lifecycleMixin(Vue)
  renderMixin(Vue)

  export default Vue
```
实际上就是使用Function实现一个类, 然后我们引入, 通过 new Vue() 将其实例化;
`可以了解new关键字执行了那些操作`

#### 思考: 为什么不使用es6的class来实现Vue类 ???

有很多`xxxMixin`的方法, 将Vue当做参数传入, 实际上就是给`Vue.prototype`上拓展一些方法; <具体都扩展那些呢???>
Vue按照不同的功能划分, 将他们分散到多个模块中; 这个功能class很难实现, 需要extend之后找出对应的子类, 不易扩展!!!
使用es5的方法更方便维护和管理, 不知道Vue3.0是否有改进呢.
思考: 任何技术存在即合理, 不同的场景各有优势. 不能否认旧的技术, 也不能盲目推崇新的技术, 需要考虑场景使用;

#### 全局的静态方法: initGlobalAPI

vue.js在初始化的过程中, 除了给其`prototype`上扩展方法, 还给`Vue`这个对象扩展了全局的静态方法;
参考: `src/core/global-api/index.js`
```js
  export function initGlobalAPI (Vue: GlobalAPI) {
    // config
    const configDef = {}
    configDef.get = () => config
    if (process.env.NODE_ENV !== 'production') {
      configDef.set = () => {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        )
      }
    }
    Object.defineProperty(Vue, 'config', configDef)

    Vue.util = {
      warn,
      extend,
      mergeOptions,
      defineReactive
    }

    Vue.set = set
    Vue.delete = del
    Vue.nextTick = nextTick

    Vue.options = Object.create(null)
    ASSET_TYPES.forEach(type => {
      Vue.options[type + 's'] = Object.create(null)
    })
    Vue.options._base = Vue

    extend(Vue.options.components, builtInComponents)

    initUse(Vue)
    initMixin(Vue)
    initExtend(Vue)
    initAssetRegisters(Vue)
  }
```
function中, 很多 `Vue.xxx` 就是对Vue进行扩展;

## 总结
- Vue是怎么实现的 ?
- Vue都扩展了那些内容 ?
- Vue是依靠什么编译的?
- 编译的过程都依赖那些工具(插件)?
