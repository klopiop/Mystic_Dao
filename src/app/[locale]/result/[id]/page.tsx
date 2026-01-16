"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getDictionary, type Locale } from "@/lib/i18n";
import { conversationStorage } from "@/lib/storage";
import ChatPanel from "@/components/ChatPanel";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as Locale) || "zh";
  const dict = getDictionary(locale);
  const conversationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const conversations = conversationStorage.getAll();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      setNotFound(true);
    }
    
    setLoading(false);
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gold-soft">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <h2 className="text-2xl font-serif text-gold-strong">
          {locale === "zh" ? "记录不存在" : "Record Not Found"}
        </h2>
        <p className="max-w-md text-zinc-400">
          {locale === "zh" 
            ? "该问诊纪要已被删除或不存在。" 
            : "This consultation record has been deleted or does not exist."}
        </p>
        <button
          onClick={() => router.push(`/${locale}/history`)}
          className="rounded-full bg-gold-strong px-8 py-3 font-semibold text-black transition hover:scale-105"
        >
          {locale === "zh" ? "返回历史" : "Back to History"}
        </button>
      </div>
    );
  }

  const conversations = conversationStorage.getAll();
  const conversation = conversations.find(c => c.id === conversationId);

  if (!conversation) return null;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-10 md:px-10">
        <h1 className="text-3xl font-semibold text-gold-strong md:text-4xl">
          {conversation.type === "oracle" 
            ? (locale === "zh" ? "算命纪要" : "Divination Record")
            : (locale === "zh" ? "问诊纪要" : "Consultation Record")
          }
        </h1>
        <p className="mt-3 text-sm text-zinc-400 md:text-base">
          {new Date(conversation.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="rounded-[28px] border border-gold-muted/40 bg-black/70 p-6 md:p-10">
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                  message.role === "user"
                    ? "bg-gold-soft/20 text-gold-strong"
                    : "bg-black/60 text-zinc-200 border border-gold-muted/20"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => router.push(`/${locale}/history`)}
          className="rounded-full border border-gold-soft/60 bg-gold-soft/15 px-8 py-3 text-sm font-semibold text-gold-strong transition hover:bg-gold-soft/25"
          type="button"
        >
          {locale === "zh" ? "返回历史" : "Back to History"}
        </button>
      </div>
    </div>
  );
}
