

## CI/CD

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

----

**我们安装gitlab-ce和gitlab-runner的时候，它们的版本要相同**

> 避免出现版本导致的兼容问题

----
## gitlab-ce
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

## gitlab-runner
### gitlab-runner的类型

- shared ： 运行整个平台项目的作业（gitlab）
- group： 运行特定group下的所有项目的作业（group）
- specific: 运行指定的项目作业（project）
- locked： 无法运行项目作业 
- paused： 不会运行作业

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

```shell
# 注册的方式有两种：一种是交互式的 、一种是命令式的
进入到docker容器中：docker exec -it 8cf4466ac88f bash

## 交互式：注册时，系统问一项，我们就去配一项
		# 输入：gitlab-runner register，开始注册
    Please enter the gitlab-ci coordinator URL (e.g. https://gitlab.com/):
    xxxxxxx(gitlab的url)
    Please enter the gitlab-ci token for this runner:
    xxxxxxx(项目/公用的token)
    Please enter the gitlab-ci description for this runner:
    xxxxxxx(runner的描述)
    Please enter the gitlab-ci tags for this runner (comma separated):
    xxxxxxx(runner的标签，可设置多个，gitlab-ci.yml中会用到)
    Registering runner... succeeded
    runner=4tutaeWW # 会输出这个runner的key值，在pipeline中的日志中可以看到使用的key
    Please enter the executor: parallels, virtualbox ... docker, docker-ssh, shell, ssh:
    xxxxxxx(选择执行方式，我本地使用了shell)
    Runner registered successfully...
    
## 命令式：runner去执行我们的设定（一条命令）
    gitlab-runner register \
      --non-interactive \
      --executor "docker" \
      --docker-image alpine:latest \
      --url "xxxxxxx(gitlab的url)" \
      --registration-token "xxxxxxx(项目/公用的token)" \
      --description "xxxxxxx(runner的描述)" \
      --tag-list "xxxxxxx(runner的标签，可设置多个，gitlab-ci.yml中会用到)" \
      --run-untagged="true" \
      --locked="false" \
      --access-level="not_protected"
```

绑定成功之后，在项目 Setting > CI/CD 中可以查看到已经绑定的runner

### gitlab-runner 命令

```shell
gitlab-runner register  #默认交互模式下使用，非交互模式添加 --non-interactive
gitlab-runner list      #此命令列出了保存在配置文件中的所有运行程序
gitlab-runner verify    #此命令检查注册的runner是否可以连接，但不验证GitLab服务是否正在使用runner。 --delete 删除
gitlab-runner unregister   #该命令使用GitLab取消已注册的runner。
gitlab-runner unregister --url http://gitlab.example.com/ --token t0k3n #使用令牌注销
gitlab-runner unregister --name test-runner #使用名称注销（同名删除第一个）
gitlab-runner unregister --all-runners #注销所有
gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
# --user 指定将用于执行构建的用户
#`--working-directory  指定将使用**Shell** executor 运行构建时所有数据将存储在其中的根目录
gitlab-runner uninstall # 该命令停止运行并从服务中卸载GitLab Runner。
gitlab-runner start     # 该命令启动GitLab Runner服务。
gitlab-runner stop      # 该命令停止GitLab Runner服务。
gitlab-runner restart   # 该命令将停止，然后启动GitLab Runner服务。
gitlab-runner status 		# 此命令显示GitLab Runner服务的状态。当服务正在运行时，退出代码为零；而当服务未运行时，退出代码为非零。
```

## gitlab yml文件示例

```shell
# 文件名为：gitlab-ci.yml，好像在gitlab中自定义
# 可以引入其他的变量

stages:
  - build
  - deploy
 
build:
  stage: build
  tags:
    - build
  only:
    - master
  script:
    - echo "mvn clean "
    - echo "mvn install"

deploy:
  stage: deploy
  tags:
    - deploy
  only:
    - master
  script:
    - echo "hello deploy"
    
# 在script中可以配置钉钉、企微的消息通知， 需要获取 hookurl
# 邮箱在 gitlab.rb 中进行配置
```

启动成功后，不同的stage调用对应的runner，使用tags触发

CI_lint 可以检查语法错误

### 流水线参数举例

| Keyword       |                                                  Description |
| :------------ | -----------------------------------------------------------: |
| script        |                                      运行的Shell命令或脚本。 |
| image         |                                             使用docker映像。 |
| services      |                                         使用docker服务映像。 |
| before_script |                                       在作业运行前运行脚本。 |
| after_script  |                                       在作业运行后运行脚本。 |
| stages        |                                 定义管道中的阶段，运行顺序。 |
| stage         |              为job定义一个阶段，可选，未指定默认为test阶段。 |
| only          |                                         限制创建作业的条件。 |
| except        |                                       限制未创建作业的条件。 |
| rules         | 条件列表，用于评估和确定作业的选定属性，以及是否创建该作业。不能`only`与/ `except`一起使用。 |
| tags          |                                   用于选择Runner的标签列表。 |
|               ||
| allow_failure |                    允许作业失败，失败的job不会影响提交状态。 |
| when          |                                       什么时候开始运行工作。 |
| environment   |                                     作业部署到的环境的名称。 |
| cache         |                             在后续运行之间应缓存的文件列表。 |
| artifacts     |                           成功时附加到作业的文件和目录列表。 |
| dependencies  | 通过提供要从中获取工件的作业列表，限制将哪些工件传递给特定作业。 |
| retry         |                     发生故障时可以自动重试作业的时间和次数。 |
| timeout       |       定义自定义作业级别的超时，该超时优先于项目范围的设置。 |
| parallel      |                                           多个作业并行运行。 |
| trigger       |                                           定义下游管道触发。 |
| include       |                                 允许此作业包括外部YAML文件。 |
| extends       |                                   该作业将要继承的配置条目。 |
| pages         |                               上载作业结果以用于GitLab页面。 |
| variables     |                                   在作业级别上定义作业变量。 |



##  个人思考：

之前是没有接触过完整的devOps的，刚接触我们的CI/CD流程的时候，对这几点比较感兴趣：

- 评论的discussion都会发送到企业微信，邮件中
- 在discussion中输入 /file tag xxx 就可以进行打包
- 打包开始和结束的时候，都会添加discussion

也一直想搞明白这个流程到底是什么样的。。。



[阅读gitlab文档](https://code.lenovows.com/help/user/project/integrations/webhooks) 之后，可以了解到这些推送，评论，合并操作都会触发 webhook.

同时外部也可以调用 [gitlab的Api](Gitlab的Api的文档入口为http://{gitlab_host}/help/api/README.md)

这样，我们只需要委托一个 “中间人” 就可以处理这些事务；

```shell
# “中间人” 的作用
1. 针对部分场景实时转发消息（MR、Discussion、打包开始、结束...）到邮件、企业微信等（jira也可以）
2. 通过不同的场景，来执行不同的命令（eg. 根据写入参数来打包 、/filez tag xxxx ）
# 可以用Jenkins，也可以用node服务
```

猜测大概是这个思路，可能有些地方想的比较简单，有些思路可能是错的，需要实践一下





p.s. 阅读明白之前同事写的 [代码](https://github.com/lenovo-filez)，才能梳理清楚整个过程。。。持续更新  



