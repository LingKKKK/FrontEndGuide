## 安装 brew

```bash
/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"
```

HomeBrew 添加第三方 php 仓库支持：

```
brew tap shivammathur/homebrew-php
```

具体的可以看：https://github.com/shivammathur/homebrew-php

然后就可以安装了！

## 安装 php 版本

```
brew install shivammathur/php/php@7.0
brew install shivammathur/php/php@7.1
brew install shivammathur/php/php@7.2
brew install shivammathur/php/php@7.3
brew install shivammathur/php/php@7.4
brew install shivammathur/php/php@8.0
```

php7.0 安装完毕后（无需操作）：

```
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php7_module /usr/local/opt/php@7.0/lib/httpd/modules/libphp7.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/7.0/

php@7.0 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have php@7.0 first in your PATH, run:
  echo 'export PATH="/usr/local/opt/php@7.0/bin:$PATH"' >> /Users/yangteng/.bash_profile
  echo 'export PATH="/usr/local/opt/php@7.0/sbin:$PATH"' >> /Users/yangteng/.bash_profile

For compilers to find php@7.0 you may need to set:
  export LDFLAGS="-L/usr/local/opt/php@7.0/lib"
  export CPPFLAGS="-I/usr/local/opt/php@7.0/include"


To start shivammathur/php/php@7.0:
  brew services start shivammathur/php/php@7.0
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php@7.0/sbin/php-fpm --nodaemonize
```

php7.1 安装完毕后（无需操作）：

```
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set php_ini /usr/local/etc/php/7.1/php.ini system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set php_dir /usr/local/share/pear@7.1 system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set doc_dir /usr/local/share/pear@7.1/doc system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set ext_dir /usr/local/lib/php/pecl/20160303 system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set bin_dir /usr/local/opt/php@7.1/bin system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set data_dir /usr/local/share/pear@7.1/data system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set cfg_dir /usr/local/share/pear@7.1/cfg system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set www_dir /usr/local/share/pear@7.1/htdocs system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set man_dir /usr/local/share/man system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set test_dir /usr/local/share/pear@7.1/test system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear config-set php_bin /usr/local/opt/php@7.1/bin/php system
==> /usr/local/Cellar/php@7.1/7.1.33_2/bin/pear update-channels
==> Caveats
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php7_module /usr/local/opt/php@7.1/lib/httpd/modules/libphp7.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/7.1/

php@7.1 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have php@7.1 first in your PATH, run:
  echo 'export PATH="/usr/local/opt/php@7.1/bin:$PATH"' >> /Users/yangteng/.bash_profile
  echo 'export PATH="/usr/local/opt/php@7.1/sbin:$PATH"' >> /Users/yangteng/.bash_profile

For compilers to find php@7.1 you may need to set:
  export LDFLAGS="-L/usr/local/opt/php@7.1/lib"
  export CPPFLAGS="-I/usr/local/opt/php@7.1/include"


To start shivammathur/php/php@7.1:
  brew services start shivammathur/php/php@7.1
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php@7.1/sbin/php-fpm --nodaemonize
==> Summary
🍺  /usr/local/Cellar/php@7.1/7.1.33_2: 509 files, 63MB, built in 7 minutes 54 seconds
```

php7.2 安装完毕后（无需操作）：

```
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set php_ini /usr/local/etc/php/7.2/php.ini system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set php_dir /usr/local/share/pear@7.2 system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set doc_dir /usr/local/share/pear@7.2/doc system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set ext_dir /usr/local/lib/php/pecl/20170718 system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set bin_dir /usr/local/opt/php@7.2/bin system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set data_dir /usr/local/share/pear@7.2/data system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set cfg_dir /usr/local/share/pear@7.2/cfg system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set www_dir /usr/local/share/pear@7.2/htdocs system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set man_dir /usr/local/share/man system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set test_dir /usr/local/share/pear@7.2/test system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear config-set php_bin /usr/local/opt/php@7.2/bin/php system
==> /usr/local/Cellar/php@7.2/7.2.34_2/bin/pear update-channels
==> Caveats
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php7_module /usr/local/opt/php@7.2/lib/httpd/modules/libphp7.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/7.2/

php@7.2 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have php@7.2 first in your PATH, run:
  echo 'export PATH="/usr/local/opt/php@7.2/bin:$PATH"' >> /Users/yangteng/.bash_profile
  echo 'export PATH="/usr/local/opt/php@7.2/sbin:$PATH"' >> /Users/yangteng/.bash_profile

For compilers to find php@7.2 you may need to set:
  export LDFLAGS="-L/usr/local/opt/php@7.2/lib"
  export CPPFLAGS="-I/usr/local/opt/php@7.2/include"


To start shivammathur/php/php@7.2:
  brew services start shivammathur/php/php@7.2
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php@7.2/sbin/php-fpm --nodaemonize
==> Summary
🍺  /usr/local/Cellar/php@7.2/7.2.34_2: 510 files, 75MB, built in 9 minutes 33 seconds
```

php7.3 安装完毕后（无需操作）：

```
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set php_ini /usr/local/etc/php/7.3/php.ini system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set php_dir /usr/local/share/pear@7.3 system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set doc_dir /usr/local/share/pear@7.3/doc system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set ext_dir /usr/local/lib/php/pecl/20180731 system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set bin_dir /usr/local/opt/php@7.3/bin system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set data_dir /usr/local/share/pear@7.3/data system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set cfg_dir /usr/local/share/pear@7.3/cfg system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set www_dir /usr/local/share/pear@7.3/htdocs system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set man_dir /usr/local/share/man system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set test_dir /usr/local/share/pear@7.3/test system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear config-set php_bin /usr/local/opt/php@7.3/bin/php system
==> /usr/local/Cellar/php@7.3/7.3.29_2/bin/pear update-channels
==> Caveats
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php7_module /usr/local/opt/php@7.3/lib/httpd/modules/libphp7.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/7.3/

php@7.3 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have php@7.3 first in your PATH, run:
  echo 'export PATH="/usr/local/opt/php@7.3/bin:$PATH"' >> /Users/yangteng/.bash_profile
  echo 'export PATH="/usr/local/opt/php@7.3/sbin:$PATH"' >> /Users/yangteng/.bash_profile

For compilers to find php@7.3 you may need to set:
  export LDFLAGS="-L/usr/local/opt/php@7.3/lib"
  export CPPFLAGS="-I/usr/local/opt/php@7.3/include"


To start shivammathur/php/php@7.3:
  brew services start shivammathur/php/php@7.3
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php@7.3/sbin/php-fpm --nodaemonize
==> Summary
🍺  /usr/local/Cellar/php@7.3/7.3.29_2: 512 files, 74.9MB, built in 8 minutes 41 seconds
```

php7.4 安装完毕后（无需操作）：

```
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php7_module /usr/local/opt/php@7.4/lib/httpd/modules/libphp7.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/7.4/

php@7.4 is keg-only, which means it was not symlinked into /usr/local,
because this is an alternate version of another formula.

If you need to have php@7.4 first in your PATH, run:
  echo 'export PATH="/usr/local/opt/php@7.4/bin:$PATH"' >> /Users/yangteng/.bash_profile
  echo 'export PATH="/usr/local/opt/php@7.4/sbin:$PATH"' >> /Users/yangteng/.bash_profile

For compilers to find php@7.4 you may need to set:
  export LDFLAGS="-L/usr/local/opt/php@7.4/lib"
  export CPPFLAGS="-I/usr/local/opt/php@7.4/include"


To start shivammathur/php/php@7.4:
  brew services start shivammathur/php/php@7.4
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php@7.4/sbin/php-fpm --nodaemonize
```

php8.0 安装完毕后（无需操作）：

```
To enable PHP in Apache add the following to httpd.conf and restart Apache:
    LoadModule php_module /usr/local/opt/php/lib/httpd/modules/libphp.so

    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

Finally, check DirectoryIndex includes index.php
    DirectoryIndex index.php index.html

The php.ini and php-fpm.ini file can be found in:
    /usr/local/etc/php/8.0/

To start shivammathur/php/php:
  brew services start shivammathur/php/php
Or, if you don't want/need a background service you can just run:
  /usr/local/opt/php/sbin/php-fpm --nodaemonize
==> Summary
🍺  /usr/local/Cellar/php/8.0.9: 495 files, 77.9MB, built in 8 minutes 45 seconds
```

## 修改 php-fpm 启动端口：

```
# 修改9000为9070
vim /usr/local/etc/php/7.0/php-fpm.d/www.conf

# 修改9000为9071
vim /usr/local/etc/php/7.1/php-fpm.d/www.conf

# 修改9000为9072
vim /usr/local/etc/php/7.2/php-fpm.d/www.conf

# 修改9000为9073
vim /usr/local/etc/php/7.3/php-fpm.d/www.conf

# 修改9000为9074
vim /usr/local/etc/php/7.4/php-fpm.d/www.conf

# 修改9000为9080
vim /usr/local/etc/php/8.0/php-fpm.d/www.conf
```

开机启动：

```
brew unlink php@7.0 && brew link --force php@7.0
#brew unlink php@7.1 && brew link --force php@7.1
#brew unlink php@7.2 && brew link --force php@7.2
#brew unlink php@7.3 && brew link --force php@7.3
brew unlink php@7.4 && brew link --force php@7.4
#brew unlink php@8.0 && brew link --force php@8.0
```

启动：

```
brew services start php@7.0
#brew services start php@7.1
#brew services start php@7.2
#brew services start php@7.3
brew services start php@7.4
#brew services start php@8.0
```

# 安装 redis 扩展

```
/usr/local/opt/php\@7.0/bin/pecl install redis
/usr/local/opt/php\@7.1/bin/pecl install redis
/usr/local/opt/php\@7.2/bin/pecl install redis
/usr/local/opt/php\@7.3/bin/pecl install redis
/usr/local/opt/php\@7.4/bin/pecl install redis
/usr/local/opt/php\@8.0/bin/pecl install redis
```

## 配置文件：

```
/usr/local/etc/php/7.0/php.ini
/usr/local/etc/php/7.1/php.ini
/usr/local/etc/php/7.2/php.ini
/usr/local/etc/php/7.3/php.ini
/usr/local/etc/php/7.4/php.ini

/usr/local/etc/php/7.0/php-fpm.conf
/usr/local/etc/php/7.1/php-fpm.conf
/usr/local/etc/php/7.2/php-fpm.conf
/usr/local/etc/php/7.3/php-fpm.conf
/usr/local/etc/php/7.4/php-fpm.conf

/usr/local/etc/php/7.0/php-fpm.d/www.conf
/usr/local/etc/php/7.1/php-fpm.d/www.conf
/usr/local/etc/php/7.2/php-fpm.d/www.conf
/usr/local/etc/php/7.3/php-fpm.d/www.conf
/usr/local/etc/php/7.4/php-fpm.d/www.conf
```

修改 php-fpm 配置：

```
echo "\npm.status_path = /php70-fpm-status\nping.path = /php70-fpm-ping\nping.response = pong" >> /usr/local/etc/php/7.0/php-fpm.d/www.conf

echo "\npm.status_path = /php71-fpm-status\nping.path = /php71-fpm-ping\nping.response = pong" >> /usr/local/etc/php/7.1/php-fpm.d/www.conf

echo "\npm.status_path = /php72-fpm-status\nping.path = /php72-fpm-ping\nping.response = pong" >> /usr/local/etc/php/7.2/php-fpm.d/www.conf

echo "\npm.status_path = /php73-fpm-status\nping.path = /php73-fpm-ping\nping.response = pong" >> /usr/local/etc/php/7.3/php-fpm.d/www.conf

echo "\npm.status_path = /php74-fpm-status\nping.path = /php74-fpm-ping\nping.response = pong" >> /usr/local/etc/php/7.4/php-fpm.d/www.conf
```
