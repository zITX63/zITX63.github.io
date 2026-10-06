@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo  Tailwind 开发模式（自动监听）
echo.
echo  用法：双击后就这么开着（黑窗口别关）
echo        改完 index.html 按 Ctrl+S，CSS 自动重建
echo        浏览器右键刷新就能看到新样式
echo.
echo  停止：在这个窗口按 Ctrl+C
echo.
echo  [!] 注意：监听模式生成的是未压缩版（约 30KB）
echo      要提交上线前，请关闭本窗口，
echo      再双击 build-css.bat 出压缩版（约 20KB）
echo ============================================
echo.

"C:\Program Files\nodejs\node.exe" "G:\WORKBY\env\tailwind\node_modules\tailwindcss\lib\cli.js" -i tailwind-input.css -o styles.css -c tailwind.config.js --watch

pause
