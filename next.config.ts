import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  // 启用静态导出（ESA Pages 部署必需）
  output: isStaticExport ? "export" : undefined,

  // 图片优化（静态导出需要禁用）
  images: {
    unoptimized: isStaticExport,
  },

  // 排除 functions 目录，避免 Next.js 编译它
  outputFileTracingExcludes: {
    '*': ['./functions/**/*'],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
