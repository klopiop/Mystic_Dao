/**
 * ESA Pages 边缘函数 API 客户端
 * 直接调用边缘函数，无需单独部署函数计算
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 统一 API 请求函数
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

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

/**
 * Chat API - 直接调用 OpenAI API（比赛展示用）
 */
export async function sendChatMessage(data: {
  type: 'oracle' | 'tcm';
  messages: Array<{ role: string; content: string }>;
  locale: string;
  conversationId?: string;
  systemHint?: string;
}) {
  const { type, messages, locale, systemHint } = data;
  
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';
  
  console.log('API 调用信息:', { 
    hasApiKey: !!apiKey,
    apiUrl,
    model,
    messageCount: messages.length
  });
  
  if (!apiKey) {
    throw new Error(locale === 'en' ? 'API key not configured' : 'API 密钥未配置');
  }
  
  const systemPrompt = [
    locale === 'en' ? 'Respond in English.' : '请使用简体中文回应。',
    typeHints[type]?.[locale === 'en' ? 'en' : 'zh'] || '',
    systemHint,
  ]
    .filter(Boolean)
    .join(' ');
  
  const requestBody = {
    model,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((message: { role: string; content: string }) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  };
  
  console.log('请求体:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('API 响应状态:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API 错误响应:', errorText);
    throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('API 成功响应:', result);
  const reply = result.choices?.[0]?.message?.content || '';

  return {
    reply,
    conversationId: 'demo-' + Date.now(),
  };
}

/**
 * Auth API - 登录
 */
export async function login(credentials: {
  email: string;
  password: string;
}) {
  const response = await apiRequest<{
    user: { id: string; email: string; role: string };
    token: string;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // 保存 token 到 localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_info', JSON.stringify(response.user));
  }

  return response;
}

/**
 * Auth API - 注册
 */
export async function register(data: {
  email: string;
  password: string;
}) {
  const response = await apiRequest<{
    user: { id: string; email: string; role: string };
    token: string;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // 保存 token 到 localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_info', JSON.stringify(response.user));
  }

  return response;
}

/**
 * Auth API - 登出
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): { id: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;

  const userInfo = localStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

/**
 * Admin API - 导出数据
 */
export async function exportData() {
  return apiRequest<{
    users: any[];
    conversations: any[];
    messages: any[];
    auditLogs: any[];
    exportedAt: string;
    exportedBy: string;
  }>('/api/admin/export');
}

/**
 * 获取认证头
 */
export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
