import { loader } from "@monaco-editor/react";

// Points @monaco-editor/react at this app's own self-hosted copy (public/vs, copied from
// node_modules/monaco-editor by scripts/copy-monaco.js) instead of its default
// cdn.jsdelivr.net/npm/monaco-editor@.../min/vs. Imported once from CodeEditor.tsx, before the
// <Editor> component ever renders — loader.config() only has an effect if called before the
// loader's first use.
loader.config({ paths: { vs: "/vs" } });
