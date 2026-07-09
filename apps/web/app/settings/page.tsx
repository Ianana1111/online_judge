"use client";

import { useEffect, useState } from "react";

const LANGUAGES = ["cpp17", "c11", "python3", "java17"];

export default function SettingsPage() {
  const [defaultLanguage, setDefaultLanguage] = useState("cpp17");
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDefaultLanguage(localStorage.getItem("oj:settings:language") ?? "cpp17");
    setEditorTheme(localStorage.getItem("oj:settings:theme") ?? "vs-dark");
  }, []);

  function save() {
    localStorage.setItem("oj:settings:language", defaultLanguage);
    localStorage.setItem("oj:settings:theme", editorTheme);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-300">Default language</label>
          <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className="oj-input">
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-300">Editor theme</label>
          <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)} className="oj-input">
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <button onClick={save} className="oj-btn-primary">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
