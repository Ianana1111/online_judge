"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";

export default function AccountRecoveryForm({ mode }: { mode: "request" | "reset" | "verify" }) {
  const { locale } = useLocale(), zh = locale === "zh-TW";
  const [token, setToken] = useState(""), [ready, setReady] = useState(mode === "request");
  const capturedToken = useRef<string | null>(null);
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false), [done, setDone] = useState(false), [error, setError] = useState("");
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    if (mode === "request") return;
    capturedToken.current ??= new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    setToken(capturedToken.current);
    // Keep credentials out of history, analytics and accidental URL sharing.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    setReady(true);
  }, [mode]);
  const title = mode === "request" ? (zh ? "找回你的帳號" : "Recover your account") : mode === "reset" ? (zh ? "設定新密碼" : "Set a new password") : (zh ? "驗證帳號信箱" : "Verify your email");
  const invalid = ready && mode !== "request" && !/^[A-Za-z0-9_-]{43}$/.test(token);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (mode === "reset" && password !== confirm) { setError(zh ? "兩次輸入的密碼不一致。" : "The passwords do not match."); return; }
    setBusy(true);
    try {
      await apiFetch(mode === "request" ? "/auth/forgot-password" : mode === "reset" ? "/auth/reset-password" : "/auth/email/verify", { method: "POST", body: mode === "request" ? { email } : mode === "reset" ? { token, password } : { token } });
      setDone(true); setPassword(""); setConfirm(""); setToken("");
      if (mode !== "request") await hydrate();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? (zh ? "操作太頻繁，請稍後再試。" : "Too many attempts. Please try again shortly.") : mode === "request" ? (zh ? "目前無法受理，請稍後重試或聯絡客服。" : "Unable to process your request. Try again later or contact support.") : (zh ? "連結可能已過期或使用過，請重新申請。" : "This link may have expired or already been used. Please request another."));
    } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-md py-12">
    <p className="mb-3 text-sm font-medium text-brand">judge.tw</p>
    <h1 className="font-display text-3xl font-bold text-ink-50">{title}</h1>
    <div className="oj-card mt-6 p-6">
      {done ? <div role="status" className="space-y-4 text-sm leading-7 text-ink-200">
        <p>{mode === "request" ? (zh ? "如果這個信箱有可重設密碼的帳號，我們會寄出重設連結。請檢查收件匣與垃圾郵件；Google 註冊的帳號請使用 Google 登入。" : "If this address has an eligible account, a reset link will arrive shortly. Check your inbox and spam folder. Google accounts should use Google sign-in.") : mode === "reset" ? (zh ? "密碼已更新，舊登入憑證已失效。請使用新密碼登入；已啟用的雙因素驗證會繼續保護帳號。" : "Your password has been updated and old sessions revoked. Log in with your new password. Two-factor authentication remains enabled.") : (zh ? "信箱驗證完成。" : "Your email is verified.")}</p>
        <Link className="oj-btn-primary inline-block" href={mode === "verify" ? "/settings?section=security" : "/login"}>{zh ? "繼續" : "Continue"}</Link>
      </div> : invalid ? <div role="alert" className="space-y-4 text-sm text-ink-300"><p>{zh ? "請從信件開啟完整連結。如果重新整理過此頁，請再次開啟信件連結。" : "Open the complete link from your email. If you refreshed this page, reopen the email link."}</p><Link href={mode === "reset" ? "/forgot-password" : "/settings?section=security"} className="text-brand underline">{zh ? "重新申請連結" : "Request a new link"}</Link></div> : <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
        <p className="text-sm leading-6 text-ink-300">{mode === "request" ? (zh ? "輸入註冊時使用的信箱，我們會協助你重新設定密碼。" : "Enter your account email to request a password reset.") : mode === "reset" ? (zh ? "使用至少 8 個字元、未在其他網站使用過的密碼。" : "Use at least 8 characters and a password you do not use elsewhere.") : (zh ? "按下方按鈕完成驗證，連結僅能使用一次。" : "Confirm below to verify your email. This link can only be used once.")}</p>
        {mode === "request" && <div><label htmlFor="recovery-email" className="mb-2 block text-sm text-ink-200">{zh ? "電子信箱" : "Email"}</label><input id="recovery-email" className="oj-input" type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>}
        {mode === "reset" && <><div><label htmlFor="recovery-password" className="mb-2 block text-sm text-ink-200">{zh ? "新密碼" : "New password"}</label><input id="recovery-password" className="oj-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} required /></div><div><label htmlFor="recovery-confirm" className="mb-2 block text-sm text-ink-200">{zh ? "再次輸入新密碼" : "Confirm new password"}</label><input id="recovery-confirm" className="oj-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div></>}
        {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
        <button disabled={busy || !ready} className="oj-btn-primary w-full">{busy ? (zh ? "處理中…" : "Working…") : mode === "request" ? (zh ? "寄送重設連結" : "Send reset link") : mode === "reset" ? (zh ? "更新密碼" : "Update password") : (zh ? "確認驗證信箱" : "Verify email")}</button>
      </form>}
    </div>
    <Link href="/login" className="mt-5 inline-block text-sm text-ink-300 underline underline-offset-4">{zh ? "返回登入" : "Back to login"}</Link>
  </div>;
}
