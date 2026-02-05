# 页面文档

本文档详细介绍了项目中所有页面的功能、组件结构和使用说明。

---

## 目录

1. [登录页 `/login`](#1-登录页-login)
2. [用户页 `/user`](#2-用户页-user)
3. [管理后台 `/admin`](#3-管理后台-admin)
4. [404 页面](#4-404-页面)

---

## 1. 登录页 `/login`

**文件位置**：[src/pages/Login/index.tsx](src/pages/Login/index.tsx) | [index.css](src/pages/Login/index.css)

### 功能概述

用户通过手机号和短信验证码进行身份验证，登录成功后根据用户角色自动跳转至对应页面。

### 主要功能

| 功能 | 说明 |
|------|------|
| 手机号输入 | 支持中国大陆 11 位手机号（1 开头，第二位 3-9） |
| 发送验证码 | 点击按钮发送短信验证码，60 秒倒计时 |
| 记住我 | 勾选后保存手机号，下次自动填充 |
| 自动登录 | token 未过期时自动跳转 |

### 登录流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  输入手机号  │ ──▶ │ 获取验证码  │ ──▶ │  输入验证码  │
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   跳转页面   │ ◀─▶ │  保存 Token  │ ◀─▶ │  提交登录   │
└─────────────┘     └─────────────┘     └─────────────┘
     │
     ├─▶ /user  (普通用户)
     └─▶ /admin (管理员)
```

### 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| `phone` | string | 手机号 |
| `code` | string | 验证码 |
| `loading` | boolean | 登录请求中 |
| `sending` | boolean | 发送验证码中 |
| `countdown` | number | 验证码倒计时 |
| `rememberMe` | boolean | 是否记住手机号 |

### API 调用

- **发送验证码**：`sendVerificationCode(phone)` [src/api/auth.ts](src/api/auth.ts)
- **登录**：`login(phone, code)` [src/api/auth.ts](src/api/auth.ts)
- **获取用户信息**：`getCurrentUser()` [src/api/user.ts](src/api/user.ts)

### 本地存储

| Key | 说明 |
|-----|------|
| `access_token` | 登录后的访问令牌 |
| `access_token_expires_at` | Token 过期时间戳 |
| `remembered_phone` | 记住手机号时保存 |

---

## 2. 用户页 `/user`

**文件位置**：[src/pages/User/index.tsx](src/pages/User/index.tsx) | [index.css](src/pages/User/index.css)

### 功能概述

TTS 语音合成工作台，用户可以选择音色、调整参数、输入文本并生成语音。

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                       顶部导航栏                              │
│   Logo  |  积分显示  |  用户头像                            │
├──────────┬────────────────────────────┬─────────────────────┤
│          │                            │                     │
│  音色库   │        操作控制区           │     生成历史        │
│          │                            │                     │
│  - 筛选   │  - 音色选择/克隆            │  - 历史记录列表     │
│  - 列表   │  - 情感控制                │                     │
│  - 预览   │  - 基础参数                │                     │
│          │  - 文本输入                │                     │
│          │  - 生成按钮                │                     │
│          │                            │                     │
└──────────┴────────────────────────────┴─────────────────────┘
```

### 功能模块

#### 2.1 音色库（左侧面板）

**组件**：[VoiceCard.tsx](src/pages/User/components/VoiceCard.tsx)

| 功能 | 说明 |
|------|------|
| 筛选音色 | 按性别（男/女）、年龄段（儿童/青年/中年/老年）筛选 |
| 选择音色 | 点击卡片选中音色 |
| 试听音色 | 点击播放按钮试听音色示例 |
| 无限滚动 | 滚动到底部自动加载更多 |

#### 2.2 操作控制区（中间区域）

| 组件 | 文件 | 功能 |
|------|------|------|
| 音色选择/克隆 | [User/index.tsx:161-204](src/pages/User/index.tsx#L161-L204) | 使用库音色或上传音频克隆 |
| 情感控制 | [EmotionControls.tsx](src/pages/User/components/EmotionControls.tsx) | 上传参考音频、调整情感权重 |
| 基础参数 | [BasicParams.tsx](src/pages/User/components/BasicParams.tsx) | 调节语速、音量 |
| 文本输入 | [TextComposer.tsx](src/pages/User/components/TextComposer.tsx) | 输入要合成的文本 |
| 生成按钮 | [GenerateButton.tsx](src/pages/User/components/GenerateButton.tsx) | 提交合成请求 |

#### 2.3 生成历史（右侧面板）

**组件**：[HistoryList.tsx](src/pages/User/components/HistoryList.tsx)

- 显示历史生成的语音记录
- 可播放、下载历史音频

### 自定义 Hook

**文件**：[useUserPage.ts](src/pages/User/useUserPage.ts)

封装了用户页的所有业务逻辑，包括：

- 音色列表加载与筛选
- 音色预览播放
- 克隆音频上传
- 情感参考音频处理
- 语音合成提交
- 历史记录加载
- 激活码兑换
- 登出

### API 调用

- **获取音色列表**：`getVoices(params)` [src/api/voice.ts](src/api/voice.ts)
- **合成语音**：`synthesizeVoice(data)` [src/api/synthesis.ts](src/api/synthesis.ts)
- **获取历史**：`getHistoryList()` [src/api/history.ts](src/api/history.ts)
- **上传克隆音频**：`uploadCloneAudio(file)` [src/api/synthesis.ts](src/api/synthesis.ts)
- **兑换激活码**：`redeemInviteCode(code)` [src/api/credits.ts](src/api/credits.ts)

---

## 3. 管理后台 `/admin`

**文件位置**：[src/pages/Admin/index.tsx](src/pages/Admin/index.tsx) | [index.css](src/pages/Admin/index.css)

### 功能概述

管理员专用后台，用于管理用户、查看流水记录和管理邀请码。

### 页面布局

```
┌─────────────┬─────────────────────────────────────────────┐
│             │              顶部导航栏                       │
│   左侧菜单   │   页面标题  |  管理员标识  |  用户信息  │ 退出 │
│             ├─────────────────────────────────────────────┤
│             │                                             │
│  - 用户管理  │              内容区域                        │
│  - 流水记录  │                                             │
│  - 邀请码    │              (根据菜单切换)                  │
│             │                                             │
└─────────────┴─────────────────────────────────────────────┘
```

### 功能模块

#### 3.1 用户管理

**功能**：
- 查看用户列表（支持按 UID/手机号搜索、按状态筛选）
- 冻结/解冻用户账号
- 为用户充值积分（可设置有效期）

| 字段 | 说明 |
|------|------|
| UID | 用户唯一标识 |
| 手机号 | 注册手机号 |
| 用户名 | 昵称（可选） |
| 状态 | 正常 / 已冻结 |
| 积分 | 当前积分余额 |
| 积分到期 | 积分过期时间 |

#### 3.2 流水记录

**功能**：
- 查看全站积分流水明细
- 按时间范围筛选
- 按用户（UID/手机号）筛选
- 按交易类型筛选

| 交易类型 | 说明 |
|----------|------|
| `synthesis` | 语音生成消耗 |
| `admin_recharge` | 后台充值 |
| `refund` | 退款 |
| `invite_code` | 邀请注册奖励 |

#### 3.3 邀请码管理

**功能**：
- 生成新的邀请码
- 查看邀请码使用记录
- 显示邀请码状态、积分、使用者信息

| 字段 | 说明 |
|------|------|
| 邀请码 | 唯一码 |
| 状态 | 未使用 / 已使用 |
| 积分 | 该码包含的积分数量 |
| 创建时间 | 生成时间 |
| 使用时间 | 被使用的时间 |
| 使用者 | 使用该码的用户 ID |

### API 调用

- **获取用户列表**：`getAdminUsers(params)` [src/api/admin.ts](src/api/admin.ts)
- **更新用户状态**：`updateUserStatus(id, status)` [src/api/admin.ts](src/api/admin.ts)
- **充值积分**：`rechargeCredits(data)` [src/api/admin.ts](src/api/admin.ts)
- **获取流水记录**：`getAdminTransactions(params)` [src/api/admin.ts](src/api/admin.ts)
- **获取邀请码列表**：`getInviteCodes(params)` [src/api/admin.ts](src/api/admin.ts)
- **生成邀请码**：`generateInviteCode()` [src/api/admin.ts](src/api/admin.ts)

---

## 4. 404 页面

**路由**：`*`（匹配所有未定义路由）

**显示内容**：`404 - 页面不存在`

### 实现位置

[App.tsx:27](src/App.tsx#L27)

```tsx
<Route path="*" element={<div>404 - 页面不存在</div>} />
```

---

## 路由配置总览

**文件**：[src/App.tsx](src/App.tsx)

| 路由 | 组件 | 权限 |
|------|------|------|
| `/` | 重定向到 `/login` | 公开 |
| `/login` | Login | 公开 |
| `/user` | User | 需登录（普通用户） |
| `/admin` | Admin | 需登录（管理员） |
| `*` | 404 | - |

### 权限控制

- **登录页**：所有人均可访问
- **用户页**：
  - 开发环境：配置 `VITE_DEV_TOKEN` 后自动以该 token 身份访问
  - 生产环境：需有效 token，非管理员自动跳转
- **管理后台**：
  - 开发环境：配置 `VITE_DEV_TOKEN` 后需管理员身份
  - 生产环境：需有效 token + 管理员角色，否则重定向到 `/user`

---

## 组件复用

### 通用 UI 组件

**目录**：[src/components/ui/](src/components/ui/)

| 组件 | 文件 | 用途 |
|------|------|------|
| Button | [Button.tsx](src/components/ui/Button.tsx) | 通用按钮（支持多种样式变体） |
| Modal | [Modal.tsx](src/components/ui/Modal.tsx) | 通用弹窗 |

### 错误边界

**文件**：[src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx)

包裹所有路由，捕获组件树中的 JavaScript 错误，防止整个应用崩溃。

---

## 状态管理策略

本项目不使用 Redux/Zustand 等全局状态管理库，采用：

1. **组件本地状态**：`useState` 管理组件内部状态
2. **自定义 Hooks**：页面级逻辑封装（如 [useUserPage.ts](src/pages/User/useUserPage.ts)）
3. **localStorage**：持久化 token 和用户偏好设置

---

## 样式组织

- **组件就近原则**：每个页面组件有对应的 `index.css` 文件
- **全局样式**：[src/index.css](src/index.css) 定义全局 CSS 变量
- **App 样式**：[src/App.css](src/App.css) 定义应用级样式

---

**文档版本**：1.0
**最后更新**：2026-02-04
