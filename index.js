/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} addEntry
 * @param {*} remainEntry
 */
const ensuePage = async function (req, res, addEntry, remainEntry) {
  if (!remainEntry.length) return
  if (req.path === '/') {
    return addEntry(this.index)
  }
  for (let i = 0; i < remainEntry.length; i++) {
    if (req.path.indexOf(remainEntry[i]) > -1) {
      await addEntry(remainEntry[i])
    }
  }
}

exports = module.exports = function webpackDevServerDynamicEntry(entry, options = {}) {
  options = Object.assign(
    {
      index: 'main',
      ensuePage
    },
    options
  )
  const compiledEntry = {}
  let allEntry
  if (typeof entry === 'function') {
    allEntry = entry()
  } else if (typeof entry === 'string' || Object.prototype.toString.call(entry).toLowerCase() === '[object array]') {
    allEntry = { main: entry }
  } else {
    allEntry = entry
  }
  return {
    entry: function entry() { return compiledEntry },
    before: function before(app, server) {
      const remainEntry = Object.keys(allEntry)
      /**
       *
       * @param {*} name
       * @param {*} path 可选
       */
      const addEntry = async (name, path) => {
        const entryPath = path || allEntry[name]
        if (compiledEntry[name] || !entryPath) return
        if (remainEntry.length) {
          remainEntry.splice(remainEntry.indexOf(name), 1)
        }
        server.log && server.log.info('compile entry: ', name)
        compiledEntry[name] = entryPath
        return new Promise(resolve => {
          if (server.invalidate.length) { // 旧版invalidate不支持回调
            server.invalidate(resolve)
          } else if (server.middleware) {
            server.middleware.invalidate(resolve)
          }
        })
      }
      const tryPathMap = function(req) {
        const handleTo = function(to) {
          if (typeof to === "function") {
            return to.apply(
              null,
              [addEntry].concat(Array.prototype.slice.call(arguments, 1))
            )
          }
          return addEntry(to)
        }
        if (options.pathMaps && options.pathMaps.length) {
          for (let i = 0; i < options.pathMaps.length; i++) {
            const pathItem = options.pathMaps[i]
            if (pathItem.from === req.path) {
              // string
              options.pathMaps.splice(i, 1)
              return handleTo(pathItem.to)
            } else if (pathItem.from && pathItem.from.test) {
              // regex
              const match = req.path.match(pathItem.from)
              if (match) {
                options.pathMaps.splice(i, 1)
                return handleTo(pathItem.to, match)
              }
            }
          }
        }
      }
      app.use(async function (req, res, next) {
        try {
          await tryPathMap(req)
          if (options.ensuePage) {
            await options.ensuePage(req, res, addEntry, remainEntry)
          }
        } catch (e) {
          server.log && server.log.error("webpack-dev-server-dynamic-entry error:", e)
        }
        await next()
      })
    }
  }
}
