# 问题记录

## 2025-02-06

### Q: OSS是什么？

**问题**：OSS 是什么？

**答案**：

OSS（Object Storage Service）是**阿里云对象存储服务**，是一种云存储解决方案。

可以把 OSS 想象成一个巨大的云端文件柜：

| 传统文件存储 | OSS 对象存储 |
|-------------|--------------|
| 存在电脑硬盘 | 存在阿里云服务器 |
| 按文件夹组织 | 按对象（文件）存储 |
| 容量有限 | 几乎无限扩容 |
| 本地访问 | 全球可访问 |

在你的项目中使用：
```
fengyun-tts.oss-cn-shanghai.aliyuncs.com
```

存储内容包括：
- 语音文件：生成的 TTS 音频（`.mp3` 文件）
- 音色试听：预设的试听音频
- 可能还有：用户头像、音频记录等

为什么使用 OSS：
- 低成本：按使用量付费，比自建服务器便宜
- 高可用：阿里云保证 99.99% 可用性
- 加速：CDN 加速，全国访问快
- 扩展性：自动扩容，不用担心存储空间

---

### Q: OSS下载错误 403 UserDisable

**问题**：
```
Failed to download voice file from OSS: 500: Failed to download file: {'status': 403, 'x-oss-request-id': '698469947877E936313422BA', 'details': {'Code': 'UserDisable', 'Message': 'UserDisable', 'RequestId': '698469947877E936313422BA', 'HostId': 'fengyun-tts.oss-cn-shanghai.aliyuncs.com', 'EC': '0003-00000801', 'RecommendDoc': 'https://api.aliyun.com/troubleshoot?q=0003-00000801'}}
```

**答案**：

这是**阿里云 OSS 存储服务**返回的错误，不是前端代码问题。

错误详情：
- 状态码：403 禁止访问
- 错误代码：UserDisable - 用户被禁用
- EC：0003-00000801 - 阿里云 OSS 标准错误码
- HostId：fengyun-tts.oss-cn-shanghai.aliyuncs.com

可能原因：
1. OSS 账号欠费（最常见）
2. AccessKey 被禁用或失效
3. Bucket 被禁用
4. 权限配置变更

解决方案（需要后端/运维人员检查）：
1. 登录阿里云控制台 → 检查 OSS 账号状态和欠费情况
2. 检查 AccessKey → 确保 AccessKey 有效且未禁用
3. 检查 Bucket 状态 → 确认 fengyun-tts Bucket 正常运行
4. 查看访问日志 → 确认是否有异常访问或安全限制

---

### Q: 计费规则

**问题**：不满一秒按照一秒算

**答案**：

这是云服务常见的计费规则：按秒计费，向上取整

| 实际时长 | 计费时长 |
|----------|----------|
| 0.1 秒 | 1 秒 |
| 0.5 秒 | 1 秒 |
| 1.2 秒 | 2 秒 |
| 3.8 秒 | 4 秒 |

公式：计费时长 = ⌈实际时长⌉（向上取整）

应用场景：
- OSS 存储流量计费
- TTS 语音生成计费
- 云服务器按秒计费
- 音频/视频转码服务

如果需要在系统中显示，可以在以下位置添加提示：
1. 用户页面 - 显示音频时长和计费时长
2. 历史记录 - 展示计费规则说明
3. 帮助文档 - 详细解释计费方式

