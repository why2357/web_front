# CLAUDE_CN.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个基于 React + TypeScript + Vite 的 TTS（文本转语音）系统前端，具有用户认证、语音合成和管理面板功能。

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000，自动打开浏览器）
npm run dev

# 构建生产版本（TypeScript 检查 + Vite 构建）
npm run build

# 预览生产构建
npm run preview
```

**注意**：当前未配置代码检查或测试工具（无 ESLint、Prettier、Jest 等）。

## 架构

### 分层结构

```
src/
├── api/          # API 层 - 集中式 HTTP 请求
├── pages/        # 页面组件 - 基于功能的路由
├── components/   # 可复用 UI 组件
├── App.tsx       # 根组件，包含路由配置
└── main.tsx      # 应用程序入口点
```

### API 层 ([src/api/](src/api/))

所有 HTTP 请求都通过集中的 Axios 实例 ([request.ts](src/api/request.ts))：

- **请求拦截器**：自动添加 `Authorization: Bearer <token>` 请求头
  - 开发环境：如果存在，使用 `.env.development.local` 中的 `VITE_DEV_TOKEN`
  - 生产环境：使用 localStorage 中的 `access_token`，并进行过期检查
- **响应拦截器**：处理统一的响应格式 `{code, message, data}`
  - Code 200/201：返回 `data` 字段
  - Code 401：自动重定向到 `/login`，清除 token
  - Code 402：积分不足错误
  - Code 403：账户被冻结错误
  - 其他错误：返回错误消息并拒绝

### 后端配置

默认 API 基础 URL（可通过 `VITE_API_BASE` 环境变量覆盖）：
- 开发环境：`http://localhost:8000/tts/`
- 生产环境：`/tts/`（Nginx 反向代理的相对路径）

### 路由

路由定义在 [App.tsx](src/App.tsx) 中：
- `/` → 重定向到 `/login`
- `/login` → 登录页面（手机号 + 短信验证）
- `/user` → 用户仪表板（TTS 合成、历史记录）
- `/admin` → 管理面板（用户管理、交易记录）

### 状态管理

- 无全局状态库（Redux、Zustand 等）
- 使用 React Hooks（useState、useEffect）管理本地状态
- 页面特定逻辑使用自定义 hooks（例如 [useUserPage.ts](src/pages/User/useUserPage.ts)）
- localStorage 用于持久化 token

### 组件模式

- 使用 hooks 的函数组件
- CSS 文件就近存放（`index.css` 与 `index.tsx` 并列）
- 使用 Ant Design 作为 UI 组件库
- 错误边界包裹所有路由

## 关键实现细节

### Token 管理

Token 以 `access_token` 和 `access_token_expires_at` 的形式存储在 localStorage 中。请求拦截器包含 5 秒的 token 过期宽限期。

### 响应格式处理

API 层处理两种响应格式：
1. **包装格式**：`{code: 200, message: "...", data: {...}}` - 返回 `data`
2. **未包装格式**：直接返回响应数据（例如历史记录列表）

### 基于角色的重定向

登录后，根据用户角色进行重定向：
- 普通用户 → `/user`
- 管理员用户 → `/admin`

## 类型安全

TypeScript 配置为启用严格模式。检查未使用的局部变量/参数以防止代码膨胀。
