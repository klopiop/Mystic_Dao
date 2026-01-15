"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, use, Suspense } from "react";

import { getDictionary, type Locale } from "@/lib/i18n";
import { login } from "@/lib/api";

function LoginContent({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const dict = getDictionary(resolvedParams.locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      const redirectTo = searchParams.get("redirect") || `/${resolvedParams.locale}`;
      // 强制刷新页面，确保登录状态同步
      window.location.href = redirectTo;
    } catch (err) {
      setError(
        resolvedParams.locale === "zh" ? "登录失败，请检查账号" : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-[28px] border border-gold-muted/40 bg-black/70 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-gold-strong">
          {dict.auth.titleLogin}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {resolvedParams.locale === "zh"
            ? "请使用邮箱密码进入玄策。"
            : "Use your email and password to enter."}
        </p>
      </div>
      <div className="space-y-4">
        <input
          className="w-full rounded-full border border-gold-muted/40 bg-black/60 px-4 py-3 text-sm text-zinc-200"
          placeholder={dict.auth.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="w-full rounded-full border border-gold-muted/40 bg-black/60 px-4 py-3 text-sm text-zinc-200"
          placeholder={dict.auth.password}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <button
          className="w-full rounded-full border border-gold-soft/60 bg-gold-soft/15 px-6 py-3 text-sm font-semibold text-gold-strong"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? dict.common.loading : dict.auth.submit}
        </button>
      </div>
      <Link
        className="text-xs text-gold-soft hover:text-gold-strong"
        href={`/${resolvedParams.locale}/auth/register`}
      >
        {dict.auth.switchToRegister}
      </Link>
    </div>
  );
}

export default function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent params={params} />
    </Suspense>
  );
}
