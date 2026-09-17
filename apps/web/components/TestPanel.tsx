"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sampleRevision } from "@oj/shared";
import { apiFetch, ApiError, openRunStream } from "@/lib/api";
import type { RunCaseResult, RunResult, Sample } from "@/lib/types";
import { useLocale, useT } from "@/lib/i18n/LocaleContext";
import { useIsDesktop } from "@/lib/useIsDesktop";

const MAX_CASES = 8; // mirrors the API's createRunSchema cap
const MAX_INPUT_CHARS = 4096;

interface Case {
  id: string;
  label: string;
  input: string;
  isSample: boolean;
  expectedOutput?: string;
  sampleOrd?: number;
}

/**
 * LeetCode-style "Run" panel: compiles the code once against a set of cases (this problem's
 * Samples, plus whatever the user adds) and compares official samples using the server checker. Custom inputs show output only;
 * no submission is created. Custom cases persist in localStorage per account+problem, same pattern
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
  formId: string;
  onRunStateChange: (state: { running: boolean; disabled: boolean }) => void;
  locked?: boolean;
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
  formId,
  onRunStateChange,
  locked = false,
}: TestPanelProps) {
  const t = useT();
  const { locale } = useLocale();
  const zh = locale === "zh-TW";
  const isDesktop = useIsDesktop();
  const storageKey = `oj:testcases:${userId}:${slug}`;
  const sampleCases: Case[] = useMemo(
    () =>
      samples.map((s) => ({
        id: `sample-${s.ord}`,
        label: `Sample ${s.ord}`,
        input: s.input,
        isSample: true,
        expectedOutput: s.output,
        sampleOrd: s.ord,
      })),
    [samples],
  );

  const [customCases, setCustomCases] = useState<Case[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const mounted = useRef(false);
  const [edits, setEdits] = useState<Record<string, string>>({}); // caseId -> edited input (samples are editable too, but never mutate the original sample)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [executedFingerprint, setExecutedFingerprint] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunCaseResult>>({});
  const [status, setStatus] = useState<"idle" | "running" | "done" | "compile_error" | "error">("idle");
  const [compileError, setCompileError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const runSequence = useRef(0);
  const esRef = useRef<{ close: () => void } | null>(null);
  const runningRef = useRef(false);
  const [pane, setPane] = useState<"cases" | "result">("cases");
  const [resultOpen, setResultOpen] = useState(false);
  const resultTabRef = useRef<HTMLButtonElement>(null);
  const caseTabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLFormElement>(null);

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

  const fingerprint = JSON.stringify([languageKey, sourceCode, cases.map((c) => [c.id, edits[c.id] ?? c.input, c.expectedOutput])]);
  const stale = executedFingerprint !== null && executedFingerprint !== fingerprint;

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
    if (!canRun || runningRef.current) return;
    runningRef.current = true;
    const sequence = ++runSequence.current;
    setExecutedFingerprint(fingerprint);
    setStatus("running");
    setCompileError(null);
    setRunError(null);
    setResults({});
    setResultOpen(true);
    setPane("result");
    esRef.current?.close();

    try {
      const { id } = await apiFetch<{ id: string }>("/runs", {
        method: "POST",
        body: {
          problemId,
          languageKey,
          sourceCode,
          cases: await Promise.all(cases.map(async (c) => {
            const input = edits[c.id] ?? c.input;
            const unchangedSample = c.isSample && input === c.input;
            return { id: c.id, ...(input.length <= MAX_INPUT_CHARS ? { input } : {}), ...(unchangedSample ? { sampleOrd: c.sampleOrd, sampleRevision: await sampleRevision(c.input, c.expectedOutput ?? "") } : {}) };
          })),
        },
      });

      if (!mounted.current || runSequence.current !== sequence) return;
      const es = openRunStream(id);
      esRef.current = es;
      es.addEventListener("status", (evt) => {
        if (!mounted.current || runSequence.current !== sequence) return;
        const payload = JSON.parse((evt as MessageEvent).data) as RunResult;
        if (payload.status === "RUNNING") return;
        runningRef.current = false;
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
        if (!mounted.current || runSequence.current !== sequence) return;
        runningRef.current = false;
        setRunError((prev) => prev ?? t("Lost connection while running."));
        setStatus((prev) => (prev === "running" ? "error" : prev));
      };
    } catch (e) {
      if (!mounted.current || runSequence.current !== sequence) return;
      runningRef.current = false;
      if (e instanceof ApiError) {
        setRunError(e.status === 429 ? t("You're running tests too fast — wait a moment and try again.") : e.message);
      } else {
        setRunError(t("Something went wrong running your code."));
      }
      setStatus("error");
    }
  }

  const activeModified = active?.isSample && activeInput !== active.input;
  const activeResult = active && !stale ? results[active.id] : undefined;
  const activeMatch = activeResult?.verdict === "AC" ? true : activeResult?.verdict === "WA" ? false : null;
  const invalidInput = cases.some((c) => (edits[c.id] ?? c.input).length > MAX_INPUT_CHARS && (!c.isSample || edits[c.id] !== undefined && edits[c.id] !== c.input));
  const canRun = loaded && !locked && status !== "running" && cases.length > 0 && cases.length <= MAX_CASES && sourceCode.trim().length > 0 && !invalidInput;
  useEffect(() => { onRunStateChange({ running: status === "running", disabled: !canRun }); }, [status, canRun, onRunStateChange]);
  useEffect(() => {
    if (pane !== "result" || !resultOpen) return;
    resultTabRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView({ block: isDesktop ? "nearest" : "start", inline: "nearest" });
  }, [pane, resultOpen, executedFingerprint, isDesktop]);

  function closeResult() {
    setResultOpen(false); setPane("cases");
    caseTabRef.current?.focus({ preventScroll: true });
  }

  return (
    <form ref={panelRef} id={formId} onSubmit={(e) => { e.preventDefault(); void handleRun(); }} className="oj-card scroll-mt-24 p-3">
      <div className="mb-3 flex items-center gap-1 border-b border-ink-700">
        <div role="tablist" aria-label={zh ? "程式測試" : "Code tests"} className="flex min-w-0 items-center gap-3"
          onKeyDown={(e) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
            e.preventDefault();
            const next = !resultOpen || e.key === "Home" ? "cases" : e.key === "End" ? "result" : pane === "cases" ? "result" : "cases";
            setPane(next); (next === "cases" ? caseTabRef : resultTabRef).current?.focus();
          }}>
          <button ref={caseTabRef} type="button" role="tab" id={`${formId}-cases-tab`} aria-controls={`${formId}-cases`} aria-selected={pane === "cases"} tabIndex={pane === "cases" ? 0 : -1}
            onClick={() => setPane("cases")} className={`min-h-10 border-b-2 px-1 text-sm font-medium ${pane === "cases" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}>
            {zh ? "測試資料" : "Test cases"}
          </button>
          {resultOpen && <button ref={resultTabRef} type="button" role="tab" id={`${formId}-result-tab`} aria-controls={`${formId}-result`} aria-selected={pane === "result"} tabIndex={pane === "result" ? 0 : -1}
            onClick={() => setPane("result")} className={`min-h-10 border-b-2 px-1 text-sm font-medium ${pane === "result" ? "border-brand text-brand" : "border-transparent text-ink-400"}`}>
            {zh ? "執行結果" : "Run result"}{status === "running" && <span aria-hidden className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />}
          </button>}
        </div>
        {resultOpen && <button type="button" onClick={closeResult} aria-label={zh ? "關閉執行結果" : "Close run result"} className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-ink-400 hover:bg-ink-800 hover:text-ink-100">×</button>}
      </div>
      <div role="tabpanel" id={`${formId}-${pane}`} aria-labelledby={`${formId}-${pane}-tab`}>
      {pane === "result" && <p role="status" className="mb-3 text-sm font-medium text-ink-200">{status === "running" ? t("Running…") : status === "done" ? (zh ? "執行完成" : "Run complete") : status === "compile_error" ? "Compile Error" : (zh ? "執行未完成" : "Run failed")}</p>}
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
                  {!stale && results[c.id]?.verdict && (
                    results[c.id].verdict === "AC"
                      ? <span className="text-verdict-ac" aria-label={t("Matches expected")}>✓</span>
                      : <span className="text-verdict-wa" aria-label={results[c.id].verdict}>✗</span>
                  )}
                </span>
              </button>
              {!c.isSample && pane === "cases" && (
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
          {cases.length < MAX_CASES && pane === "cases" && (
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
      </div>

      {stale && <p role="status" className="mb-3 text-xs text-ink-300">{zh ? "程式碼、語言或輸入已變更，請重新執行以取得最新結果。" : "Code, language or input changed. Run again for current results."}</p>}
      {invalidInput && <p role="alert" className="mb-3 text-xs text-verdict-wa">{zh ? "自訂輸入最多 4,096 個字元。" : "Custom input is limited to 4,096 characters."}</p>}
      {storageError && <p role="alert" className="mb-3 text-xs text-verdict-wa">{t("Your browser could not save these test cases. Copy them before leaving.")}</p>}

      {active ? (
        <div className="space-y-2.5">
          {pane === "cases" && <div>
            <p className="mb-1 text-xs font-medium text-ink-400">{t("Input")}</p>
            <textarea
              aria-label={t("Input")}
              value={activeInput}
              onChange={(e) => setInputFor(active.id, e.target.value)}
              maxLength={MAX_INPUT_CHARS}
              spellCheck={false}
              className="oj-input h-20 resize-y font-mono text-xs"
            />
          </div>}

          {pane === "cases" && activeModified && <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><p className="text-ink-300">{zh ? "已修改輸入：只顯示執行結果，不與原範例答案比較。" : "Edited input: output only, without comparison to the original sample."}</p><button type="button" className="text-brand underline underline-offset-4" onClick={() => setInputFor(active.id, active.input)}>{zh ? "還原範例" : "Restore sample"}</button></div>}
          {pane === "cases" && active.isSample && !activeModified && (
            <div>
              <p className="mb-1 text-xs font-medium text-ink-400">{t("Expected output")}</p>
              <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs">{active.expectedOutput}</pre>
            </div>
          )}

          {pane === "result" && activeResult && (
            <div>
              <p className="mb-2 text-xs text-ink-400">{activeResult.verdict === "AC" || activeResult.verdict === "WA" ? (zh ? "使用正式判題規則比對此範例；完整測資請使用提交。" : "Compared with the submission checker for this sample. Submit to check the full test suite.") : !activeResult.verdict ? (zh ? "此結果僅供檢視輸出，未進行答案比對。" : "Output only; no expected answer was checked.") : null}</p>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-ink-400">{t("Output")}</p>
                {activeMatch === true && <span className="text-xs font-medium text-verdict-ac">{t("Matches expected")}</span>}
                {activeMatch === false && <span className="text-xs font-medium text-verdict-wa">{t("Doesn't match")}</span>}
                {activeResult.verdict && !["AC", "WA"].includes(activeResult.verdict) && <span className="text-xs font-medium text-verdict-re">{activeResult.verdict}{activeResult.verdict === "TLE" ? ` · ${t("Timed out")}` : ""}</span>}
                <span className="ml-auto font-mono text-[11px] text-ink-500">{activeResult.timeMs} ms</span>
              </div>
              <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs">{activeResult.stdout || t("(no output)")}</pre>
              {activeResult.outputTruncated && <p className="text-xs text-ink-400">{zh ? "輸出過長，僅顯示前 100,000 個字元；答案比對使用完整輸出。" : "Showing the first 100,000 characters. Comparison used the full output."}</p>}
              {activeResult.stderr && (
                <pre tabIndex={0} className="mt-1.5 overflow-x-auto rounded bg-ink-800 p-2 font-mono text-xs text-verdict-re">
                  {activeResult.stderr}
                </pre>
              )}
              {active.isSample && !activeModified && <details className="mt-3 text-xs text-ink-400"><summary className="cursor-pointer">{t("Expected output")}</summary><pre tabIndex={0} className="oj-card mt-2 overflow-x-auto p-2 font-mono">{active.expectedOutput}</pre></details>}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-500">{t("No test cases yet — add one to try your code.")}</p>
      )}

      {pane === "result" && !stale && compileError && (
        <div className="mt-2.5">
          <p className="mb-1 text-xs font-medium text-verdict-ce">{t("Compile error")}</p>
          <pre tabIndex={0} className="oj-card overflow-x-auto p-2 font-mono text-xs text-verdict-ce">{compileError}</pre>
        </div>
      )}
      {pane === "result" && !stale && runError && <p role="alert" className="mt-2.5 text-xs text-verdict-wa">{runError}</p>}
    </div>
    </form>
  );
}
