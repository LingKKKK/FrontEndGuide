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

# chunk

    1. Chunk 则是输出产物的基本组织单位
    2. 在生成阶段 webpack 按规则将 entry 及其它 Module 插入 Chunk 中
    3. 再由 SplitChunksPlugin 插件根据优化规则与 ChunkGraph 对 Chunk 做一系列的变化、拆解、合并操作，重新组织成一批性能(可能)更高的 Chunks 。
    4. 运行完毕之后 webpack 继续将 chunk 一一写入物理文件中，完成编译工作。

    Module: 作用于编译的前半段, 规定了如何读取
    Chunk: 作用于编译的后半段, 规定了如何写入

# 默认的分包规则

    1. 初始化
    2. 构建阶段 make
    3. 生成阶段 seal
    4. 写入阶段 emit
