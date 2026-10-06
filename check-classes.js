/* 检查 index.html 里用到的 class 是否都已生成到 styles.css
 * 用途：别的 AI 改完代码后跑一次，看有没有「写了但没样式」的新积木
 */

const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
let css = '';
try {
  css = fs.readFileSync('styles.css', 'utf8');
} catch (e) {
  console.log('  [错误] 找不到 styles.css，请先双击 build-css.bat');
  process.exit(1);
}

// 1. 从 <style> 里提取你自己写的类名（这些不归 Tailwind 管）
const custom = new Set();
for (const m of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
  for (const c of m[1].matchAll(/\.([a-zA-Z][\w-]*)/g)) custom.add(c[1]);
}

// 2. 找出「故意不写样式、只给 JS 当选择器用」的钩子类名
//    判断依据：它在 JS 里被 querySelector / closest 之类的方式引用过
const hooks = new Set();
for (const c of custom) hooks.delete(c);
for (const m of html.matchAll(/['"]\.([a-zA-Z][\w-]*)['"]/g)) hooks.add(m[1]);
for (const m of html.matchAll(/querySelector(?:All)?\(\s*['"]\.([\w-]+)/g)) hooks.add(m[1]);

// 2. 收集 index.html 里出现的所有 class
const names = new Set();
for (const m of html.matchAll(/class=["']([^"']+)["']/g)) {
  m[1].split(/\s+/).forEach(c => { if (c && !c.includes('${')) names.add(c); });
}
for (const m of html.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g)) {
  m[1].split(/\s+/).forEach(c => { if (c) names.add(c); });
}
for (const m of html.matchAll(/classList\.(?:add|remove|toggle)\(['"]([^'"]+)['"]/g)) {
  names.add(m[1]);
}

// 4. 逐个去 styles.css 里找（Tailwind 会把 : / [ ] 等字符转义）
const missing = [];
const hooksUsed = [];
for (const n of names) {
  const esc = n.replace(/[[\]\\/.:#%!(),]/g, ch => '\\' + ch);
  const hasStyle = css.includes('.' + esc) || css.includes(esc) || custom.has(n);
  if (hasStyle) continue;
  if (hooks.has(n)) hooksUsed.push(n);
  else missing.push(n);
}

console.log('');
console.log('  index.html 里出现的 class 总数 : ' + names.size);
console.log('  你自己在 <style> 里定义的类名  : ' + custom.size);
console.log('  纯 JS 钩子（本就不需要样式）   : ' + hooksUsed.length);
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
