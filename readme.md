# webpack-dev-server-dynamic-entry
在webpack多入口编译中，如果入口多在开发时第一次启动编译会用很久的时间。

但是实际上有些入口是用不到的，编译它存粹是浪费时间

在开发环境时可以使用动态入口，在入口被访问的时候才去编译它，以此来减少编译时间

# 使用

```javascript
// webpack.config.js

const dynamicEntryPlugin = require('webpack-dev-server-dynamic-entry')
const dynamicEntry = dynamicEntryPlugin(entry, options)

module.exports = {
  entry: isDev ? dynamicEntry.entry : entry,
  devServer: {
    before: dynamicEntry.before
  }
}
```

## 只在开发模式的devServer的情况下使用

# options配置
目前只支持ensuePage

## ensuePage
有默认值, 如下。在接收每个请求都会调用ensuePage，在匹配中路由后可以调用addEntry
```javascript
(async function ensuePage (req, res, addEntry, allEntry) {
    if (req.path === '/') {
      return addEntry('main')
    }
    const paths = Object.keys(allEntry)
    for (let i = 0; i <= paths.length; i++) {
      if (req.path.indexOf(paths[i]) >= 1) {
        await addEntry(paths[i])
      }
    }
  })
```

# addEntry
返回promise，动态添加入口，并等待编译完成

## 参数
- name, 必需
- path, 非必需

## 使用场景
1、入口已在allEntry中，不传path
2、新创建的文件夹，根据请求路径，对应到入口路径动态添加入口


