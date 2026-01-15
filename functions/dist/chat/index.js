import { prisma } from '../lib/prisma';
import { getUserFromRequest } from '../lib/auth';
const typeHints = {
    oracle: {
        zh: '你是东方道法算命神机，以星象、卦辞、符箓语气回应。',
        en: 'You are a Daoist oracle, responding with celestial symbolism.',
    },
    tcm: {
        zh: '你是中医问诊助手，以辨证论治语气回答并给出调养建议。',
        en: 'You are a TCM consultant, providing differentiation and guidance.',
    },
};
export async function handler(req) {
    // CORS 处理
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    // 验证用户
    const user = await getUserFromRequest(req.headers);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    try {
        const payload = (await req.json());
        const { type, messages, locale, conversationId, systemHint } = payload;
        if (!type || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const conversationType = type === 'tcm' ? 'TCM' : 'ORACLE';
        // 获取或创建会话
        let conversation = conversationId
            ? await prisma.conversation.findUnique({
                where: { id: conversationId },
            })
            : null;
        if (conversation && user.role !== 'ADMIN') {
            if (conversation.userId !== user.id) {
                return new Response(JSON.stringify({ error: 'Forbidden' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId: user.id,
                    type: conversationType,
                    title: messages[0]?.content?.slice(0, 32) || 'Mystic Session',
                },
            });
        }
        // 保存用户消息
        const userMessage = messages[messages.length - 1];
        if (userMessage?.content) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'USER',
                    content: userMessage.content,
                },
            });
        }
        // 构建系统提示
        const systemPrompt = [
            locale === 'en' ? 'Respond in English.' : '请使用简体中文回应。',
            typeHints[type][locale === 'en' ? 'en' : 'zh'],
            systemHint,
        ]
            .filter(Boolean)
            .join(' ');
        // 调用 OpenAI API（支持自定义 URL）
        let reply = '';
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
        if (!apiKey) {
            reply =
                locale === 'en'
                    ? 'The oracle is sealed. Configure OPENAI_API_KEY to awaken it.'
                    : '神机尚未启封，请配置 OPENAI_API_KEY。';
        }
        else {
            const openaiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    temperature: 0.7,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map((message) => ({
                            role: message.role,
                            content: message.content,
                        })),
                    ],
                }),
            });
            if (!openaiResponse.ok) {
                const error = await openaiResponse.text();
                return new Response(JSON.stringify({ error }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            const data = (await openaiResponse.json());
            reply = data.choices?.[0]?.message?.content || '';
        }
        // 保存 AI 回复
        if (reply) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'ASSISTANT',
                    content: reply,
                },
            });
        }
        // 记录审计日志
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: 'CHAT_REQUEST',
                message: `Conversation ${conversation.id} (${conversationType})`,
                ip: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
            },
        });
        const response = {
            reply,
            conversationId: conversation.id,
        };
        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error('Chat API error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
