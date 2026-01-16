# ESA Pages 简化部署指南（最终版）

## ✅ 好消息：不需要 functions 目录！

**问题原因：** ESA Pages 边缘函数运行在 Cloudflare Workers 环境，不支持标准的 Node.js 依赖（如 Prisma、jsonwebtoken、crypto 等）。

**解决方案：** 使用纯边缘函数（`api/index.ts`），直接调用 Qwen3-Max API，无需数据库和认证。

## 🏗️ 最终架构

```
┌─────────────────────────────────┐
│      用户访问 ESA Pages       │
└──────────┬────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│   ESA Pages (静态前端)       │
│  - HTML/CSS/JS 静态资源    │
│  - 边缘函数 (api/index.ts)   │ ← 纯 TypeScript，无依赖
└──────────┬────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│     Qwen3-Max API          │
└─────────────────────────────────┘
```

## 📁 项目结构（最终版）

```
.
├── api/
│   └── index.ts              # 边缘函数 ✅
├── src/
│   ├── app/                   # Next.js 前端
│   └── lib/
│       └── api.ts             # API 客户端
├── functions/                 # ❌ 已删除（不需要）
├── .env.production           # 环境变量
├── .gitignore              # 已更新
└── package.json
```

## 🚀 部署步骤

### 1. 配置环境变量

在项目根目录的 `.env.production` 中配置：

```env
# Qwen3-Max API 配置
OPENAI_API_KEY=sk-1a9017c965c355d67198b1171848c063
OPENAI_API_URL=https://apis.iflow.cn/v1/chat/completions
OPENAI_MODEL=qwen3-max
```

### 2. 提交代码

```bash
# 添加所有更改
git add .

# 提交
git commit -m "Remove functions directory, use edge functions only"

# 推送到 GitHub
git push origin main
```

### 3. 在 ESA Pages 控制台部署

1. 登录阿里云控制台
2. 进入 **边缘安全加速 ESA** → **函数和 Pages** → **Pages**
3. 选择您的项目
4. 点击 **部署** 按钮
5. 配置环境变量：
   ```env
   OPENAI_API_KEY=sk-1a9017c965c355d67198b1171848c063
   OPENAI_API_URL=https://apis.iflow.cn/v1/chat/completions
   OPENAI_MODEL=qwen3-max
   ```
6. 点击 **部署**

## ✨ 优势

### 相比传统方案

| 特性 | 传统方案 | 简化方案 |
|------|---------|----------|
| 部署复杂度 | 需要配置函数计算、数据库、触发器 | ✅ 一键部署 |
| 依赖管理 | 需要管理多个服务 | ✅ 只需一个项目 |
| 成本 | 函数计算 + RDS + Pages | ✅ 只需 Pages |
| 维护 | 需要监控多个服务 | ✅ 统一管理 |
| 故障排查 | 需要查看多个日志 | ✅ 统一日志 |

## 🧪 测试部署

部署完成后，访问您的 Pages 域名：

1. 打开算命页面：`https://your-domain.aliyuncs.com/zh/oracle`
2. 输入问题并发送
3. 查看是否正常返回 AI 回复

## 🔍 故障排查

### 问题：API 调用失败

**检查项：**
1. 环境变量是否正确配置
2. Qwen3-Max API 密钥是否有效
3. 边缘函数是否正确部署

**查看日志：**
1. 进入 ESA Pages 项目详情
2. 点击 **日志** 标签
3. 查看边缘函数执行日志

### 问题：CORS 错误

边缘函数已自动配置 CORS，如果仍有问题：
- 检查浏览器控制台错误信息
- 确认请求头正确

## 💰 成本

### ESA Pages
- **免费额度**：每月 10GB 流量
- **超出费用**：¥0.5/GB
- **边缘函数**：包含在 Pages 中，无需额外费用

**月度预估**：约 ¥0-50（中小规模）

## 📚 相关文档

- [ESA Pages 边缘函数文档](https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/what-is-functions-and-pages/)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🎉 总结

现在部署超级简单：

1. ✅ 配置环境变量
2. ✅ 提交代码
3. ✅ 在 ESA Pages 点击部署
4. ✅ 完成！

无需数据库、无需函数计算、无需额外配置！
