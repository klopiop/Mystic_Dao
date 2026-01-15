import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// 静态导出配置
export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    // Allow unauthenticated for now or strictly require it?
    // The client enforces it, but let's be safe.
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { messages, type, systemHint } = body;

    // TODO: Connect to real LLM (e.g. Qwen / OpenAI)
    // For now, return a simulated response based on the input.
    
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    let reply = "";
    if (type === "oracle") {
      reply = `[神机推演] 卦象已显。您所问之事“${lastMessage}”，从卦面上看... (此为模拟回复，请接入真实大模型)`;
    } else if (type === "tcm") {
      reply = `[中医诊断] 根据您的描述“${lastMessage}”，脉象显示... (此为模拟回复，请接入真实大模型)`;
    } else {
      reply = "I hear you. (Mock response)";
    }

    return NextResponse.json({
      reply,
      conversationId: "mock-conversation-id-" + Date.now()
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
