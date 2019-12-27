# webpack-dev-server-dynamic-entry
在webpack多入口构建中，如果入口很多，在开发时第一次启动构建会用很久的时间。

但是实际上有些入口是用不到的，构建它完全是浪费时间

在开发环境时可以使用动态入口，在入口被访问的时候才去构建它，以此来减少构建时间

# 原理
使用函数作为webpack配置的entry，用中间件拦截devServer的收到的每一个请求，当请求命中某个entryName，就把它添加到entry里，然后让webpack重新构建，等带构建完成再调下一个中间件完成请求的返回

entry一定要在调webpack(config)之前去拦截，改成函数。看了webpack暴露的接口，可以动态添加入口，没有删除入口。用函数入口还有一个好处是就算返回空对象webpack也不会报错，一开始不用执行任何编译操作

最后，问题的关键是维护一个请求路径到entry的映射， 这里的解决方案有：

- 提供pathMaps配置，请求路径到entry的映射的集合
- ensuePage函数默认行为，路径为'/'，加载index配置的entry，否则去遍历所有的entryName，看是否在路径中，如果在就构建该entry
- 重写ensuePage函数，此操作不覆盖pathMaps配置

# 支持
- webpack版本: 理论上支持dynamicEntry就支持，大致看了一下webpack@1就支持了
- webpack-dev-server版本：2及2+，1没看
- node版本：用了async/await，没编译，低版本node可以自己编译一下

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


## pathMaps: Array
默认无，路径到entry的映射，如下

```
{
  pathMaps: [
    {
      from: '/', // string | regex,
      to: '' // string | (addEntry: Function, match?: Array<any>) => Promise<any>
    }
  ]
}
```

## ensuePage: Function | false
devServer每次收到请求ensuePage都会被调用, 函数定义如下，当默认操作不满足需求，可重写
```
declare function ensuePage(req: Request, res: Response, addEntry: Function, remainEntry: string[]): Promise<any>
```
如果提供了pathMaps，不需要再使用ensuePage，可以设置为false，避免多余的去匹配路由操作

## index: string
配置请求路径为'/'时，构建的入口名，在ensuePage为默认值时生效，默认值为'main'。

# addEntry，在ensuePage中使用addEntry
动态添加entry，调用server.invalidate重新构建，返回promise等待构建完成
```
declare function addEntry(name: string, path?: string): Promise<any>
```
## 参数
- name, string 必需 entry name
- path, string 非必需

## 使用场景
- 入口已在allEntry中，不传path
- 新创建的文件夹，根据请求路径，对应到入口路径动态添加入口


