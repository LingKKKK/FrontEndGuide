# Git 的工作区

    远程仓库 - 本地仓库 - 缓存区 - 工作区

# Git 常用的命令

    项目:
      git init: 初始化
      git clone: 克隆仓库
      git config: 设置配置文件
    修改:
      git add: 添加文件
      git rm: 移除文件
      git mv: 改名, 放在缓存区
      git commit: 将代码保存缓存区
    分支:
      git branch: 分支相关的;
          -D: 删除分支
          -a: 查看本地和远程的所有分支
      git tag: 打版本号, -D push 等;
    对比差异:
      git status: 查看更改
      git log: 查看提交日志
      git blame [file]: 查看提交的人员和记录
      git diff: 查看暂存区和工作区之间的差异
                git diff --shortstat "@{0 day ago}" -> 查看今天写了多少代码
    拉取推送:
      git fetch: 下载远程仓库所有的更新
      git remove -v: 显示所有的远程仓库信息
      git pull: 拉去远程分支
      git push: 推送
                -f --force : 忽略错误, 强制提交
                -all: 提交所有的分支
    撤销:
      git checkout [file]: 放弃文件的修改; 可以跟文件, 也可以跟相对路径
      git reset [file]: 重置暂存区的文件, 使其和上次commit保持一直, 但是工作区的不变
      git reset --hard: 重置暂存区和工作区的文件, 使其和指定的commit版本一致
      git reset --keep: 重置暂存区的文件和指定的commit版本一直, 工作区保持不变
      git revert: 将代码回滚, 但是指针向后, 不会将之前的提交内容抹除掉
      git statsh: 将修改的代码放置到缓存区
      git statsh pop: 将缓存区的第一条代码同步到本地

# commit、tree、blob关系
  commit: 位于整个储存结构的顶端; 它包含4部分: 本次唯一的tree、父级commit、作者信息、本次提交的时间戳
  tree: 类似文件系统的目录结构, 下面包含了tree(目录)和blob(文件)
  blob: 存储文件的数据, 包含文件的内容和文件的属性 (只要文件的内容相同, 就认为是同一个blob, 这样很节省空间)

  在根目录.git/object文件夹中,存放了所有的对象.对象hash值的前两位作为文件夹的名称,后38位作为对象文件名.
  通过`git log`查看到的commit,前两位就是对应的文件夹.
  `git cat-file -p [commit的前十位/整个commit]`可以查看到commit的内容.
  `git cat-file -t [commit的前十位/整个commit]`可以查看到commit的类型.

  [参考](https://www.freesion.com/article/94381339859/)

# commit的组成/生成规则
```shell
  # 查看日志
  ➜  view git:(refactor/atomic) git log
  commit  8cb505985a5b2e86f28ecf9cdf54cbb257f849c2 (HEAD -> refactor/atomic)
  Author: 岳鹏飞 <663831709@qq.com>
  Date:   Fri Apr 29 16:57:10 2022 +0800
      feat(replace-auth-function): 引用权限控制器中的方法, 增加替换日志
```
`commit`是唯一的hash码,数字和英文构成,用于表示一个git commit对象
commit_hash是由下面几部分组成的:
```shell
  # commit组成
  ➜  view git:(refactor/atomic) git cat-file commit HEAD
  tree 4d8f4c3695e2f117cf80148a22f6376d6707d0d4 ->  本次commit目录树和每个对象的hash值
  parent 8fadfe03a700086069954ac841a951293a6b52bc -> 上一次commit的hash值
  author 岳鹏飞 <663831709@qq.com> 1651222630 +0800 -> 作者信息
  committer 岳鹏飞 <663831709@qq.com> 1651222630 +0800 -> 本次提交的时间戳
```
```shell
  # commit数量
  ➜  view git:(refactor/atomic) printf "commit %s\0" $(git cat-file commit HEAD | wc -c)
  commit 287%
```
<!-- $ (printf "commit %s\0" $(git cat-file commit HEAD | wc -c); git cat-file commit HEAD) | shasum
19d02d2cc358e59b3d04f82677dbf3808ae4fc40  - -->
```shell
  查看hash的组成: git cat-file -p 8cb505985a5b2e86f28ecf9cdf54cbb257f849c2
```

# 什么样的情况会导致分支冲突?
两个分支中的文件存在差异, 且从commit中的parent追溯不到另一个分支的commit, 则产生冲突

# 为什么会出现冲突?
  git不知道要使用哪一个版本的代码,需要手动resolve

# 分支如何对比? 对比什么内容?
对比当前commit所有文件的差异(内容变更: 增删改)

终于搜索到一篇文章，每一次commit都是基于暂存区来生成的，所以每一次commit都是一份完整的状态。合并的时候是通过两个分支和共有的基分支三个分支来判断是否冲突，是否新增，是否删除的。以前不理解这样的一种情况，checkout master分支到feature分支，然后在feature分支把某个文件删除，同时master有新的提交commit，因为每次commit都是完整的状态，我以前以为feature合并master就只是feature的commit和master的commit的比较来合并，所以一直不理解如果我这时候feature分支合并了master分支，会不会把我feature分支删除的文件恢复过来，通过测试不会，那为什么不会呢?如果要避免，我想是不是每次commit的都只是变化的blob，而且被删除的文件会通过一个特殊的blob来表达，这就是我进入的一个误区。最终原来是通过加入一个共同的基分支来一起比较的。翻墙进Google才找到的，百度尽然没搜索到，中文网站啊。感谢谷歌，要不然就只能苦逼的去看git源码了。

https://www.bookstack.cn/read/git-doc-zh/docs-65.md
https://blog.csdn.net/metheir/article/details/81808766
