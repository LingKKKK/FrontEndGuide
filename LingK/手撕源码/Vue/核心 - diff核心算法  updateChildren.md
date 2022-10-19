updateChildren 方法对比差异, 是 Vue-diff 的核心算法, 和 React-diff 的差异就在这个算法中

只有新旧节点都存在, 且均不为空时, 才会调用 updateChildren 方法
所以, `updateChildren`方法是同层级下的比较

```js
function updateChildren(
  parentElm,
  oldCh,
  newCh,
  insertedVnodeQueue,
  removeOnly
) {
  let oldStartIdx = 0; // old_开始指针
  let newStartIdx = 0; // new_开始指针
  let oldEndIdx = oldCh.length - 1; // old_结束指针
  let oldStartVnode = oldCh[0]; // old_开始节点
  let oldEndVnode = oldCh[oldEndIdx]; // old_结束节点
  let newEndIdx = newCh.length - 1; // new_结束指针
  let newStartVnode = newCh[0]; // new_开始节点
  let newEndVnode = newCh[newEndIdx]; // new_结束节点
  /**
   * @oldKeyToIdx 是一个map循环; key是v-bind:key的值,value是对应的vnode; => 可以通过key找到对应且唯一的vnode
   */
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

  /**
   * @removeOnly
   * 是一个特殊的标志, 只有在<transition-group>中才会使用
   * 为了确保移除的元素在离开过渡时保持正确的位置
   */

  const canMove = !removeOnly;

  if (process.env.NODE_ENV !== "production") {
    /**
     * @checkDuplicateKeys 检查一组元素的key值是否重复;
     * @警告 如果存在重复会报warning: 检测到重复的密钥：“${key}”。这可能会导致更新错误。
     */
    checkDuplicateKeys(newCh); // 检查新节点的key值是否重复
    // 可以正常运行,但是会警告,不会阻断进程
  }

  // oldStartIdx oldEndIdx newStartIdx newEndIdx 两两做比较,一共有4中结果

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // 如果`旧起始节点`不存在, 指针向右顺延一位, 取下一个节点
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]; // 如果`旧结束节点`不存在, 指针向左顺延一位, 取上一个节点
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      /**
       * @场景 新旧start节点为sameVnode, 对这组节点进行patch变更, 然后新旧指针同时向右移;
       */
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      /**
       * @场景 新旧end节点为sameVnode, 对这组节点进行patch变更, 然后新旧指针同时向左移;
       */
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      /**
       * @场景 旧start节点和新end节点为sameVnode, 将旧start移到旧end后面, 然后对这两组节点进行patch;
       * @because 在新队列中, 旧start在旧end后面, 需要将旧start放置在旧end后面;
       * 新指针左移, 旧指针右移
       */
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
      canMove &&
        nodeOps.insertBefore(
          parentElm,
          oldStartVnode.elm,
          nodeOps.nextSibling(oldEndVnode.elm)
        );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      /**
       * @场景 旧end节点和新start节点为sameVnode, 将旧end移到旧start前面, 然后对这两组节点进行patch;
       * @bacause 在新队列中, 旧end在旧start前面, 需要将旧end放置在旧start前面;
       * 旧指针左移, 新指针右移
       */
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
      canMove &&
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 以上四种场景都不满足时, 执行以下操作
      /**
       * @条件 在旧start~旧end之间, 找到和新start满足sameVnode的节点; 找到符合条件的节点后, 新start指针右移, 进入下个循环
       * @场景1 如果不满足上述条件, 说明新start是新节点, 创建新节点插入在旧start前面
       * @场景2 如果找到满足条件的vNode节点, 将该vNode节点移动到旧start前面
       */
      if (isUndef(oldKeyToIdx))
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      if (isUndef(idxInOld)) {
        // New element
        createElm(
          newStartVnode,
          insertedVnodeQueue,
          parentElm,
          oldStartVnode.elm,
          false,
          newCh,
          newStartIdx
        );
      } else {
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          canMove &&
            nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
        } else {
          // same key but different element. treat as new element
          createElm(
            newStartVnode,
            insertedVnodeQueue,
            parentElm,
            oldStartVnode.elm,
            false,
            newCh,
            newStartIdx
          );
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // diff算法使用双指针的方式进行节点的对比, 再根据指针的大小来确定当前的场景;
  // oldStartIdx > oldEndIdx || newStartIdx > newEndIdx 是结束循环的条件

  if (oldStartIdx > oldEndIdx) {
    // 如果先判断出 oldStartIdx > oldEndIdx, 那么说明新节点的数量要大于旧节点的
    // 所以, 多出来的这部分节点需要创建并添加到vNode上
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
    addVnodes(
      parentElm,
      refElm,
      newCh,
      newStartIdx,
      newEndIdx,
      insertedVnodeQueue
    );
  } else if (newStartIdx > newEndIdx) {
    // 同理, 判断出 newStartIdx > newEndIdx, 说明新节点遍历完毕, 旧节点的数量要大于新节点的数量
    // 旧节点多处的内容需要从vNode中删除
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}
```

[参考](https://blog.csdn.net/weixin_42232156/article/details/120353173)
[参考](https://blog.csdn.net/weixin_39996496/article/details/111137477)
[参考☆☆☆☆☆](https://blog.csdn.net/guxin_duyin/article/details/109955470)

# 关于 key 值的优化

    例如, 在list中添加某一个值;
    没有key值的时候, 需要遍历list, 重新渲染整个list;
    有key的时候, 找到list中, 对应的位置插入, 只渲染新增的vNode节点即可, 不需要渲染其他内容;

# 声明式渲染

    1.Dom状态只是数据状态的一个映射
    2.所有的数据尽可能的在状态层面进行处理
    3.当状态发生改变,view视图会以最合理的方式进行渲染展示

# 区别"声明式渲染"和"命令式渲染"

    声明式渲染: 只需要关心声明和调用, 不需要关注具体是怎么实现的
    命令式渲染: 需要关注调用和具体的操作流程
    例如: 设定一个数组,需要让数组中所有内容都*2

```js
    // 命令式: 参与每一处的调用
    let arr = [2, 4, 5, 6];
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
      arr2.push(arr[i] * 2);
    }
    // 声明式: 声明一个方法,调用之后自动执行
    let arr = [2, 4, 5, 6];
    let arr2 = arr.map((item) => item * 2);
```


总结:
  updateChildren方法是diff算法的核心内容.
  updateChildren的原理是利用`新旧列表的双指针`, 对指针位置进行判断,从而应对不同的场景. 两端指针向内收缩;

  1.处理的方式: 如果存在key并且满足sameVnode,会将该DOM节点进行复用,否则会创建一个新的DOM节点.
  2.处理的场景
    oldStart、oldEnd、newStart、newEnd, 指针两两做比较, 一共有2*2=4种场景
    ① oldStart和newStart满足`sameVnode`(没变化), oldStart和newStart进行`patchVnode`, start指针向后移动(+1)
    ② oldEnd和newEnd满足`sameVnode`(没变化), oldEnd和newEnd进行`patchVnode`, end指针向前移动(-1)
    ③ oldStart和newEnd满足`sameVnode`(oldStart节点已经跑到了后面), oldStart和newEnd进行`patchVnode`, 然后将oldStart节点移到oldEnd后面(dom元素后移), oldStart指针向右移动(+1), newEnd指针向左移动(-1)
    ④ oldEnd和newStart满足`sameVnode`(oldEnd节点已经跑到了前面), oldEnd和newStart进行`patchVnode`, 然后将oldEnd节点移到oldStart前面(dom元素前移), oldEnd指针向左移动(-1), newStart指针向右移动(+1)
    * 如果不满足上述四种场景, 就需要在oldStart~oldEnd之间,满足和newStart为`sameVnode`的节点,
    ① 如何找到这样的节点, 将该节点移动到oldStart前面
    ② 如果找不到此类节点, 证明该节点为新节点, 需要创建新节点并插入到oldStart前面
  3.跳出循环的条件
    ① newStart>newEnd; 说明新节点先遍历完毕,旧节点数量更多,需要将未遍历的旧节点删除掉;
    ② oldStart>oldEnd; 说明老节点先遍历完毕,新节点数量更多,需要将新节点创建之后放在oldEnd后面;

