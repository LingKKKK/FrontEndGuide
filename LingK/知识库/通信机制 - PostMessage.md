# 工作原理
  [参考](http://www.javashuo.com/article/p-bosfrbih-cd.html)
  postMessage依赖结构化克隆数据,将消息从一个JavaScript空间复制到另一个JavaScript空间.
  结构化克隆分为两个部分:
    1.在消息上执行,对消息进行序列化
    2.在接收方任务队列中添加一个任务,对消息进行反序列化

# postMessage
postMessage是html5引入的API
postMessage方法允许不同源的脚本采用异步的方式有效的通信
可以实现跨文本文档/多窗口/跨域消息传递.
用于:*多窗口见得数据通信*

# 使用方法
`otherWindow.postMessage(message, targetOrigin, [transfer]);`
*otherWindow*
窗口的一个引用,比如iframe的contentWindow属性,或者执行window.open返回的窗口对象,以及window.frames等
*message*
发送到其他窗口的数据(任意样式,自动深拷贝)
*targetOrigin*
目标窗口,指定哪些窗口可以接受到信息
可以选择同源窗口'/',可以选择任意窗口'*'
*transfer*
转移权限

# 示例
```js
  window.addEventListener("message", receiveMessage, false) ;
  function receiveMessage(event) {
    var origin= event.origin;
    console.log(event);
  }
```
**event** 对象有4个重要的对象
*data* 其他窗口发送过来的消息对象
*type* 发送的消息类型(可以自定义)
*source* 发送消息的窗口对象(来源)
*origin* 发送消息窗口的源

# 使用场景

一 **跨域通信** GET请求和POST请求
```html 父窗口创建跨域iframe并发起请求
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>跨域POST消息发送</title>
    <script type="text/JavaScript">
      // sendPost 通过postMessage实现跨域通信将表单信息发送到 moweide.gitcafe.io上,
      // 并取得返回的数据
      function sendPost() {
        // 获取id为otherPage的iframe窗口对象
        var iframeWin = document.getElementById("otherPage").contentWindow;
        // 向该窗口发送消息
        iframeWin.postMessage(document.getElementById("message").value,
          'http://moweide.gitcafe.io');
      }
      // 监听跨域请求的返回
      window.addEventListener("message", function(event) {
        console.log(event, event.data);
      }, false);
    </script>
  </head>
  <body>
    <textarea id="message"></textarea>
    <input type="button" value="发送" onclick="sendPost()">
    <iframe
      src="http://moweide.gitcafe.io/other-domain.html" id="otherPage"
      style="display:none"></iframe>
  </body>
</html>
```

```html 子窗口接口并处理消息
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>POST Handler</title>
    <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
    <script type="text/JavaScript">
      window.addEventListener("message", function( event ) {
        // 监听父窗口发送过来的数据向服务器发送post请求
        var data = event.data;
        $.ajax({
          // 注意这里的url只是一个示例.实际练习的时候你需要自己想办法提供一个后台接口
          type: 'POST',
          url: 'http://moweide.gitcafe.io/getData',
          data: "info=" + data,
          dataType: "json"
        }).done(function(res){
          //将请求成功返回的数据通过postMessage发送给父窗口
          window.parent.postMessage(res, "*");
        }).fail(function(res){
          //将请求失败返回的数据通过postMessage发送给父窗口
          window.parent.postMessage(res, "*");
        });
      }, false);
    </script>
  </head>
</html>
```

二 **webworker**
```js webworker实例,在主进程和子进程中通信
  // main.js
  if(window.Worker) {
    var myWorker = new Worker('http://xxx.com/worker.js');
    // 发送消息
    first.onchange = function() {
      myWorker.postMessage([first.value, second.value]);
      console.log("Message posted to worker");
    }
    second.onchange = function() {
      myWorker.postMessage([first.value,second.value]);
      console.log('Message posted to worker');
    }
    // 主线程 监听onmessage以响应worker回传的消息
    myWorker.onmessage = function (e) {
      var textContent = e.data;
      console.log("message received from worker");
    }
  }
  // worker.js
  // 内置selfduixiang,,代表子线程本身, worker内部要加载其他脚本,可通过importScripts()方法
  onmessage = function(e) {
    console.log("message received from main script");
    var workerResult = "Result: " + (e.data[0] * e.data[1]);
    console.log("posting message\back to main script");
    postMessage(workerResult);
  }
```

