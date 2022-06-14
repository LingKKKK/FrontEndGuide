# webpack 的组成

    入口 enter
    出口 output
    插件 plugin
    模块 module
        1. 需要使用loader来进行解析js/json之外的文件
        2. vue-loader sass/less-loader file-loader等
    模式 mode -> product/test/develop
    解析规则 resolve
        1. alias 配置别名
        2. extensions 自动补充文件后缀
        3. modules 快速解析到node_modules文件

# 默认的分包规则

    1. 初始化
    2. 构建阶段 make
    3. 生成阶段 seal
    4. 写入阶段 emit

# package.json 中的配置
## dependencies 和 devDependencies 的区别
  [dɪˈpɛndən siz]
  通过 NODE_ENV 来区分生产环境和开发环境 development/production
  devDependencies：用于开发环境的配置 --save-dev; 仅在开发环境中使用，生产环境不会被打包
  dependencies：用户生产环境的配置 --save; 既可以在生产环境中使用，也可以在开发环境中使用

# webpack的解析流程
           开始编译
             ↓
    webpack配置参数（默认配置）
             ↓
    创建 NormalModuleFactory (就是解析模块的实例)
             ↓
     使用 Factory 创建实例  →→→  create方法创建normalModuleFactory
             ↓                 使用resolve解析loader路径
             ↓                 创建模块对应的normalModuleFactory实例
             ↓
           编译模块  →→→  调用normalModuleFactory的build方法
             ↓           执行 loader-run，开始对各类文件进行解析
             ↓
            输出

# Chunk
    流程：
      1 chunk是编译输出的基本单位
      2 由webpack确定entry和依赖的modules遍历输出
      3 使用到了 splitChunksPlugin 插件，并对编译规则进行优化，提高chunk性能
      4 运行完毕之后，将chunk拆解合并到一个文件中，输出完成编译工作
    算法：
      1. webpack先将entry中对应的module都生成一个新的chunk
      2. 遍历module的依赖列表，将依赖的module也加入chunk
      3. 如果依赖的module是动态引入的模块，会根据这个module再次创建一个新的chunk，继续遍历
      4. 重复1 2 3直到输出完所有的chunk
    ** Module: 作用于编译的前半段, 规定了如何读取
    ** Chunk: 作用于编译的后半段, 规定了如何写入

# webpack的工作流程
    1 初始化：从配置文件和Shell语句读取合并参数
    2 开始编译：从上一步得到的参数初始化compile对象，预先加载所有依赖的插件
    3 确定入口：根据配置中的entry找到所有的入口文件
    4 编译模块：normalModuleFactory实例调用loaders并执行编译
    5 完成编译
    6 输出资源：根据入口和模块之间的依赖，打包成多个chunk，再把chunk转换成一个文件输出
    ！！！ 第6步是修改文件的最后机会

# webpack的优化都有哪些?
    配置优化:
      1.忽略依赖库的解析
        noParse: /jquery|lodash/ 不解析jq/lodash, 节省时间内存
      2.解析时, 筛选目录和文件
        loaders解析的时候,可以筛选目录,加快运行的效率
      3.打包时, 屏蔽某些内容
        并非所有的内容都需要打包, 单元测试, 脚本任务等不需要打包
        IgnorePlugin
      4.dll plugin 动态链接库
        有些代码库和依赖仅需要一次性打包, 例如 react / react-dom / lodash
        对这些库一次性打包(xxx_dll_plugin),然后动态引用, 这样会增加效率
        webpack.DllPlugin({xxx}) === webpack.plugin({xxx})
      5.抽离公用的代码
        一般将特殊的配置保留,相同的内容都抽离到公用的js中
        webpack.js / build.js / dev.js / test.js 等, 根据环境变量按需进入
    打包优化:
      1.去掉不必要的插件
        NoEmitOnErrorPlugin删除没有触发的依赖包
      2.提取第三方库
        CommonsChunkPlugin 提取公用模块,打包到单独的空间, 便于其他模块依赖
      3,代码压缩
        UnlifyPlugin 内置的插件(执行起来特别耗时间), 仅在生产环境使用
      4.source-map
        线上本地调试分别配置对应的项
      5.代码分割
        code split配合router执行, 不支持es6模块系统
      6.设置缓存
        仅在内容有变更时修改hash, 配合浏览器的缓存
