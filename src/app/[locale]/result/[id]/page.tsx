import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getDictionary, type Locale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";

// 为动态路由生成静态参数
export function generateStaticParams() {
  return [];
}

export default async function ResultPage({
  params,
}: {
  params: { locale: Locale; id: string };
}) {
  const dict = getDictionary(params.locale);
  const session = await requireUser(params.locale);
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { messages: true, user: true },
  });

  if (!conversation) {
    notFound();
  }

  if (session.role !== "ADMIN" && conversation.userId !== session.id) {
    notFound();
  }

  const latest = [...conversation.messages].reverse().find((message) => message.role === "ASSISTANT");

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-8">
        <h1 className="text-3xl font-semibold text-gold-strong">
          {conversation.type === "ORACLE" ? dict.nav.oracle : dict.nav.tcm}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {conversation.title || (params.locale === "zh" ? "神机问道" : "Mystic Session")}
        </p>
      </div>
      {latest && (
        <div className="rounded-3xl border border-gold-soft/40 bg-gold-soft/10 px-6 py-6 text-sm text-gold-strong shadow-[0_0_30px_rgba(246,211,139,0.15)]">
          {latest.content}
        </div>
      )}
      <div className="space-y-3">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl border px-5 py-4 text-sm ${
              message.role === "USER"
                ? "border-gold-muted/40 bg-black/60 text-zinc-200"
                : "border-gold-soft/40 bg-black/80 text-gold-soft"
            }`}
          >
            <div className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
              {message.role === "USER"
                ? params.locale === "zh"
                  ? "来访者"
                  : "Seeker"
                : params.locale === "zh"
                  ? "神机"
                  : "Oracle"}
            </div>
            <div className="leading-relaxed">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
