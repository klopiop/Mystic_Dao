import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// 静态导出配置
export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email: rawEmail, password } = body;
    const email = rawEmail?.toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already used" }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "SIGNUP",
          message: `User ${email} registered`,
          ip: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to create audit log:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
