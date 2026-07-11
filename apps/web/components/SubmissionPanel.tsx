"use client";

import { useEffect, useRef, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import VerdictBadge from "@/components/VerdictBadge";
import { apiFetch, ApiError, openSubmissionStream } from "@/lib/api";
import type { SubmissionDetail } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";

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
}: {
  problemId: string;
  slug: string;
  contestId?: string;
  locked?: boolean;
}) {
  const storageKey = `oj:draft:${slug}`;
  const [languageKey, setLanguageKey] = useState("cpp17");
  const [sourceCode, setSourceCode] = useState(STUB.cpp17);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [flash, setFlash] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
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
    localStorage.setItem(storageKey, JSON.stringify({ languageKey, sourceCode }));
  }, [storageKey, languageKey, sourceCode]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => () => esRef.current?.close(), []);

  const cooldownRemaining = Math.max(0, cooldownUntil - now);
  const canSubmit = !locked && !submitting && cooldownRemaining <= 0 && sourceCode.trim().length > 0;

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
        if (e.status === 429) setError("You're submitting too fast — wait a few seconds and try again.");
        else if (e.status === 403) setError("This contest window is closed or you haven't started it yet.");
        else setError(e.message);
      } else {
        setError("Something went wrong submitting your code.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <select
          value={languageKey}
          onChange={(e) => {
            const next = e.target.value;
            setLanguageKey(next);
            const raw = localStorage.getItem(storageKey);
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
          {locked
            ? "Locked"
            : submitting
              ? "Submitting…"
              : cooldownRemaining > 0
                ? `Wait ${Math.ceil(cooldownRemaining / 1000)}s`
                : "Submit"}
        </button>
      </div>

      <CodeEditor languageKey={languageKey} value={sourceCode} onChange={setSourceCode} />

      {error && (
        <p className="rounded border border-verdict-wa/40 bg-verdict-wa/10 px-3 py-2 text-sm text-verdict-wa">
          {error}
        </p>
      )}

      {detail && (
        <div className="oj-card p-4">
          <div className="mb-3 flex items-center justify-between">
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
          <p className="text-xs text-ink-500">Judged by the real UVa Online Judge — this is their verdict.</p>
        </div>
      )}
    </div>
  );
}
