"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { OfficialEditorialResponse } from "@oj/shared";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useExamTimerStore } from "@/store/examTimer";
import { useLocale } from "@/lib/i18n/LocaleContext";
import CommunityMarkdown from "@/components/CommunityMarkdown";

const languageNames = { cpp17: "C++17", python3: "Python 3", c11: "C11", java17: "Java 17" };
export default function OfficialEditorialPanel({ slug, examLocked }: { slug: string; examLocked: boolean }) {
  const { locale } = useLocale(), zh = locale === "zh-TW";
  const { user, status } = useAuthStore();
  const activeContest = useExamTimerStore(s => s.contestId);
  const query = useQuery({
    queryKey: ["official-editorial", slug, user?.id ?? "anonymous", activeContest, examLocked],
    queryFn: ({ signal }) => apiFetch<OfficialEditorialResponse>(`/problems/${encodeURIComponent(slug)}/editorial`, { signal }),
    enabled: status === "ready" && !examLocked, staleTime: 0, gcTime: 0,
    refetchOnWindowFocus: "always", refetchInterval: 30_000,
  });
  if (examLocked || query.data?.status === "EXAM_LOCKED") return <div className="oj-card space-y-3 p-6 sm:p-8" role="status">
    <p className="font-semibold text-ink-100">{zh ? "先完成測驗，再一起拆解這題。" : "Finish your exam, then explore the solution."}</p>
    <p className="text-sm leading-7 text-ink-300">{zh ? "這題屬於你正在進行的測驗。測驗結束後，官方詳解就會開放閱讀。" : "This problem belongs to your active exam. Its editorial will be available after the exam ends."}</p>
    {!examLocked && <button className="oj-btn-secondary" disabled={query.isFetching} onClick={() => query.refetch()}>{zh ? "重新確認" : "Check again"}</button>}
  </div>;
  if (query.isPending || status !== "ready") return <div role="status" className="oj-card p-8 text-sm text-ink-300">{zh ? "正在載入官方詳解…" : "Loading the official editorial…"}</div>;
  if (query.isError) return <div role="alert" className="oj-card space-y-4 p-6"><p>{zh ? "暫時無法載入詳解，請再試一次。" : "The editorial could not be loaded. Please try again."}</p><button className="oj-btn-secondary" onClick={() => query.refetch()}>{zh ? "重試" : "Retry"}</button></div>;
  const result = query.data;
  if (!result || result.status !== "AVAILABLE") return <div role="status" className="oj-card space-y-3 p-6 sm:p-8">
    <p className="font-semibold text-ink-100">{result?.status === "REVIEW_REQUIRED" ? (zh ? "這題的詳解正在重新驗證" : "This editorial is being reverified") : (zh ? "這題的官方詳解正在準備中" : "This official editorial is being prepared")}</p>
    <p className="text-sm leading-7 text-ink-300">{zh ? "我們會確認解說、參考程式與目前測資一致，再開放完整詳解。你可以先嘗試解題，或在討論區交流思路。" : "We check the explanation and reference code against the current tests before publication. You can keep solving or discuss your approach in the meantime."}</p>
  </div>;
  return <article className="min-w-0 space-y-8 pb-6" aria-label={zh ? "官方詳解內容" : "Official editorial content"}>
    <header className="space-y-3 border-b border-ink-700 pb-6">
      <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 font-semibold text-brand">{zh ? "官方詳解" : "Official editorial"}</span><span className="text-ink-400">{zh ? "繁體中文" : "Traditional Chinese"} · v{result.revision}</span></div>
      <h2 className="break-words text-xl font-semibold leading-8 text-ink-100 sm:text-2xl">{result.editorial.title}</h2>
      <p className="text-xs leading-6 text-ink-400">{zh ? "參考程式已通過本站範例與完整測資驗證" : "Reference code passed this judge’s samples and full test suite"} · <time dateTime={result.verifiedAt}>{new Date(result.verifiedAt).toLocaleDateString(locale)}</time></p>
    </header>
    <CommunityMarkdown content={result.editorial.bodyMd} />
    <section className="min-w-0 space-y-4" aria-label={zh ? "完整程式與解說" : "Reference code and explanation"}>
      <h3 className="text-lg font-semibold text-ink-100">{zh ? "完整程式與逐段解說" : "Reference code, explained"}</h3>
      {result.editorial.solutions.map(solution => <EditorialCode key={`${solution.languageKey}:${result.revision}`} solution={solution} zh={zh} />)}
    </section>
  </article>;
}

function EditorialCode({ solution, zh }: { solution: Extract<OfficialEditorialResponse, { status: "AVAILABLE" }>["editorial"]["solutions"][number]; zh: boolean }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const language = languageNames[solution.languageKey];
  async function copy() {
    try { await navigator.clipboard.writeText(solution.sourceCode); setCopyState("copied"); }
    catch { setCopyState("error"); }
  }
  return <details className="oj-card min-w-0 overflow-hidden" open>
    <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-ink-100 focus-visible:outline focus-visible:outline-brand">{language} · {zh ? "參考解法" : "Reference solution"}</summary>
    <div className="space-y-5 border-t border-ink-700 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-ink-400">{zh ? "複製後可直接貼入編輯器" : "Ready to copy into your editor"}</span><button className="oj-btn-secondary min-h-10 text-xs" onClick={copy} aria-label={zh ? `複製 ${language} 程式碼` : `Copy ${language} code`}>{copyState === "copied" ? (zh ? "已複製" : "Copied") : (zh ? "複製程式碼" : "Copy code")}</button></div>
      <span role="status" className="sr-only">{copyState === "copied" ? (zh ? "程式碼已複製到剪貼簿" : "Code copied to clipboard") : ""}</span>
      {copyState === "error" && <p role="alert" className="text-sm text-verdict-wa">{zh ? "無法存取剪貼簿，請選取下方程式碼並手動複製。" : "Clipboard access failed. Select the code below and copy it manually."}</p>}
      <pre tabIndex={0} aria-label={`${language} ${zh ? "參考程式" : "reference code"}`} className="max-h-[34rem] overflow-auto rounded-lg bg-ink-950 p-4 font-mono text-xs leading-6 text-ink-100"><code>{solution.sourceCode}</code></pre>
      <CommunityMarkdown content={solution.explanationMd} />
    </div>
  </details>;
}
