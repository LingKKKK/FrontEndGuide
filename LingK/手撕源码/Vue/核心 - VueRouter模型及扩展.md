
# 对VueRouter的理解
Vue-Router 是队列模型，从源码中可以看到，切换路由触发对新旧 NavigationGuard数组 对比，筛选出：激活、重用、失活的 NavigationGuard，然后利用迭代器，按序执行路由队列，在队列中触发 GuardHook

window.open() 和 xxx.location.href 都是异步执行, 不会阻塞JS进程
https://juejin.cn/post/6844904040518647815


# 元数据 / 元信息
在实际的开发环境中,我们常需要将一些自定义信息附加在路由上, 例如: 过度名称, 访问权限, 附加信息等.
这些自定义的内容都可以通过meta属性来时实现, 并且他可以在路由地址和导航守卫中被访问到.

```JS 自定义meta标签
  const routes = [
    {
      path: '/posts',
      component: PostsLayout,
      children: [
        {
          path: 'new',
          component: PostsNew,
          meta: { requiresAuth: true } // 只有经过身份验证的用户才能创建帖子
        },
        {
          path: ':id',
          component: PostsDetail
          meta: { requiresAuth: false } // 任何人都可以阅读文章
        }
      ]
    }
  ]
```

一个路由匹配到的所有路由记录, 都会暴露在`$route`对象的matched属性中.
需要遍历这个数组来检查路由记录中的`mate`字段, 并且检查它下面的某些自定义属性.
Vue Router 提供了一个`$route.mate`方法,它是一个非递归合并所有mete字段的方法. 可以直接访问到`mate`属性

```JS 访问自定义的mate属性
  router.beforeEach((to, from) => {
    // 而不是去检查每条路由记录
    // to.matched.some(record => record.meta.requiresAuth)
    if (to.meta.requiresAuth && !auth.isLoggedIn()) {
      // 此路由需要授权，请检查是否已登录
      // 如果没有，则重定向到登录页面
      return {
        path: '/login',
        // 保存我们所在的位置，以便以后再来
        query: { redirect: to.fullPath },
      }
    }
  })
```

# 数据获取
在进入到某个路由时,需要从服务端获取数据. 例如:在渲染用户信息时,需要从服务器获取用户数据.
有两种方式支持: 导航完成前获取,导航完成后获取. 用户体验不同,需要酌情考虑.

## 导航完成前获取
先完成导航, 然后在接下来的组件声明周期函数中获取数据, 在数据获取期间显示“加载中”之类的指示
在 created 周期中执行获取请求, 获取完毕再渲染到组件中.

## 导航完成后获取
导航完成前，在路由进入的守卫中获取数据，在数据获取成功后执行导航.
在组件的 beforeRouteEnter 守卫中执行, 获取完毕执行 next() 继续渲染即可.

```JS 守卫中请求数据渲染
  beforeRouteEnter(to, from, next) {
    getPost(to.params.id, (err, post) => {
      next(vm => vm.setData(err, post))
    })
  },
  async beforeRouteUpdate(to, from) {
    this.post = null
    try {
      this.post = await getPost(to.params.id)
    } catch (error) {
      this.error = error.toString()
    }
  },
```





# 备注

```JS 给王祎的示例
  const routes = [
    {
      path: '/users/:id',
      component: UserDetails,
      beforeEnter: (to, from) => {
        return false
      },
    },
  ]

  const routes = [
    {
      path: '/users/:id',
      component: UserDetails,
      beforeEnter: [removeQueryParams, removeHash],
    },
    {
      path: '/about',
      component: UserDetails,
      beforeEnter: [removeQueryParams],
    },
  ]
```
