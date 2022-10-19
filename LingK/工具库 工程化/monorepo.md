# 大型项目的前端管理工具 - monorepo

[参考](http://t.zoukankan.com/vickylinj-p-15572188.html)

`monorepo`是一种管理代码的方式.
在一个项目仓库(repo)中,同时管理多个模块/包(package).
不同于常见的一个模块对应一个仓库

例如本地的: wangEditor/slate-editor 项目,第一级目录的内容以脚手架为主,主要内容都在`package`目录中.
并将包分成多个`package`进行管理.

```
  ├── packages
  |   ├── pkg1
  |   |   ├── package.json
  |   ├── pkg2
  |   |   ├── package.json
  ├── package.json
```

# 分析

`monorepo`的优势是: **统一工作流**和**Code Sharing**
我们想看一个 package 的代码,想了解它的逻辑,它的 repo 就是当前的 repo,这样查找会特别方便.
但需要修改多个 package 的时候,不需要找到各自的 repo 进行`修改`,`测试`,`发版`或者`npm link`.可以统一执行.
只需要搭建一套脚手架,就能对多个 package 同时进行管理工作(构建/自测/发布)

`monorepo`的劣势是: **repo 体积较大**
各 pacakge 理论上都是独立存在,所以每个 package 都维护自己的依赖(dependencies).
很大的可能是这些 package 之间都有相同的依赖关系,这就会出现重复安装的情况,会使`node_modules`的体积更加庞大(依赖爆炸).

_总结_
当项目拥有一定的复杂度,且需要做模块划分,但是模块联系紧密的时候,比较适合使用`monorepo`组织代码
代码管理,是一个进化的过程,并非一蹴而就.。

# monorepo 方案

- learn
- yarn workspaces

[learn中文教程](https://segmentfault.com/a/1190000019350611)
[learn-大型前端项目管理工具](https://segmentfault.com/a/1190000019309820?utm_source=tag-newest)
[learn-学习理解](https://blog.csdn.net/kalinux/article/details/116462002)
[learn + yarn_workspaces 管理monorepo](https://zhuanlan.zhihu.com/p/350329753)
[去monorepo的4种方式](https://blog.csdn.net/dfsgwe1231/article/details/105996358)
[monorepo使用教程](https://blog.51cto.com/u_15064632/4322993)
