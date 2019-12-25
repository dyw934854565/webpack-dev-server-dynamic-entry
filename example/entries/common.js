module.exports = function makePage(page = 'index') {
  const pages = ['index', 'admins', 'user', 'login']
  let html = `<p>now page: ${page}</p>`
  html += pages.filter(val => val !== page).map(val => `
    <p><a href="/${val}.html">goto ${val}</a></p>
  `).join('')
  return html
}
