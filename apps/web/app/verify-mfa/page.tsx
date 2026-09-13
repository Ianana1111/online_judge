"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function VerifyMfaPage() {
  const { locale } = useLocale(), zh = locale === "zh-TW", router = useRouter();
  const { user, status, hydrate, logout } = useAuthStore();
  const [code, setCode] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [recovery, setRecovery] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { await apiFetch("/auth/mfa/verify", { method: "POST", body: { code } }); setCode(""); await hydrate(); router.replace("/"); }
    catch (err) { setError(err instanceof ApiError && err.status === 429 ? (zh ? "嘗試太頻繁，請稍後再試。" : "Too many attempts. Try again shortly.") : (zh ? "驗證失敗。請使用下一組驗證碼或尚未使用的備用碼；若持續失敗，請五分鐘後再試。" : "Verification failed. Try the next code or an unused recovery code. If attempts remain blocked, wait five minutes.")); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-md py-12"><h1 className="font-display text-2xl font-bold text-ink-50">{zh ? "確認是你本人" : "Verify it’s you"}</h1>
    <div className="oj-card mt-6 p-6">{status === "ready" && !user ? <Link href="/login" className="text-brand underline">{zh ? "請先登入" : "Log in first"}</Link> : <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
      <p className="text-sm leading-6 text-ink-300">{recovery ? (zh ? "輸入一組備用碼。每組僅能使用一次，請勿分享給任何人。" : "Enter an unused recovery code. Each code works only once. Never share it.") : (zh ? "開啟驗證器 App，輸入 judge.tw 的六位數驗證碼。" : "Open your authenticator and enter the six-digit judge.tw code.")}</p>
      <label htmlFor="mfa-code" className="block text-sm text-ink-200">{recovery ? (zh ? "備用碼" : "Recovery code") : (zh ? "驗證碼" : "Authentication code")}</label>
      <input id="mfa-code" className="oj-input font-mono" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" inputMode={recovery ? "text" : "numeric"} maxLength={recovery ? 32 : 6} minLength={6} required autoFocus />
      {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
      <button className="oj-btn-primary w-full" disabled={busy || !user}>{busy ? (zh ? "驗證中…" : "Verifying…") : (zh ? "確認並繼續" : "Verify and continue")}</button>
      <button className="text-sm text-brand underline" type="button" onClick={() => { setRecovery(!recovery); setCode(""); setError(""); }}>{recovery ? (zh ? "使用驗證器" : "Use authenticator") : (zh ? "改用備用碼" : "Use a recovery code")}</button>
      <button className="block text-sm text-ink-400 underline" disabled={busy} type="button" onClick={async () => { try { await logout(); router.replace("/login"); } catch { setError(zh ? "登出失敗，請重試。" : "Could not log out. Try again."); } }}>{zh ? "登出並切換帳號" : "Log out and switch accounts"}</button>
    </form>}</div></div>;
}
