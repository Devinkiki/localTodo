@echo off
chcp 65001 >nul
title Local Todo

REM 检测是否使用便携版 Node.js
if exist "node-portable\node.exe" (
    set NODE_PATH=node-portable\node.exe
) else (
    set NODE_PATH=node
)

REM 验证 Node.js 是否可用
%NODE_PATH% --version >nul 2>&1
if errorlevel 1 (
    echo ========================================
    echo   错误：未找到 Node.js 环境
    echo ========================================
    echo.
    echo 请安装 Node.js 或下载便携版:
    echo https://nodejs.org/dist/v24.14.0/node-v24.14.0-win-x64.zip
    echo.
    echo 下载后解压到本目录，文件夹命名为 node-portable
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   Local Todo
echo ========================================
echo.
echo 正在启动...
echo 浏览器将自动打开 http://127.0.0.1:3000
echo 按 Ctrl+C 可停止服务
echo.

%NODE_PATH% serve.cjs
