# 停止并删除所有的 docker 镜像

    杀死所有正在运行的容器
    docker kill $(docker ps -a -q)
    删除所有已经停止的容器
    docker rm $(docker ps -a -q)
    删除所有未打 dangling 标签的镜
    docker rmi $(docker images -q -f dangling=true)
    删除所有镜像
    docker rmi $(docker images -q)
    强制删除 无法删除的镜像
    docker rmi -f <IMAGE_ID>
    docker rmi -f $(docker images -q)
    ~/.bash_aliases
    杀死所有正在运行的容器.
    alias dockerkill='docker kill $(docker ps -a -q)'
    删除所有已经停止的容器.
    alias dockercleanc='docker rm $(docker ps -a -q)'
    删除所有未打标签的镜像.
    alias dockercleani='docker rmi $(docker images -q -f dangling=true)'
    删除所有已经停止的容器和未打标签的镜像.
    alias dockerclean='dockercleanc || true && dockercleani'

# 安装 lnmp

    进入lnmp, 执行 sudo ./build.sh 脚本文件
    在docker yml配置文件中, 定义了各类容器镜像地址和相关联配置
