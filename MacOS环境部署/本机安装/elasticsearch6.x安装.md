目前生产环境和开发环境的 elasticsearch 搜索引擎版本依赖为 6.x 系列，所以这里以 6.x 为例。

直接输入命令：

```bash
brew install elasticsearch@6
```

等待几分钟，即成功安装, `brew info elasticsearch@6`可以查看安装信息，检查是否安装成功。

```bash
# 设置为开机启动
brew services link elasticsearch@6
# 启动命令
brew services start elasticsearch@6
# 重新启动命令
brew services restart elasticsearch@6
# 停止服务命令
brew services stop elasticsearch@6
# 取消开机启动命令
brew services unlink elasticsearch@6
```
