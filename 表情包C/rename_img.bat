@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    图片自动重命名工具
echo ========================================
echo.

REM 设置文件扩展名
set "EXT=png"

echo 正在扫描当前文件夹的 .%EXT% 文件...
echo.

dir /b *.%EXT% >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 当前文件夹中没有 .%EXT% 文件
    pause
    exit /b
)

if not exist ".temp_rename" mkdir ".temp_rename"

REM 按时间从旧到新排序 (/o:d = 从旧到新)
set counter=1
for /f "delims=" %%f in ('dir /b /o:d *.%EXT%') do (
    copy "%%f" ".temp_rename\!counter!.%EXT%" >nul
    set /a counter+=1
)

del *.%EXT% >nul 2>&1
move ".temp_rename\*.%EXT%" . >nul
rmdir ".temp_rename"

set /a total=counter-1
echo.
echo ✅ 重命名完成!
echo 共处理 %total% 个文件
echo 文件已按时间从旧到新排序: 1.%EXT% 到 %total%.%EXT%
echo.
echo 📝 在HTML中配置: count: %total%, ext: "%EXT%"
echo.
pause
