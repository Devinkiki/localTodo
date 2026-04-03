@echo off
chcp 65001 >nul
title Local Todo - 打包发布版本
echo ========================================
echo   Local Todo 打包工具
echo ========================================
echo.

set RELEASE_DIR=release\local-todo

REM 清理旧的发布包
if exist "%RELEASE_DIR%" (
    echo 清理旧的发布包...
    rmdir /s /q "%RELEASE_DIR%"
)

REM 创建发布目录结构
echo 创建发布目录...
mkdir "%RELEASE_DIR%"

REM 复制构建产物
echo 复制构建产物...
if not exist "dist\" (
    echo 正在构建生产版本...
    call npm run build
    if errorlevel 1 (
        echo [错误] 构建失败
        pause
        exit /b 1
    )
)
xcopy /E /I /Y dist "%RELEASE_DIR%\dist" >nul

REM 复制服务器脚本和启动脚本
echo 复制脚本文件...
copy /Y scripts\serve.cjs "%RELEASE_DIR%\serve.cjs" >nul
copy /Y release-template\start.bat "%RELEASE_DIR%\start.bat" >nul

REM 安装生产依赖（仅 serve-handler）
echo 安装生产依赖...
cd "%RELEASE_DIR%"
call npm init -y >nul 2>&1
call npm install serve-handler >nul 2>&1
cd ..\..

REM 复制 README
echo 复制使用说明...
(
echo ========================================
echo   Local Todo - 独立运行版
echo ========================================
echo.
echo 启动方式:
echo   双击 start.bat 即可运行
echo.
echo 如需完全无依赖运行:
echo   1. 下载 Node.js 便携版:
echo      https://nodejs.org/dist/v24.14.0/node-v24.14.0-win-x64.zip
echo   2. 解压到本目录，文件夹命名为 node-portable
echo   3. 再次双击 start.bat
echo.
echo 默认访问地址: http://127.0.0.1:3000
echo 端口可通过环境变量 PORT 修改: set PORT=8080
echo.
) > "%RELEASE_DIR%\使用说明.txt"

echo.
echo ========================================
echo   打包完成！
echo   发布包位置: %RELEASE_DIR%
echo ========================================
echo.
echo 将 %RELEASE_DIR% 文件夹压缩为 zip 即可分发
echo 用户解压后双击 start.bat 即可运行
echo.
pause
