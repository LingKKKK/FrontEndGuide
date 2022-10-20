左侧固定, 右侧填充: https://www.jianshu.com/p/1bf476c7f327
六种方式实现水平居中: https://www.cnblogs.com/chengxs/p/11231906.html
webAPI: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onbeforeunload
Promise: https://www.jianshu.com/p/1b63a13c2701
用户账号密码等验证正则: https://www.cnblogs.com/loufangcheng/p/9856355.html
vue-router: https://www.cntofu.com/book/132/pipeline/data.md
好文章: https://medium.com/
sequelize文档: https://sequelize.org/master/class/lib/model.js~Model.html
JSON Web 令牌（JWT）是如何保护 API 的？ https://zhuanlan.zhihu.com/p/107759530
LeetCode按照怎样的顺序来刷题比较好？ https://zhuanlan.zhihu.com/p/104983442
上传一张图片以消除背景 https://www.remove.bg/zh/upload
你都见过什么奇奇怪怪的网站？ https://www.zhihu.com/question/354444082/answer/1037317544
别乱提交代码了，看下大厂 Git 提交规范是怎么做的！https://zhuanlan.zhihu.com/p/100773495
2020年了,再不会webpack敲得代码就不香了(近万字实战) https://zhuanlan.zhihu.com/p/99959392
2020前端基础包过面试题 https://zhuanlan.zhihu.com/p/92590306
 前后端分离就必须 SPA 吗？ https://www.zhihu.com/question/352047943/answer/993693504
(2.4w字,建议收藏)😇原生JS灵魂之问(下), 冲刺🚀进阶最后一公里(附个人成长经验分享)   https://zhuanlan.zhihu.com/p/93528023
继承的类型 https://www.cnblogs.com/humin/p/4556820.html
如何用js判断一个对象是不是Array https://www.cnblogs.com/sakura-sakura/p/6678264.html
JavaScript中各种源码实现（前端面试笔试必备) https://zhuanlan.zhihu.com/p/108289604
回调地狱  https://upload-images.jianshu.io/upload_images/15311104-f36baae9a21490c7.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200
为什么redis在java是同步缓存，而在nodejs是异步缓存？ https://www.zhihu.com/question/22805560
promise和async/await相互转换的讲解: https://www.cnblogs.com/abey/p/7054527.html

https://www.cnblogs.com/jianguo221/p/11838527.html

vue中设置值不刷新变量的bug: https://blog.csdn.net/weixin_33910385/article/details/91710105
js中apply call bind的用法和区别: https://blog.csdn.net/wulex/article/details/81774494

vue  -> getBoundingClientRect
什么是页面长连接????

ie8 不兼容rgba() : https://www.cnblogs.com/cheerful-queen/p/5018539.html
ie兼容表: https://blog.csdn.net/dayu9216/article/details/70225261
ie8兼容写法: *color: red\0;
* 		“-″减号是IE6专有的hack
* 		“\9″ IE6/IE7/IE8/IE9/IE10都生效
* 		“\0″ IE8/IE9/IE10都生效，是IE8/9/10的hack
* 		“\9\0″ 只对IE9/IE10生效，是IE9/10的hack


页面置灰:   filter: grayscale(1);

vue cn https://vue.docschina.org/v2/guide/instance.html
http://www.jqhtml.com/7626.html

将两个元素水平居中排列: 外部设置text-align: center; 然后将两个元素设置成 display: inline-block/inline;

@content https://www.jianshu.com/p/21224080326e

后台三高: 高性能 高并发 高可用
Fullter Google教程: https://www.appbrewery.co/courses/851555/lectures/15448373


https://blog.csdn.net/error4o4/article/details/74783706
https://zhuanlan.zhihu.com/p/82124513
https://zhuanlan.zhihu.com/p/83585199
https://www.zhihu.com/question/48219401/answer/785452193

https://zhuanlan.zhihu.com/p/77713629

https://gist.github.com/   gist

自定义动态图 :https://loading.io/spinner/custom/299984/
https://loading.io/spinner/

将MD文件转成html样式去显示:
https://segmentfault.com/q/1010000006856647?_ea=1154202


公众号里调用一些微信的方法的时候, 无效的原因: https://blog.csdn.net/qq_21119513/article/details/81383371
微信小程序选项卡swiper默认高度150px（让高度实现自适应）怎么解决?
https://blog.csdn.net/qq_38215042/article/details/87517490


sublime是否启动vim模式: https://www.cnblogs.com/flipped/p/5204139.html
正常的配置 : "ignored_packages":["Vintage"],
使用vim的配置 : "ignored_packages":[],

JS高阶面试题: https://coding.imooc.com/class/190.html


打开开发者工具: https://www.cnblogs.com/fundebug/p/20_chrome_devtools_debugging_tips.html


论坛: https://v2ex.com/


JQ 模拟滚动条: http://www.jq22.com/jquery-info4572





真机调试: 打包->

在运行flutter apk的时候，出现了下面的错误
详细错误

Error: ADB exited with exit code 1
Performing Streamed Install

adb: failed to install E:\xxx\xxx\xxxx\build\app\outputs\apk\app.apk: Failure [INSTALL_FAILED_USER_RESTRICTED: Install canceled by user]
Error launching application on MI 8 Lite.

解决方法：
命令行执行以下命令

adb install -r -d E:\xxx\xxx\xxxx\build\app\outputs\apk\app.apk



获取页面中所有参数:
function GetRequest() {
   var url = location.search; //获取url中"?"符后的字串
   var theRequest = new Object();
   if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for(var i = 0; i < strs.length; i ++) {
         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
      }
   }
   return theRequest;
}


abdcef a在b前 cd不相邻 ef不相邻 cd不在最后



* overflow: hidden;
* text-overflow: ellipsis;
* white-space: nowrap;


ali Icon 全下载:
Array.from(document.getElementById("inmain").querySelectorAll(".icon-cover")).forEach(v=>{
	v.querySelector(".cover-item").click()
})
Array.from(document.getElementsByClassName("select_time_dialog")).forEach(function(v) {
  v.querySelectorAll("li").forEach(function(_li) {
    _li.addEventListener('click', function () {
      console.log(1111111);
    });
  })
})


CSS样式穿透: https://www.cnblogs.com/bgwhite/p/9558530.html
IOS设置input disabled属性无效: https://www.cnblogs.com/ws-zhangbo/p/9687006.html
	.veve-cell-input {
          color: #000 !important;
          opacity: 1;
          -webkit-text-fill-color: #000 !important;
        }
        input:disabled {
          color: #000 !important;
          opacity: 1;
          -webkit-text-fill-color: #000 !important;
        }

数字变动: https://gitee.com/mirrors/countUp.js
