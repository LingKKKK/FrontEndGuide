# 合并分支

## rebase 和 merge 的区别 ??
rebase: 变基, 变更分支的根基/基线
	rebase会把当前分支的commit放到目标分支的最后面, 相当于从目标分支重新签出这一分支;
	例如:从A分支签出B分支, 同时进行功能开发,经过n次commit之后,如果此时在B分支 rebase A的话,就把当前的几次commit放在A的最后面
merge: 合并, 将代码合入
	merge会把当前分支和目标分支的commit合并在一起,形成一个新的commit提交

都会产生冲突,都需要手动合并一下冲突

例如:
	现在分支的状态是: A: 1-2-3
	从A分支签出B分支
	A分支提交 commit: 4-5
	B分支提交 commit: 6-7
	如果在B分支 rebase A, 那么B分支的commit就是: 1-2-3-4-5-6-7
	如果将B分支 merge into A, 那么B分支的commit就是: 1-2-3-6-7-8(4-5); 8就是合并的4-5commit

使用场景
	1. 从主分支上签出一个分支, 做自己的修改; 此时主分支也一直再更新内容; 当你的功能开发完毕之后, 需要使用到主分支的修改, 做一次集成, 这样应该使用rebase, 这样会把你的提交都放在最后;; 如果使用merge, 就无法退回到自己分支的某个节点;
	2. 使用rebase之后, 可能不太好定位自己从哪个节点签出, 例如上面的案例, rebase之后就是 1-2-3-4-5-6-7, 需要看日志确定从哪个节点签出;
	3. rebase之后的历史树并非完整的历史树,在rebase时已经被篡改了

## rebase的作用
	1. 变基线
	2. 修改commit message

### git命令行rebase
当前分支"feature/fedev-385", 目标分支"release/2021-v2021.4"
执行 >>> git rebase release/2021-v2021.4
-------变基成功-------
此时分支"feature/fedev-385"的所有commit都被放到"release/2021-v2021.4"的最后面了

### 在fork/soureTree上操作
当前分支"feature/fedev-385", 目标分支"release/2021-v2021.4"
执行 >>> 选中"release/2021-v2021.4", 右键选择"Rebase feature/fedev-385 into here"
-------变基成功-------


# 合并冗余的commit

## rebase合并多个commit
在命令行中:
	git rebase -i hash >>> 在vim中编辑想要保留的commit message, 可自定义
在fork中:
	1. 单个commit右键"interactive rebase", 再选择"Fixup 或者 Squash" 忽略不想要的commit
	2. 多选commit右键"Squash into parent", 可以忽略不想要的commit
	3. 单击commit右键"reword message", 可以修改commit的提交信息

github > pull request: 你本地修改且合并完毕, 希望管理员能拉取你的更新 >> “我改了你们的代码，你们拉回去看看吧 ！”
gitlabb > merge request: 你本地修改完毕, 希望管理员能合并你的更新 >> “我改了你们的代码，请求合并代码！”


## 为什么要使用rebase?
  rebase的基本操作流程: `从现有分支 A 创建新分支 B` -> `在分支 B 上添加/提交更改` -> `来自分支 A 的变基更新` -> `将分支 B 的更改合并到分支 A`

  如果需要将`master分支`的更新同步到`feature分支`,并解决冲突. 我们有两个选择:
    ① merge origin/master into feature
    ② rebase feature onto origin/master
  `rebase`和`merge`, 都能满足我们合并操作的需求,但是需要权衡利弊,选择最合适的操作方式.
  Merge - The Good
    ① 操作简单易上手,步骤比较固定:`pull -> merge -> push`
    ② 只需要解决一次冲突
    ③ 两个分支的关联比较直观
  Merge - The Bad
    ① 让分支树(分支历史)比较混乱
    ② 之前的commit很难被追踪清理(非线性)
    ③ 使基线(分支)变多,每增加一个功能都会增加一条基线
  Rebase - The Good
    ① 减缓基线(分支)的增加速度
    ② 让主分支的代码更容易被追踪到
    ③ 整合commit,让合并的意图更明显
  Rebase - The Bad
    ① 需要有一定基础,新手勿用
    ② (操作不当时)可能会导致多次冲突
    ③ 打破commit创建的顺序,容易混淆合入意图
    ④ (操作不当时)会引入bug

Rebase面临第一个问题就是`冲突`,如果因为使用了`rebase`而进入冲突地狱,那么他就不是一个很好的选择.
举例来说:
  ① 我从主分支`master`上签出一个分支`refactor/atomic`来重构权限构造器.
  ② 我的重构包含了15次提交,在这15次提交中,重构了底层逻辑,对优化结构进行重构优化,增加了单元测试校验,增加了文档注释.
  ③ 我重构的方法中,包含了对`util.js`中方法A的重构.
  ④ 现在准备将我的代码合到`master`分支上,但是我发现,`master`分支上的方法A已经被其他同事重构过了.
  我现在有两个选择:
  merge: 遇到冲突 -> 手动解决冲突 -> 合并成功
  rebase: 开始rebase -> 解决第一次commit冲突 -> 解决第二次commit冲突 -> ... -> 解决完15次commit冲突后 -> 合并成功
  如果遇到了上面的流程,rebase无疑是很差的选择.操作越多出错的风险越大.
  解决方案: 将多次commit合并,这样变基时,只需要解决少量的冲突,是可以接受的.

Rebase面临第二个问题就是`无法撤销`. 当合并分支时,我粗心的将错误的代码引入到了主分支, 如果我选择`merge`合入,分支会自动创建一个合并提交的commit,当我出错时我可以使用`revert`/`reset`来重置代码. 如果我选择`rebase`合入,我很难确定是从哪一个commit引入的错误,因为commit历史被修改,我需要逐一排查,以确定所有的commit都符合预期.同时,难以确定哪些commit是`rebase`引入的.
  解决方案: 通过`git reflog`确定合入的commit,实在不行回滚一下,或者使用`abort`来跳过合入.

综上所述
  rebase的使用场景比较特殊,慎重使用
  ① 下游分支需要更新上游分支内容的时候使用rebase
    我在本地重构原子权限,需要同步master分支代码,需要`rebase on master`合入master分支所有修改
    在开发独立模块和功能时使用,确保代码的正确性和可靠性,验证场景的覆盖率要100%
  ② 上游分支合并下游分支代码的时候使用merge
    本地修改完毕, 使用`merge into master`, 将本地代码合入master分支


## 为什么要使用squash?
  ```shell
    # 操作`merge --squash`流程
    clone the remote repository
    git checkout -b my_new_feature
    # ..work and commit some stuff
    git rebase master
    # ..work and commit some stuff
    git rebase master
    # ..finish the feature, commit
    git rebase master
    git checkout master
    git merge --squash my_new_feature
    git commit -m "added my_new_feature"
    git branch -D my_new_feature
  ```
  `squash合并`: 丢弃功能分支上的所有历史记录 -> 它将所有的提交都压缩成了一个commit(message是最后一次提交的内容)
  让分支更加简洁,减少commit记录的同时,也能将功能集中化; 思考两个场景: 1.review分支 2.迁移功能

  我们基于私有2021版本,增加了'在线解压缩'的功能.
  关于review分支:
    一、如果不用`squash合并`,最终合入主分支的commit记录是: '1.增加了解压缩xxx功能 2.增加了解压缩xxx功能 3. 增加了解压缩xxx功能 ...'; 对于这些commit记录,我们不会关心,不会回滚,不会针对性的review. 它们仅仅是版本迭代过程的记录. 但是我们将开发分支向主分支合并的时候,会把这些commit记录都合并进去.这就导致了主分支的commit节点变得更加复杂,变得难以追踪. 同时,我们如果需要迁移某部分功能时,如果不借助外部工具,仅从git记录是很难找到这部分功能的历史记录.
    二、使用`squash合并`, 在合到主分支或者次分支的时候,所有的迭代过程都可以压缩到一个commit提交,这样让主分支变得更加纯粹. 我们在追踪代码时,可以直接从提交日志中找到这些commit记录. 同时,开发过程中的commit记录,可以从开发分支直接追踪. 避免开发分支和主分支的commit记录变得混乱.
    `squash`会让我们的分支更加简洁,更加纯粹. 但是部分问题也随之而来:
      1. 分支之间的关联不明确 (我们很难从主分支找到对应的开发分支)
        因为`squash合并`的流程相当于: 基于`开发分支`创建`临时分支`->合入分支时时创建一个新的commit->删除`临时分支`;所以我们看不到`开发分支`和`主分支`之间的任何联系
        解决的方法: 在commit-message中要填写好相关的信息; 例如: message: 'merge BUS-324(在线解压缩) into branch'
      2. 开发分支更新之后再合入主分支会有冲突 (两个分支和基线分支都不同 -> 必然会有冲突)
        上面提到了`squash合入`的流程,这样导致如果有代码更新,再次请求合入必然会引起分支冲突<参考分支冲突的原因>.
        解决的方式: ① 主分支revert -> 开发分支再起请求`squash合入` ② 开发分支merge主分支 -> 修改完毕再起请求`squash合入`
  关于迁移功能: `squash合入`会将所有的修改都压缩到一个commit节点中,查看对比起来也更方便

  综上所述, `squash合入`更适合`原子功能`的合入.例如上面提到的`在线解压缩`功能,这就是最小的模块,无法再细化.
  在`FEDEV`分支进行功能开发 -> 开发完毕都合入`BUS`分支 -> 在BUS分支验收完毕之后 -> `squash合入`次分支 -> 合入主分支
  patch也是类似的流程, 将所有的修改集中合入, 其目的就是为了简化分支

  考虑过让每个开发者都接触并合理的使用`squash合并`流程,因为它的确实是在帮我们优化分支结构. 但是考虑到`squash`并不适合应用在开发迭代的过程中,所以放弃了这个想法; 目前能想到的就是在`BUS合入次分支`,`次分支合入主分支`,`Patch合入主分支`这三个场景可以使用到`squash合并`. 其他场景能不使用就尽量不使用.

# commit都包含哪些信息?
  commit: 位于整个储存结构的顶端; 它包含4部分: 本次唯一的tree、父级commit、作者信息、本次提交的时间戳
  tree: 类似文件系统的目录结构, 下面包含了tree(目录)和blob(文件)
  blob: 存储文件的数据, 包含文件的内容和文件的属性 (只要文件的内容相同, 就认为是同一个blob, 这样很节省空间)

  在根目录.git/object文件夹中,存放了所有的对象.对象hash值的前两位作为文件夹的名称,后38位作为对象文件名.
  通过`git log`查看到的commit,前两位就是对应的文件夹.
  `git cat-file -p [commit的前十位/整个commit]`可以查看到commit的内容.
  `git cat-file -t [commit的前十位/整个commit]`可以查看到commit的类型.

# 分支对比都对比什么?
  对比当前commit所有文件的差异(内容变更: 增删改)

  终于搜索到一篇文章，每一次commit都是基于暂存区来生成的，所以每一次commit都是一份完整的状态。合并的时候是通过两个分支和共有的基分支三个分支来判断是否冲突，是否新增，是否删除的。以前不理解这样的一种情况，checkout master分支到feature分支，然后在feature分支把某个文件删除，同时master有新的提交commit，因为每次commit都是完整的状态，我以前以为feature合并master就只是feature的commit和master的commit的比较来合并，所以一直不理解如果我这时候feature分支合并了master分支，会不会把我feature分支删除的文件恢复过来，通过测试不会，那为什么不会呢?如果要避免，我想是不是每次commit的都只是变化的blob，而且被删除的文件会通过一个特殊的blob来表达，这就是我进入的一个误区。最终原来是通过加入一个共同的基分支来一起比较的。翻墙进Google才找到的，百度尽然没搜索到，中文网站啊。感谢谷歌，要不然就只能苦逼的去看git源码了。
