"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiUrl, ApiError, setCsrfToken } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function AccountSecuritySettings() {
  const { locale } = useLocale(), zh = locale === "zh-TW";
  const { user, hydrate } = useAuthStore();
  const [password, setPassword] = useState(""), [code, setCode] = useState("");
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null), [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  const [events, setEvents] = useState<{ id: string; kind: string; createdAt: string }[] | null>(null), [historyError, setHistoryError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("securityReauth") !== "1") return;
    setMessage(zh ? "Google 身分確認已完成，請於五分鐘內繼續安全設定。" : "Google reauthentication completed. Continue your security change within five minutes.");
    url.searchParams.delete("securityReauth"); window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}`);
  }, [zh]);
  useEffect(() => {
    let active = true;
    apiFetch<typeof events>("/auth/security").then((data) => { if (active) { setEvents(data); setHistoryError(false); } }).catch(() => { if (active) setHistoryError(true); });
    return () => { active = false; };
  }, [user?.id, user?.mfaEnabled, message]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);
  useEffect(() => {
    if (!codes.length) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [codes.length]);
  if (!user) return null;
  const eventLabels: Record<string, string> = zh ? { PASSWORD_RESET: "密碼已重設", EMAIL_VERIFIED: "帳號信箱已驗證", MFA_ENABLED: "雙因素驗證已啟用", MFA_DISABLED: "雙因素驗證已停用", MFA_RECOVERY_CODE_USED: "使用備用碼登入", MFA_RECOVERY_CODES_REPLACED: "備用碼已重新產生" } : { PASSWORD_RESET: "Password reset", EMAIL_VERIFIED: "Email verified", MFA_ENABLED: "Two-factor authentication enabled", MFA_DISABLED: "Two-factor authentication disabled", MFA_RECOVERY_CODE_USED: "Recovery code used", MFA_RECOVERY_CODES_REPLACED: "Recovery codes replaced" };
  async function action(kind: "email" | "setup" | "enable" | "disable" | "recovery-codes") {
    setBusy(true); setError(""); setMessage("");
    try {
      if (kind === "email") {
        await apiFetch("/auth/email/request", { method: "POST" }); setCooldown(60);
        setMessage(zh ? "驗證信已排入寄送，請查看收件匣與垃圾郵件。" : "Verification email queued. Check your inbox and spam folder.");
      } else if (kind === "setup") {
        setSetup(await apiFetch("/auth/mfa/setup", { method: "POST", body: { password: password || undefined } })); setPassword(""); setCode("");
      } else {
        const result = await apiFetch<{ csrfToken: string; recoveryCodes?: string[] }>(`/auth/mfa/${kind}`, { method: "POST", body: { code, password: password || undefined } });
        setCsrfToken(result.csrfToken); setCode(""); setPassword(""); setSetup(null); setCodes(result.recoveryCodes ?? []);
        setMessage(kind === "disable" ? (zh ? "雙因素驗證已停用。" : "Two-factor authentication disabled.") : (zh ? "安全設定已更新。請立即保存下方備用碼。" : "Security settings updated. Save your recovery codes below."));
        await hydrate();
      }
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? (zh ? "操作太頻繁，請稍後再試。" : "Too many attempts. Please try again later.") : (zh ? "操作未完成。請確認密碼、驗證碼或 Google 重新登入狀態；若持續失敗，請五分鐘後重試或聯絡客服。" : "Unable to complete this action. Check your password, code or Google reauthentication. If it continues, wait five minutes or contact support."));
    } finally { setBusy(false); }
  }
  return <div className="space-y-6">
    {user.mfaEnrollmentRequired && <p role="alert" className="rounded-xl border border-brand/40 bg-brand/10 p-4 text-sm leading-6 text-ink-200">{zh ? "管理員帳號需要啟用雙因素驗證，完成後即可繼續使用管理功能。" : "Administrators must enable two-factor authentication before continuing."}</p>}
    <section className="oj-card space-y-4 p-5" aria-labelledby="email-security-title"><h2 id="email-security-title" className="font-semibold text-ink-100">{zh ? "帳號信箱" : "Account email"}</h2><p className="break-all text-sm text-ink-300">{user.email}</p><p className="text-sm text-ink-300">{user.emailVerifiedAt ? (zh ? "✓ 已驗證" : "✓ Verified") : (zh ? "尚未驗證。驗證信箱可協助確認帳號所有權；學校驗證需另外完成。" : "Not verified. Verify your account email to confirm ownership. School verification is separate.")}</p>{!user.emailVerifiedAt && <button onClick={() => void action("email")} disabled={busy || cooldown > 0 || user.mfaEnrollmentRequired} className="oj-btn-secondary">{cooldown ? `${cooldown}s` : zh ? "寄送驗證信" : "Send verification email"}</button>}</section>
    <section className="oj-card space-y-4 p-5" aria-labelledby="mfa-security-title"><h2 id="mfa-security-title" className="font-semibold text-ink-100">{zh ? "雙因素驗證" : "Two-factor authentication"}</h2>
      <p className="text-sm leading-6 text-ink-300">{user.mfaEnabled ? (zh ? "✓ 已啟用。登入時會再確認驗證器中的一次性驗證碼。" : "✓ Enabled. Your authenticator adds a second check when you log in.") : (zh ? "使用驗證器 App 產生的一次性驗證碼，為帳號增加一層保護。設定過程約需一分鐘。" : "Add a second layer of protection with codes from an authenticator app. Setup takes about a minute.")}</p>
      {codes.length > 0 ? <div className="space-y-4"><h3 className="text-sm font-semibold text-ink-100">{zh ? "保存備用碼" : "Save recovery codes"}</h3><p className="text-sm leading-6 text-ink-300">{zh ? "每組只能使用一次，之後無法再次查看。請存放在安全的地方，避免與驗證器放在同一部裝置。" : "Each code works once and cannot be displayed again. Store them safely, separate from your authenticator."}</p><pre className="overflow-x-auto rounded-lg bg-ink-900 p-4 text-sm text-ink-100" tabIndex={0} aria-label={zh ? "備用碼清單" : "Recovery codes"}>{codes.join("\n")}</pre><button className="oj-btn-primary" onClick={() => setCodes([])}>{zh ? "我已安全保存備用碼" : "I have saved my recovery codes"}</button></div> : <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void action(setup ? "enable" : user.mfaEnabled ? "recovery-codes" : "setup"); }}>
        {!setup && (user.hasPassword ? <div><label htmlFor="security-password" className="mb-2 block text-sm text-ink-200">{zh ? "目前密碼" : "Current password"}</label><input id="security-password" className="oj-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={128} /></div> : <a href={apiUrl("/auth/google?intent=security")} className="inline-block text-sm text-brand underline">{zh ? "先使用 Google 重新確認身分" : "Reauthenticate with Google first"}</a>)}
        {setup && <div className="space-y-3"><p className="text-sm leading-6 text-ink-300">{zh ? "在驗證器新增帳號，選擇「輸入設定金鑰」，名稱填 judge.tw、類型選「依時間」。設定須於十分鐘內完成。" : "Add an account in your authenticator using a setup key. Name it judge.tw and choose time-based codes. Finish within ten minutes."}</p><div className="break-all rounded-lg border border-ink-700 p-3 font-mono text-sm text-ink-100" aria-label={zh ? "驗證器設定金鑰" : "Authenticator setup key"}>{setup.secret}</div><a href={setup.uri} className="inline-block text-sm text-brand underline">{zh ? "在此裝置開啟驗證器" : "Open authenticator on this device"}</a></div>}
        {(setup || user.mfaEnabled) && <div><label htmlFor="security-code" className="mb-2 block text-sm text-ink-200">{zh ? "驗證碼" : "Authentication code"}</label><input id="security-code" className="oj-input font-mono" autoComplete="one-time-code" inputMode={setup ? "numeric" : "text"} value={code} onChange={(e) => setCode(e.target.value)} minLength={6} maxLength={setup ? 6 : 32} required /></div>}
        <div className="flex flex-wrap gap-3"><button className="oj-btn-primary" disabled={busy}>{busy ? (zh ? "處理中…" : "Working…") : setup ? (zh ? "確認啟用" : "Confirm and enable") : user.mfaEnabled ? (zh ? "重新產生備用碼" : "Replace recovery codes") : (zh ? "開始設定" : "Start setup")}</button>{setup && <button className="oj-btn-secondary" type="button" disabled={busy} onClick={() => { setSetup(null); setCode(""); }}>{zh ? "取消設定" : "Cancel setup"}</button>}{user.mfaEnabled && user.role !== "ADMIN" && <button className="oj-btn-secondary" disabled={busy || !code || (user.hasPassword && !password)} type="button" onClick={() => void action("disable")}>{zh ? "停用雙因素驗證" : "Disable two-factor authentication"}</button>}</div>
        {user.mfaEnabled && <p className="text-xs leading-5 text-ink-400">{zh ? "重新產生備用碼會使所有舊備用碼與其他登入憑證失效。" : "Replacing recovery codes invalidates all old recovery codes and other sessions."}</p>}
      </form>}
    </section>
    {error && <p role="alert" className="text-sm leading-6 text-verdict-wa">{error}</p>}{message && <p role="status" className="text-sm leading-6 text-ink-200">{message}</p>}
    <section className="oj-card p-5" aria-labelledby="security-history-title"><h2 id="security-history-title" className="mb-4 font-semibold text-ink-100">{zh ? "近期安全紀錄" : "Recent security activity"}</h2>{historyError ? <p role="alert" className="text-sm text-ink-300">{zh ? "無法載入紀錄，請重新整理再試。" : "Could not load activity. Refresh to try again."}</p> : events === null ? <p role="status" className="text-sm text-ink-400">{zh ? "載入中…" : "Loading…"}</p> : !events.length ? <p className="text-sm text-ink-400">{zh ? "目前沒有安全設定變更紀錄。" : "No security changes recorded yet."}</p> : <ul className="divide-y divide-ink-800">{events.map((event) => <li key={event.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="text-ink-200">{eventLabels[event.kind] ?? event.kind}</span><time dateTime={event.createdAt} className="text-ink-400">{new Date(event.createdAt).toLocaleString(locale)}</time></li>)}</ul>}</section>
  </div>;
}
