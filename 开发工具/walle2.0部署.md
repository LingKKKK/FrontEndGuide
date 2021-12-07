目前 walle 部署工具版本是 2.0.1，本服务目前安装在 `10.141.191.193` 服务器上，其 web 对外暴露端口为 `8088`，该端口经过 nginx 反向代理到 `123.206.91.167` 入口服务器。

域名： `http://walle2.jikegz.com`

PS:该域名需要做 host 映射才可以访问：`123.206.91.167 walle2.jikegz.com`

```
部署目录：/root/soft/walle-env
部署依赖：docker、docker-compose、mysql
```

## 部署方式：

#### 安装 docker、docker-compose

安装 docker 方法这里省略，主要说一下 docker-compose：

```
yum install docker-compose
```

安装成功后，切换到 `/root/soft/walle-env` 目录：

在 docker-compose.yml 同级目录新建 walle.env，连接数据库 MYSQL_USER 默认使用 root,如需使用其他用户，需自建用户更改 walle.env 文件

```bash
vim walle.env
```

内容(连接的是 193 服务器的测试数据库，数据库名 walle)：

```
# Set MySQL/Rails environment
MYSQL_USER=root
MYSQL_PASSWORD=314159261qazXSW2mysql
MYSQL_DATABASE=walle
MYSQL_ROOT_PASSWORD=314159261qazXSW2mysql
MYSQL_HOST=10.141.191.193
MYSQL_PORT=3307
```

新建 docker-compose.yml 文件：

```
version: "3"

services:
  web:
    image: alenx/walle-web:2.1
    container_name: walle-nginx
    hostname: nginx-web
    ports:
      # 如果宿主机80端口被占用，可自行修改为其他port(>=1024)
      # 0.0.0.0:要绑定的宿主机端口:docker容器内端口80
      - "8088:80"
    depends_on:
      - python
    networks:
      - walle-net
    restart: always

  python:
    image: alenx/walle-python:2.1
    container_name: walle-python
    hostname: walle-python
    env_file:
      # walle.env需和docker-compose在同级目录
      - ./walle.env
    command: bash -c "cd /opt/walle_home/ && /bin/bash admin.sh migration &&  python waller.py"
    expose:
      - "5000"
    volumes:
      - /home/www/walle_home/plugins/:/opt/walle_home/plugins/
      - /home/www/walle_home/codebase/:/opt/walle_home/codebase/
      - /home/www/walle_home/logs/:/opt/walle_home/logs/
      - /root/.ssh:/root/.ssh/
    #depends_on:
    #  - db
    networks:
      - walle-net
    restart: always

networks:
  walle-net:
    driver: bridge
```

新建对应目录：

```bash
mkdir -p /home/www/walle_home/logs
mkdir -p /home/www/walle_home/codebase
mkdir -p /home/www/walle_home/plugins
```

## 一键启动（快速体验）

```bash
docker-compose up -d && docker-compose logs -f
# 打开浏览器localhost:8088
```

#### 对应的 docker-compose 常用操作命令：

```bash
# 构建服务
docker-compose build
# 启动服务,启动过程中可以直接查看终端日志，观察启动是否成功
docker-compose up
# 启动服务在后台，如果确认部署成功，则可以使用此命令，将应用跑在后台，作用类似 nohup python waller.py &
docker-compose up -d
# 查看日志,效果类似 tail -f waller.log
docker-compose logs -f
# 停止服务,会停止服务的运行，但是不会删除服务所所依附的网络，以及存储等
docker-compose stop
# 删除服务，并删除服务产生的网络，存储等，并且会关闭服务的守护
docker-compose down
# 重启walle所有服务
docker-compose restart
```

## 系统升级

建议一段时间后进行升级操作，相关命令：

```bash
# 在193宿主机上，查看walle相关的容器
docker ps

# 进入walle-python容器
docker exec -ti sh walle-python /bin/bash

# 进入walle项目目录
cd /opt/walle-home

# 运行升级命令
sh admin.sh upgrade

# 重启服务
sh admin.sh restart

# 退出当前容器
exit

# 停掉当前依赖容器环境
docker-compose down

# 再次启动
docker-compose up -d
```
