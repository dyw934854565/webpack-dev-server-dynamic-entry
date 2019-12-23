/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} addEntry
 * @param {*} allEntry
 */
const ensuePage = (async (req, res, addEntry, allEntry) => {
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
exports = module.exports = function webpackDevServerDynamicEntry(entry, options = {}) {
  const compiledEntry = {}
  let allEntry
  if (typeof entry === 'function') {
    allEntry = entry()
  } else if (typeof entry === 'string' || Object.prototype.toString.call(entry).toLowerCase() === '[object array]') {
    allEntry = { main: entry }
  } else {
    allEntry = entry
  }
  options.ensuePage = options.ensuePage || ensuePage
  return {
    entry: function entry() { return compiledEntry },
    before: function before(app, server) {
      /**
       *
       * @param {*} name
       * @param {*} path 可选
       */
      const addEntry = async (name, path) => {
        const entryPath = path || allEntry[name]
        if (compiledEntry[name] || !entryPath) return
        compiledEntry[name] = entryPath
        return new Promise(resolve => {
          server.invalidate(resolve)
        })
      }
      app.use(async function (req, res, next) {
        await options.ensuePage(req, res, addEntry, allEntry)
        await next()
      })
    }
  }
}
