"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import VerdictBadge from "@/components/VerdictBadge";
import TestPanel from "@/components/TestPanel";
import { apiFetch, ApiError, openSubmissionStream } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { BillingStatus, Sample, SubmissionDetail } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";

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
}: {
  problemId: string;
  slug: string;
  contestId?: string;
  locked?: boolean;
  /** False for reference-only problems with no matching UVa id (some archived GPE problems) —
   * submitting would just burn the user's quota/cooldown for a guaranteed system-error verdict,
   * so block it client-side with an explanation instead of letting them find out the hard way. */
  judgeable?: boolean;
  /** This problem's sample input/output pairs — seeds the Run panel's default test cases. */
  samples?: Sample[];
}) {
  const { user, status: authStatus } = useAuthStore();
  // Scoped per-account (not just per-problem): an unscoped key meant any browser session — logged
  // out, or logged into a different account — would read back whatever the last signed-in user on
  // this device had typed, which is both a privacy leak on shared/public machines and confusing on
  // your own. null while logged out so no draft is ever read or written for an anonymous session.
  const storageKey = user ? `oj:draft:${user.id}:${slug}` : null;
  const [languageKey, setLanguageKey] = useState("cpp17");
  const [sourceCode, setSourceCode] = useState(STUB.cpp17);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [flash, setFlash] = useState(false);
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
  const canSubmit = judgeable && !locked && !submitting && cooldownRemaining <= 0 && sourceCode.trim().length > 0;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const { id } = await apiFetch<{ id: string }>("/submissions", {
        method: "POST",
        body: { problemId, contestId, languageKey, sourceCode },
      });
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setDetail({
        id,
        userId: "",
        problemId,
        contestId,
        languageKey,
        status: "PENDING",
        verdict: "PENDING",
        score: 0,
        createdAt: new Date().toISOString(),
      });
      // A successful submission just consumed one unit of a FREE user's quota server-side —
      // refetch so the indicator below reflects it immediately instead of going stale until the
      // next unrelated billing fetch.
      qc.invalidateQueries({ queryKey: ["billing", "me"] });
      esRef.current?.close();
      const es = openSubmissionStream(id);
      esRef.current = es;
      es.addEventListener("status", (evt) => {
        const payload = JSON.parse((evt as MessageEvent).data) as SubmissionDetail;
        setDetail(payload);
        if (payload.verdict !== "PENDING" && payload.verdict !== "JUDGING") {
          setFlash(true);
          setTimeout(() => setFlash(false), 400);
          es.close();
        }
      });
      es.onerror = () => {
        es.close();
      };
    } catch (e) {
      if (e instanceof ApiError) {
        // 403 covers two distinct causes here — a closed/not-yet-started contest window, and a
        // FREE-plan submit quota exceeded — and the backend already returns the right specific
        // message for whichever one actually happened, so just surface it rather than guessing
        // with a single hardcoded string (that used to always say "contest window closed," even
        // when the real reason was the submit cap).
        if (e.status === 429) setError("You're submitting too fast — wait a few seconds and try again.");
        else setError(e.message);
      } else {
        setError("Something went wrong submitting your code.");
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
    return <div className="oj-card h-[480px] animate-pulse bg-ink-900" />;
  }
  if (!user) {
    return (
      <div className="oj-card flex h-[480px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-ink-300">Log in to write and submit code for this problem.</p>
        <Link href="/login" className="oj-btn-primary px-4 py-2 text-sm">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!judgeable && (
        <p className="rounded border border-ink-700 bg-ink-800/60 px-3 py-2 text-xs text-ink-400">
          This problem has no matching UVa judge, so it isn&apos;t gradeable here — reference-only. Use it for
          reading/practice; submitting is disabled.
        </p>
      )}
      <div className="flex items-center justify-between">
        <select
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
              {LANGUAGE_LABEL[l]}
            </option>
          ))}
        </select>
        <button onClick={handleSubmit} disabled={!canSubmit} className="oj-btn-primary w-40">
          {!judgeable
            ? "Not gradeable"
            : locked
              ? "Locked"
              : submitting
                ? "Submitting…"
                : cooldownRemaining > 0
                  ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s`
                  : "Submit"}
        </button>
      </div>

      {billing && billing.submits.limit != null && (
        <p className="text-right text-xs text-ink-500">
          {billing.submits.used >= billing.submits.limit ? (
            <span className="text-verdict-wa">
              You've used all {billing.submits.limit} free submissions —{" "}
              <Link href="/upgrade" className="underline hover:text-brand">
                upgrade to Pro
              </Link>{" "}
              for unlimited.
            </span>
          ) : (
            <>
              {billing.submits.used}/{billing.submits.limit} free submissions used
              {billing.submits.limit - billing.submits.used <= 3 && (
                <>
                  {" · "}
                  <Link href="/upgrade" className="underline hover:text-brand">
                    upgrade to Pro
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

      {detail && (
        <div className="oj-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium text-ink-300">Verdict</span>
            <VerdictBadge verdict={detail.verdict} flash={flash} />
          </div>
          {(detail.timeMs !== undefined || detail.memoryKb !== undefined) && (
            <p className="mb-2 font-mono text-xs text-ink-400">
              {detail.timeMs != null && `${detail.timeMs} ms`}
              {detail.timeMs != null && detail.memoryKb != null && " · "}
              {detail.memoryKb != null && `${Math.round(detail.memoryKb / 1024)} MB`}
            </p>
          )}
          {detail.compileError && (
            <pre className="mb-2 overflow-x-auto rounded bg-ink-800 p-3 text-xs text-verdict-ce">
              {detail.compileError}
            </pre>
          )}
        </div>
      )}

      <CodeEditor languageKey={languageKey} value={sourceCode} onChange={setSourceCode} />

      <TestPanel
        problemId={problemId}
        slug={slug}
        userId={user.id}
        languageKey={languageKey}
        sourceCode={sourceCode}
        samples={samples}
      />
    </div>
  );
}
