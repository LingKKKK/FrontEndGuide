# 使用 node fs
```javascript
  /*
   * $$FILEZ_BUILD_TAG$$
   * 批量替换操作 - 无法持续集成
   */
  function createConfig(filePath) {
    try {
        const fullFilePath = path.resolve(__dirname, '..', filePath)
        const templateRegexp = new RegExp(`\\$\\$FILEZ_BUILD_TAG\\$\\$`, 'g')
        const FILEZ_BUILD_TAG = process.env.FILEZ_BUILD_TAG || 'dev'
        const fileContent = fs.readFileSync(fullFilePath, { encoding: 'utf-8' })
        const replacedFileContent = fileContent.replace(templateRegexp, FILEZ_BUILD_TAG)
        fs.writeFileSync(path.resolve(__dirname, fullFilePath), replacedFileContent);
        fs.existsSync(process.cwd(), fullFilePath)
        console.log(`${fullFilePath} 版本号生成成功`)
    } catch (error) {
        console.log('文件替换版本号 失败')
        console.log(error)
        process.exit(1)
    }
  }
  /*
   * $$FILEZ_BUILD_TAG$$
   * 查询到 html 文件, 替换html文件中的 xxx
   */
  function searchAllHtml(filePath) {
    if (!filePath) {
      return;
    }
    fs.readdir(filePath, function(err, files) {
      if (files && files.length) {
        files.forEach(function(filename) {
          var filedir = path.join(filePath, filename);
          fs.stat(filedir, function(eror, stats) {
            if (stats) {
              if (stats.isFile()) {
                var fileName = filedir.substr(-4);
                if (fileName === 'html') {
                  createConfig(filedir)
                }
              }
              if (stats.isDirectory()) {
                searchAllHtml(filedir);
              }
            }
          })
        });
      }
    });
  }
  searchAllHtml("web/www");
```
