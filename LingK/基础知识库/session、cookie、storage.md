# cookie

    1. 存在客户端
    2. 服务器生成, 交给客户端保存
    3. 键值对的形式
    4. 有过期机制

    document.cookie = 'weekday=mon;'
    document.cookie = 'weekday=tue; domain=.weekday.com'
    document.cookie = 'weekday=wed; domain=wed.weekday.com'
    设置:
      1. 不设置domain, 默认为当前域名
      2. 设置domain, 无论值是否为域, 设置成功之后, 值一定为域.
      3. 当前域名可以给子域名/父域名设置cookie; 不能子子, 不能父父, 只能相邻设置
      4. 当前域名不可为同级其他域名设置cookie
    共享:
      1. domain为父域, 所有子域及跨级子域均可以共享cookie
      2. domain为子域, 父域无法共享cookie
    ※ 设置的domain越靠近父域，共享的越宽泛。

    eg. ※ 设置的域： .xxxx.com
      当前域名：weekday.com
      设置 document.cookie = 'weekday=wed; domain=wed.weekday.com', 设置不成功
      当前域名 am.wed.weekday.com
      设置 document.cookie = 'weekday=tue; domain=.weekday.com'，设置成功
      当前域名 tue.weekday.com
      设置 document.cookie = 'weekday=wed; domain=wed.weekday.com', 设置不成功

# session

    1. 存在服务端
    2. 服务器生成, 在服务端保存
    3. 键值对的形式
    4. 有过期机制, 默认30分钟

# localStorage sessionStorage

    1. 5M
    2. 需要手动清理 / 关闭会话页面清除

# Token

    1. token的认证流程和cookie的很类似
    2. 存放在webStorage中, 服务端存在数据库中
    3. token做临时身份认证的令牌; uid + time + sign + params [JWT JSON Web Token]
    4. token不能修改过期时间, 可以存入数据库, 使用时做对比
