"use client";

import Editor from "@monaco-editor/react";
import "@/lib/monacoLoader";
import { useTheme } from "@/lib/useTheme";

const MONACO_LANG: Record<string, string> = {
  cpp17: "cpp",
  c11: "c",
  python3: "python",
  java17: "java",
};

export default function CodeEditor({
  languageKey,
  value,
  onChange,
  fillHeight = false,
}: {
  languageKey: string;
  value: string;
  onChange: (v: string) => void;
  /** Fills its container's height instead of a fixed 480px — used on the standalone problem page,
   * where the container itself is the resizable top half of VerticalSplitPane. Leaves every other
   * caller (there's currently only one, but the contest-embedded ProblemView reaches it too) at
   * the fixed height, since "fill height" only means something inside an ancestor that actually
   * has one to fill. */
  fillHeight?: boolean;
}) {
  const theme = useTheme();

  return (
    <div className={`oj-card overflow-hidden ${fillHeight ? "h-full" : ""}`}>
      <Editor
        height={fillHeight ? "100%" : "480px"}
        theme={theme === "dark" ? "vs-dark" : "light"}
        language={MONACO_LANG[languageKey] ?? "plaintext"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 4,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
