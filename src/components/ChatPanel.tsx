"use client";

import { useState } from "react";

import type { Locale } from "@/lib/i18n";
import { sendChatMessage } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  locale: Locale;
  title: string;
  subtitle: string;
  placeholder: string;
  systemHint: string;
  type: "oracle" | "tcm";
};

export default function ChatPanel({
  locale,
  title,
  subtitle,
  placeholder,
  systemHint,
  type,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const submit = async () => {
    if (!input.trim() || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage({
        locale,
        type,
        systemHint,
        messages: nextMessages,
        conversationId,
      });
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            locale === "zh"
              ? `神机暂未回应：${errorMessage}`
              : `The oracle is silent: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-10 md:px-10">
        <h1 className="text-3xl font-semibold text-gold-strong md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-zinc-400 md:text-base">{subtitle}</p>
      </div>

      <div className="rounded-[28px] border border-gold-muted/40 bg-black/70 p-6 md:p-10">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-gold-muted/30 bg-black/60 px-4 py-6 text-sm text-zinc-400">
              {locale === "zh"
                ? "先写下你的疑问，神机会逐层拆解。"
                : "Share your question to begin the reading."}
            </div>
          )}
          {messages.map((message, index) => (
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
          {loading && (
            <div className="text-xs uppercase tracking-[0.4em] text-gold-soft">
              {locale === "zh" ? "推演中" : "Divining"}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-full border border-gold-muted/40 bg-black/60 px-5 py-3 text-sm text-zinc-200 outline-none transition focus:border-gold-soft/70"
            placeholder={placeholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submit();
              }
            }}
          />
          <button
            className="rounded-full border border-gold-soft/60 bg-gold-soft/15 px-6 py-3 text-sm font-semibold text-gold-strong transition hover:bg-gold-soft/25"
            type="button"
            onClick={submit}
          >
            {locale === "zh" ? "传达" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
