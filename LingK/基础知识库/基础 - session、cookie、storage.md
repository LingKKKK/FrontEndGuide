# cookie

    1. 存在客户端
    2. 服务器生成, 交给客户端保存
    3. 键值对的形式
    4. 有过期机制

# session

    1. 存在服务端
    2. 服务器生成, 在服务端保存
    3. 键值对的刑事
    4. 有过期机制, 默认30分钟

# localStorage sessionStorage

    1. 5M
    2. 需要手动清理 / 关闭会话页面清除

# Token

    1. token的认证流程和cookie的很类似
    2. 存放在webStorage中, 服务端存在数据库中
    3. token做临时身份认证的令牌; uid + time + sign + params [JWT JSON Web Token]
    4. token不能修改过期时间, 可以存入数据库, 使用时做对比
