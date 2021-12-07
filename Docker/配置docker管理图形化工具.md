
# 搭建Portainer可视化界面
## 安装启动
1. 将 portainer 镜像拉取到本地
*docker pull portainer/portainer*
2. 查询要设定的端口是否被占用
*lsof -i tcp:9000*
3. 新建并启动容器
*docker run -d -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer*
  **p.s. 9000:9000 第一个9000是外部监控的端口，第二个9000是docker内部监控的端口**
## Docker关于集群的管理
※ https://blog.csdn.net/u011781521/article/details/80469804
