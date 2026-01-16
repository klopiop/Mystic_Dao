export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/chat' && method === 'POST') {
        return await handleChat(request, env);
      }

      return new Response(JSON.stringify({ error: 'Not Found', path }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Edge Function Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};

async function handleChat(request: Request, env: any): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    const { type, messages, locale, systemHint } = body;

    const typeHints: Record<string, Record<string, string>> = {
      oracle: {
        zh: '你是东方道法算命神机，以星象、卦辞、符箓语气回应。',
        en: 'You are a Daoist oracle, responding with celestial symbolism.',
      },
      tcm: {
        zh: '你是中医问诊助手，以辨证论治语气回答并给出调养建议。',
        en: 'You are a TCM consultant, providing differentiation and guidance.',
      },
    };

    const systemPrompt = [
      locale === 'en' ? 'Respond in English.' : '请使用简体中文回应。',
      typeHints[type]?.[locale === 'en' ? 'en' : 'zh'] || '',
      systemHint,
    ]
      .filter(Boolean)
      .join(' ');

    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: locale === 'en' ? 'API key not configured' : 'API 密钥未配置' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((message: { role: string; content: string }) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({
        reply,
        conversationId: 'demo-' + Date.now(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
