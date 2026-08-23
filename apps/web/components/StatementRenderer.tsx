import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { statementSanitizeSchema } from "@/lib/sanitizeSchema";

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
