/** @type {import('tailwindcss').Config} */

/* Tailwind 配置文件
 * content：告诉 Tailwind 去哪些文件里找 class，找到了才会生成对应 CSS
 *          （所以以后如果新增了别的 html 文件，要在这里补进数组）
 * 改完这个文件必须重新构建 styles.css：双击 build-css.bat
 */
module.exports = {
  // 告诉 Tailwind 去哪些文件里找 class，找到了才会生成对应 CSS。
  // 以后如果新增了别的 html 页面（如 blog.html），在这里补一行：'./blog.html'
  content: ['./index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
