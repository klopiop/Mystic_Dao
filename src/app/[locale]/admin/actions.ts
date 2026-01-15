"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";

export async function banUser(formData: FormData) {
  const locale = (formData.get("locale")?.toString() as Locale) || "zh";
  const session = await requireAdmin(locale);
  const userId = formData.get("userId")?.toString();
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { bannedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      action: "BAN_USER",
      message: `User ${userId} banned`,
      ip: "server",
      userAgent: "server",
    },
  });
  revalidatePath(`/${locale}/admin`);
}

export async function unbanUser(formData: FormData) {
  const locale = (formData.get("locale")?.toString() as Locale) || "zh";
  const session = await requireAdmin(locale);
  const userId = formData.get("userId")?.toString();
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { bannedAt: null },
  });
  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      action: "UNBAN_USER",
      message: `User ${userId} unbanned`,
      ip: "server",
      userAgent: "server",
    },
  });
  revalidatePath(`/${locale}/admin`);
}
