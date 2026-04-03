import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 固定端口，避免每次启动端口变化
    port: 5173,
    // 启动后自动打开浏览器
    open: true,
    // 端口被占用时自动尝试下一个
    strictPort: false,
  },
})
