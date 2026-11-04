@echo off
setlocal
cd /d "%~dp0"
set PORT=8766
set HOST=127.0.0.1
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 20 or newer, then open this launcher again.
 pause
 exit /b 1
)
if not exist "out\index.html" (
 call npm run build
 if errorlevel 1 exit /b 1
)
echo H5X preview is starting. Keep this window open for automatic CTFtime updates.
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8766'"
node scripts/serve-h5x.mjs
pause
