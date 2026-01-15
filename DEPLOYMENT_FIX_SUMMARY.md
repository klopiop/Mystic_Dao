# ESA Pages 部署问题修复总结

## 问题描述

原始构建错误：
```
Failed to copy build artifacts: Both assets and function js file are not found, please configure the assets directory and function js file path in esa.jsonc or ESA console.
```

## 问题分析

1. **静态资源路径问题**：Next.js 默认构建输出到 `.next` 目录，但静态HTML文件位于 `.next/server/app` 中
2. **函数构建问题**：functions 目录缺少 `prisma.ts` 文件，导致 TypeScript 编译失败
3. **类型错误**：AuditAction 枚举值不匹配

## 解决方案

### 1. 修复 Next.js 配置

保持标准 Next.js 配置（不使用静态导出），因为：
- 静态导出模式不支持 API 路由
- 混合部署需要服务端渲染能力

### 2. 修复 Functions 构建

- 恢复 `functions/src/lib/prisma.ts` 文件
- 使用相对路径导入主项目的 Prisma 客户端
- 修复 AuditAction 枚举值：
  - `'DATA_EXPORT'` → `'EXPORT_USERS'`
  - `'REGISTER'` → `'SIGNUP'`

### 3. 更新 ESA 配置

```json
{
  "assets": ".next",
  "function": "functions/dist/index.js",
  "build": {
    "install": "pnpm install",
    "frontend": "pnpm run build",
    "backend": "cd functions && pnpm install && pnpm run build"
  },
  "deployment": {
    "type": "hybrid",
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "/api/$1"
      },
      {
        "src": "/_next/static/(.*)",
        "dest": "/_next/static/$1"
      },
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ]
  }
}
```

## 构建验证

✅ Next.js 构建成功，生成静态 HTML 文件到 `.next/server/app`
✅ Functions 构建成功，生成 JS 文件到 `functions/dist`
✅ 所有构建产物路径正确配置

## 部署架构

- **前端**：Next.js 静态页面 + 服务端渲染
- **后端**：独立 Functions 处理 API 请求
- **数据库**：Prisma + SQLite
- **路由**：混合模式，API 请求转发到 Functions

## 注意事项

1. 磁盘空间不足时，Prisma 客户端生成可能失败
2. Functions 目录需要独立构建，不能依赖主项目的 node_modules
3. 混合部署模式下，API 路由和静态页面需要正确配置路由规则

## 后续优化建议

1. 考虑使用 CDN 加速静态资源
2. 优化 Functions 打包大小
3. 添加构建缓存以提高部署速度
4. 配置环境变量管理