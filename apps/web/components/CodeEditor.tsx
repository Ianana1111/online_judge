"use client";

import Editor from "@monaco-editor/react";

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
}: {
  languageKey: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="oj-card overflow-hidden">
      <Editor
        height="480px"
        theme="vs-dark"
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
