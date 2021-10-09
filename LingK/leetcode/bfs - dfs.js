/**
 * Depth First Search 深度优先搜索
 *    以纵向的维度, 查询dom树, 遍历其所有的子节点之后再遍历其兄弟节点
 * Breadth First Search 广度优先搜索
 *    以横向的维度, 遍历第一层时, 不要深度, 先遍历兄弟节点, 第二轮再遍历子节点
 */

// 深度优先不需要记录所有的节点, 所以占用的空间比较小; 广度优先需要记录所有的节点, 所以占用空间大
// 深度优先采用的是堆栈的形式, 先进后出; 广度优先采用的是队列的形式, 先进先出

function deepFirstSearch(node, nodeList) {
  if (node) {
    nodeList.push(node);
    var children = node.children;
    for (var i = 0; i < children.length; i++)
      //每次递归的时候将 需要遍历的节点 和 节点所存储的数组传下去
      deepFirstSearch(children[i], nodeList);
  }
  return nodeList;
}

function breadthFirstSearch(node) {
  var nodes = [];
  var i = 0;
  if (!(node == null)) {
    nodes.push(node);
    breadthFirstSearch(node.nextElementSibling);
    node = nodes[i++];
    breadthFirstSearch(node.firstElementChild);
  }
  return nodes;
}

function breadthFirstSearch(node) {
  var nodes = [];
  if (node != null) {
    var queue = [];
    queue.unshift(node);
    while (queue.length != 0) {
      var item = queue.shift();
      nodes.push(item);
      var children = item.children;
      for (var i = 0; i < children.length; i++) queue.push(children[i]);
    }
  }
  return nodes;
}
