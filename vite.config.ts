import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置文件
// https://vite.dev/config/
export default defineConfig({
  // 使用 React 插件
  plugins: [react()],
  
  // 开发服务器配置
  server: {
    port: 3000,        // 开发服务器端口（类似 Spring Boot 的 server.port）
    open: true,        // 启动时自动打开浏览器
  },
})
