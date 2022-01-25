[参考](https://segmentfault.com/a/1190000015848917)

# Vue AST语法树

## 什么是AST
AST是抽象语法树, abstract syntax tree; 或者是语法树 syntax tree;
源代码的抽象语法结构的树状表现形式.
vue在mount的过程中, template会被编译成AST语法树.
然后经过generate(将AST语法树转化成render function)得到render函数, 返回vNode节点.
vNode节点是Vue虚拟DOM节点, 里面包含了标签节点文本信息等内容

template模板
```vue
<div id="test">
    请输入：<input type="text" v-model="message"><br/>
</div>
```
parse()
```js
  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce (msg){
  }
  function closeElement (element){
  }
  //调用parseHTML,这里对options的内容省略
  parseHTML(template,options);
```
parse有两部分内容
- options: 配置规则, 对文本的处理, 头部尾部
- parseHtml的方法
  使用while循环对传入的html进行解析
  - 判断script/style标签
  - 判断<!-->注释标签
  - 判断<![]>兼容性标签
  - 判断<!DOCTYPE>标签
  - 判断其他类型的标签 div span 等
  - 判断结束标签
