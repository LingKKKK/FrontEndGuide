[Wiki](https://wiki.lenovows.com/pages/viewpage.action?pageId=8180857)

# 目的

```shell
# Portal: 传送门, 将子组件渲染到父组件之外的节点
有时,组件模板的一部分逻辑是属于这个组件的,但是从技术角度来看,最好将模板的这一部分移到DOM其他的位置;
在不使用DOM树的情况下,将它从深度嵌套的位置上剥离出来;
所以在Vue3.0中,有teleport;React中有portal;
在Vue2.0中没有类似的功能,所以制作了@filez/portal;
我们的工程只有两大类形态:页面+弹窗;很多功能都是基础弹窗来实现的;但是弹窗和主体页面过度耦合,增加维护和开发成本;
主体页面其实只关心弹窗操作之后的回调数据,Portal就是做这件事的;
利用Vue的extend,js的appendChild,将需要的组件append到body下,实现弹窗和主体页面的充分解耦;利用Promise实现函数化, 然函数式的流程成为前端逻辑的真正基础;

将弹窗从一个UI组件, 抽离成一个业务组件;
```

## 需要了解源码, 及如何透传参数的
