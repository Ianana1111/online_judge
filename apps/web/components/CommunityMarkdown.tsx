import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/** Community text supports code and math. HTML and remote images are excluded, including in
 * administrator previews, so opening a review never executes markup or loads a tracking image. */
export default function CommunityMarkdown({ content }: { content: string }) {
  return <div className="prose-statement min-w-0 break-words">
    <ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { trust: false, strict: "warn", maxExpand: 1000 }]]}
      components={{
        pre: ({ children, ...props }) => <pre {...props} tabIndex={0}>{children}</pre>,
        a: ({ children, ...props }) => <a {...props} target="_blank" rel="nofollow ugc noopener noreferrer">{children}</a>,
        img: ({ alt }) => <span>{alt ? `[${alt}]` : ""}</span>,
        table: ({ children, ...props }) => <div className="overflow-x-auto" tabIndex={0}><table {...props}>{children}</table></div>,
      }}>{content}</ReactMarkdown>
  </div>;
}
