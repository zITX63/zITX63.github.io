/* 检查页面里用到的 class 是否都已生成到 styles.css
 * 用途：别的 AI 改完代码后跑一次，看有没有「写了但没样式」的新积木
 *
 * 检查哪些页面：自动读 tailwind.config.js 里的 content 数组，
 * 所以以后新增了页面（只要在 config 里登记过），这里会自动跟着检查。
 */

const fs = require('fs');

let css = '';
try {
  css = fs.readFileSync('styles.css', 'utf8');
} catch (e) {
  console.log('  [错误] 找不到 styles.css，请先双击 build-css.bat');
  process.exit(1);
}

// 0. 从 tailwind.config.js 的 content 里读出要检查哪些 html
let files = ['index.html'];
try {
  const m = fs.readFileSync('tailwind.config.js', 'utf8').match(/content:\s*\[([^\]]*)\]/);
  if (m) {
    const list = m[1].match(/['"]([^'"]+)['"]/g).map(s => s.slice(1, -1));
    if (list.length) files = list;
  }
} catch (e) { /* 读不到就用默认 */ }
files = files.filter(f => f.endsWith('.html') && fs.existsSync(f));

// 从一段 class 属性值里收集类名。
// 难点：值里可能有 ${a === b ? 'x y' : 'z'} 这种 JS 三元表达式，
// 表达式本身（=== / currentCat / ?）不是 class，但里面的字符串字面量是。
function addClasses(val) {
  for (const expr of val.matchAll(/\$\{([\s\S]*?)\}/g)) {
    for (const q of expr[1].matchAll(/['"]([^'"]+)['"]/g)) {
      q[1].split(/\s+/).forEach(c => { if (c) names.add(c); });
    }
  }
  val.replace(/\$\{[\s\S]*?\}/g, ' ')
     .split(/\s+/).forEach(c => { if (c && !c.includes('${')) names.add(c); });
}

// 1. 自定义类名（<style> 里自己写的，不归 Tailwind 管）
const custom = new Set();
// 2. 纯 JS 钩子类名（故意不写样式，只用来被 querySelector 找到）
const hooks = new Set();
// 3. 页面里出现的所有 class
const names = new Set();

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');

  for (const m of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    for (const c of m[1].matchAll(/\.([a-zA-Z][\w-]*)/g)) custom.add(c[1]);
  }
  // 允许 querySelectorAll?.('.bar') 这种可选链写法
  // 同时支持 querySelectorAll('.bar') 和 querySelectorAll?.('.bar') 两种写法
  for (const m of html.matchAll(/querySelector(?:All)?(?:\?\.)?\s*\(\s*['"]\.([\w-]+)/g)) hooks.add(m[1]);
  for (const m of html.matchAll(/closest(?:\?\.)?\s*\(\s*['"]\.([\w-]+)/g)) hooks.add(m[1]);

  // class 属性值：分别按双引号/单引号取值，避免被值里的另一种引号截断
  for (const m of html.matchAll(/class="([^"]*)"/g)) addClasses(m[1]);
  for (const m of html.matchAll(/class='([^']*)'/g)) addClasses(m[1]);
  for (const m of html.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g)) {
    m[1].split(/\s+/).forEach(c => { if (c) names.add(c); });
  }
  for (const m of html.matchAll(/classList\.(?:add|remove|toggle)\(['"]([^'"]+)['"]/g)) {
    names.add(m[1]);
  }
}
for (const c of custom) hooks.delete(c);

// 4. 逐个去 styles.css 里找（Tailwind 会把 : / [ ] 等字符转义）
const missing = [];
const hooksUsed = [];
for (const n of names) {
  const esc = n.replace(/[[\]\\/.:#%!(),]/g, ch => '\\' + ch);
  if (css.includes('.' + esc) || css.includes(esc) || custom.has(n)) continue;
  if (hooks.has(n)) hooksUsed.push(n);
  else missing.push(n);
}

console.log('');
console.log('  检查的页面                     : ' + files.join(', '));
console.log('  页面里出现的 class 总数        : ' + names.size);
console.log('  你自己在 <style> 里定义的类名  : ' + custom.size);
console.log('  纯 JS 钩子（本就不需要样式）   : ' + hooksUsed.length +
            (hooksUsed.length ? '  (' + hooksUsed.join(', ') + ')' : ''));
console.log('  缺少样式、需要留意的           : ' + missing.length);
console.log('');

if (missing.length === 0) {
  console.log('  [OK] 全部命中，样式已完整生成，直接刷新浏览器即可。');
} else {
  console.log('  [注意] 以下 class 写了但没有任何样式（写了也不会有效果）：');
  missing.forEach(x => console.log('        - ' + x));
  console.log('');
  console.log('  处理：双击 build-css.bat 重新生成 styles.css，再刷新浏览器。');
}
console.log('');
