@echo off
REM ============================================================
REM  Rebuild styles.css
REM  Run this (double-click) whenever you add or change
REM  Tailwind classes in index.html, otherwise the new style
REM  will NOT show up.
REM ============================================================
cd /d "%~dp0"

"C:\Program Files\nodejs\node.exe" "G:\WORKBY\env\tailwind\node_modules\tailwindcss\lib\cli.js" -i "tailwind-input.css" -o "styles.css" -c "tailwind.config.js" --minify

echo.
if exist "styles.css" (
  echo [OK] styles.css rebuilt.
) else (
  echo [FAILED] styles.css was not created. Read the message above.
)
echo.
pause
