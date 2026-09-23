import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { statementSanitizeSchema } from "@/lib/sanitizeSchema";
import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

export function isNumericMatrix(value: string) {
  const rows = parseNumericMatrix(value);
  if (rows.length < 2 || rows.length > 50) return false;
  return rows[0].length > 1 && rows.every((row) => row.length === rows[0].length && row.every((cell) => /^[-+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(cell)));
}

function parseNumericMatrix(value: string) {
  return value.trim().split(/\r?\n/).map((row) => row.trim()).filter(Boolean).map((row) => row.split(/\s+/));
}

function StatementPre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  const text = nodeText(children).trim();
  if (isNumericMatrix(text)) {
    const rows = parseNumericMatrix(text);
    const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
    return <div className="statement-matrix" role="table" aria-label="matrix" tabIndex={0}>{rows.map((row, rowIndex) => <div className="statement-matrix-row" role="row" key={rowIndex}>{row.map((cell, column) => <span className="statement-matrix-cell" role="cell" style={{ width: `${widths[column]}ch` }} key={column}>{cell}</span>)}</div>)}</div>;
  }
  return <pre {...props} tabIndex={0}>{children}</pre>;
}

/**
 * Renders untrusted Markdown (problem statements may originate from UVA-style
 * source material containing legacy HTML tags). Pipeline: parse raw HTML ->
 * sanitize (strip scripts/handlers/unknown tags) -> THEN expand math, so
 * KaTeX's own trusted output never has to pass through the sanitizer.
 *
 * Deliberately NOT using remark-breaks (single "\n" -> hard break) here: most statements were
 * PDF-extracted with a real newline at every original page line-wrap, not at real paragraph
 * boundaries, so turning every one of those into a visible break makes ordinary prose look
 * choppy/fragmented. The rare case that genuinely needs a preserved line break (an ASCII-art grid,
 * a "print exactly this" example) gets one explicit <br> per break in the source content instead
 * (rehypeRaw parses it) — scoped to just that span, not a global behavior change.
 */
export default function StatementRenderer({ content }: { content: string }) {
  return (
    <div className="prose-statement">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, statementSanitizeSchema], rehypeKatex]}
        components={{
          pre: StatementPre,
          // Statements link out to original source PDFs (e.g. UVa/CPE) — open in a new tab so
          // the reader never loses their place in the editor/submission panel.
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // Unlike <pre> (already wrapped in overflow-x-auto via .prose-statement), a wide table
          // (e.g. a reference/lookup table with many columns) had no scroll container of its own —
          // on a narrow screen it forced the whole page to scroll horizontally instead of just the
          // table, the same class of bug already fixed for ProblemFilterTable.
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto" tabIndex={0}>
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
