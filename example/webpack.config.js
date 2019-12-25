const HtmlWebpackPlugin = require('html-webpack-plugin')
const DynamicEntry = require('../index')
const path = require('path')
/* 也可以用glob遍历文件夹 */
const entries = {
  admins: './entries/admins.js',
  login: './entries/login.js',
  index: './entries/index.js',
  user: './entries/user.js',
}
const dynamicEntry = DynamicEntry(entries, {
  index: 'index'
  // pathMaps: [
  //   ...Object.keys(entries).map(entryName => ({
  //     from: '/' + entryName + '.html',
  //     to: entryName
  //   })),
  //   {
  //     from: '/',
  //     to: 'index'
  //   }
  // ],
  // ensuePage: false
});
module.exports = {
  context: __dirname,
  entry: dynamicEntry.entry,
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js"
  },
  plugins: Object.keys(entries).map(
    key =>
      new HtmlWebpackPlugin({
        chunks: [key],
        filename: `${key}.html`,
        inject: true
      })
  ),
  devServer: {
    host: "0.0.0.0",
    before: dynamicEntry.before,
    hot: true,
    open: true,
    watchOptions: {
      poll: false
    }
  }
};
