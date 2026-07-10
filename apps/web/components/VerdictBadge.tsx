import type { Verdict } from "@/lib/types";
import { VERDICT_LABEL } from "@/lib/types";

const VERDICT_STYLE: Record<Verdict, string> = {
  AC: "bg-verdict-ac/15 text-verdict-ac border-verdict-ac/40",
  WA: "bg-verdict-wa/15 text-verdict-wa border-verdict-wa/40",
  TLE: "bg-verdict-tle/15 text-verdict-tle border-verdict-tle/40",
  MLE: "bg-verdict-mle/15 text-verdict-mle border-verdict-mle/40",
  RE: "bg-verdict-re/15 text-verdict-re border-verdict-re/40",
  RF: "bg-verdict-rf/15 text-verdict-rf border-verdict-rf/40",
  CE: "bg-verdict-ce/15 text-verdict-ce border-verdict-ce/40",
  PE: "bg-verdict-pe/15 text-verdict-pe border-verdict-pe/40",
  OLE: "bg-verdict-ole/15 text-verdict-ole border-verdict-ole/40",
  SE: "bg-verdict-se/15 text-verdict-se border-verdict-se/40",
  PENDING: "bg-verdict-pending/15 text-verdict-pending border-verdict-pending/40",
  JUDGING: "bg-verdict-pending/15 text-verdict-pending border-verdict-pending/40",
};

export default function VerdictBadge({
  verdict,
  flash = false,
  size = "md",
}: {
  verdict: Verdict;
  flash?: boolean;
  size?: "sm" | "md";
}) {
  const pulsing = verdict === "PENDING" || verdict === "JUDGING";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded border font-mono font-semibold uppercase tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        VERDICT_STYLE[verdict],
        flash ? "animate-verdict-flash" : "",
        pulsing ? "animate-pulse-soft" : "",
      ].join(" ")}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
