"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getDictionary, type Locale } from "@/lib/i18n";
import { conversationStorage } from "@/lib/storage";

interface Conversation {
  id: string;
  type: string;
  title: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "zh";
  const dict = getDictionary(locale);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedConversations = conversationStorage.getAll();
    setConversations(storedConversations);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm(locale === "zh" ? "确定要删除这条记录吗？" : "Are you sure you want to delete this record?")) {
      conversationStorage.delete(id);
      setConversations(conversationStorage.getAll());
    }
  };

  const handleClearAll = () => {
    if (confirm(locale === "zh" ? "确定要清空所有记录吗？" : "Are you sure you want to clear all records?")) {
      conversationStorage.clear();
      setConversations([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gold-soft">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-8">
          <h1 className="text-3xl font-semibold text-gold-strong">
            {dict.history.title}
          </h1>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={handleClearAll}
            className="rounded-full border border-red-500/50 bg-red-950/20 px-6 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-950/30"
            type="button"
          >
            {locale === "zh" ? "清空记录" : "Clear All"}
          </button>
        )}
      </div>
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-gold-muted/30 bg-black/70 px-6 py-10 text-sm text-zinc-400">
          {dict.history.empty}
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex flex-col gap-3 rounded-2xl border border-gold-muted/30 bg-black/70 px-6 py-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="text-sm text-gold-soft">
                  {conversation.type === "oracle" ? dict.nav.oracle : dict.nav.tcm}
                </div>
                <div className="text-lg text-zinc-200">
                  {conversation.title || "Mystic Session"}
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(conversation.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  className="rounded-full border border-gold-soft/50 px-5 py-2 text-xs text-gold-strong transition hover:bg-gold-soft/10"
                  href={`/${locale}/result/${conversation.id}`}
                >
                  {dict.history.view}
                </Link>
                <button
                  onClick={() => handleDelete(conversation.id)}
                  className="rounded-full border border-red-500/50 px-5 py-2 text-xs text-red-400 transition hover:bg-red-950/20"
                  type="button"
                >
                  {locale === "zh" ? "删除" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
