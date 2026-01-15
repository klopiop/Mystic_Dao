import Link from "next/link";

import { prisma } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { banUser, unbanUser } from "@/app/[locale]/admin/actions";

export default async function AdminPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dict = getDictionary(params.locale);
  await requireAdmin(params.locale);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  const audits = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { actor: true },
  });

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-8">
        <h1 className="text-3xl font-semibold text-gold-strong">
          {dict.admin.title}
        </h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gold-strong">
            {dict.admin.users}
          </h2>
          <Link
            className="rounded-full border border-gold-soft/50 px-4 py-2 text-xs text-gold-strong"
            href="/api/admin/export"
            prefetch={false}
          >
            {dict.admin.export}
          </Link>
        </div>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-2xl border border-gold-muted/30 bg-black/70 px-6 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm text-gold-soft">{user.email}</div>
                <div className="text-xs text-zinc-500">
                  {user.role} · {user.createdAt.toLocaleString()}
                </div>
                {user.bannedAt && (
                  <div className="text-xs text-rose-300">
                    Banned: {user.bannedAt.toLocaleString()}
                  </div>
                )}
              </div>
              <form action={user.bannedAt ? unbanUser : banUser}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="locale" value={params.locale} />
                <button
                  className="rounded-full border border-gold-soft/50 px-4 py-2 text-xs text-gold-strong"
                  type="submit"
                >
                  {user.bannedAt ? dict.admin.unban : dict.admin.ban}
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gold-strong">
          {dict.admin.audits}
        </h2>
        <div className="space-y-3">
          {audits.map((audit) => (
            <div
              key={audit.id}
              className="rounded-2xl border border-gold-muted/30 bg-black/70 px-6 py-4 text-sm text-zinc-300"
            >
              <div className="text-gold-soft">{audit.action}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {audit.actor?.email || "system"} · {audit.createdAt.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {audit.ip} · {audit.userAgent}
              </div>
              <div className="mt-2 text-sm text-zinc-300">{audit.message}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
