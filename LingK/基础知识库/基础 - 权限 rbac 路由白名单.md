# 定义

    是vue核心集成的内容, 主要的内容就是解决单页面的导航功能;
    路由是webapp切换程序的枢纽
    最早的路由出现在服务端, 通过请求解析html, 再返回html文档

# 路由的优势

    提升用户体验和降低维护成本
    减少异步加载和ajax请求, 从而减少页面等待, 让交互更流畅
    减少页面切换的性能问题, 不需要刷新所有的dom, 降低内存消耗
    开发成本较低, 前后端分离, 自由程度更高

# 路由模式

    hash模式:
      1. #后面的内容,不会发送给服务端,仅在本地监听
      2. #后,就是hash值的变化,因为不会发送请求,所以不会刷新页面,仅调用本地的组件/页面
      3. 每次hash变化时,都会触发 hashChange 方法,可以绑定监听,做dom操作
      4. 在ie上做过兼容,修改url,不刷新页面,可以做到监听url的变化
    history模式:
      利用html5 history中新增的 pushState replaceState方法
      前进和后退都没有问题, 刷新的时候, 页面的内容会丢失; 可使用sessionStorage来解决;

    * hash模式下, 再次访问不会触发http请求, 锚点不同不会触发新请求

# 路由传参的方式

```JavaScript
		var router = new VueRouter({
			// params
			routers: [
				{ path: '/login/:id/:name', component: login }, // 不传参数的话, 刷新时页面会丢失
				{ name: 'register', path: '/register/:id/:name', component: register }
			],
			// query
			routers: [
				{ path: '/login', component: login }, // 不传参数的话, 刷新时页面会丢失
				{ name: 'register', path: '/register', component: register }
			]
		})
```

    params:
    	只能通过name来引入路由, 如果使用path会返回undefined
    	url中传参按照path定义的格式传入
    query:
    	既可通过name传参也可以通过path传参
    	url中传参使用 ?&分割参数

# 路由守卫 == 路由钩子

    全局前置守卫:
        router.beforeEach(from to next)
    全局后置守卫:
        router.afterEach(from to)
    全局解析守卫:
        组件内守卫和异步组件解析时, 触发解析守卫
        router.beforeResolve(from, to, next)
    路由独享守卫:
        在路由表中配置
        beforeEnter: (from, to, next) => {}
    组件内的守卫:
        类似其他钩子函数, 在组件内调用
        beforeRouteEnter: (from, to, next) 进入时触发
        beforeRouteUpdata: (from, to, next) 更新时触发
        beforeRouteLeave: (from, to, next) 离开时触发

# RBAC

Role-Based Access Control: 以角色为基础的访问控制

## 路由白名单的思路

    1.动态路由表
      - 在身份切换或者获取不到身份的时候重新请求路由
      router.beforeEach  --检查Token-->  确保Token无误  --获取动态路由-->  展示身份对应的路由
    2.静态路由表
      id auth component 等自定义的属性标签
    3.每次访问接口的时候,都会携带token,通过token判断可访问性

## 在框架中如何做权限校验的

    均可基于权限中心/token去实施
    1. 操作权限
       通过权限中心控制
       不同的框架应该有权限控制的指令 (vue: v-permission)
    2. 访问权限
       静态/动态路由 mate/可显示性
       页面访问权限

## 动态路由

    路由的内容由后台传入, 在前端进行渲染
    * base64 MD5 WebStorage
