import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// 静态导出配置
export const dynamic = "force-static";

// 为动态路由生成静态参数
export function generateStaticParams() {
  return [];
}
