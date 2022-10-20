# web项目
    目前本地不起任何服务, 仅把前端代码替换到测试环境中


# 测试环境地址
    http://test.lenovows.com/user/setting

    登录账号密码: feb71@test.com     123qwe
    登录账号密码: feb72@test.com     123qwe

# 旧版网盘入口
    http://test.lenovows.com/stat/space_stat


# 私有Web项目
    内容: 管理控制台 / 旧版网盘
    修改代码需要本地修改,然后ftps上传到对应的服务器中,将对应的文件替换掉,查看线上环境是否正常.
    - 如果不正常,将线上文件恢复,本地再次修改提交
    - 如修改内容正常,将文件推至线上
    - MR → 审核 → build
    ※ 需要ftp的账号密码,以及文件目录(涉及到php项目,需要删除cache)

# 私有view
    内容: 网盘
    目录结构: https://wiki.lenovows.com/pages/viewpage.action?pageId=19177365
    - 本地安装环境
    - 本地启起服务调试
    - 测试完毕之后再向线上推送
    - MR → 审核 → build
    需要注意的内容:
      build/base.config.js 代理/转发/alias/sourceMap
      {{ $t(xxx) }} => 国际化相关内容
    - 项目使用纯组件的形式构建, 没有page页面, 通过组件之间的依赖
    - vue-i18n vue-router vuex element-UI

<!-- # 私有doc_preview
    - 本地安装环境
    - 本地启起服务调试
    - 测试完毕之后再向线上推送
    - MR → 审核 → build -->


对于项目/框架, 不太好升级/替换. 因为整个逻辑复杂, 项目比较庞大.
而且vue不像react, 可以做到不重构升级, vue需要改动的太大了.


# 调试预览相关的问题
  预览使用的插件是pdfjs
  doc_preview: 
    调用了pdfjs打包的build文件, 里面有templete(html/js/css)
    使用iframe, 
      1. 先展示 pdfjs-templete
      2. 将预览的pdf内容用canvas渲染到templete内
    -> pdfjs打包的templete算是比较独立的环境