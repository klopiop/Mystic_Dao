import { compare } from "bcryptjs";
import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret";

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

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    console.log("Login attempt for:", normalizedEmail);
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    console.log("User found:", user ? { id: user.id, email: user.email } : null);

    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.bannedAt) {
      return NextResponse.json({ error: "Account has been banned" }, { status: 403 });
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await encode({
      token: { id: user.id, email: user.email, role: user.role },
      secret: JWT_SECRET,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "LOGIN",
          message: "User logged in",
          ip: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to create audit log:", logError);
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
