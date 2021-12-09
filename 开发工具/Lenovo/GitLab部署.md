

### CI/CD

```
CI：（Continuous Integration）
  持续集成，在代码开发的过程中，持续的对代码进行集成，构建以及自动化测试。
  有了CI工具，我们可以在提交的过程中，今早的发现错误。
CD：（Continuous Delivery）持续交付
CD：（Continuous Deployment）持续部署：在代码构建完毕之后，更方便的将代码上传至线上，有利于快速迭代并交付产品。
```

### gitlab、ci、runner 之间的关系

##### gitlab
    是一个用于仓库管理系统的开源项目，使用Git作为代码管理工具，并在此基础上搭建起来的Web服务
##### gitlab-ci
    配合 gitlab 使用的一套CI/CD系统 (同Jenkins)
##### gitlab-runner

- runner 作用

```
配合gitlab-ci使用.
gitlab管理的工程都会有脚本(build,package.json,webpack等)用于构建.
当这个工程的仓库代码发生变动时
  1. gitlab会将变动通知给gitlab-ci
  2. gitlab-ci会找到并通知工程关联的runner(>=1)
  3. runner会更新代码到本地, 并按照预定的顺序执行脚本
❈ gitlab-runner 用来执行集成脚本的东西.
❈ gitlab是工厂,gitlab-ci是管理中心,runner是工人,集成脚本就是机器.
❈ 工人需要在管理中心进行注册,声明自己是为哪个工程服务的,当工厂有任务时,通知管理中心调度工人操作机器.
```

- runner 分布

```shell
runner可以分布在不同的主机上
同一个主机可以有多个runner
runner和gitlab可以完全分离，映射关系即可
```

- runner 类型

```shell
# 共享型 shared runner
这种runner所有的工程都可以使用，使用系统管理员可以创建
# 指定型 specific runner
这种runner只为指定的工程服务，拥有该工程访问权限就可以进行创建
```



----

**我们安装gitlab-ce和gitlab-runner的时候，它们的版本要相同**

> 避免出现版本导致的兼容问题

----

### 使用docker安装gitlab-ce
##### 本地下载并运行Docker镜像
```shell
# 需要查询3000端口是否被占用
lsof -i tcp:3000
# 如果3000被占用，需要指定一个闲置的端口 「2000 - 60000之间都可以」
# p.s. 大多数环境中的1024以下的端口会被后台进程占用，3000～9999会被网络服务占用，可以设定的大一点；

# dockerhub上有较多的资源，这里选择了 v12.9.0版本
docker run -d -name gitlab -p 55555:80 gitlab/gitlab-ce:12.9.0-ce.0
# 可以通过 --name gitlab 来指定容器的name，可以不设定，他自己会默认起名
# eg. 容器内部:80 >>> 外部:55555
```
##### 启动本地 gitlab 服务
访问上面配置的本地3000端口 http://localhost:3000
- 首次访问时，可能会出现报错；关闭页面，再次访问3000端口会到登陆页面；
- ※ 设置初始的账号密码：root/root123123



### 使用docker安装gitlab-runner

##### 本地下载并运行Docker镜像

```shell
# 因为gitlab-ce使用了v12.9.0版本，这里我们搜索runner也要是12.9.0版本的
# 我们要将gitlab-runner内的卷映射本地，所以我们需要预先创建本地卷；↓↓↓ 以我的环境为例 ↓↓↓
pwd
>>> /Users/work
mkdir gitlab-runner && cd gitlab-runner && mkdir config
# 本地卷地址：/Users/lingk/work/Lenovo/gitlab-runner/config
run -itd -v /Users/work/gitlab-runner/config:/etc/gitlab-runner gitlab/gitlab-runner:v12.9.0
# 等待gitlab-runner下载完毕，检查一下是否可用
docker ps
>>> 复制gitlab-runner容器ID 例如：8cf4466ac88f
docker exec -it 8cf4466ac88f bash
gitlab-runner --help
## 如果指令执行成功，就是gitlab-runner可以正常运行
```



### 注册gitlab-runner







