
[源码简析](https://blog.csdn.net/qq_42308316/article/details/108222953)


# snabbom核心
    1 @h函数 创建JavaScript对象(vNode)描述真实的dom元素
    2 @init函数 设置模块,创建patch方法
    3 @patch函数 比较新旧节点,对比差异
    4 对比差异之后,将内容更新到真实的DOM元素上

# 目录层级
│ h.ts	               h() 函数，用来创建 VNode
│ hooks.ts             所有钩子函数的定义
│ htmldomapi.ts        对 DOM API 的包装
│ is.ts                判断数组和原始值的函数
│ jsx-global.d.ts      jsx 的类型声明文件
│ jsx.ts               处理 jsx
│ snabbdom.bundle.ts   入口，已经注册了模块
│ snabbdom.ts          初始化，返回 init/h/thunk
│ thunk.ts             优化处理，对复杂视图不可变值得优化
│ tovnode.ts           DOM 转换成 VNode
│ vnode.ts             虚拟节点定义
│
├─helpers
│ attachto.ts          定义了 vnode.ts 中 AttachData 的数据结构
│
└─modules              所有模块定义
   attributes.ts
   class.ts
   dataset.ts
   eventlisteners.ts
   hero.ts              example 中使用到的自定义钩子
	 module.ts            定义了模块中用到的钩子函数 props.ts
   style.ts
