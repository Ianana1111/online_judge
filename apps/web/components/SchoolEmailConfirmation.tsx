"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";

type VerifiedAccount = { handle: string; school: string };
type Receipt = { confirmedAt: number; account?: VerifiedAccount };
const RECEIPT_KEY = "judge.school-verification-receipt";
const RECEIPT_TTL = 30 * 60 * 1000;

// A short-lived display receipt survives a refresh in this tab. Never persist the token,
// email, user ID or session credentials; this receipt grants no authorization.
function readReceipt(): Receipt | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) ?? "null");
    if (value && typeof value.confirmedAt === "number" && Date.now() >= value.confirmedAt && Date.now() - value.confirmedAt < RECEIPT_TTL &&
      (!value.account || (typeof value.account.handle === "string" && typeof value.account.school === "string"))) return value;
  } catch { /* Storage may be unavailable in a restricted browser. */ }
  return null;
}

export default function SchoolEmailConfirmation() {
  const zh = useLocale().locale === "zh-TW";
  const { user, status, hydrate } = useAuthStore();
  const saved = useRef<string | null>(null), submitting = useRef(false);
  const challengeVersion = useRef(0);
  const [token, setToken] = useState(""), [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false), [receipt, setReceipt] = useState<Receipt | null>(null), [error, setError] = useState("");
  useEffect(() => {
    function acceptLink(incoming: string) {
      challengeVersion.current += 1;
      saved.current = incoming; setToken(incoming); setReceipt(null); setError("");
      history.replaceState(history.state, "", location.pathname);
      try { sessionStorage.removeItem(RECEIPT_KEY); } catch { /* Optional display storage. */ }
    }
    const initial = saved.current ?? new URLSearchParams(location.hash.slice(1)).get("token");
    if (initial !== null) acceptLink(initial);
    else setReceipt(readReceipt());
    const onHashChange = () => {
      const incoming = new URLSearchParams(location.hash.slice(1)).get("token");
      if (incoming !== null) acceptLink(incoming);
    };
    window.addEventListener("hashchange", onHashChange);
    setReady(true);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  async function confirm() {
    if (!token || submitting.current) return;
    const version = challengeVersion.current;
    submitting.current = true; setBusy(true); setError("");
    try {
      const result = await apiFetch<{ ok: boolean; reason?: string; account?: VerifiedAccount }>("/users/school/verify/confirm", { method: "POST", body: { token } });
      if (version !== challengeVersion.current) return;
      if (result.ok) {
        const next = { confirmedAt: Date.now(), account: result.account };
        setReceipt(next); setToken(""); saved.current = "";
        try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(next)); } catch { /* Verification already succeeded. */ }
        // Refresh this browser's existing session. Never sign in as the token's owner or
        // link their Google identity to the current browser's account.
        void hydrate();
      } else setError(result.reason === "duplicate"
        ? (zh ? "這個信箱已驗證其他帳號，請聯絡客服。" : "This mailbox is already linked to another account. Contact support.")
        : (zh ? "連結已失效。請回到原本登入 judge. 的瀏覽器，在設定確認驗證狀態；若尚未完成，請重新寄信並開啟最新連結。" : "This link is no longer valid. Return to your original judge. browser and check Settings. If not yet verified, request a new email and open its latest link."));
    } catch { if (version === challengeVersion.current) setError(zh ? "暫時無法確認結果，請按下方按鈕重試。如果已完成驗證，重試不會重複綁定。" : "We couldn't confirm the result. Retry below; an already completed verification won't be linked again."); }
    finally { submitting.current = false; setBusy(false); }
  }

  const account = receipt?.account;
  const sameAccount = status === "ready" && !!account && user?.handle === account.handle;
  const differentAccount = status === "ready" && !!account && !!user && user.handle !== account.handle;
  return <div className="mx-auto max-w-lg px-1 py-12">
    <h1 className="font-display text-3xl font-bold text-ink-100">{zh ? "驗證學校信箱" : "Verify school email"}</h1>
    <div className="oj-card mt-6 space-y-5 p-6">
      {receipt ? <>
        <div role="status" className="space-y-2 rounded-lg border border-verdict-ac/30 bg-verdict-ac/5 p-4">
          <p className="font-semibold text-verdict-ac">{zh ? "學校信箱驗證完成" : "School email verified"}</p>
          {account && <p className="break-words text-sm text-ink-200">@{account.handle} · {account.school}</p>}
          <p className="text-sm leading-6 text-ink-300">{zh ? "驗證結果已儲存，不需要再驗證一次。" : "Your verification has been saved. You do not need to verify again."}</p>
        </div>
        {differentAccount && <p role="note" className="break-words rounded-lg border border-ink-700 p-3 text-sm leading-6 text-ink-200">
          {zh ? `這個瀏覽器目前登入的是 @${user.handle}。這次驗證完成在 @${account.handle}，不會變更目前登入帳號的學校。` : `This browser is signed in as @${user.handle}. Verification was completed for @${account.handle}; the current account's school has not changed.`}
        </p>}
        <p className="text-sm leading-7 text-ink-300">{sameAccount
          ? (zh ? "可以回設定查看已驗證的學校，或繼續練習。" : "View your verified school in Settings, or keep practicing.")
          : (zh ? "你可以關閉此頁，回到原本登入 judge. 的 Chrome 個人檔案或瀏覽器繼續使用。原本的設定頁會自動更新驗證狀態。" : "You can close this page and return to the Chrome profile or browser where you originally signed in to judge. Your open Settings page will update automatically.")}</p>
        {!sameAccount && <p className="text-sm leading-6 text-ink-400">{zh ? "學校 Google 帳號用來收驗證信，不一定是你的 judge. 登入帳號。如果需要登入，請使用原本的登入方式，不用重新註冊。" : "Your school Google account receives the email; it may differ from your judge. login. If you need to sign in, use your original login method. No new account is needed."}</p>}
        <Link href={sameAccount ? "/settings" : "/"} className="oj-btn-primary inline-flex w-full justify-center">{sameAccount ? (zh ? "查看已驗證的學校" : "View verified school") : (zh ? "回到 judge. 首頁" : "Go to judge.")}</Link>
      </> : <>
        <p className="text-sm leading-7 text-ink-300">{ready && !token
          ? (zh ? "請從最新的驗證信重新開啟完整連結。若已看過驗證成功的訊息，回原本帳號的設定確認即可，不必重新驗證。" : "Reopen the complete link from your latest verification email. If you already saw a success message, check your original account's Settings; no repeat verification is needed.")
          : (zh ? "確認這是你申請的學校信箱驗證，再按下方按鈕完成。無須先登入；即使在不同的 Chrome 個人檔案開啟，也會驗證到原本提出申請的 judge. 帳號。" : "Confirm that you requested this school verification, then press the button below. No sign-in is required: even in a different Chrome profile, verification belongs to the judge. account that requested it.")}</p>
        <button className="oj-btn-primary w-full" disabled={!ready || !token || token.length > 4096 || busy} onClick={confirm}>{busy ? (zh ? "驗證中…" : "Verifying…") : (zh ? "確認驗證學校信箱" : "Confirm school email")}</button>
      </>}
      {error && <p role="alert" className="text-sm leading-6 text-verdict-wa">{error}</p>}
      <Link href="/faq" className="inline-block text-sm text-brand underline">{zh ? "學校驗證常見問題" : "School verification FAQ"}</Link>
    </div>
  </div>;
}
