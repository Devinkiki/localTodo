@echo off
chcp 65001 >nul
title Local Todo - 开发服务器
echo ========================================
echo   Local Todo 开发服务器
echo ========================================
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [1/2] 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接或手动运行: npm install
        pause
        exit /b 1
    )
    echo.
)

echo [2/2] 启动开发服务器...
echo 浏览器将自动打开 http://localhost:5173
echo 按 Ctrl+C 可停止服务器
echo.

call npm run dev
