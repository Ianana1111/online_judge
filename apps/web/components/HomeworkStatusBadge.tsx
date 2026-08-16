"use client";

import type { HomeworkStatus } from "@/lib/types";
import VerdictBadge from "./VerdictBadge";
import { useT } from "@/lib/i18n/LocaleContext";

export default function HomeworkStatusBadge({ status, size = "sm" }: { status: HomeworkStatus; size?: "sm" | "md" }) {
  const t = useT();
  if (status === "NOT_STARTED") {
    return (
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded border border-ink-700 bg-ink-800/50 font-mono font-semibold uppercase tracking-wide text-ink-400",
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        ].join(" ")}
      >
        {t("Not started")}
      </span>
    );
  }
  return <VerdictBadge verdict={status} size={size} />;
}
