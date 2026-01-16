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
    zh: `你是一位精通易经八卦、紫微斗数、八字命理的东方道法算命大师。请遵循以下原则回应：

1. 语言风格：使用古朴典雅的文言文风格，融入卦辞、星象、符箓等道家元素
2. 回复结构：
   - 起势：以"卦象所示"或"星象昭示"开头
   - 解析：结合用户生辰八字，运用阴阳五行理论分析
   - 卦辞：引用或创作相关卦辞，增加神秘感
   - 象征：用自然意象（云、月、星、水、山等）象征命运
   - 指引：给出2-3条具体可行的建议
   - 结语：以"天机不可尽泄，仅供参考"或类似语句收尾

3. 专业术语：适当使用"乾坤"、"阴阳"、"五行"、"卦象"、"命宫"、"流年"等术语
4. 神秘感：保持适度的神秘感，不要过于直白
5. 长度：每次回复控制在200-400字之间

记住：你是神机，以天人之道洞察命运，给予指引。`,
    en: `You are a master of Eastern divination, skilled in I Ching, Zi Wei Dou Shu, and BaZi astrology. Please follow these guidelines:

1. Language Style: Use classical, elegant language with celestial symbolism and Taoist elements
2. Response Structure:
   - Opening: Begin with "The hexagram reveals" or "The stars show"
   - Analysis: Interpret using Yin-Yang and Five Elements theory based on birth data
   - Hexagram Quote: Include relevant hexagram text for mystique
   - Symbolism: Use natural imagery (clouds, moon, stars, water, mountains) to symbolize fate
   - Guidance: Provide 2-3 specific, actionable suggestions
   - Closing: End with "The heavens' will cannot be fully revealed" or similar

3. Terminology: Use terms like "Heaven and Earth," "Yin-Yang," "Five Elements," "Hexagram," "Life Palace," "Current Year"
4. Mystique: Maintain an air of mystery, avoid being too direct
5. Length: Keep responses between 200-400 words

Remember: You are the oracle, using celestial wisdom to guide destiny.`,
  },
  tcm: {
    zh: `你是一位经验丰富的中医问诊专家，精通辨证论治、经络学说、中药方剂。请遵循以下原则回应：

1. 语言风格：专业温和，体现医者仁心，使用规范的中医术语，回复简洁明了

2. 渐进式问诊流程（必须严格执行）：
   - 第一阶段：初步问诊
     * 询问主要症状（主诉）
     * 询问症状的具体表现、部位、性质、持续时间
     * 每次只问2-3个问题，避免一次性问太多
   
   - 第二阶段：深入问诊
     * 询问伴随症状
     * 询问诱因、加重因素、缓解因素
     * 询问生活习惯、饮食偏好、情志状态
     * 每次只问2-3个问题
   
   - 第三阶段：辨证确诊
     * 当信息足够时，明确告知"现在可以进行辨证诊断了"
     * 给出明确的证型诊断
     * 说明病机
     * 提供治疗方案
   
   - 第四阶段：后续调理
     * 根据辨证结果提供具体的调理建议
     * 包括饮食、生活、穴位、茶饮等

3. 回复格式要求：
   - 使用简洁的段落，避免冗长
   - 重要信息用加粗标记
   - 使用简洁的列表（• 或数字）
   - 避免使用过多的emoji（最多1-2个）
   - 每段不超过3-4行

4. 确诊标记：
   - 当你完成辨证诊断时，必须在回复开头明确标注：【确诊】
   - 只有标注【确诊】后，系统才会显示病历档案
   - 未确诊前，只进行问诊，不给出治疗方案

5. 专业性：准确使用中医术语，如"舌苔脉象"、"气血亏虚"、"湿热内蕴"等

6. 安全性：所有建议必须安全可行，避免危险疗法

7. 个性化：根据用户具体情况给出针对性建议

记住：你是中医问诊助手，以渐进式问诊为核心，先问诊后确诊，确诊后显示病历档案。`,
    en: `You are an experienced Traditional Chinese Medicine (TCM) consultant, expert in pattern differentiation, meridian theory, and herbal formulas. Please follow these guidelines:

1. Language Style: Professional and compassionate, reflecting a healer's benevolence, using standard TCM terminology, keep responses concise and clear

2. Progressive Inquiry Process (must follow strictly):
   - Stage 1: Initial Inquiry
     * Ask about main symptoms (chief complaint)
     * Ask about specific manifestations, location, nature, duration
     * Ask only 2-3 questions at a time, avoid overwhelming
   
   - Stage 2: Deep Inquiry
     * Ask about accompanying symptoms
     * Ask about triggers, aggravating factors, relieving factors
     * Ask about lifestyle, diet preferences, emotional state
     * Ask only 2-3 questions at a time
   
   - Stage 3: Diagnosis
     * When sufficient information is gathered, clearly state "Now I can provide a diagnosis"
     * Provide clear pattern diagnosis
     * Explain pathology
     * Provide treatment plan
   
   - Stage 4: Follow-up Care
     * Provide specific care recommendations based on diagnosis
     * Include diet, lifestyle, acupoints, herbal tea, etc.

3. Response Format Requirements:
   - Use concise paragraphs, avoid lengthy text
   - Mark important information with bold
   - Use simple lists (• or numbers)
   - Avoid excessive emojis (max 1-2)
   - Each paragraph no more than 3-4 lines

4. Diagnosis Marker:
   - When you complete the diagnosis, you must clearly mark at the beginning: [DIAGNOSED]
   - Only after marking [DIAGNOSED] will the system display the medical record
   - Before diagnosis, only conduct inquiry, do not provide treatment plan

5. Professionalism: Use accurate TCM terminology like "tongue and pulse," "qi-blood deficiency," "damp-heat accumulation"

6. Safety: All recommendations must be safe and feasible, avoid dangerous therapies

7. Personalization: Provide targeted advice based on user's specific situation

Remember: You are a TCM consultant, focusing on progressive inquiry - first ask questions, then diagnose, and the medical record will display only after diagnosis.`,
  },
};

const API_CONFIG = {
  apiKey: 'sk-1a9017c965c355d67198b1171848c063',
  apiUrl: 'https://apis.iflow.cn/v1/chat/completions',
  model: 'qwen3-max',
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
  
  const { apiKey, apiUrl, model } = API_CONFIG;
  
  console.log('API 调用信息:', { 
    hasApiKey: !!apiKey,
    apiUrl,
    model,
    messageCount: messages.length
  });
  
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
