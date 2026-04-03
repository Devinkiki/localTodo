#!/bin/bash

# Local Todo - 一键启动脚本
# 自动检测依赖并启动开发服务器

echo "========================================"
echo "  Local Todo 开发服务器"
echo "========================================"
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "[1/2] 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[错误] 依赖安装失败，请检查网络连接或手动运行: npm install"
        exit 1
    fi
    echo ""
fi

echo "[2/2] 启动开发服务器..."
echo "浏览器将自动打开 http://localhost:5173"
echo "按 Ctrl+C 可停止服务器"
echo ""

npm run dev
