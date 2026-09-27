"use client";

import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function Loading() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const practice = !searchParams.get("contestId");
  const hasList = ["problems", "collection"].includes(searchParams.get("listSource") ?? "");
  return (
    <div className={`problem-workspace ${practice ? "practice-workspace" : ""} lg:h-full lg:overflow-hidden`}
      role="status" aria-label={locale === "zh-TW" ? "正在載入題目" : "Loading problem"}>
      <div aria-hidden="true" className="flex flex-col gap-6 lg:h-full lg:flex-row lg:gap-0">
        <div className="min-w-0 space-y-4 lg:h-full lg:basis-1/2 lg:overflow-hidden lg:pr-4">
          {hasList && <Skeleton className="h-10 w-full" />}
          <Skeleton className="h-9 w-2/3" />
          <div className="flex gap-4 border-b border-ink-800 py-3">
            {[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-4 w-16" />)}
          </div>
          <Skeleton className="h-3 w-1/3" />
          <div className="space-y-3">
            {["w-full", "w-full", "w-5/6", "w-full", "w-3/4"].map((width, key) => <Skeleton key={key} className={`h-4 ${width}`} />)}
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="hidden w-3 shrink-0 items-center justify-center lg:flex">
          <div className="h-full w-px bg-ink-800" />
        </div>
        <Skeleton className="h-[520px] min-w-0 lg:h-full lg:flex-1 lg:basis-1/2" />
      </div>
    </div>
  );
}
