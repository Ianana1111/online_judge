"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { ContestListItem } from "@/lib/types";
import { stripProblemNumber } from "@/lib/problemTitle";
import { useLocale } from "@/lib/i18n/LocaleContext";

/** The preview stays in document flow: its grid track animates to the content's real
 * height, including long titles and wrapping on small screens. No nested problem links. */
export default function ContestArchiveRow({ contest, date }: { contest: ContestListItem; date: Date | null }) {
  const zh = useLocale().locale === "zh-TW";
  const [expanded, setExpanded] = useState(false);
  const previewId = useId();
  const problems = contest.problemPreview;
  const mmdd = date ? `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}` : "—";
  return <article aria-label={contest.title}
    onPointerEnter={(e) => { if (e.pointerType !== "touch") setExpanded(true); }}
    onPointerLeave={(e) => { if (e.pointerType !== "touch") setExpanded(false); }}
    onFocusCapture={(e) => { if (e.target.matches(":focus-visible")) setExpanded(true); }}
    onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false); }}
    onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setExpanded(false); } }}
    className={`rounded-xl border transition-colors ${expanded ? "border-brand/40 bg-brand/[0.03]" : "border-ink-700 bg-ink-900/30"}`}>
    <div className="flex items-center gap-2 px-3 py-1">
      <Link href={`/contests/${contest.id}`} aria-label={contest.title}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-ink-200 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
        <span className="shrink-0 rounded-md bg-ink-800 px-2.5 py-1.5 font-mono text-sm tabular-nums">{mmdd}</span>
        <span className="min-w-0 break-words text-sm font-medium">{contest.title}</span>
      </Link>
      <span className="shrink-0 text-xs text-ink-400">{problems ? (zh ? `${problems.length} 題` : `${problems.length} problems`) : `${contest.durationMin} min`}</span>
      <button type="button" aria-label={zh ? `預覽 ${contest.title} 題目` : `Preview ${contest.title} problems`} aria-expanded={expanded} aria-controls={previewId}
        onClick={() => setExpanded((value) => !value)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-800 hover:text-brand">
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
    <div id={previewId} aria-hidden={!expanded} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="border-t border-ink-700/60 px-4 pb-4 pt-3">
          <p className="mb-2 text-[11px] text-ink-400">{zh ? "本場題目 · 僅供預覽" : "Exam problems · Preview only"}</p>
          {problems?.length ? <ol aria-label={zh ? `${contest.title} 題目清單` : `${contest.title} problem list`} className="flex flex-wrap gap-2">
            {problems.map((problem, index) => <li key={`${problem.label}-${index}`} className="flex min-w-0 max-w-full items-start gap-2 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-xs text-ink-200">
              <span className="font-mono font-semibold text-brand">{problem.label}</span>
              <span className="min-w-0 break-words">{stripProblemNumber(problem.title, problem.uvaId)}{problem.uvaId != null && <span className="ml-2 font-mono text-ink-400">#{problem.uvaId}</span>}</span>
            </li>)}
          </ol> : <p className="text-xs text-ink-400">{zh ? "目前沒有可顯示的題目預覽。" : "No problem preview is available."}</p>}
        </div>
      </div>
    </div>
  </article>;
}
