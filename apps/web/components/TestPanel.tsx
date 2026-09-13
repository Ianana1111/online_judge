"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, ApiError, openRunStream } from "@/lib/api";
import type { RunCaseResult, RunResult, Sample } from "@/lib/types";
import { useT } from "@/lib/i18n/LocaleContext";

const MAX_CASES = 8; // mirrors the API's createRunSchema cap
const MAX_INPUT_CHARS = 4096;

interface Case {
  id: string;
  label: string;
  input: string;
  isSample: boolean;
  expectedOutput?: string;
}

function normalize(s: string): string {
  // Same spirit as the judge's IGNORE_TRAILING_WS checker — a quick visual hint, not a real
  // verdict (float/special checkers only run for real submissions).
  return s
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .trim();
}

/**
 * LeetCode-style "Run" panel: compiles the code once against a set of cases (this problem's
 * Samples, plus whatever the user adds) and shows raw output per case — no verdict, nothing
 * submitted or persisted. Custom cases persist in localStorage per account+problem, same pattern
 * as SubmissionPanel's own draft storage.
 */
type TestPanelProps = {
  problemId: string;
  slug: string;
  userId: string;
  languageKey: string;
  sourceCode: string;
  samples: Sample[];
  checkerType?: "EXACT" | "IGNORE_TRAILING_WS" | "FLOAT" | "SPECIAL";
};

export default function TestPanel(props: TestPanelProps) {
  return <TestPanelSession key={`${props.userId}:${props.slug}:${props.samples.length}`} {...props} />;
}

function TestPanelSession({
  problemId,
  slug,
  userId,
  languageKey,
  sourceCode,
  samples,
  checkerType = "IGNORE_TRAILING_WS",
}: TestPanelProps) {
  const t = useT();
  const storageKey = `oj:testcases:${userId}:${slug}`;
  const sampleCases: Case[] = useMemo(
    () =>
      samples.map((s) => ({
        id: `sample-${s.ord}`,
        label: `Sample ${s.ord}`,
        input: s.input,
        isSample: true,
        expectedOutput: s.output,
      })),
    [samples],
  );

  const [customCases, setCustomCases] = useState<Case[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const mounted = useRef(false);
  const [edits, setEdits] = useState<Record<string, string>>({}); // caseId -> edited input (samples are editable too, but never mutate the original sample)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunCaseResult>>({});
  const [status, setStatus] = useState<"idle" | "running" | "done" | "compile_error" | "error">("idle");
  const [compileError, setCompileError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const esRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      const seen = new Set<string>();
      const valid = Array.isArray(parsed) ? parsed.filter((c): c is { id: string; input: string } => {
        if (!c || typeof c.id !== "string" || !/^custom-[a-zA-Z0-9-]{1,100}$/.test(c.id) || typeof c.input !== "string" || c.input.length > MAX_INPUT_CHARS || seen.has(c.id)) return false;
        seen.add(c.id); return true;
      }).slice(0, Math.max(0, MAX_CASES - samples.length)) : [];
      setCustomCases(valid.map((c) => ({ ...c, label: "", isSample: false })));
    } catch {
      setStorageError(true);
    }
    setLoaded(true);
  }, [storageKey, samples.length]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(customCases.map((c) => ({ id: c.id, input: c.input }))));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [storageKey, customCases, loaded]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; esRef.current?.close(); }; }, []);

  const cases = useMemo(() => [...sampleCases, ...customCases], [sampleCases, customCases]);
  // "Case N" is always this case's 1-based position among *custom* cases, recomputed on every
  // change so removing one from the middle renumbers the rest instead of leaving a gap.
  const customLabelById = useMemo(() => {
    const map = new Map<string, string>();
    customCases.forEach((c, i) => map.set(c.id, `Case ${i + 1}`));
    return map;
  }, [customCases]);

  useEffect(() => {
    if (!activeId && cases.length > 0) setActiveId(cases[0].id);
    else if (activeId && !cases.some((c) => c.id === activeId)) setActiveId(cases[0]?.id ?? null);
  }, [cases, activeId]);

  const active = cases.find((c) => c.id === activeId) ?? null;
  const activeInput = active ? (edits[active.id] ?? active.input) : "";

  function setInputFor(id: string, value: string) {
    const sample = sampleCases.find((c) => c.id === id);
    if (sample) {
      setEdits((prev) => ({ ...prev, [id]: value }));
    } else {
      setCustomCases((prev) => prev.map((c) => (c.id === id ? { ...c, input: value } : c)));
    }
  }

  function addCase() {
    if (cases.length >= MAX_CASES) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCustomCases((prev) => [...prev, { id, label: "", input: "", isSample: false }]);
    setActiveId(id);
  }

  function removeCase(id: string) {
    setCustomCases((prev) => prev.filter((c) => c.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleRun() {
    if (cases.length === 0 || status === "running") return;
    setStatus("running");
    setCompileError(null);
    setRunError(null);
    setResults({});
    esRef.current?.close();

    try {
      const { id } = await apiFetch<{ id: string }>("/runs", {
        method: "POST",
        body: {
          problemId,
          languageKey,
          sourceCode,
          cases: cases.map((c) => ({ id: c.id, input: edits[c.id] ?? c.input })),
        },
      });

      if (!mounted.current) return;
      const es = openRunStream(id);
      esRef.current = es;
      es.addEventListener("status", (evt) => {
        if (!mounted.current) return;
        const payload = JSON.parse((evt as MessageEvent).data) as RunResult;
        if (payload.status === "RUNNING") return;
        if (payload.status === "DONE") {
          const byId: Record<string, RunCaseResult> = {};
          for (const r of payload.cases ?? []) byId[r.id] = r;
          setResults(byId);
          setStatus("done");
        } else if (payload.status === "COMPILE_ERROR") {
          setCompileError(payload.compileError ?? t("Compile error"));
          setStatus("compile_error");
        } else {
          setRunError(payload.compileError ?? t("Something went wrong running your code."));
          setStatus("error");
        }
        es.close();
      });
      es.onerror = () => {
        es.close();
        if (!mounted.current) return;
        setRunError((prev) => prev ?? t("Lost connection while running."));
        setStatus((prev) => (prev === "running" ? "error" : prev));
      };
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof ApiError) {
        setRunError(e.status === 429 ? t("You're running tests too fast — wait a moment and try again.") : e.message);
      } else {
        setRunError(t("Something went wrong running your code."));
      }
      setStatus("error");
    }
  }

  const textComparison = checkerType === "EXACT" || checkerType === "IGNORE_TRAILING_WS";
  const outputMatches = (actual: string, expected: string) => checkerType === "EXACT" ? actual === expected : normalize(actual) === normalize(expected);
  const activeResult = active ? results[active.id] : undefined;
  const activeMatch =
    textComparison && active?.isSample && activeResult && !activeResult.timedOut && activeResult.exitCode === 0
      ? outputMatches(activeResult.stdout, active.expectedOutput ?? "")
      : null;

  return (
    <div className="oj-card p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {cases.map((c) => (
            <div
              key={c.id}
              className={`inline-flex items-center rounded border text-xs transition-colors ${
                c.id === activeId
                  ? "border-brand text-brand"
                  : "border-ink-700 text-ink-300 hover:border-ink-500 hover:text-ink-100"
              }`}
            >
              <button type="button" onClick={() => setActiveId(c.id)} className="px-2.5 py-1">
                <span className="inline-flex items-center gap-1">
                  {c.isSample ? c.label : customLabelById.get(c.id)}
                  {results[c.id] &&
                    (c.isSample && textComparison
                      ? outputMatches(results[c.id].stdout, c.expectedOutput ?? "") && !results[c.id].timedOut && results[c.id].exitCode === 0
                        ? <span className="text-verdict-ac">✓</span>
                        : <span className="text-verdict-wa">✗</span>
                      : null)}
                </span>
              </button>
              {!c.isSample && (
                <button
                  type="button"
                  onClick={() => removeCase(c.id)}
                  className="pr-2 text-ink-500 hover:text-verdict-wa"
                  aria-label={t("Remove test case")}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {cases.length < MAX_CASES && (
            <button
              type="button"
              onClick={addCase}
              disabled={!loaded}
              title={t("Add your own test case")}
              className="rounded border border-dashed border-ink-700 px-2 py-1 text-xs text-ink-400 transition-colors hover:border-brand hover:text-brand"
            >
              {t("+ Add case")}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={status === "running" || cases.length === 0 || sourceCode.trim().length === 0}
          className="oj-btn-secondary shrink-0 px-3 py-1.5 text-xs"
        >
          {status === "running" ? t("Running…") : t("▶ Run")}
        </button>
      </div>

      {storageError && <p role="alert" className="mb-3 text-xs text-verdict-wa">{t("Your browser could not save these test cases. Copy them before leaving.")}</p>}

      {active ? (
        <div className="space-y-2.5">
          <div>
            <p className="mb-1 text-xs font-medium text-ink-400">{t("Input")}</p>
            <textarea
              aria-label={t("Input")}
              value={activeInput}
              onChange={(e) => setInputFor(active.id, e.target.value)}
              maxLength={MAX_INPUT_CHARS}
              spellCheck={false}
              className="oj-input h-20 resize-y font-mono text-xs"
            />
          </div>

          {active.isSample && (
            <div>
              <p className="mb-1 text-xs font-medium text-ink-400">{t("Expected output")}</p>
              <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs">{active.expectedOutput}</pre>
            </div>
          )}

          {activeResult && (
            <div>
              {!textComparison && <p className="mb-2 text-xs text-ink-400">{t("This problem uses a special comparison. Submit to check the result.")}</p>}
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-ink-400">{t("Output")}</p>
                {activeMatch === true && <span className="text-xs font-medium text-verdict-ac">{t("Matches expected")}</span>}
                {activeMatch === false && <span className="text-xs font-medium text-verdict-wa">{t("Doesn't match")}</span>}
                {activeResult.timedOut && <span className="text-xs font-medium text-verdict-tle">{t("Timed out")}</span>}
                <span className="ml-auto font-mono text-[11px] text-ink-500">{activeResult.timeMs} ms</span>
              </div>
              <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs">{activeResult.stdout || t("(no output)")}</pre>
              {activeResult.stderr && (
                <pre tabIndex={0} className="mt-1.5 overflow-x-auto rounded bg-ink-800 p-2 font-mono text-xs text-verdict-re">
                  {activeResult.stderr}
                </pre>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-500">{t("No test cases yet — add one to try your code.")}</p>
      )}

      {compileError && (
        <div className="mt-2.5">
          <p className="mb-1 text-xs font-medium text-verdict-ce">{t("Compile error")}</p>
          <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs text-verdict-ce">{compileError}</pre>
        </div>
      )}
      {runError && <p className="mt-2.5 text-xs text-verdict-wa">{runError}</p>}
    </div>
  );
}
