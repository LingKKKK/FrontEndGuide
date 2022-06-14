# 针对临时的hotfix
目前的节点是:
  1. 已经打完了patch6
  2. patch7正在开发中
  3. 出现了一个客户端的问题, 需要临时解决一下
打包流程:
  1. 在gitlab上新创建一个分支: release/2021-patch7-hotfix-xxxx)
     1. 从上一个patch的tag中签出, 在gitlab可以快捷选择
     2. 在对应的分支下进行修改, 然后进行`build`打包
  2. 在wiki月度Patch下创建一个 2021_patch7_hotfix_xxxx 的版本发布说明
     1. 在`build`之后, 正常填写工单
     2. 交由服务端打包生成一个全量的包
  3. 自测完毕之后, 跳过测试环节, 将全量的包发送给实施人员进行部署
  * 因为比较紧急, 所以临时解决, 这是兜底的方案 (慎用!!!)

# 月度patch下的hotfix
计划本月发布patch7, 固定有4轮提测, 每一轮开放工单合入hotfix
默认是将patch7下的所有hotfix都合入到patch7中;
  1.需要查看版本, 填写对应的工单
    https://wiki.lenovows.com/display/PCS/2021
    https://wiki.lenovows.com/pages/viewpage.action?pageId=19190907
  2.前端打包完毕填写工单给服务端
  3.服务端打包交由测试验证
  4.测试验证完毕交由实施部署验证
  5.确认无误之后合入主分支
  6.收尾工作,做风险评估,性能评估
