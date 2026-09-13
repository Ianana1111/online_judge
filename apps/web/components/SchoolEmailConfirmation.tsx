"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
export default function SchoolEmailConfirmation() {
  const zh = useLocale().locale === "zh-TW", hydrate = useAuthStore((s) => s.hydrate);
  const saved = useRef<string | null>(null), [token, setToken] = useState(""), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [done, setDone] = useState(false), [error, setError] = useState("");
  useEffect(() => { saved.current ??= new URLSearchParams(location.hash.slice(1)).get("token") ?? ""; setToken(saved.current); history.replaceState(history.state, "", location.pathname); setReady(true); }, []);
  async function confirm() {
    setBusy(true); setError("");
    try { const result = await apiFetch<{ ok: boolean; reason?: string }>("/users/school/verify/confirm", { method: "POST", body: { token } });
      if (result.ok) { setDone(true); setToken(""); await hydrate(); }
      else setError(result.reason === "duplicate" ? (zh ? "這個信箱已驗證其他帳號，請聯絡客服。" : "This mailbox is already linked to another account. Contact support.") : (zh ? "連結已失效，請回設定重新申請。" : "This link is no longer valid. Request a new one in settings."));
    } catch { setError(zh ? "暫時無法完成，請稍後再試。" : "Unable to confirm. Please try again shortly."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-md py-12"><h1 className="font-display text-3xl font-bold text-ink-100">{zh ? "驗證學校信箱" : "Verify school email"}</h1><div className="oj-card mt-6 space-y-5 p-6">
    {done ? <p role="status" className="text-ink-200">{zh ? "學校信箱驗證完成，你的學校將顯示在個人頁與排行榜。" : "School email verified. Your school will appear on your profile and leaderboard."}</p> : <><p className="text-sm leading-6 text-ink-300">{ready && !token ? (zh ? "請從驗證信重新開啟完整連結。" : "Reopen the complete link from your verification email.") : (zh ? "確認此信箱屬於你，再按下方按鈕完成驗證。" : "Confirm that this mailbox belongs to you, then verify below.")}</p><button className="oj-btn-primary w-full" disabled={!ready || !token || token.length > 4096 || busy} onClick={confirm}>{busy ? (zh ? "驗證中…" : "Verifying…") : (zh ? "確認驗證學校信箱" : "Confirm school email")}</button></>}
    {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}<Link href="/settings" className="inline-block text-sm text-brand underline">{zh ? "返回設定" : "Back to settings"}</Link>
  </div></div>;
}
