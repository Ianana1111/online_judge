"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useT } from "@/lib/i18n/LocaleContext";

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/register", { method: "POST", body: { handle, email, password } });
      await hydrate();
      router.push("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">{t("Create an account")}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="handle" className="mb-1 block text-sm text-ink-300">
            {t("Handle")}
          </label>
          <input
            id="handle"
            className="oj-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={24}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-ink-300">
            {t("Email")}
          </label>
          <input
            id="email"
            type="email"
            className="oj-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-ink-300">
            {t("Password")}
          </label>
          <input
            id="password"
            type="password"
            className="oj-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-ink-400">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span>
            {t("I agree to the")} <Link href="/terms" className="text-brand hover:underline">{t("Terms of Service")}</Link>{" "}
            {t("and")} <Link href="/privacy" className="text-brand hover:underline">{t("Privacy Policy")}</Link>.
          </span>
        </label>
        {error && <p className="text-sm text-verdict-wa">{error}</p>}
        <button type="submit" disabled={loading || !agreed} className="oj-btn-primary w-full">
          {loading ? t("Creating account…") : t("Create account")}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-800" />
        <span className="text-xs text-ink-500">{t("or")}</span>
        <div className="h-px flex-1 bg-ink-800" />
      </div>
      <GoogleLoginButton disabled={!agreed} />

      <p className="mt-4 text-sm text-ink-400">
        {t("Already have an account?")}{" "}
        <Link href="/login" className="text-brand hover:underline">
          {t("Log in")}
        </Link>
      </p>
    </div>
  );
}
