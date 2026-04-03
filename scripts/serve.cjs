/**
 * 轻量级静态文件服务器
 * 用于将 dist/ 目录打包为独立可执行文件，无需 Node.js 环境
 *
 * 功能：
 * - 自动查找 dist/ 目录（开发模式或 pkg 打包后）
 * - 支持 SPA 路由回退（所有路由返回 index.html）
 * - 自动打开浏览器
 * - 可配置端口（默认 3000）
 *
 * 注意：必须使用 CJS 格式，因为 pkg 对 ESM 支持有限
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const handler = require('serve-handler');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '127.0.0.1';

/**
 * 获取 dist/ 目录的绝对路径
 * pkg 打包后，资源文件位于 snapshot 虚拟路径下
 */
function getDistPath() {
  // pkg 打包环境：使用 process.execPath 定位可执行文件所在目录
  if (process.pkg) {
    return path.join(path.dirname(process.execPath), 'dist');
  }
  // 优先检查同级目录下的 dist/（发布包模式）
  const localDist = path.join(__dirname, 'dist');
  if (fs.existsSync(localDist)) {
    return localDist;
  }
  // 开发环境：项目根目录下的 dist/（脚本在 scripts/ 目录下）
  return path.join(__dirname, '..', 'dist');
}

/**
 * 自动打开浏览器
 */
function openBrowser(url) {
  const platform = process.platform;
  const commands = {
    win32: `start "" "${url}"`,
    darwin: `open "${url}"`,
    linux: `xdg-open "${url}"`,
  };
  const cmd = commands[platform] || commands.linux;
  if (cmd) {
    exec(cmd, () => {});
  }
}

/**
 * 创建 HTTP 服务器
 */
const distPath = getDistPath();
const indexPath = path.join(distPath, 'index.html');

// 验证 dist/ 是否存在
if (!fs.existsSync(distPath)) {
  console.error(`错误：找不到 dist/ 目录，路径：${distPath}`);
  console.error('请先运行构建：npm run build');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  // 使用 serve-handler 处理静态文件
  handler(req, res, {
    public: distPath,
    // SPA 路由支持：找不到文件时返回 index.html
    rewrites: [{ source: '**', destination: indexPath }],
    // 目录列表关闭
    directoryListing: false,
  }).catch((err) => {
    console.error('服务器错误:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log('========================================');
  console.log('  Local Todo 已启动');
  console.log(`  访问地址: ${url}`);
  console.log('  按 Ctrl+C 可停止服务');
  console.log('========================================');
  console.log('正在打开浏览器...');
  openBrowser(url);
});
