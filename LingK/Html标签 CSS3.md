# html5 新增标签

    新增了一些语义化标签:
      header footer nav section aside audio video 等
    块元素(大多数是结构性标签)
      默认的 display: block
      div h ul li table
    行内元素(大多数是描述性标签)
      默认的 display: inline
      span a b strong b img u input

# css3 新增标签

    新增内容:
      过渡: transition
      动画: animation
      形状转换: transform
      选择器: nth-child last-child
      阴影: box-shadow
      边框: border-image
      渐变
      Flex布局
      媒体查询: media
    可继承的属性:
      和字相关的属性(除了text-align居中,text-indent缩进),都可继承
    盒模型:
      box-sizing: border-box; 怪异盒模型: border padding 计算在width内
      box-sizing: content-box; W3C标准盒模型: border padding 不计算在width内

# mate 标签

    keywords: 定义文档关键词, 用于SEO搜索
    description: 定义页面描述信息
    author: 定义页面开发者信息
    refresh: 定义间隔刷新页面
    viewport: 用于移动端的优先显示; 定义缩放值的相关信息

```JavaScript
  <meta name="keywords" content="HTML, CSS, XML, XHTML, JavaScript">
  <meta name="description" content="Free Web tutorials on HTML and CSS">
  <meta name="author" content="Hege Refsnes">
  <meta http-equiv="refresh" content="30">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" ">
```

# 各类浏览器的私有前缀

    火狐: -moz-
    谷歌: -webkit-
    欧朋: -o-
    IE:  -ms-

# 遮罩,渐变

    mask
    使用css做图片遮罩. 用到了 mask 属性,控制渐变
    1. mask可以引入图片, 让图片进行定位
    2. 引入background, 然后再用mask做线性渐变

```css
.box {
  background: url("./flag.jfif") no-repeat;
  background-size: cover;
  mask: linear-gradient(110deg, #000 10%, transparent 70%, transparent);
  -webkit-mask: linear-gradient(110deg, #000 10%, transparent 70%, transparent);
}
```
# CSS样式优先级
    1.css加载时, 新的属性会覆盖旧属性;
    2.@import / link 谁后加载谁的优先级较高
    3.js修改css样式的优先级更高一点, 因为它等待dom渲染完毕之后再进行修改
```shell
    # css样式的优先级是根据权重来判断的
    第一等级: 内联样式 style="", 权值为: 1,0,0,0
    第二等级: ID选择器 id="", 权值为: 0,1,0,0
    第三等级：代表 class|伪类|属性选择器, .class|:hover|:[type], 权值为: 0,0,1,0
    第四等级：代表 标签|伪元素选择器, ::after|::fist-inline, 权值为: 0,0,0,1
    第五等级: 通用选择器|子选择器, * > + 等, 权值为: 0,0,0,0
    # 权值的计算
    权值 = 第一等级 * 个数, 第二等级 * 个数, 第三等级 * 个数, 第四等级 * 个数 = (x,x,x,x)
    # 比较的方法
    1.存在"!important"时, 无条件优先
    2.一级大的优先,一级相同对比二级,依次向下对比
    3.权重都相同时,旧值覆盖新值
```
