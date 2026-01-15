import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
