# webpack-dev-server-dynamic-entry
在webpack多入口编译中，如果入口很多，在开发时第一次启动编译会用很久的时间。

但是实际上有些入口是用不到的，编译它完全是浪费时间

在开发环境时可以使用动态入口，在入口被访问的时候才去编译它，以此来减少编译时间


# 原理
使用函数作为webpack配置的entry，用中间件拦截devServer的收到的每一个请求，当请求命中入口文件，把入口添加到entry里，然后让webpack重新编译，等编译成功再返回请求的数据

entry一定要在调webpack(config)之前去拦截，改成函数，看了webpack暴露的接口，可以动态添加入口，没有删除入口

最后的问题关键是维护一个请求路径到entry的映射， 这里的解决方案有：

- 提供pathMaps配置，正则和entry的对应的集合
- ensuePage函数默认行为，路径为'/'，加载index配置的entry，否则去遍历所有的entryName，看是否在路径中，如果在就编译该entry
- 重写ensuePage函数，此操作不覆盖pathMaps配置

# 使用

```javascript
// webpack.config.js

const dynamicEntryPlugin = require('webpack-dev-server-dynamic-entry')
const dynamicEntry = dynamicEntryPlugin(entry, {index, ensuePage, pathMaps})

module.exports = {
  entry: isDev ? dynamicEntry.entry : entry,
  devServer: {
    before: dynamicEntry.before
  }
}
```

## 例子

```
cd ./example
npm install
npm start
```

## 只在开发模式的devServer的情况下使用

# options配置

## pathMaps
数组：默认无，路径到entry的映射，如下

```
{
  pathMaps: [
    {
      from: '/', // string, regex,
      to: '' // string (entry name), function(addEntry, match): Promise<any>
    }
  ]
}
```

## ensuePage
函数或者非真值：devServer每次收到请求ensuePage都会被调用
```
async function ensuePage(req, res, addEntry, remainEntry): Promise
```
如果提供了pathMaps，不需要再使用ensuePage，可以设置为false，避免多余的去匹配路由操作

## index
字符串：配置请求路径为'/'时，编译的入口，在ensuePage为默认值时生效，默认值为'main'。

```javascript

# addEntry，在ensuePage中使用addEntry
返回promise，动态添加入口，并等待编译完成

## 参数
- name, string 必需 entry name
- path, string 非必需

## 使用场景
- 入口已在allEntry中，不传path
- 新创建的文件夹，根据请求路径，对应到入口路径动态添加入口


