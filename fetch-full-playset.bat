@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 18 or newer is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)"
if errorlevel 1 (
  echo Please update Node.js to version 18 or newer.
  pause
  exit /b 1
)
echo Collecting the separate full-playset bank. This may take a long time.
echo Each card must have THREE copies. Progress is saved automatically.
node --dns-result-order=ipv4first "deck-popularity\collect-full.cjs" --target 6000 %*
set "full_result=%errorlevel%"
if "%full_result%"=="0" (
  echo Complete. Refresh deckPopularity.html and choose the full-playset mode.
) else (
  echo Collection stopped. Read the message above and rerun this BAT to resume.
)
pause
exit /b %full_result%
