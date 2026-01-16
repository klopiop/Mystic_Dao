"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '未配置',
      NEXT_PUBLIC_OPENAI_API_URL: process.env.NEXT_PUBLIC_OPENAI_API_URL || '未配置',
      NEXT_PUBLIC_OPENAI_MODEL: process.env.NEXT_PUBLIC_OPENAI_MODEL || '未配置',
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8">
      <h1 className="text-2xl font-bold text-gold-strong mb-6">环境变量调试</h1>
      
      <div className="space-y-4">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-gold-muted/30 bg-black/60 p-4">
            <div className="text-sm text-gold-soft font-semibold">{key}</div>
            <div className="mt-2 text-sm break-all">
              {key.includes('KEY') 
                ? value === '未配置' 
                  ? value 
                  : `${value.slice(0, 8)}...${value.slice(-4)}`
                : value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-red-500/30 bg-red-950/20 p-4">
        <h2 className="text-lg font-semibold text-red-400 mb-2">检查清单</h2>
        <ul className="space-y-2 text-sm">
          <li className={envVars.NEXT_PUBLIC_OPENAI_API_KEY !== '未配置' ? 'text-green-400' : 'text-red-400'}>
            {envVars.NEXT_PUBLIC_OPENAI_API_KEY !== '未配置' ? '✓' : '✗'} API Key 已配置
          </li>
          <li className={envVars.NEXT_PUBLIC_OPENAI_API_URL !== '未配置' ? 'text-green-400' : 'text-red-400'}>
            {envVars.NEXT_PUBLIC_OPENAI_API_URL !== '未配置' ? '✓' : '✗'} API URL 已配置
          </li>
          <li className={envVars.NEXT_PUBLIC_OPENAI_MODEL !== '未配置' ? 'text-green-400' : 'text-red-400'}>
            {envVars.NEXT_PUBLIC_OPENAI_MODEL !== '未配置' ? '✓' : '✗'} 模型名称已配置
          </li>
        </ul>
      </div>

      <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
        <h2 className="text-lg font-semibold text-blue-400 mb-2">测试 API 连接</h2>
        <button
          onClick={async () => {
            try {
              const response = await fetch(process.env.NEXT_PUBLIC_OPENAI_API_URL || '', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
                  messages: [{ role: 'user', content: '你好' }],
                }),
              });

              if (!response.ok) {
                const error = await response.text();
                alert(`API 调用失败：${response.status} - ${error}`);
              } else {
                const data = await response.json();
                alert(`API 调用成功！\n\n回复：${data.choices?.[0]?.message?.content}`);
              }
            } catch (error) {
              alert(`错误：${error instanceof Error ? error.message : String(error)}`);
            }
          }}
          className="rounded-full bg-gold-strong px-6 py-3 text-sm font-semibold text-black transition hover:scale-105"
        >
          测试 API
        </button>
      </div>
    </div>
  );
}
