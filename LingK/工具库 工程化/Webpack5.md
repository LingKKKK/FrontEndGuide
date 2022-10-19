webpack5 优化构建速度

[参考](http://events.jianshu.io/p/a6599c084627)

[官网](https://webpack.docschina.org/)

# webpack中的几个路径

## 相对路径和绝对路径
相对路径: 表示文件以当前路径为起点,相较于当前目录位置而被指向或引用的文件路径
/ 表示当前文件所在目录的根目录
./ 表示当前文件所在目录
../ 表示当前文件夹所在目录的上一级目录
绝对路径: 在当前文件的电脑硬盘路径,物理地址

## entry入口路径配置
功能: 用于指定webpack在打包时依据哪个文件作为入口
默认值: ./src/index.js
注意: entry的相对路径地点并非以webpack.config.js所在路径为起点,而是package所在的路径为起点
理解: 将入口文件打包再引入模板html文件,从而完成对js文件的打包

## output出口路径配置
filename
  功能:用于指定webpack打包之后输出的主文件名称,将会输出到path指定的目录下
  默认值: ./dist/main.js
  注意: filename的值必须是一个相对路径,不能是绝对路径
path
  功能: 用于指定webpack打包之后生成文件存放的目录
  默认值: ./dist
  注意: path属性的值是一个绝对路径,通过 path.resolve 方法解析输出一个绝对路径
  `path: path.resolve(__dirname, "../build"),`
publicPath
  功能: publicPath用于对webpack打包之后得到的`静态资源前`进行`路径拼接`
  默认值: 空字符串""
### 为什么 dev 需要配置 publicPath 为'/'?
在本地通过 webpack-server-dev 启动本地服务时,浏览器会基于WDS提供的静态服务加载资源,例如index.html.
浏览器在解析html的时候,遇到link和script标签回去解析对应的css和js资源
例如`<script defer="" src="/js/bundle.js"></script>`
浏览器请求的地址为: `http://localhost:8080 + output.publicPath + js/bundle.js`
如果不配置publicPath,拼接的路径就缺少/ `http://localhost:8080/js/bundle.js`
### 为什么 build 需要配置 publicPatch 为 ./?
打包之后,由于请求资源时是在本地打开的,如果不使用相对路径会从磁盘空间查找,一定会找不到.

## devServer中的路径配置
publicPath(v4中配置,v5中已经没有此配置)
  功能:指定本地服务在打包时获取打包后资源所在路径
  默认值:/
  注意:devServer中的publicPath很少主动配置.
主要的作用就是指定项目在浏览器中打开后默认去本地服务器上的哪个文件夹获取打包之后的文件资源.
如果不配置会读默认值. 代表直接去当前服务器的根目录下获取打包之后的资源即可
`http://localhost:8080/`
如果将devServer.publicPath的值配置为：'/project',那么此时获取资源的路径是：
`http://localhost:8080/project` 代表直接去当前服务器的project目录下获取打包之后的资源
**建议output.publicPath和devServer.publicPath值一致,否则会造成资源请求失败**

contentBase(v4中配置,v5中已经没有此配置)
如果使用webpack打包资源前,在index.html中引入了一些三方静态资源,而这些静态资源并不会被webpack依赖,所以不会被webpack打包到dist目录下,但是本地WDS启动本地服务后,index.html加载时,还是按照相对路径去加载这些静态资源,此时就一定会出错.
```html 打包前的index.html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>webpack module</title>
	/* 引入第三方静态资源 等于是直接读取的本地文件*/
	<script src="./vender/vender.js"></script>
  </head>
  <body>
	  <div id="app"></div>
  </body>
</html>
```
启动DWS服务,会基于当前域请求资源: `http://localhost:8080/vender/vender.js`
由于此文件并不在dist文件夹下,所以本地服务器是无法读取到资源的.
在webpack4中,需要配置devServer.contentBase,告知三方资源的请求路径
```js
devServer: {
	contentBase: path.resolve(__dirname,"./vender")  // 绝对路径
}
```
在webpack5中,我们需要配置static中的directory和publicPath属性
```js
devServer: {
  static: {
    directory: path.resolve(__dirname, './vender'),
    publicPath: '/vender'
  }
}
```
