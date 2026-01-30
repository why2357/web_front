# 📘 前端开发完整指南 - 给后端工程师

## 🎯 项目概述

这是一个基于 React + TypeScript + Vite 的 TTS（文字转语音）系统前端项目。

### 技术栈
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全的 JavaScript
- **Vite 7** - 超快的构建工具
- **React Router** - 客户端路由
- **Axios** - HTTP 请求库

---

## 📁 项目结构详解

```
web_front/
├── src/
│   ├── api/                      # API 层（类似后端的 Service 层）
│   │   ├── request.ts            # Axios 封装，统一处理请求/响应
│   │   ├── auth.ts               # 认证 API（登录、登出）
│   │   ├── user.ts               # 用户 API（获取/更新用户信息）
│   │   ├── voice.ts              # 音色和语音合成 API
│   │   ├── history.ts            # 历史记录 API
│   │   └── admin.ts              # 管理后台 API
│   │
│   ├── pages/                    # 页面组件（类似后端的 Controller）
│   │   ├── Login/                # 登录页
│   │   │   ├── index.tsx         # 组件逻辑
│   │   │   └── index.css         # 组件样式
│   │   ├── User/                 # 用户工作台
│   │   │   ├── index.tsx
│   │   │   └── index.css
│   │   └── Admin/                # 管理后台
│   │       ├── index.tsx
│   │       └── index.css
│   │
│   ├── App.tsx                   # 根组件（路由配置）
│   ├── main.tsx                  # 应用入口
│   └── index.css                 # 全局样式
│
├── index.html                    # HTML 入口
├── package.json                  # 依赖配置（类似 pom.xml）
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 构建配置
└── README.md                     # 项目说明
```

---

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
构建产物在 `dist/` 目录

---

## 🔧 核心概念

### 1. React 组件

React 组件类似后端的"类"，但用于渲染 UI。

```typescript
// 函数组件（推荐）
function MyComponent() {
  return <div>Hello World</div>;
}

// 带状态的组件
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 2. React Hooks

Hooks 是 React 的"特殊函数"，用于管理组件状态和生命周期。

#### useState - 状态管理
```typescript
const [state, setState] = useState(initialValue);

// 示例
const [name, setName] = useState('张三');
const [age, setAge] = useState(25);

// 更新状态
setName('李四');
setAge(age + 1);
```

#### useEffect - 副作用（类似生命周期）
```typescript
useEffect(() => {
  // 组件挂载时执行（类似 @PostConstruct）
  console.log('Component mounted');
  
  // 返回清理函数（类似 @PreDestroy）
  return () => {
    console.log('Component unmounted');
  };
}, []); // 空数组 = 只执行一次

useEffect(() => {
  // 当 count 变化时执行
  console.log('Count changed:', count);
}, [count]); // 依赖数组
```

### 3. JSX 语法

JSX 是在 JavaScript 中写 HTML 的语法。

```typescript
// 变量插值
const name = '张三';
<div>Hello, {name}!</div>

// 条件渲染
{isLoggedIn ? <Dashboard /> : <Login />}

// 列表渲染
{users.map(user => (
  <div key={user.id}>{user.name}</div>
))}

// 事件处理
<button onClick={handleClick}>点击</button>
<input onChange={(e) => setText(e.target.value)} />
```

### 4. TypeScript 类型

```typescript
// 基础类型
const name: string = '张三';
const age: number = 25;
const isActive: boolean = true;

// 数组
const numbers: number[] = [1, 2, 3];
const users: User[] = [];

// 对象（接口）
interface User {
  id: string;
  name: string;
  age: number;
}

const user: User = {
  id: '1',
  name: '张三',
  age: 25,
};

// 函数
function greet(name: string): string {
  return `Hello, ${name}`;
}

const add = (a: number, b: number): number => a + b;

// 可选属性
interface Config {
  title: string;
  description?: string;  // 可选
}

// 联合类型
type Status = 'pending' | 'success' | 'error';
const status: Status = 'success';
```

---

## 🌐 API 调用

### 基本用法

```typescript
import { getCurrentUser } from '@/api/user';

// async/await 方式（推荐）
const loadUser = async () => {
  try {
    const user = await getCurrentUser();
    console.log(user);
  } catch (error) {
    console.error(error);
  }
};

// Promise 方式
getCurrentUser()
  .then(user => console.log(user))
  .catch(error => console.error(error));
```

### 在组件中使用

```typescript
function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data);
    } catch (error: any) {
      alert(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>未登录</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>积分: {user.credits}</p>
    </div>
  );
}
```

---

## 🎨 样式处理

### CSS 文件

```css
/* 每个组件都有自己的 CSS 文件 */
.container {
  padding: 20px;
  background: white;
}

.button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
}

.button:hover {
  background: #2563eb;
}
```

### 在组件中使用

```typescript
import './index.css';

function MyComponent() {
  return (
    <div className="container">
      <button className="button">点击</button>
    </div>
  );
}
```

---

## 🔀 路由管理

### 配置路由（App.tsx）

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 页面跳转

```typescript
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 登录成功后跳转
    navigate('/user');
  };

  return <button onClick={handleLogin}>登录</button>;
}
```

---

## 🐛 调试技巧

### 1. 使用 console.log

```typescript
console.log('变量值:', user);
console.log('API 响应:', data);
console.error('错误:', error);
```

### 2. React DevTools

在浏览器中安装 React DevTools 扩展，可以查看组件树和状态。

### 3. 网络请求

打开浏览器开发者工具（F12）→ Network 标签，查看所有 HTTP 请求。

---

## 📝 常用命令

```bash
# 安装新依赖
npm install <package-name>

# 安装开发依赖
npm install --save-dev <package-name>

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 检查依赖更新
npm outdated

# 更新依赖
npm update
```

---

## 🔒 Token 管理

### 保存 Token

```typescript
localStorage.setItem('access_token', token);
```

### 读取 Token

```typescript
const token = localStorage.getItem('access_token');
```

### 删除 Token

```typescript
localStorage.removeItem('access_token');
```

### 自动添加 Token

在 `src/api/request.ts` 中已配置请求拦截器，会自动添加 Token 到请求头。

---

## 🚨 常见错误

### 1. "Cannot find module"

**原因**: 文件路径错误或文件不存在

**解决**: 检查 import 路径是否正确

```typescript
// ✅ 正确
import User from './pages/User';

// ❌ 错误
import User from './pages/Users'; // 文件名拼写错误
```

### 2. "X is not a function"

**原因**: 变量不是函数或未定义

**解决**: 检查变量定义和导入

```typescript
// ✅ 正确
import { getCurrentUser } from './api/user';
const user = await getCurrentUser();

// ❌ 错误
import getCurrentUser from './api/user'; // 错误的导入方式
```

### 3. CORS 跨域错误

**原因**: 后端未配置 CORS

**解决**: 后端需要允许前端域名访问

```python
# FastAPI 示例
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. "Unexpected token '<'"

**原因**: 后端返回 HTML 而不是 JSON

**解决**: 检查后端接口是否正确，查看 Network 标签中的响应内容

---

## 📚 学习资源

### 官方文档
- [React 官方文档](https://react.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)

### 推荐教程
- React 官方教程（Tic-Tac-Toe 游戏）
- TypeScript for Java/C# Programmers

---

## 🎉 下一步

1. **启动项目**: `npm run dev`
2. **测试登录**: 输入手机号和验证码
3. **测试 TTS**: 选择音色、输入文本、生成语音
4. **查看管理后台**: 使用管理员账号登录

有问题随时问！Happy Coding! 🚀
