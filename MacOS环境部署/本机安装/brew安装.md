# 先清空已经安装过的 nginx php mysql 等

    本机自带的php可以不清, 因为有一些依赖php的应用

# 安装 Nginx

    安装: brew install nginx
    启动: brew services start nginx
    重启: brew services restart nginx
    停止: brew services stop nginx
    查看: cat /usr/local/etc/nginx/nginx.conf
    编辑: vi /usr/local/etc/nginx/nginx.conf

# 安装 Mysql

    安装: brew install mysql
    启动: brew services start mysql
    重启: brew services restart mysql
    停止: brew services stop mysql
    # 设置为开机启动     brew services link mysql
    # 启动命令          brew services start mysql
    # 重新启动命令       brew services restart mysql
    # 停止服务命令       brew services stop mysql
    # 取消开机启动命令    brew services unlink mysql

# 安装 Php

    [https://blog.csdn.net/zz00008888/article/details/109534142]
    启动php-fpm:
      sudo /usr/sbin/php-fpm
      * 必须是在root权限下启动, 需要将default文件进行复制修改. (目录: /private/etc/)
      * php-fpm目录(同启动命令): /usr/sbin/php-fpm
    如果出现端口被占用的情况:
      lsof -i tcp:9000
      sudo kill PID PID PID
