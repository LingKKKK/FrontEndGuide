# Sass/Scss、Less 是什么?

    Sass:
      动态样式语言, Sass语法属于缩排语法
      有变量, 运算, 嵌套, 混入, 继承, 颜色处理, 函数
    Less:
      动态样式语言, 和Sass一样
      有变量, 运算, 嵌套, 混入, 继承, 颜色处理, 函数
      可以在客户端运行,也可以在服务端运行(NodeJS)

# Sass/Scss Less 的区别

    1.编译环境
      Sass: 在服务端处理, Ruby Dart Node
      Less: 需要引入less.js来处理less输出成css到浏览器
    2.变量符
      Sass: 使用$
      Less: 使用@
    3.输出格式
      Sass: 有4种输出格式: 嵌套格式/展开格式/紧凑格式/压缩格式
      Less: 没有输出设置
    4.条件语句
      Sass: 支持if{}else{}; for{}等
      Less: 不支持
    5.引入外部css
      Sass: @import外部文件时,如果不想生成同名文件, 可以_开头, sass认为是同一文件,不会多次编译
      Less: 和Sass类似
    6.工具库不同
      Sass: compass, 关系和 js jq一样, 对Sass进行增强
      Less: UI组件库 bootstrap

```css
/* 条件示例 */
@mixin txt($weight) {
  color: white;
  @if $weight == bold {
    font-weight: bold;
  } @else if $weight == light {
    font-weight: 100;
  } @else {
    font-weight: normal;
  }
}
.txt1 {
  @include txt(bold);
}
/* 编译结果 */
.txt1 {
  color: white;
  font-weight: bold;
}

/* 循环示例 */
@for $i from 1 to 10 {
  .border-#{$i} {
    border: #{$i}px solid blue;
  }
}

/* 不进行编译 */
@import "_test1.scss";
@import "_test2.scss";
@import "_test3.scss";
```
