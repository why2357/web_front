# 配音Web服务 - 前端API文档

## 📋 目录

- [通用说明](#通用说明)
- [1. 认证模块 (Authentication)](#1-认证模块-authentication)
- [2. 用户信息模块 (User Info)](#2-用户信息模块-user-info)
- [3. 音色管理模块 (Voices)](#3-音色管理模块-voices)
- [4. 语音合成模块 (Voice Synthesis)](#4-语音合成模块-voice-synthesis)
- [5. 积分管理模块 (Credits)](#5-积分管理模块-credits)
- [6. 历史记录模块 (History)](#6-历史记录模块-history)
- [7. 文件上传模块 (Files)](#7-文件上传模块-files)
- [8. 管理后台模块 (Admin)](#8-管理后台模块-admin)

---

## 通用说明

### 基础URL

```
http://your-domain.com
```

### 统一响应格式

所有接口返回格式统一为：

```json
{
  "code": 200,
  "message": "success",
  "data": { /* 具体数据 */ }
}
```

**字段说明：**
- `code` (int): HTTP状态码
  - `200`: 成功
  - `201`: 创建成功
  - `400`: 请求参数错误
  - `401`: 未授权（未登录或token过期）
  - `402`: 积分不足
  - `403`: 权限不足（账号被冻结等）
  - `404`: 资源不存在
  - `500`: 服务器内部错误
- `message` (string): 提示信息，可直接展示给用户
- `data` (any): 响应数据，根据不同接口返回不同结构

### 认证方式

除了登录和发送验证码接口外，所有接口都需要在请求头中携带Token：

```http
Authorization: Bearer <access_token>
```

### 分页参数

分页接口统一使用以下查询参数：

- `page` (int): 页码，从1开始，默认1
- `size` (int): 每页数量，范围1-100，默认20

分页响应统一包含：

```json
{
  "items": [ /* 数据列表 */ ],
  "total": 100,
  "page": 1,
  "size": 20,
  "total_pages": 5
}
```

---

## 1. 认证模块 (Authentication)

### 1.1 发送短信验证码

**接口地址：** `POST /api/auth/send-code`

**说明：** 发送手机短信验证码，用于登录

**请求参数：**

```json
{
  "phone": "13800138000",
  "purpose": "login"
}
```

**字段说明：**
- `phone` (string, 必填): 手机号，11位数字，1开头
- `purpose` (string, 可选): 用途，固定值"login"，默认"login"

**响应示例：**

```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "phone": "13800138000",
    "expires_in": 300
  }
}
```

**响应字段：**
- `phone` (string): 手机号
- `expires_in` (int): 验证码有效期，单位秒（通常为300秒=5分钟）

---

### 1.2 手机号登录

**接口地址：** `POST /api/auth/login`

**说明：** 手机号+验证码登录，首次登录自动注册

**请求参数：**

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**字段说明：**
- `phone` (string, 必填): 手机号，11位数字
- `code` (string, 必填): 6位数字验证码

**响应示例：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "role": "user",
    "is_new_user": false
  }
}
```

**响应字段：**
- `access_token` (string): 访问令牌，后续请求需携带
- `token_type` (string): 令牌类型，固定为"bearer"
- `role` (string): 用户角色，"user"=普通用户，"admin"=管理员
- `is_new_user` (boolean): 是否为新注册用户

**错误响应：**

```json
{
  "code": 401,
  "message": "验证码错误或已过期",
  "data": null
}
```

```json
{
  "code": 403,
  "message": "账号已被冻结",
  "data": null
}
```

---

### 1.3 使用邀请码

**接口地址：** `POST /api/auth/use-invite-code`

**说明：** 使用邀请码增加积分，一个用户可以使用多个邀请码

**鉴权：** 需要登录

**请求参数：**

```json
{
  "invite_code": "M2GU-79JL"
}
```

**字段说明：**
- `invite_code` (string, 必填): 邀请码，最多50字符

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "credits_added": 1000,
    "new_balance": 1000,
    "expires_at": "2027-01-23T10:30:00"
  }
}
```

**响应字段：**
- `credits_added` (int): 本次增加的积分数量
- `new_balance` (int): 使用后的积分余额
- `expires_at` (string): 积分过期时间（ISO 8601格式）

**注意事项：**
- 每次使用邀请码后，账号所有积分的过期时间都会刷新为：当前时间+365天
- 首次使用邀请码会自动激活账号

---

### 1.4 获取当前用户信息

**接口地址：** `GET /api/auth/me`

**说明：** 获取当前登录用户的详细信息

**鉴权：** 需要登录

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "13800138000",
    "username": "张三",
    "role": "user",
    "status": "active",
    "credits_balance": 1000,
    "credits_expire_at": "2027-01-23T10:30:00",
    "created_at": "2026-01-01T12:00:00",
    "last_login": "2026-01-23T09:00:00"
  }
}
```

**响应字段：**
- `uuid` (string): 用户唯一标识符（UUID格式）
- `phone` (string): 手机号
- `username` (string): 用户名（可能为空）
- `role` (string): 用户角色，"user"=普通用户，"admin"=管理员
- `status` (string): 账号状态，"active"=正常，"frozen"=已冻结
- `credits_balance` (int): 积分余额
- `credits_expire_at` (string): 积分过期时间（ISO 8601格式，可能为null）
- `created_at` (string): 注册时间（ISO 8601格式）
- `last_login` (string): 最后登录时间（ISO 8601格式，可能为null）

---

## 2. 用户信息模块 (User Info)

用户信息通过 `GET /api/auth/me` 获取，参见 [1.4 获取当前用户信息](#14-获取当前用户信息)

---

## 3. 音色管理模块 (Voices)

### 3.1 获取标签列表

**接口地址：** `GET /api/voices/tags`

**说明：** 获取所有可用的音色标签，用于筛选音色

**鉴权：** 需要登录

**查询参数：**
- `category` (string, 可选): 标签分类筛选

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "商务",
      "category": "场景",
      "description": "适合商务场合",
      "use_count": 150,
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "温柔",
      "category": "情感",
      "description": "声音温柔亲切",
      "use_count": 200,
      "sort_order": 2
    }
  ]
}
```

**响应字段：**
- `id` (int): 标签ID
- `name` (string): 标签名称
- `category` (string): 标签分类（如：场景、情感、语言等）
- `description` (string): 标签描述
- `use_count` (int): 使用次数
- `sort_order` (int): 排序权重，越小越靠前

---

### 3.2 获取公共音色模板列表

**接口地址：** `GET /api/voices/templates`

**说明：** 获取系统提供的公共音色模板，支持筛选、排序、分页

**鉴权：** 需要登录

**查询参数：**
- `gender` (string, 可选): 性别筛选，可选值：male(男)、female(女)、all(全部)
- `age_range` (string, 可选): 年龄段筛选，可选值：child(儿童)、youth(青年)、middle(中年)、old(老年)
- `category` (string, 可选): 类别筛选，如："游戏配音"、"广告旁白"、"有声书"等
- `tags` (array[string], 可选): 标签筛选，支持多个标签（必须同时包含所有标签）
- `keyword` (string, 可选): 关键词搜索，搜索名称和描述
- `sort_by` (string, 可选): 排序方式，可选值：
  - `sort_order`: 默认排序（推荐）
  - `use_count`: 按使用次数排序
  - `created_at`: 按创建时间排序
- `page` (int, 可选): 页码，默认1
- `page_size` (int, 可选): 每页数量，默认20，最大100

**请求示例：**

```
GET /api/voices/templates?gender=female&tags=商务&tags=中文&sort_by=use_count&page=1&page_size=20
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "知性女声",
        "description": "成熟稳重，适合商务场合",
        "avatar_url": "https://oss.example.com/avatars/voice_1.jpg",
        "gender": "female",
        "age_range": "middle",
        "tags": ["商务", "中文", "温柔"],
        "category": "广告旁白",
        "style": "稳重大气",
        "duration": 5.2,
        "sort_order": 1,
        "use_count": 520,
        "created_at": "2026-01-01T12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

**响应字段：**
- `items` (array): 音色列表
  - `id` (int): 音色模板ID
  - `name` (string): 音色名称
  - `description` (string): 音色描述
  - `avatar_url` (string): 音色头像URL
  - `gender` (string): 性别，male=男，female=女
  - `age_range` (string): 年龄段，child=儿童，youth=青年，middle=中年，old=老年
  - `tags` (array[string]): 标签列表
  - `category` (string): 类别（如：游戏配音、广告旁白等）
  - `style` (string): 风格描述
  - `duration` (float): 音色样本时长，单位秒
  - `sort_order` (int): 排序权重，越小越靠前
  - `use_count` (int): 使用次数
  - `created_at` (string): 创建时间（ISO 8601格式）
- `total` (int): 总记录数
- `page` (int): 当前页码
- `page_size` (int): 每页数量
- `total_pages` (int): 总页数

---

### 3.3 获取指定音色模板详情

**接口地址：** `GET /api/voices/templates/{template_id}`

**说明：** 获取指定公共音色模板的详细信息

**鉴权：** 需要登录

**路径参数：**
- `template_id` (int): 音色模板ID

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "知性女声",
    "description": "成熟稳重，适合商务场合",
    "avatar_url": "https://oss.example.com/avatars/voice_1.jpg",
    "gender": "female",
    "age_range": "middle",
    "tags": ["商务", "中文", "温柔"],
    "category": "广告旁白",
    "style": "稳重大气",
    "duration": 5.2,
    "use_count": 520,
    "created_at": "2026-01-01T12:00:00"
  }
}
```

**响应字段：** 同上（3.2的单个item结构）

**错误响应：**

```json
{
  "code": 404,
  "message": "Voice template not found",
  "data": null
}
```

---

### 3.4 上传自定义音色

**接口地址：** `POST /api/voices/custom`

**说明：** 上传自定义音色文件，系统自动上传到OSS并支持MD5去重

**鉴权：** 需要登录

**请求方式：** multipart/form-data

**请求参数：**
- `name` (string, 必填): 音色名称
- `description` (string, 可选): 音色描述
- `audio_file` (file, 必填): 音频文件（必须是audio/*类型）

**响应示例：**

```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": 100,
    "name": "我的音色",
    "description": "这是我自己的声音",
    "file_size": 1024000,
    "duration": 10.5,
    "is_duplicate": false,
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**响应字段：**
- `id` (int): 自定义音色ID，用于后续生成语音
- `name` (string): 音色名称
- `description` (string): 音色描述
- `file_size` (int): 文件大小，单位字节
- `duration` (float): 音频时长，单位秒
- `is_duplicate` (boolean): 是否为重复文件（已存在相同MD5的文件）
- `created_at` (string): 创建时间（ISO 8601格式）

**错误响应：**

```json
{
  "code": 400,
  "message": "File must be an audio file",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "File size exceeds maximum allowed size (10485760 bytes)",
  "data": null
}
```

---

### 3.5 获取自定义音色列表

**接口地址：** `GET /api/voices/custom`

**说明：** 获取当前用户上传的所有自定义音色

**鉴权：** 需要登录

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 100,
      "name": "我的音色",
      "description": "这是我自己的声音",
      "file_size": 1024000,
      "duration": 10.5,
      "created_at": "2026-01-23T10:30:00"
    }
  ]
}
```

**响应字段：**
- `id` (int): 自定义音色ID
- `name` (string): 音色名称
- `description` (string): 音色描述
- `file_size` (int): 文件大小，单位字节
- `duration` (float): 音频时长，单位秒
- `created_at` (string): 创建时间（ISO 8601格式）

---

### 3.6 获取指定自定义音色详情

**接口地址：** `GET /api/voices/custom/{voice_id}`

**说明：** 获取指定自定义音色的详细信息

**鉴权：** 需要登录

**路径参数：**
- `voice_id` (int): 自定义音色ID

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 100,
    "name": "我的音色",
    "description": "这是我自己的声音",
    "file_size": 1024000,
    "duration": 10.5,
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**响应字段：** 同上（3.5的单个item结构）

**错误响应：**

```json
{
  "code": 404,
  "message": "Custom voice not found or access denied",
  "data": null
}
```

---

## 4. 语音合成模块 (Voice Synthesis)

### 4.1 生成语音

**接口地址：** `POST /api/synthesis/generate`

**说明：** 根据文本内容生成语音，支持多种情感控制方式

**鉴权：** 需要登录

**请求参数：**

```json
{
  "text_content": "你好，欢迎使用配音服务",
  "voice_template_id": 1,
  "emo_control_method": 0,
  "emo_weight": 1.0,
  "speed": 1.0,
  "volume_scale": 1.0,
  "max_text_tokens_per_sentence": 120
}
```

**字段说明：**

**基本参数：**
- `text_content` (string, 必填): 要转换的文本内容，最多500字

**音色选择（二选一，必须指定一个）：**
- `voice_template_id` (int, 可选): 公共音色模板ID（从3.2接口获取）
- `custom_voice_id` (int, 可选): 自定义音色ID（从3.5接口获取）

**情感控制参数：**
- `emo_control_method` (int, 必填): 情感控制方式，默认0
  - `0`: 使用参考音频情感（与音色文件保持一致）
  - `1`: 使用情感参考音频（需要上传额外的情感参考音频）
  - `2`: 使用情感向量（精确控制8种情感）
  - `3`: 使用情感文本描述（自然语言描述情感）
- `emo_audio` (string, 可选): 情感参考音频OSS Key，当`emo_control_method=1`时必填（从4.2接口获取）
- `emo_vec` (array[float], 可选): 情感向量，8维数组，当`emo_control_method=2`时必填
  - 格式：`[喜, 怒, 哀, 惧, 厌恶, 低落, 惊喜, 平静]`
  - 示例：`[0.5, 0.1, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2]`
- `emo_text` (string, 可选): 情感描述文本，当`emo_control_method=3`时必填，最多500字
  - 示例："充满活力和热情，语气欢快"
- `emo_weight` (float, 可选): 情感权重，范围0.0-1.6，默认1.0

**音频控制参数：**
- `speed` (float, 可选): 语速，范围0.5-2.0，默认1.0
  - `0.5`: 0.5倍速（慢）
  - `1.0`: 正常语速
  - `1.5`: 1.5倍速（快）
  - `2.0`: 2倍速（很快）
- `volume_scale` (float, 可选): 音量控制，范围0.1-2.0，默认1.0
- `max_text_tokens_per_sentence` (int, 可选): 分句最大Token数，范围20-200，默认120

**请求示例1（使用公共音色，默认情感）：**

```json
{
  "text_content": "今天天气真好",
  "voice_template_id": 1,
  "emo_control_method": 0,
  "speed": 1.0,
  "volume_scale": 1.0
}
```

**请求示例2（使用自定义音色+情感参考音频）：**

```json
{
  "text_content": "今天天气真好",
  "custom_voice_id": 100,
  "emo_control_method": 1,
  "emo_audio": "emotion_audio/user_123/a1b2c3d4e5f6.mp3",
  "emo_weight": 1.2,
  "speed": 1.2,
  "volume_scale": 1.1
}
```

**请求示例3（使用情感向量）：**

```json
{
  "text_content": "今天天气真好",
  "voice_template_id": 1,
  "emo_control_method": 2,
  "emo_vec": [0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.0],
  "emo_weight": 1.0,
  "speed": 1.0
}
```

**响应示例：**

```json
{
  "code": 201,
  "message": "success",
  "data": {
    "id": 1001,
    "audio_url": "https://oss.example.com/generated/audio_123.mp3?signature=xxx",
    "file_size": 2048000,
    "duration": 15.5,
    "credits_used": 10,
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**响应字段：**
- `id` (int): 历史记录ID，可用于查询历史记录
- `audio_url` (string): 音频文件下载链接（OSS签名URL，有效期1小时）
- `file_size` (int): 文件大小，单位字节
- `duration` (float): 音频时长，单位秒
- `credits_used` (int): 本次消耗的积分数量（1 token = 1 积分）
- `created_at` (string): 生成时间（ISO 8601格式）

**错误响应：**

```json
{
  "code": 400,
  "message": "Must specify either voice_template_id or custom_voice_id",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "emo_audio is required when emo_control_method=1",
  "data": null
}
```

```json
{
  "code": 402,
  "message": "Insufficient credits. Required: 50, Available: 30",
  "data": null
}
```

**注意事项：**
- 积分计算规则：1 token = 1 积分（token计算基于文本长度）
- 音频URL有效期为1小时，超时后需要通过历史记录接口重新获取下载链接
- 生成的音频会自动保存到历史记录

---

### 4.2 上传情感参考音频

**接口地址：** `POST /api/synthesis/upload-emotion-reference`

**说明：** 上传情感参考音频，用于情感控制方式1（emo_control_method=1）

**鉴权：** 需要登录

**请求方式：** multipart/form-data

**请求参数：**
- `audio_file` (file, 必填): 音频文件（必须是audio/*类型）

**响应示例：**

```json
{
  "code": 200,
  "message": "Emotion reference uploaded successfully",
  "data": {
    "emo_audio_identifier": "emotion_audio/user_123/a1b2c3d4e5f6.mp3",
    "emo_audio": "emotion_audio/user_123/a1b2c3d4e5f6.mp3",
    "file_size": 512000,
    "is_duplicate": false,
    "md5": "a1b2c3d4e5f6g7h8i9j0"
  }
}
```

**响应字段：**
- `emo_audio_identifier` (string): 情感参考音频标识符（推荐使用此字段）
- `emo_audio` (string): 情感参考音频OSS Key（兼容旧版本，与emo_audio_identifier相同）
- `file_size` (int): 文件大小，单位字节
- `is_duplicate` (boolean): 是否为重复文件（已存在相同MD5的文件）
- `md5` (string): 文件MD5值

**使用说明：**
1. 先调用此接口上传情感参考音频
2. 获取返回的`emo_audio_identifier`或`emo_audio`
3. 在调用4.1生成语音接口时，将此标识符作为`emo_audio`参数传入

**错误响应：**

```json
{
  "code": 400,
  "message": "File must be an audio file",
  "data": null
}
```

---

## 5. 积分管理模块 (Credits)

### 5.1 获取积分余额

**接口地址：** `GET /api/credits/balance`

**说明：** 获取当前用户的积分余额和统计信息

**鉴权：** 需要登录

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "balance": 1000,
    "total_earned": 2000,
    "total_spent": 1000,
    "expires_at": "2027-01-23T10:30:00"
  }
}
```

**响应字段：**
- `balance` (int): 当前积分余额
- `total_earned` (int): 累计获得积分
- `total_spent` (int): 累计消费积分
- `expires_at` (string): 积分过期时间（ISO 8601格式，可能为null）

---

### 5.2 获取积分流水记录

**接口地址：** `GET /api/credits/transactions`

**说明：** 获取当前用户的积分变动记录，支持分页

**鉴权：** 需要登录

**查询参数：**
- `page` (int, 可选): 页码，默认1
- `size` (int, 可选): 每页数量，默认20，最大100

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "items": [
      {
        "amount": -10,
        "balance_after": 990,
        "transaction_type": "voice_synthesis",
        "description": "Generated audio for text: 今天天气真好...",
        "created_at": "2026-01-23T10:30:00"
      },
      {
        "amount": 1000,
        "balance_after": 1000,
        "transaction_type": "invite_code",
        "description": "使用邀请码: M2GU-79JL",
        "created_at": "2026-01-23T10:00:00"
      }
    ]
  }
}
```

**响应字段：**
- `total` (int): 总记录数
- `items` (array): 流水记录列表
  - `amount` (int): 积分变动数量（正数=增加，负数=消费）
  - `balance_after` (int): 变动后的积分余额
  - `transaction_type` (string): 交易类型
    - `invite_code`: 使用邀请码
    - `voice_synthesis`: 语音生成
    - `admin_recharge`: 后台充值
    - `refund`: 退款
  - `description` (string): 交易描述
  - `created_at` (string): 交易时间（ISO 8601格式）

---

## 6. 历史记录模块 (History)

### 6.1 获取配音历史记录列表

**接口地址：** `GET /api/history`

**说明：** 获取当前用户的配音历史记录，支持分页

**鉴权：** 需要登录

**查询参数：**
- `page` (int, 可选): 页码，默认1
- `size` (int, 可选): 每页数量，默认20，最大100

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "items": [
      {
        "id": 1001,
        "text_content": "今天天气真好",
        "voice_template_id": 1,
        "custom_voice_id": null,
        "emotion_control_type": "same_as_reference",
        "file_size": 2048000,
        "duration": 15.5,
        "credits_used": 10,
        "created_at": "2026-01-23T10:30:00"
      }
    ]
  }
}
```

**响应字段：**
- `total` (int): 总记录数
- `items` (array): 历史记录列表
  - `id` (int): 历史记录ID
  - `text_content` (string): 生成时使用的文本内容
  - `voice_template_id` (int): 公共音色模板ID（可能为null）
  - `custom_voice_id` (int): 自定义音色ID（可能为null）
  - `emotion_control_type` (string): 情感控制类型
    - `same_as_reference`: 使用参考音频情感
    - `emotion_reference`: 使用情感参考音频
    - `vector_control`: 使用情感向量
    - `text_control`: 使用情感文本
  - `file_size` (int): 文件大小，单位字节
  - `duration` (float): 音频时长，单位秒
  - `credits_used` (int): 消耗的积分数量
  - `created_at` (string): 生成时间（ISO 8601格式）

---

### 6.2 获取指定历史记录详情

**接口地址：** `GET /api/history/{history_id}`

**说明：** 获取指定配音历史记录的详细信息

**鉴权：** 需要登录

**路径参数：**
- `history_id` (int): 历史记录ID

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "text_content": "今天天气真好",
    "voice_template_id": 1,
    "custom_voice_id": null,
    "emotion_control_type": "same_as_reference",
    "file_size": 2048000,
    "duration": 15.5,
    "credits_used": 10,
    "created_at": "2026-01-23T10:30:00"
  }
}
```

**响应字段：** 同上（6.1的单个item结构）

**错误响应：**

```json
{
  "code": 404,
  "message": "Audio history not found or access denied",
  "data": null
}
```

---

### 6.3 删除历史记录

**接口地址：** `DELETE /api/history/{history_id}`

**说明：** 删除指定的配音历史记录

**鉴权：** 需要登录

**路径参数：**
- `history_id` (int): 历史记录ID

**响应示例：**

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**错误响应：**

```json
{
  "code": 404,
  "message": "Audio history not found or access denied",
  "data": null
}
```

---

### 6.4 获取音频下载链接

**接口地址：** `GET /api/history/{history_id}/download-url`

**说明：** 获取历史记录对应音频文件的临时下载链接

**鉴权：** 需要登录

**路径参数：**
- `history_id` (int): 历史记录ID

**查询参数：**
- `expires` (int, 可选): 链接有效期，单位秒，默认3600（1小时），最大86400（24小时）

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "download_url": "https://oss.example.com/generated/audio_123.mp3?signature=xxx",
    "expires_in": 3600
  }
}
```

**响应字段：**
- `download_url` (string): 音频文件下载链接（OSS签名URL）
- `expires_in` (int): 链接有效期，单位秒

**使用场景：**
- 当4.1接口返回的`audio_url`过期后，可通过此接口重新获取下载链接
- 需要更长有效期的下载链接时（最长24小时）

---

## 7. 文件上传模块 (Files)

### 7.1 上传用户头像

**接口地址：** `POST /api/files/avatar`

**说明：** 上传用户头像，自动替换旧头像

**鉴权：** 需要登录

**请求方式：** multipart/form-data

**请求参数：**
- `avatar_file` (file, 必填): 头像文件

**支持格式：** jpg, jpeg, png, gif, webp

**文件大小限制：** 最大5MB

**响应示例：**

```json
{
  "code": 201,
  "message": "头像上传成功",
  "data": {
    "avatar_url": "https://oss.example.com/avatars/abc123.jpg?signature=xxx",
    "file_size": 204800,
    "is_duplicate": false
  }
}
```

**响应字段：**
- `avatar_url` (string): 头像URL（长期有效，10年有效期）
- `file_size` (int): 文件大小，单位字节
- `is_duplicate` (boolean): 是否为重复文件（基于MD5去重）

**错误响应：**

```json
{
  "code": 400,
  "message": "不支持的文件类型，仅支持: .jpg, .jpeg, .png, .gif, .webp",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "文件大小超过限制（最大 5MB）",
  "data": null
}
```

---

## 8. 管理后台模块 (Admin)

**说明：** 以下接口仅管理员可访问

### 8.1 邀请码管理

#### 8.1.1 生成邀请码

**接口地址：** `GET /api/admin/invite-codes/generate`

**说明：** 生成一个新的邀请码（固定1000积分）

**鉴权：** 需要管理员权限

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "M2GU-79JL",
    "status": "unused",
    "credits_amount": 1000,
    "created_at": "2026-01-23 10:30:00",
    "used_at": null,
    "used_by_id": null
  }
}
```

**响应字段：**
- `code` (string): 邀请码
- `status` (string): 状态，unused=未使用，used=已使用
- `credits_amount` (int): 积分数量，固定1000
- `created_at` (string): 创建时间（格式：YYYY-MM-DD HH:MM:SS）
- `used_at` (string): 使用时间（可能为null）
- `used_by_id` (int): 使用者用户ID（可能为null）

---

#### 8.1.2 获取邀请码历史记录

**接口地址：** `GET /api/admin/invite-codes`

**说明：** 获取当前管理员生成的所有邀请码，支持分页

**鉴权：** 需要管理员权限

**查询参数：**
- `limit` (int, 可选): 每页数量，范围1-100，默认10
- `skip` (int, 可选): 跳过记录数，默认0

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "code": "M2GU-79JL",
      "status": "used",
      "credits_amount": 1000,
      "created_at": "2026-01-23 10:30:00",
      "used_at": "2026-01-23 11:00:00",
      "used_by_id": 123
    },
    {
      "code": "X5PN-82KM",
      "status": "unused",
      "credits_amount": 1000,
      "created_at": "2026-01-23 09:00:00",
      "used_at": null,
      "used_by_id": null
    }
  ]
}
```

**响应字段：** 同上（8.1.1的数组格式）

---

### 8.2 用户管理

#### 8.2.1 获取用户列表

**接口地址：** `GET /api/admin/users`

**说明：** 获取所有用户列表，支持搜索、筛选、分页

**鉴权：** 需要管理员权限

**查询参数：**
- `keyword` (string, 可选): 搜索关键词（用户UID或手机号）
- `status_filter` (string, 可选): 状态筛选，可选值：active(正常)、frozen(已冻结)
- `page` (int, 可选): 页码，默认1
- `size` (int, 可选): 每页数量，默认10，最大100

**请求示例：**

```
GET /api/admin/users?keyword=13800&status_filter=active&page=1&size=20
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 123,
        "uid": 123,
        "phone": "13800138000",
        "username": "张三",
        "status": "active",
        "credits": "1,000 pts",
        "credits_expire_at": "2027-01-23",
        "operations": ["详情", "冻结"]
      }
    ],
    "total": 100,
    "page": 1,
    "size": 20,
    "total_pages": 5
  }
}
```

**响应字段：**
- `items` (array): 用户列表
  - `id` (int): 用户ID
  - `uid` (int): 用户UID（与id相同）
  - `phone` (string): 手机号
  - `username` (string): 用户名
  - `status` (string): 账号状态，active=正常，frozen=已冻结
  - `credits` (string): 积分余额（格式化字符串，如"1,000 pts"）
  - `credits_expire_at` (string): 积分过期日期（格式：YYYY-MM-DD，可能为null）
  - `operations` (array[string]): 可用操作列表（如：["详情", "冻结"]或["详情", "解冻"]）
- `total` (int): 总记录数
- `page` (int): 当前页码
- `size` (int): 每页数量
- `total_pages` (int): 总页数

---

#### 8.2.2 获取用户详情

**接口地址：** `GET /api/admin/users/{user_id}`

**说明：** 获取指定用户的详细信息

**鉴权：** 需要管理员权限

**路径参数：**
- `user_id` (int): 用户ID

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "uid": 123,
    "phone": "13800138000",
    "username": "张三",
    "credits": 1000,
    "credits_expire_at": "2027-01-23",
    "status": "active",
    "created_at": "2026-01-01 12:00:00",
    "last_login": "2026-01-23 09:00:00"
  }
}
```

**响应字段：**
- `id` (int): 用户ID
- `uid` (int): 用户UID（与id相同）
- `phone` (string): 手机号
- `username` (string): 用户名
- `credits` (int): 积分余额（数值）
- `credits_expire_at` (string): 积分过期日期（格式：YYYY-MM-DD，可能为null）
- `status` (string): 账号状态，active=正常，frozen=已冻结
- `created_at` (string): 注册时间（格式：YYYY-MM-DD HH:MM:SS）
- `last_login` (string): 最后登录时间（格式：YYYY-MM-DD HH:MM:SS，可能为null）

**错误响应：**

```json
{
  "code": 404,
  "message": "User not found",
  "data": null
}
```

---

#### 8.2.3 更新用户状态

**接口地址：** `PATCH /api/admin/users/{user_id}/status`

**说明：** 更新用户状态（冻结/解冻）

**鉴权：** 需要管理员权限

**路径参数：**
- `user_id` (int): 用户ID

**请求参数：**

```json
{
  "status": "frozen"
}
```

**字段说明：**
- `status` (string, 必填): 新状态，可选值：active(正常)、frozen(已冻结)

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 123,
    "uid": 123,
    "phone": "13800138000",
    "status": "frozen",
    "updated_at": "2026-01-23 10:30:00"
  }
}
```

**响应字段：**
- `id` (int): 用户ID
- `uid` (int): 用户UID（与id相同）
- `phone` (string): 手机号
- `status` (string): 更新后的状态
- `updated_at` (string): 更新时间（格式：YYYY-MM-DD HH:MM:SS）

**错误响应：**

```json
{
  "code": 400,
  "message": "status field is required",
  "data": null
}
```

```json
{
  "code": 400,
  "message": "Invalid status. Must be: active or frozen",
  "data": null
}
```

---

### 8.3 流水记录管理

#### 8.3.1 获取全站流水记录

**接口地址：** `GET /api/admin/transactions`

**说明：** 获取全站积分流水记录，支持时间范围、用户搜索、类型筛选、分页

**鉴权：** 需要管理员权限

**查询参数：**
- `start_date` (string, 可选): 开始日期，格式：YYYY/MM/DD
- `end_date` (string, 可选): 结束日期，格式：YYYY/MM/DD
- `keyword` (string, 可选): 搜索用户UID或手机号
- `transaction_type` (string, 可选): 交易类型筛选
  - `invite_code`: 邀请注册
  - `voice_synthesis`: 语音生成
  - `admin_recharge`: 后台充值
  - `refund`: 退款
- `page` (int, 可选): 页码，默认1
- `size` (int, 可选): 每页数量，默认20，最大100

**请求示例：**

```
GET /api/admin/transactions?start_date=2026/01/01&end_date=2026/01/31&transaction_type=voice_synthesis&page=1&size=20
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "created_at": "2026-01-23 10:30:00",
        "uid": 123,
        "user_id": 123,
        "username": "张三",
        "description": "语音生成",
        "credits_change": "-10 pts",
        "status": "完成"
      },
      {
        "created_at": "2026-01-23 10:00:00",
        "uid": 123,
        "user_id": 123,
        "username": "张三",
        "description": "邀请注册",
        "credits_change": "+1000 pts",
        "status": "完成"
      }
    ],
    "total": 500,
    "page": 1,
    "size": 20,
    "total_pages": 25
  }
}
```

**响应字段：**
- `items` (array): 流水记录列表
  - `created_at` (string): 交易时间（格式：YYYY-MM-DD HH:MM:SS）
  - `uid` (int): 用户UID
  - `user_id` (int): 用户ID（与uid相同）
  - `username` (string): 用户名
  - `description` (string): 交易描述（中文）
  - `credits_change` (string): 积分变动（格式化字符串，如"+1000 pts"或"-10 pts"）
  - `status` (string): 交易状态，固定为"完成"
- `total` (int): 总记录数
- `page` (int): 当前页码
- `size` (int): 每页数量
- `total_pages` (int): 总页数

**错误响应：**

```json
{
  "code": 400,
  "message": "Invalid start_date format. Use: YYYY/MM/DD",
  "data": null
}
```

---

### 8.4 积分管理

#### 8.4.1 为用户充值积分

**接口地址：** `POST /api/admin/credits/recharge`

**说明：** 管理员为指定用户充值积分

**鉴权：** 需要管理员权限

**请求参数：**

```json
{
  "user_id": 123,
  "amount": 500,
  "validity_days": 365,
  "description": "新用户奖励"
}
```

**字段说明：**
- `user_id` (int, 必填): 用户ID
- `amount` (int, 必填): 充值积分数量
- `validity_days` (int, 可选): 有效期天数，默认365天
- `description` (string, 可选): 充值说明，默认"管理员充值"

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5001,
    "user_id": 123,
    "amount": 500,
    "transaction_type": "admin_recharge",
    "description": "新用户奖励",
    "created_at": "2026-01-23 10:30:00"
  }
}
```

**响应字段：**
- `id` (int): 流水记录ID
- `user_id` (int): 用户ID
- `amount` (int): 充值积分数量
- `transaction_type` (string): 交易类型，固定为"admin_recharge"
- `description` (string): 充值说明
- `created_at` (string): 充值时间（格式：YYYY-MM-DD HH:MM:SS）

**错误响应：**

```json
{
  "code": 400,
  "message": "user_id and amount are required",
  "data": null
}
```

```json
{
  "code": 404,
  "message": "User not found",
  "data": null
}
```

---

#### 8.4.2 获取积分流水记录（管理员）

**接口地址：** `GET /api/admin/credits/transactions`

**说明：** 获取积分流水记录，可筛选指定用户，支持分页

**鉴权：** 需要管理员权限

**查询参数：**
- `user_id` (int, 可选): 用户ID筛选
- `page` (int, 可选): 页码，默认1
- `size` (int, 可选): 每页数量，默认10，最大100

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 5001,
        "user_id": 123,
        "username": "张三",
        "amount": 500,
        "transaction_type": "admin_recharge",
        "description": "新用户奖励",
        "created_at": "2026-01-23 10:30:00"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 10,
    "total_pages": 5
  }
}
```

**响应字段：**
- `items` (array): 流水记录列表
  - `id` (int): 流水记录ID
  - `user_id` (int): 用户ID
  - `username` (string): 用户名
  - `amount` (int): 积分变动数量（正数=增加，负数=消费）
  - `transaction_type` (string): 交易类型
  - `description` (string): 交易描述
  - `created_at` (string): 交易时间（格式：YYYY-MM-DD HH:MM:SS）
- `total` (int): 总记录数
- `page` (int): 当前页码
- `size` (int): 每页数量
- `total_pages` (int): 总页数

---

## 附录

### A. 枚举值说明

#### 用户状态 (UserStatus)
- `active`: 正常
- `frozen`: 已冻结

#### 用户角色 (UserRole)
- `user`: 普通用户
- `admin`: 管理员

#### 性别 (Gender)
- `male`: 男
- `female`: 女
- `all`: 全部

#### 年龄段 (AgeRange)
- `child`: 儿童
- `youth`: 青年
- `middle`: 中年
- `old`: 老年

#### 情感控制方式 (EmotionControlMethod)
- `0`: 使用参考音频情感（默认）
- `1`: 使用情感参考音频
- `2`: 使用情感向量
- `3`: 使用情感文本描述

#### 交易类型 (TransactionType)
- `invite_code`: 使用邀请码
- `voice_synthesis`: 语音生成
- `admin_recharge`: 后台充值
- `refund`: 退款

---

### B. 错误码对照表

| 错误码 | 说明 | 常见场景 |
|--------|------|----------|
| 200 | 成功 | 正常响应 |
| 201 | 创建成功 | 创建资源成功 |
| 400 | 请求参数错误 | 缺少必填参数、参数格式错误 |
| 401 | 未授权 | 未登录或token过期 |
| 402 | 积分不足 | 生成语音时积分不足 |
| 403 | 权限不足 | 账号被冻结、非管理员访问管理接口 |
| 404 | 资源不存在 | 用户不存在、音色不存在、历史记录不存在 |
| 500 | 服务器内部错误 | 服务器异常、第三方服务异常 |

---

### C. 时间格式说明

本API使用两种时间格式：

1. **ISO 8601格式**（推荐，可直接被JavaScript Date解析）
   - 格式：`YYYY-MM-DDTHH:MM:SS`
   - 示例：`2026-01-23T10:30:00`
   - 使用场景：用户模块、音色模块、历史记录模块等

2. **简单格式**（管理后台专用）
   - 格式：`YYYY-MM-DD HH:MM:SS`
   - 示例：`2026-01-23 10:30:00`
   - 使用场景：管理后台模块

**前端处理建议：**
```javascript
// ISO 8601格式
const date1 = new Date('2026-01-23T10:30:00');

// 简单格式
const date2 = new Date('2026-01-23 10:30:00'.replace(' ', 'T'));
```

---

### D. 完整调用流程示例

#### 场景1：新用户注册并生成第一段语音

```javascript
// 1. 发送验证码
POST /api/auth/send-code
{
  "phone": "13800138000",
  "purpose": "login"
}

// 2. 登录（首次自动注册）
POST /api/auth/login
{
  "phone": "13800138000",
  "code": "123456"
}
// 响应：{ "access_token": "xxx", "is_new_user": true }

// 3. 使用邀请码获得积分
POST /api/auth/use-invite-code
Authorization: Bearer xxx
{
  "invite_code": "M2GU-79JL"
}
// 响应：{ "credits_added": 1000, "new_balance": 1000 }

// 4. 获取音色模板列表
GET /api/voices/templates?page=1&page_size=20
Authorization: Bearer xxx

// 5. 生成语音
POST /api/synthesis/generate
Authorization: Bearer xxx
{
  "text_content": "你好，欢迎使用配音服务",
  "voice_template_id": 1,
  "emo_control_method": 0,
  "speed": 1.0
}
// 响应：{ "audio_url": "https://...", "credits_used": 10 }

// 6. 查看历史记录
GET /api/history?page=1&size=20
Authorization: Bearer xxx
```

#### 场景2：使用自定义音色+情感参考音频生成语音

```javascript
// 1. 上传自定义音色
POST /api/voices/custom
Authorization: Bearer xxx
Content-Type: multipart/form-data
{
  "name": "我的声音",
  "description": "我自己的声音",
  "audio_file": <file>
}
// 响应：{ "id": 100 }

// 2. 上传情感参考音频
POST /api/synthesis/upload-emotion-reference
Authorization: Bearer xxx
Content-Type: multipart/form-data
{
  "audio_file": <file>
}
// 响应：{ "emo_audio_identifier": "emotion_audio/user_123/xxx.mp3" }

// 3. 生成语音
POST /api/synthesis/generate
Authorization: Bearer xxx
{
  "text_content": "今天天气真好",
  "custom_voice_id": 100,
  "emo_control_method": 1,
  "emo_audio": "emotion_audio/user_123/xxx.mp3",
  "emo_weight": 1.2,
  "speed": 1.0
}
```

---

### E. 开发建议

1. **Token管理**
   - 将access_token保存在localStorage或sessionStorage
   - 每次请求在请求头中携带：`Authorization: Bearer <token>`
   - 收到401错误时，提示用户重新登录

2. **错误处理**
   - 统一处理HTTP状态码和响应中的code字段
   - 将message字段直接展示给用户
   - 特别处理402（积分不足）和403（账号被冻结）

3. **分页处理**
   - 使用page和size参数控制分页
   - 根据total_pages决定是否显示"加载更多"

4. **文件上传**
   - 使用FormData进行文件上传
   - 设置正确的Content-Type为multipart/form-data
   - 注意文件大小限制

5. **音频下载**
   - audio_url有效期为1小时，注意提示用户
   - 过期后通过历史记录接口重新获取下载链接
   - 建议前端实现下载功能而非直接在浏览器播放

6. **积分提示**
   - 在生成语音前，先计算所需积分并检查余额
   - 积分不足时，引导用户使用邀请码或联系管理员充值

---

## 更新日志

### v1.0.0 (2026-01-23)
- 初始版本
- 完整的API文档，涵盖所有模块
- 详细的字段说明和示例
- 完整的错误处理说明
