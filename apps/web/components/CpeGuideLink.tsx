"use client";

import { BookOpenIcon } from "@/components/icons";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function CpeGuideLink({ placement }: { placement: "collection" | "contests" | "dashboard" }) {
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const dashboard = placement === "dashboard";
  const description = dashboard
    ? zh ? "探索 CPE 備考資源" : "Explore CPE study resources"
    : placement === "collection"
      ? zh ? "搭配課程，練好必考 49 題" : "Lessons for the essential 49"
      : zh ? "考前複習，看看教學課程" : "Review lessons before your exam";

  return (
    <a
      href={dashboard ? "https://cpe.guide/" : "https://cpe.guide/courses"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-ink-700 bg-brand/[0.03] p-3 transition-colors hover:border-brand/50 hover:bg-brand/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:w-72 sm:shrink-0"
    >
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"><BookOpenIcon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-sm font-semibold text-ink-100">CPE Guide</span>
          <span className="text-[10px] text-ink-400">{zh ? "合作夥伴" : "Partner"}</span>
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-ink-300">{description}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-base text-ink-400 transition-colors group-hover:text-brand">↗</span>
      <span className="sr-only">{zh ? "（另開分頁）" : " (opens in a new tab)"}</span>
    </a>
  );
}
