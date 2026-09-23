import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "alignas", "alignof", "and", "as", "asm", "assert", "async", "await", "auto", "bool", "break", "case", "catch", "char", "class", "const", "constexpr", "continue", "def", "delete", "do", "double", "elif", "else", "enum", "except", "explicit", "export", "extends", "false", "final", "finally", "float", "for", "friend", "from", "if", "implements", "import", "in", "inline", "instanceof", "int", "interface", "lambda", "long", "namespace", "native", "new", "noexcept", "none", "not", "nullptr", "operator", "or", "override", "package", "pass", "private", "protected", "public", "raise", "register", "return", "short", "signed", "sizeof", "static", "struct", "super", "switch", "synchronized", "template", "this", "throw", "throws", "transient", "true", "try", "typedef", "typename", "union", "unsigned", "using", "virtual", "void", "volatile", "while", "with", "yield",
]);
const TYPES = new Set([
  "ArrayList", "BigInteger", "HashMap", "HashSet", "List", "Map", "Scanner", "Set", "String", "StringBuilder", "bool", "boolean", "byte", "char", "deque", "dict", "double", "float", "int", "int16_t", "int32_t", "int64_t", "int8_t", "list", "long", "map", "pair", "priority_queue", "queue", "set", "short", "size_t", "stack", "str", "tuple", "uint16_t", "uint32_t", "uint64_t", "uint8_t", "vector", "void",
]);

const TOKEN = /(^\s*#.*$|\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?)\b|\b[A-Za-z_]\w*\b)/gm;

function tokenClass(token: string, source: string, end: number, languageKey: string) {
  if (/^\s*#/.test(token)) return languageKey === "python3" ? "text-[#6a9955]" : "text-[#c586c0]";
  if (token.startsWith("//") || token.startsWith("/*") || (token.startsWith("#") && !/^\s*#/.test(token))) return "text-[#6a9955]";
  if (token.startsWith('"') || token.startsWith("'")) return "text-[#ce9178]";
  if (/^(?:0[xX][\da-fA-F]+|\d)/.test(token)) return "text-[#b5cea8]";
  const lower = token.toLowerCase();
  if (TYPES.has(token) || TYPES.has(lower) || /^[A-Z]\w*$/.test(token)) return "text-[#4ec9b0]";
  if (KEYWORDS.has(lower)) return "text-[#c586c0]";
  if (/^\s*\(/.test(source.slice(end))) return "text-[#dcdcaa]";
  return "text-[#9cdcfe]";
}

/** Static highlighting keeps reference code readable without mounting a second Monaco editor. */
export default function SyntaxHighlightedCode({ source, label, languageKey }: { source: string; label: string; languageKey: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of source.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(source.slice(cursor, start));
    const token = match[0];
    const end = start + token.length;
    nodes.push(<span className={tokenClass(token, source, end, languageKey)} key={`${start}:${end}`}>{token}</span>);
    cursor = end;
  }
  if (cursor < source.length) nodes.push(source.slice(cursor));

  return <pre tabIndex={0} aria-label={label} className="max-h-[34rem] overscroll-contain overflow-auto rounded-lg border border-white/10 bg-[#0d1117] p-4 font-mono text-xs leading-6 text-[#d4d4d4]"><code>{nodes}</code></pre>;
}
