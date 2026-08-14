import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { statementSanitizeSchema } from "@/lib/sanitizeSchema";

/**
 * Renders untrusted Markdown (problem statements may originate from UVA-style
 * source material containing legacy HTML tags). Pipeline: parse raw HTML ->
 * sanitize (strip scripts/handlers/unknown tags) -> THEN expand math, so
 * KaTeX's own trusted output never has to pass through the sanitizer.
 *
 * remarkBreaks turns a single "\n" inside a paragraph into a real line break, instead of
 * CommonMark's default of collapsing it to a space. Problem statements routinely embed literal
 * multi-line content (ASCII-art grids, "print exactly this" examples) inline in prose without a
 * blank-line paragraph break, so without this every one of those silently squishes onto one line.
 * This is a global fix — it means source content never needs a fenced ``` code block just to
 * preserve line structure, which would otherwise render as a heavy bordered card that looks out
 * of place in the middle of ordinary prose.
 */
export default function StatementRenderer({ content }: { content: string }) {
  return (
    <div className="prose-statement">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, statementSanitizeSchema], rehypeKatex]}
        components={{
          // Statements link out to original source PDFs (e.g. UVa/CPE) — open in a new tab so
          // the reader never loses their place in the editor/submission panel.
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
