"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { categories, reviewLabels, type EditablePost, type PostCategory } from "@/lib/community";
import CommunityMarkdown from "./CommunityMarkdown";

type Fields = { title: string; bodyMd: string; category: PostCategory; isOfficial: boolean };
export default function PostComposer() {
  const { user, status } = useAuthStore(), params = useSearchParams(), { locale } = useLocale();
  if (status !== "ready") return <p role="status">{locale === "zh-TW" ? "載入中…" : "Loading…"}</p>;
  if (!user) return <Link className="oj-btn-primary" href="/login?next=/discussion/write">{locale === "zh-TW" ? "登入後投稿" : "Log in to write"}</Link>;
  return <Editor key={`${user.id}:${params.get("id") ?? "new"}`} userId={user.id} admin={user.role === "ADMIN"} id={params.get("id")} />;
}
function Editor({ userId, admin, id }: { userId: string; admin: boolean; id: string | null }) {
  const { locale } = useLocale(), zh = locale === "zh-TW", router = useRouter(), qc = useQueryClient();
  const key = `community-draft:${userId}:${id ?? "new"}`;
  const query = useQuery({ queryKey: ["posts", "own", userId, id], queryFn: () => apiFetch<EditablePost>(`/posts/${id}/mine`), enabled: !!id });
  const [fields, setFields] = useState<Fields>({ title: "", bodyMd: "", category: "GENERAL", isOfficial: false });
  const [saved, setSaved] = useState<Fields | null>(null), [initialized, setInitialized] = useState(false), [preview, setPreview] = useState(false), [sending, setSending] = useState(false), [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saved" | "failed">("idle");
  useEffect(() => {
    if (initialized || (id && !query.data)) return;
    if (query.data) setFields({ title: query.data.title, bodyMd: query.data.bodyMd, category: query.data.category, isOfficial: query.data.isOfficial });
    try {
      const data = JSON.parse(localStorage.getItem(key) ?? "null");
      if (data && typeof data.title === "string" && data.title.length <= 200 && typeof data.bodyMd === "string" && data.bodyMd.length <= 50000 && Object.hasOwn(categories, data.category)) {
        setSaved({ title: data.title, bodyMd: data.bodyMd, category: !admin && data.category === "ANNOUNCEMENT" ? "GENERAL" : data.category, isOfficial: admin && data.isOfficial === true });
      }
    } catch { setSaveState("failed"); }
    setInitialized(true);
  }, [initialized, id, query.data, key, admin]);
  function update(next: Fields) { setFields(next); try { localStorage.setItem(key, JSON.stringify(next)); setSaveState("saved"); } catch { setSaveState("failed"); } }
  useEffect(() => {
    if (saveState !== "failed" || (!fields.title && !fields.bodyMd)) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [saveState, fields.title, fields.bodyMd]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSending(true); setError("");
    try {
      await apiFetch(id ? `/posts/${id}` : "/posts", { method: id ? "PATCH" : "POST", body: fields });
      try { localStorage.removeItem(key); } catch { /* optional local storage */ }
      await qc.invalidateQueries({ queryKey: ["posts"] }); router.push("/discussion/mine?submitted=1");
    } catch (err) { setError(err instanceof Error ? err.message : (zh ? "送出失敗，內容仍保留在編輯器中。" : "Could not submit. Your text is still in the editor.")); }
    finally { setSending(false); }
  }
  if (query.isError) return <div role="alert"><p>{zh ? "無法開啟這篇投稿，請確認你使用的是原投稿帳號。" : "Could not open this draft. Check that you are signed in as its author."}</p><button className="oj-btn-ghost mt-3" onClick={() => query.refetch()}>{zh ? "再試一次" : "Retry"}</button></div>;
  if (!initialized) return <p role="status">{zh ? "載入投稿…" : "Loading your post…"}</p>;
  return <div className="mx-auto max-w-3xl space-y-6">
    <Link href="/discussion" className="text-sm text-brand">{zh ? "← 返回討論區" : "← Back to discussions"}</Link>
    <header><h1 className="font-display text-3xl font-bold text-ink-100">{id ? (zh ? "修改投稿" : "Edit your post") : (zh ? "分享你的思路" : "Share your thinking")}</h1><p className="mt-3 text-sm leading-6 text-ink-400">{zh ? "文章和修改都會先送審，通過後才公開。使用 Markdown 整理觀念與程式碼，請勿包含個人資料或尚未結束的測驗答案。" : "Posts and edits are reviewed before publication. Use Markdown for ideas and code. Leave out personal data and active exam answers."}</p></header>
    {query.data?.status && <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm text-ink-300"><p className="font-semibold text-brand">{reviewLabels[query.data.status][zh ? 0 : 1]}</p>{query.data.reason && <p className="mt-2 whitespace-pre-wrap">{query.data.reason}</p>}{query.data.publishedAt && <p className="mt-2">{zh ? "修改審核期間，讀者仍會看到上一個核准版本。" : "Readers will see the last approved version while your edit is reviewed."}</p>}</div>}
    {saved && <div className="oj-card flex flex-wrap items-center gap-3 p-4 text-sm"><span className="mr-auto text-ink-300">{zh ? "這個瀏覽器有尚未送出的草稿。" : "This browser has an unsent draft."}</span><button className="oj-btn-ghost" onClick={() => { update(saved); setSaved(null); }}>{zh ? "恢復草稿" : "Restore draft"}</button><button className="text-ink-400" onClick={() => { setSaved(null); try { localStorage.removeItem(key); } catch { /* optional */ } }}>{zh ? "捨棄" : "Discard"}</button></div>}
    <form onSubmit={submit} className="oj-card space-y-5 p-5 sm:p-7">
      {saveState === "failed" ? <p role="alert" className="text-sm text-verdict-wa">{zh ? "瀏覽器無法保存草稿，離開前請先複製內容備份。你仍可繼續編輯與送審。" : "This browser cannot save your draft. Copy your text before leaving. You can still edit and submit."}</p> : saveState === "saved" && <p role="status" className="text-xs text-ink-400">{zh ? "草稿已保存在此瀏覽器，尚未送出。" : "Draft saved in this browser; not submitted yet."}</p>}
      <div><label htmlFor="post-title" className="mb-2 block text-sm font-medium text-ink-200">{zh ? "標題" : "Title"}</label><input id="post-title" className="oj-input w-full" required maxLength={200} value={fields.title} onChange={(e) => update({ ...fields, title: e.target.value })} placeholder={zh ? "一個具體的標題，讓好問題被看見" : "A specific title helps people understand your topic"} /></div>
      <div><label htmlFor="post-category" className="mb-2 block text-sm font-medium text-ink-200">{zh ? "分類" : "Category"}</label><select id="post-category" className="oj-input w-full sm:w-56" value={fields.category} onChange={(e) => update({ ...fields, category: e.target.value as PostCategory })}>{Object.entries(categories).filter(([c]) => admin || c !== "ANNOUNCEMENT").map(([c, labels]) => <option value={c} key={c}>{labels[zh ? 0 : 1]}</option>)}</select></div>
      {admin && <label className="flex items-center gap-2 text-sm text-ink-300"><input type="checkbox" checked={fields.isOfficial} onChange={(e) => update({ ...fields, isOfficial: e.target.checked })} />{zh ? "標記為官方內容（仍需審核）" : "Mark as official (review still required)"}</label>}
      <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="post-body" className="text-sm font-medium text-ink-200">{zh ? "內容" : "Content"}</label><button type="button" className="oj-btn-ghost text-xs" aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? (zh ? "繼續編輯" : "Continue editing") : (zh ? "預覽排版" : "Preview")}</button></div>
        {preview ? <div className="min-h-72 rounded-lg border border-ink-700 p-5"><CommunityMarkdown content={fields.bodyMd || (zh ? "尚未輸入內容。" : "No content yet.")} /></div> : <textarea id="post-body" className="oj-input min-h-80 w-full font-mono text-sm leading-7" required maxLength={50000} value={fields.bodyMd} onChange={(e) => update({ ...fields, bodyMd: e.target.value })} placeholder={zh ? "說明你的問題、想法，以及已經嘗試的方法…" : "Describe your question, idea and what you have tried…"} />}
        <p className="mt-2 text-right text-xs text-ink-400">{fields.bodyMd.length.toLocaleString()} / 50,000</p>
      </div>
      {error && <p role="alert" className="text-sm text-verdict-wa">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-700 pt-5"><p className="text-xs text-ink-400">{zh ? "送出後可在「我的投稿」查看進度。" : "Track progress in My posts after submitting."}</p><button type="submit" className="oj-btn-primary" disabled={sending || !fields.title.trim() || !fields.bodyMd.trim()}>{sending ? (zh ? "送出中…" : "Submitting…") : (zh ? "送出審核 →" : "Submit for review →")}</button></div>
    </form>
  </div>;
}
