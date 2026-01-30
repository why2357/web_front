# 🎙️ Crea Vedio - TTS 配音系统前端

基于 React + TypeScript + Vite 构建的现代化 TTS（文字转语音）系统。

## 📁 项目结构

```
web_front/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── request.ts          # Axios 封装（HTTP 客户端）
│   │   ├── auth.ts             # 认证相关 API
│   │   ├── user.ts             # 用户信息 API
│   │   ├── voice.ts            # 音色和语音合成 API
│   │   └── history.ts          # 历史记录 API
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Login/              # 登录页
│   │   │   ├── index.tsx
│   │   │   └── index.css
│   │   └── User/               # 用户工作台
│   │       ├── index.tsx
│   │       └── index.css
│   │
│   ├── App.tsx                 # 根组件（路由配置）
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
│
├── index.html                  # HTML 入口
├── package.json                # 依赖配置
├── tsconfig.json               # TypeScript 配置
└── vite.config.ts              # Vite 构建配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

### 3. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 🔧 技术栈

- **React 19** - UI 框架
- **TypeScript 5** - 类型系统
- **Vite 7** - 构建工具（超快！）
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **Ant Design** - UI 组件库

## 📄 页面说明

### 1. 登录页 (`/login`)

- 手机号 + 验证码登录
- 60秒倒计时
- 自动跳转到用户页

### 2. 用户页 (`/user`)

- **左侧**: 音色选择列表
- **中间**: 文本输入、参数调节、提交合成
- **右侧**: 历史记录列表
- **顶部**: 用户信息、积分显示、退出登录

### 3. 管理后台页 (`/admin`)

- **左侧菜单**: 用户管理、流水记录、流程组管理
- **流水记录**: 
  - 时间范围筛选
  - 用户 UID 筛选
  - 交易类型筛选
  - 分页查询
  - 导出报表
- **用户管理**: 开发中...
- **流程组管理**: 开发中...

## 🔌 API 对接

后端地址配置在 `src/api/request.ts`：

```typescript
baseURL: 'http://localhost:8000'
```

所有 API 调用自动添加 Token：

```http
Authorization: Bearer <access_token>
```

## 📝 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新文件夹
2. 创建 `index.tsx` 和 `index.css`
3. 在 `src/App.tsx` 添加路由

### 调用 API

```typescript
import { getCurrentUser } from '@/api/user';

const loadUser = async () => {
  try {
    const data = await getCurrentUser();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
```

### 状态管理

使用 React Hooks：

```typescript
const [count, setCount] = useState(0);

// 更新状态
setCount(count + 1);
```

## 🐛 常见问题

### 1. 登录后 401 错误

检查 Token 是否保存：

```typescript
localStorage.getItem('access_token')
```

### 2. CORS 跨域问题

后端需要配置 CORS 允许前端域名。

### 3. 请求超时

在 `src/api/request.ts` 调整 `timeout` 参数。

## 📚 学习资源

- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)
- [React Router 文档](https://reactrouter.com/)

## 👨‍💻 开发者

- 后端工程师学前端系列
- 从依赖管理开始的完整教程

---

**Happy Coding! 🎉**
