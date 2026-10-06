@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo  Class 检查器
echo  检查 index.html 里用到的样式，
echo  是否都已经在 styles.css 里生成好了
echo ============================================

"C:\Program Files\nodejs\node.exe" "check-classes.js"

pause
