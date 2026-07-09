import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import { statementSanitizeSchema } from "@/lib/sanitizeSchema";

/**
 * Renders untrusted Markdown (problem statements may originate from UVA-style
 * source material containing legacy HTML tags). Pipeline: parse raw HTML ->
 * sanitize (strip scripts/handlers/unknown tags) -> THEN expand math, so
 * KaTeX's own trusted output never has to pass through the sanitizer.
 */
export default function StatementRenderer({ content }: { content: string }) {
  return (
    <div className="prose-statement">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
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
