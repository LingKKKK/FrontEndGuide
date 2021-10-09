# 容器属性 (父级属性)

    1.flex-direction 决定了主轴的方向
      row: 默认值,水平方向,从左到右
      row-reverse: 水平方向,从右到左
      column: 垂直方向,从上到下
      column-reverse: 垂直方向,从下到上
    2.flex-warp 当一行显示不下,折行的方式
      nowarp: 默认值,不换行,一行压缩排列
      warp: 正常换行,从上到下(顺序添加)
      warp-reverse: 换行,从下到上(在初始行上方添加一行)
    3.flex-flow: 是主轴和换行的缩写
      flex-flow: <flex-direction> <空格> <flex-warp>
    4.justify-content:主轴对齐方式
      flex-start: 默认值,左对齐
      flex-end: 右对齐
      center: 居中
      space-between: 两端对齐, 中间存有间隔
      space-around: 每个项目两侧间隔相等, 环绕式 <平均分割>
      space-evenly: 项目间隔和项目与边框间隔一样, <平均分割加强版>
    5.align-items: 项目在交叉轴的对齐方法
      stretch: 默认值, 如果未设高度或者设为auto, 自动填充整个父级
      flex-start: 交叉轴的起点
      flex-end: 交叉轴的终点
      center: 交叉轴的中点
      baseline: 以第一行文字为基准线
    6.align-content: 定义多项目, 多根轴线的对齐方式, 只有一根轴线时无效
      stretch: 默认值, 占满整个轴线
      flex-start: 交叉轴的起点对齐
      flex-end: 交叉轴的终点对齐
      center: 交叉轴终点对齐
      space-between: 交叉轴的两端对齐
      space-around: 交叉轴环绕对齐

# 项目属性 (子属性)

    order: 决定项目排列顺序, 数值越小越靠前
      设置成数字
    flex-grow: 项目放大比例
      设置成数字, 默认值为1
    flex-strink: 项目缩小比例
      设置成数字, 默认1
    flex-basis: 项目占用主轴的空间
      默认是auto, 原本的大小
    flex: 简写
      flex: <flex-grow> <flex-strink> <flex-basis>
      flex: 1;  === flex: 1 1 auto;
    align-self: 项目单独的对齐方式, 区别与父级, 比父级的优先级要高;
