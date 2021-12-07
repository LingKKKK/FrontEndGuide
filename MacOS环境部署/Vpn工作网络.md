此服务依赖于`docker`，所以必须要先安装`docker`服务，安装方法此处就不赘述，请自行查询。

### 拉取并启动镜像

```
docker run -d --name netmix --hostname netmix -v "/data/openvpn/client.ovpn:/etc/openvpn/client.conf" -p 2222:22 -p 8686:80 -p 8888:8888 --cap-add=NET_ADMIN --tty=true -i -t teng315/netmix:1.0
```

配置说明：

- `/data/openvpn/client.ovpn` 文件用于 vpn 连接配置文件，文件必须要存在。
- 2222 为映射出来的 ssh 端口，避免和宿主机冲突
- 8686 为 web 通道服务端口，避免和宿主机冲突
- 8888 为代理服务器端口，避免和宿主机冲突

正常启动后，需要进入容器，运行服务：

```
docker exec -ti netbox netbox
```

启动后，打开浏览器输入：

http://127.0.0.1:8686/index.php

正常看到 `phpinfo` 信息说明服务运行起来了~

---

#### 配置连接工作网络有以下几种方式：

## 1、ssh 连接方式：

默认的连接信息为：

```
ssh -p2222 root@127.0.0.1
```

> 默认连接密码：123456

此方式适用于大部分支持 ssh 的连接。

## 2、代理模式：

此方式适用于大部分网络环境，如浏览器可局部代理，系统可支持全局代理（不建议）等环境！

此处我根据`Goole Chrome`浏览器为例说明，其它类似：

需要在[应用市场](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif)下载 `Proxy SwitchyOmega` 浏览器扩展插件！

翻不了墙的，[在这里下载](https://proxy-switchyomega.com/download)：

#### 配置

安装完后，打开:

1.左侧`通用`：初始情景模式->选择 auto switch！

2.左侧`情景模式`选项 `proxy`：

3.右侧：

- 代理协议，选择`HTTP`方式；
- 代理服务器，填写：`127.0.0.1`
- 代理端口，填写：`8888`
- 点击旁边小锁，填写认证信息：用户名（root），密码（123456）

  4.左侧`情景模式`选项 `auto switch`：

切换规则处：

- 条件类型选择`域名通配符`
- 条件处填写：`10.*`
- 情景模式选择：`proxy`

然后点击左侧：**应用选项！** 即可完成设置！

配置完成后，就可以访问服务器如[瓦力发版](http://10.0.0.13:8000)、[bugfree](http://10.0.0.13:8006)等平台了！

## 3、通道模式：

此方式仅适用于 Navicat 系列工具！

**配置方法：**

Navicat->在连接点击右键，编辑连接->HTTP 选项卡->勾选`使用HTTP通道`->通道网址处填写下面的通道地址（测试连接）->保存！

> 使用 HTTP 通道，不能和其它连接方式共存，如 SSL/SSH！

通道地址：

```
http://127.0.0.1:8686/ntunnel_mysql.php
```
