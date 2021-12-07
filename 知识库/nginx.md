## php 输出文字不全

经排查，/var/lib/nginx/tmp/fastcgi 目录没有权限，设置 www 用户 777 权限。然后给/var/lib/nginx 设置 www 用户
