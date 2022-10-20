https://blog.51cto.com/u_15414551/4399779


function get(url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function () {
            //即使是404也会进入这个相应函数，所以需要检测状态
            if (req.status == 200) {
                //完成许诺，返回响应文本
                resolve(req.response);
            } else {
                //完成未完成，返回错误
                reject(Error(req.statusText));
            }
        };

        // 发生错误时的相应函数
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // 发送请求
        req.send();
    });
}

var addressUri = "./1.json";
get(addressUri).then(function (response) {
    console.log("Success!", response);
}, function (error) {
    console.error("Failed!", error);
});





  var url = `http://127.0.0.1:5555/api/dl_router/databox/?path_type=ent&neid=${neid}&S=${S}&X-LENOVO-SESS-ID=${X}`
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log(xhr.response);
      } else {
        console.error(xhr.status);
      }
    }
  }
