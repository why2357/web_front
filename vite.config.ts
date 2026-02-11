import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置文件
// https://vite.dev/config/
export default defineConfig({
  // 使用 React 插件
  plugins: [react()],

  // 开发服务器配置
  server: {
    port: 3000,        // 开发服务器端口
    open: true,        // 启动时自动打开浏览器
    proxy: {
      // 代理 OSS 音频请求，解决 CORS 问题（开发环境）
      '/audio-proxy': {
        target: 'https://fengyun-tts.oss-cn-shanghai.aliyuncs.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audio-proxy/, ''),
        secure: false,
      },
    },
  },

  // 生产环境构建优化
  build: {
    outDir: 'dist',
    sourcemap: false,              // 关闭 sourcemap（减小体积，提升安全性）
    minify: 'esbuild',             // 使用 esbuild 压缩（Vite 默认，更快）
    chunkSizeWarningLimit: 1000,   // chunk 大小警告阈值（KB）
    rollupOptions: {
      output: {
        // 分包策略：将 React 和 Ant Design 等大型依赖单独打包
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd'],
        },
      },
    },
  },
})
