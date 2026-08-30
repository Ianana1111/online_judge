"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TestPanel from "@/components/TestPanel";
import VerticalSplitPane from "@/components/VerticalSplitPane";
import { apiFetch, ApiError, openSubmissionStream } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { BillingStatus, Sample, SubmissionDetail, SubmissionResultTab } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

// Monaco is a large editor bundle unrelated to the rest of the problem page (statement, tabs,
// discussion) — deferring it out of the initial page JS keeps that content interactive sooner.
// ssr:false because Monaco reaches for `window`/`navigator` at import time.
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <div className="oj-card h-[480px] animate-pulse bg-ink-900" />,
});

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];
const COOLDOWN_MS = 10_000;

const STUB: Record<string, string> = {
  // Standard <iostream>, not GCC's non-standard <bits/stdc++.h>: UVa's compiler rejects the latter
  // with a Compile Error, so the default template must work on the judge we actually submit to.
  cpp17: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  c11: '#include <stdio.h>\n\nint main(void) {\n    \n    return 0;\n}\n',
  python3: "import sys\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n",
  java17: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n',
};

export default function SubmissionPanel({
  problemId,
  slug,
  contestId,
  locked = false,
  judgeable = true,
  samples = [],
  fullHeight = false,
  attemptNumber,
  onResult,
}: {
  problemId: string;
  slug: string;
  contestId?: string;
  /** See ProblemView's own comment — namespaces the draft key below per contest attempt. */
  attemptNumber?: number;
  locked?: boolean;
  /** False for reference-only problems with no matching UVa id (some archived GPE problems) —
   * submitting would just burn the user's quota/cooldown for a guaranteed system-error verdict,
   * so block it client-side with an explanation instead of letting them find out the hard way. */
  judgeable?: boolean;
  /** This problem's sample input/output pairs — seeds the Run panel's default test cases. */
  samples?: Sample[];
  /** Standalone problem page only (see ProblemView/SplitPane) — splits the editor and TestPanel
   * into their own independently-resizable, independently-scrolling halves instead of the normal
   * one-after-another stack a contest-embedded ProblemView still uses. */
  fullHeight?: boolean;
  /** Called once a submission reaches a terminal verdict — ProblemView shows this as a dynamic
   * last tab (see its own TAB_ORDER) instead of this panel rendering the result inline. Not called
   * for PENDING/JUDGING; the submit button's own "Pending…" state covers that in-between window. */
  onResult?: (result: SubmissionResultTab) => void;
}) {
  const t = useT();
  const { user, status: authStatus } = useAuthStore();
  // Scoped per-account (not just per-problem): an unscoped key meant any browser session — logged
  // out, or logged into a different account — would read back whatever the last signed-in user on
  // this device had typed, which is both a privacy leak on shared/public machines and confusing on
  // your own. null while logged out so no draft is ever read or written for an anonymous session.
  //
  // Inside a contest, additionally namespaced by contestId+attemptNumber so a fresh attempt (or a
  // different contest reusing the same problem) never inherits code from elsewhere — including
  // standalone practice on this same problem outside any contest — which would otherwise let
  // someone just resubmit an already-known-correct answer instead of actually re-solving it.
  const storageKey = user
    ? contestId && attemptNumber != null
      ? `oj:draft:${user.id}:${slug}:contest:${contestId}:${attemptNumber}`
      : `oj:draft:${user.id}:${slug}`
    : null;
  const [languageKey, setLanguageKey] = useState("cpp17");
  const [sourceCode, setSourceCode] = useState(STUB.cpp17);
  const [submitting, setSubmitting] = useState(false);
  // True from the moment a submission is accepted until its verdict comes back over SSE — drives
  // the submit button's "Pending…" state. Distinct from `submitting`, which only covers the POST
  // request itself (typically well under a second); this covers the actual judging wait.
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const esRef = useRef<EventSource | null>(null);
  const qc = useQueryClient();

  // FREE-plan submit quota, shown proactively so a user finds out they're capped before they hit
  // the wall instead of only from a rejected submission. PRO/admin/student accounts have no cap
  // (see billing.service.isProActive), so this stays hidden for them (limit === null).
  const { data: billing } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: () => apiFetch<BillingStatus>("/billing/me"),
    enabled: !!user,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.languageKey) setLanguageKey(parsed.languageKey);
        if (parsed.sourceCode) setSourceCode(parsed.sourceCode);
        return;
      } catch {
        /* ignore */
      }
    }
    setSourceCode(STUB.cpp17);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ languageKey, sourceCode }));
  }, [storageKey, languageKey, sourceCode]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => () => esRef.current?.close(), []);

  const cooldownRemaining = Math.max(0, cooldownUntil - now);
  const canSubmit =
    judgeable && !locked && !submitting && !judging && cooldownRemaining <= 0 && sourceCode.trim().length > 0;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    // Snapshotted here, not read again from state later — the editor stays live while judging is
    // in flight, so by the time the SSE verdict arrives `sourceCode`/`languageKey` may already
    // reflect edits made *after* this particular submission, not what it actually judged.
    const submittedSourceCode = sourceCode;
    const submittedLanguageKey = languageKey;
    try {
      const { id } = await apiFetch<{ id: string }>("/submissions", {
        method: "POST",
        body: { problemId, contestId, languageKey, sourceCode },
      });
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setJudging(true);
      // A successful submission just consumed one unit of a FREE user's quota server-side —
      // refetch so the indicator below reflects it immediately instead of going stale until the
      // next unrelated billing fetch.
      qc.invalidateQueries({ queryKey: ["billing", "me"] });
      esRef.current?.close();
      const es = openSubmissionStream(id);
      esRef.current = es;
      es.addEventListener("status", (evt) => {
        const payload = JSON.parse((evt as MessageEvent).data) as SubmissionDetail;
        if (payload.verdict === "PENDING" || payload.verdict === "JUDGING") return;
        setJudging(false);
        onResult?.({
          verdict: payload.verdict,
          timeMs: payload.timeMs,
          memoryKb: payload.memoryKb,
          compileError: payload.compileError,
          sourceCode: submittedSourceCode,
          languageKey: submittedLanguageKey,
          createdAt: payload.createdAt,
        });
        es.close();
      });
      es.onerror = () => {
        setJudging(false);
        es.close();
      };
    } catch (e) {
      if (e instanceof ApiError) {
        // 403 covers two distinct causes here — a closed/not-yet-started contest window, and a
        // FREE-plan submit quota exceeded — and the backend already returns the right specific
        // message for whichever one actually happened, so just surface it rather than guessing
        // with a single hardcoded string (that used to always say "contest window closed," even
        // when the real reason was the submit cap).
        if (e.status === 429) setError(t("You're submitting too fast — wait a few seconds and try again."));
        else setError(e.message);
      } else {
        setError(t("Something went wrong submitting your code."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Nothing to key a draft or a submission to without an account — and showing the editor here
  // used to mean whatever the last signed-in user on this device typed leaked into an anonymous
  // session (see the storageKey comment above). Loading state first so this doesn't flash before
  // hydrate() resolves.
  if (authStatus !== "ready") {
    return <div className={`oj-card animate-pulse bg-ink-900 ${fullHeight ? "h-full" : "h-[480px]"}`} />;
  }
  if (!user) {
    return (
      <div className={`oj-card flex flex-col items-center justify-center gap-3 p-6 text-center ${fullHeight ? "h-full" : "h-[480px]"}`}>
        <p className="text-sm text-ink-300">{t("Log in to write and submit code for this problem.")}</p>
        <Link href="/login" className="oj-btn-primary px-4 py-2 text-sm">
          {t("Log in")}
        </Link>
      </div>
    );
  }

  const controls = (
    <div className="space-y-3">
      {!judgeable && (
        <p className="rounded border border-ink-700 bg-ink-800/60 px-3 py-2 text-xs text-ink-400">
          {t("This problem has no matching UVa judge, so it isn't gradeable here — reference-only. Use it for reading/practice; submitting is disabled.")}
        </p>
      )}
      <div className="flex items-center justify-between">
        <select
          aria-label={t("Language")}
          value={languageKey}
          onChange={(e) => {
            const next = e.target.value;
            setLanguageKey(next);
            const raw = storageKey ? localStorage.getItem(storageKey) : null;
            const hasDraftForLang = raw && JSON.parse(raw).languageKey === next;
            if (!hasDraftForLang) setSourceCode(STUB[next] ?? "");
          }}
          className="oj-input w-40"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {t(LANGUAGE_LABEL[l])}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit} disabled={!canSubmit} className="oj-btn-primary w-40">
          {!judgeable
            ? t("Not gradeable")
            : locked
              ? t("Locked")
              : submitting
                ? t("Submitting…")
                : judging
                  ? t("Pending…")
                  : cooldownRemaining > 0
                    ? t("Wait {n}s", { n: Math.ceil(cooldownRemaining / 1000) })
                    : t("Submit")}
        </button>
      </div>

      {billing && billing.submits.limit != null && (
        <p className="text-right text-xs text-ink-500">
          {billing.submits.used >= billing.submits.limit ? (
            <span className="text-verdict-wa">
              {t("You've used all {limit} free submissions —", { limit: billing.submits.limit })}{" "}
              <Link href="/upgrade" className="underline hover:text-brand">
                {t("upgrade to Pro")}
              </Link>{" "}
              {t("for unlimited.")}
            </span>
          ) : (
            <>
              {t("{used}/{limit} free submissions used", { used: billing.submits.used, limit: billing.submits.limit })}
              {billing.submits.limit - billing.submits.used <= 3 && (
                <>
                  {" · "}
                  <Link href="/upgrade" className="underline hover:text-brand">
                    {t("upgrade to Pro")}
                  </Link>
                </>
              )}
            </>
          )}
        </p>
      )}

      {error && (
        <p className="rounded border border-verdict-wa/40 bg-verdict-wa/10 px-3 py-2 text-sm text-verdict-wa">
          {error}
        </p>
      )}
    </div>
  );

  const bottomContent = (
    <TestPanel
      problemId={problemId}
      slug={slug}
      userId={user.id}
      languageKey={languageKey}
      sourceCode={sourceCode}
      samples={samples}
    />
  );

  if (fullHeight) {
    // CodeEditor needs a flex-1/min-h-0 ancestor with an actual pixel height to fill — a plain
    // space-y-3 stack (as in the non-fullHeight branch below) sizes to its content instead, which
    // collapsed the editor to ~0px when this was first wired up. The controls block above it stays
    // its natural content height (shrink-0); the editor takes whatever's left.
    const topContent = (
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        <div className="shrink-0">{controls}</div>
        <div className="min-h-[200px] flex-1">
          <CodeEditor languageKey={languageKey} value={sourceCode} onChange={setSourceCode} fillHeight />
        </div>
      </div>
    );
    return (
      <div className="flex h-full min-h-0 flex-col">
        <VerticalSplitPane
          top={topContent}
          bottom={<div className="h-full min-h-0 overflow-y-auto pr-1">{bottomContent}</div>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {controls}
      <CodeEditor languageKey={languageKey} value={sourceCode} onChange={setSourceCode} />
      {bottomContent}
    </div>
  );
}
