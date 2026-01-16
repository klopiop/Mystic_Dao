"use client";

import { useState, useEffect } from "react";

import type { Locale } from "@/lib/i18n";
import { sendChatMessage } from "@/lib/api";
import { conversationStorage } from "@/lib/storage";
import type { MedicalRecord } from "./MedicalRecordSidebar";

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
  existingConversationId?: string;
  onSave?: () => void;
  onMedicalRecordUpdate?: (record: MedicalRecord | null, isDiagnosed: boolean) => void;
};

export default function ChatPanel({
  locale,
  title,
  subtitle,
  placeholder,
  systemHint,
  type,
  existingConversationId,
  onSave,
  onMedicalRecordUpdate,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(existingConversationId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (existingConversationId) {
      const conversations = conversationStorage.getAll();
      const existing = conversations.find(c => c.id === existingConversationId);
      if (existing) {
        setMessages(existing.messages);
      }
    }
  }, [existingConversationId]);

  const extractMedicalRecord = (aiResponse: string): MedicalRecord | null => {
    if (type !== "tcm") return null;

    const record: MedicalRecord = {
      lastUpdated: new Date().toISOString(),
    };

    const lines = aiResponse.split("\n");
    let currentSection: string | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.includes("主诉") || trimmedLine.includes("Main Complaint") || trimmedLine.includes("您描述的症状")) {
        currentSection = "mainComplaint";
        continue;
      } else if (trimmedLine.includes("辨证") || trimmedLine.includes("Pattern") || trimmedLine.includes("诊断") || trimmedLine.includes("Diagnosis")) {
        currentSection = "diagnosis";
        continue;
      } else if (trimmedLine.includes("治则") || trimmedLine.includes("Treatment Principle") || trimmedLine.includes("治疗原则")) {
        currentSection = "treatment";
        continue;
      } else if (trimmedLine.includes("饮食") || trimmedLine.includes("Diet") || trimmedLine.includes("食疗")) {
        currentSection = "diet";
        continue;
      } else if (trimmedLine.includes("生活") || trimmedLine.includes("Lifestyle") || trimmedLine.includes("起居")) {
        currentSection = "lifestyle";
        continue;
      } else if (trimmedLine.includes("穴位") || trimmedLine.includes("Acupoint") || trimmedLine.includes("按摩")) {
        currentSection = "acupoints";
        continue;
      } else if (trimmedLine.includes("中药") || trimmedLine.includes("Herbal") || trimmedLine.includes("茶饮")) {
        currentSection = "prescription";
        continue;
      }

      if (currentSection && trimmedLine && !trimmedLine.startsWith("#") && !trimmedLine.startsWith("##")) {
        const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");

        if (currentSection === "mainComplaint" && !record.mainComplaint) {
          record.mainComplaint = cleanLine;
        } else if (currentSection === "diagnosis") {
          if (!record.diagnosis) record.diagnosis = {};
          if (cleanLine.includes("证型") || cleanLine.includes("Pattern")) {
            record.diagnosis.pattern = cleanLine.split(/[:：]/)[1]?.trim() || cleanLine;
          } else if (cleanLine.includes("病机") || cleanLine.includes("Pathology")) {
            record.diagnosis.pathology = cleanLine.split(/[:：]/)[1]?.trim() || cleanLine;
          } else if (cleanLine.includes("体质") || cleanLine.includes("Constitution")) {
            record.diagnosis.constitution = cleanLine.split(/[:：]/)[1]?.trim() || cleanLine;
          }
        } else if (currentSection === "treatment") {
          if (!record.treatment) record.treatment = {};
          if (cleanLine.includes("治则") || cleanLine.includes("Principle")) {
            record.treatment.principle = cleanLine.split(/[:：]/)[1]?.trim() || cleanLine;
          } else if (cleanLine.length > 5) {
            if (!record.treatment.recommendations) record.treatment.recommendations = [];
            record.treatment.recommendations.push(cleanLine);
          }
        } else if (currentSection === "diet") {
          if (!record.treatment) record.treatment = {};
          if (!record.treatment.diet) record.treatment.diet = [];
          if (cleanLine.length > 2) {
            record.treatment.diet.push(cleanLine);
          }
        } else if (currentSection === "lifestyle") {
          if (!record.treatment) record.treatment = {};
          if (!record.treatment.lifestyle) record.treatment.lifestyle = [];
          if (cleanLine.length > 2) {
            record.treatment.lifestyle.push(cleanLine);
          }
        } else if (currentSection === "acupoints") {
          if (!record.treatment) record.treatment = {};
          if (!record.treatment.acupoints) record.treatment.acupoints = [];
          const points = cleanLine.split(/[,，、]/).map(p => p.trim()).filter(p => p);
          record.treatment.acupoints.push(...points);
        } else if (currentSection === "prescription") {
          if (!record.prescription) record.prescription = {};
          if (cleanLine.includes("茶饮") || cleanLine.includes("Tea")) {
            record.prescription.herbalTea = cleanLine.split(/[:：]/)[1]?.trim() || cleanLine;
          } else if (cleanLine.length > 2) {
            if (!record.prescription.herbs) record.prescription.herbs = [];
            const herbMatch = cleanLine.match(/([^\d]+)(\d+[克g]*)?/);
            if (herbMatch) {
              record.prescription.herbs.push({
                name: herbMatch[1].trim(),
                dosage: herbMatch[2] || undefined,
              });
            }
          }
        }
      }
    }

    const hasData = record.mainComplaint || 
                    record.diagnosis?.pattern || 
                    record.treatment?.principle ||
                    record.treatment?.diet?.length ||
                    record.prescription?.herbalTea;

    return hasData ? record : null;
  };

  const formatAIResponse = (response: string): string => {
    let formatted = response;

    formatted = formatted.replace(/【确诊】/g, "");
    formatted = formatted.replace(/\[DIAGNOSED\]/g, "");

    formatted = formatted.replace(/📌/g, "");
    formatted = formatted.replace(/🩺/g, "");
    formatted = formatted.replace(/🔍/g, "");
    formatted = formatted.replace(/🧭/g, "");
    formatted = formatted.replace(/📋/g, "");
    formatted = formatted.replace(/🌿/g, "");
    formatted = formatted.replace(/💡/g, "");
    formatted = formatted.replace(/⚠️/g, "");
    formatted = formatted.replace(/🎯/g, "");
    formatted = formatted.replace(/✓/g, "");
    formatted = formatted.replace(/✗/g, "");

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    formatted = formatted.replace(/#{3,}\s*(.*?)\s*$/gm, "### $1");
    formatted = formatted.replace(/#{2}\s*(.*?)\s*$/gm, "## $1");
    formatted = formatted.replace(/#{1}\s*(.*?)\s*$/gm, "# $1");

    formatted = formatted.replace(/^\s*\d+\.\s+/gm, "• ");
    formatted = formatted.replace(/^\s*[-*]\s+/gm, "• ");

    formatted = formatted.replace(/\n{3,}/g, "\n\n");

    formatted = formatted.trim();

    return formatted;
  };

  const submit = async () => {
    if (!input.trim() || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setHasUnsavedChanges(true);

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
      const finalMessages: Message[] = [
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ];
      setMessages(finalMessages);

      if (type === "tcm") {
        const medicalRecord = extractMedicalRecord(data.reply);
        const isDiagnosed = data.reply.includes("【确诊】") || data.reply.includes("[DIAGNOSED]");
        onMedicalRecordUpdate?.(medicalRecord, isDiagnosed);
      }
      
      if (conversationId) {
        conversationStorage.update(conversationId, { messages: finalMessages });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant" as const,
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

  const handleSave = () => {
    if (messages.length === 0) return;

    const title = messages[0].content.slice(0, 50);
    
    if (conversationId) {
      conversationStorage.update(conversationId, { messages, title });
    } else {
      const newConversation = conversationStorage.save({
        type,
        title,
        messages,
      });
      setConversationId(newConversation.id);
    }
    
    setHasUnsavedChanges(false);
    onSave?.();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 rounded-[28px] border border-gold-muted/40 bg-black/60 px-6 py-10 md:px-10">
          <h1 className="text-3xl font-semibold text-gold-strong md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-zinc-400 md:text-base">{subtitle}</p>
        </div>
        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            className="rounded-full border border-gold-soft/60 bg-gold-soft/15 px-6 py-3 text-sm font-semibold text-gold-strong transition hover:bg-gold-soft/25"
            type="button"
          >
            {locale === "zh" ? "保存纪要" : "Save"}
          </button>
        )}
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
                {message.role === "assistant" ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatAIResponse(message.content).replace(/\n/g, "<br />") 
                    }} 
                  />
                ) : (
                  message.content
                )}
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
