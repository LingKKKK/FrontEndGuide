直接输入命令：

```bash
brew install redis
```

等待几分钟，即成功安装, `brew info redis`可以查看安装信息，检查是否安装成功。

```bash
# 设置为开机启动
brew services link redis
# 启动命令
brew services start redis 或 redis-server /usr/local/etc/redis.conf
# 重新启动命令
brew services restart redis
# 停止服务命令
brew services stop redis
# 取消开机启动命令
brew services unlink redis
```
