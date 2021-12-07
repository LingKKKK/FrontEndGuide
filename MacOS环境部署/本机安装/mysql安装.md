直接输入命令：

```bash
brew install mysql
```

等待几分钟，即成功安装, `brew info mysql`可以查看安装信息，检查是否安装成功。

```bash
# 设置为开机启动
brew services link mysql
# 启动命令
brew services start mysql
# 重新启动命令
brew services restart mysql
# 停止服务命令
brew services stop mysql
# 取消开机启动命令
brew services unlink mysql
```
