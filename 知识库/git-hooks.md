### hooks、husky

```shell
# git-hooks
在执行git的过程中被触发的钩子（在特定的节点，触发特定的事件）
# husky的作用
让我们在编写项目的时候，添加git-hooks

p.s. git-hooks是前端项目工程化（规范、高效）必不可少的环节。我们需要在打包的过程中对一些内容进行校验。
```



### 我们项目里用到的git-hooks

以私有view项目为例，涉及的hooks：文件的类型，提交的信息

```json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged", // 对缓存文件（类型）的校验
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS" // 校验commit的信息是否符合规范（标准/自定义）
  }
}

// lint-staged参考：根目录 “package.json” 中的 “lint-staged” 项配置
// commitlint规则参考：根目录下的 “.commitlintrc.js”
```



### 错误提交示例

错误提交包含了两个部分：

- 保存文件不符合 lint-staged 规范
- commit信息不符合 commitlint 规范

```shell
# 命令行、fork、sourceTree 执行日志中的信息基本一致

# stage不符合规范的文件时
➜  view git:(xxxxxxxxx) ✗ git ci -m 'test(add-MDfile): 添加MD文件'
	husky > pre-commit (node v12.18.3)
	ℹ No staged files match any configured task.
	husky > commit-msg (node v12.18.3)
	##### 仔细阅读下面的报错信息，排查错误原因
	⧗   input: test(add-MDfile):添加MD文件
	✖   subject may not be empty [subject-empty]
	✖   type may not be empty [type-empty]
	
	✖   found 2 problems, 0 warnings
	ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
	husky > commit-msg hook failed (add --no-verify to bypass)

# commit不符合规范的message时
➜  view git:(xxxxxxxxx) ✗ git ci -m '错误的提交描述'
	husky > pre-commit (node v12.18.3)
	✔ Preparing...
	✔ Running tasks...
	✔ Applying modifications...
	✔ Cleaning up...
	husky > commit-msg (node v12.18.3)
	##### 仔细阅读下面的报错信息，排查错误原因
	⧗   input: 错误的提交描述
	✖   subject may not be empty [subject-empty]
	✖   type may not be empty [type-empty]

	✖   found 2 problems, 0 warnings
	ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
	husky > commit-msg hook failed (add --no-verify to bypass)
```



### 正确提交示例

参考：[Git Commit Message 规范](https://wiki.lenovows.com/pages/viewpage.action?pageId=2033576)

```shell
➜  view git:(xxxxxxxxx) ✗ git ci -m 'test(add-file): 保存一个js文件'
  husky > pre-commit (node v12.18.3)
  # 中间的执行过程...
  [current_test_commit a0dbb0c78] test(add-file): 保存一个js文件
  husky > commit-msg (node v12.18.3)
  1 file changed, 2 insertions(+)
  ## commit执行成功
```



### 禁止使用的命令

```shell
在提交报错的会提示：add --no-verify to bypass
我们禁止使用 --no-verify 来跳过验证，这会让hooks没有任何意义
```



### Mac用户使用fork、sourceTree会遇到跳过pre-commit的问题

```shell
# 在提交时，发现git工具并未执行 husky 定义的 git-hooks

# 1. 查询日志如下
  Can't find npx in PATH: /Applications/Fork.app/Contents/Resources/git-instance/libexec/git-core:/Applications/Fork.app/Contents/Resources/git-instance/git-lfs:/Applications/Fork.app/Contents/Resources/gitflow-avh:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
  Skipping pre-commit hook
  
# 2. 或者出现如下错误
	.git/hooks/pre-commit: node: command not found
	
# 原因
fork/sourceTree这类gui和命令行访问的环境变量不一样，需要加入你的node环境变量
gui访问的目录是：/usr/local/bin

# 方法1
  ➜  view git:(current_test_commit) ✗ which node
  /Users/lingk/.nvm/versions/node/v12.18.3/bin/node
  # 将得到的目录添加到 .git/hooks/pre-commit 中
  PATH="/usr/local/opt/node/bin:$PATH"
  
# 方法2 ☆☆☆
	在 ~ 目录下，添加 .huskyrc 文件
	➜  ~ vi .huskyrc
	# 写入环境变量
	export PATH="/Users/lingk/.nvm/versions/node/v12.18.3/bin:$PATH"
	:x! # 保存 ~/.huskyrc
	
	# 原因
	在 “.git/hooks/husky.sh” 中，会优先解析本地的 .huskyrc， 然后再执行 npm/npmx等等命令
```



 Window环境，目前未发现类似问题
