// Strips Markdown syntax down to a single-line plain-text teaser so a long lesson writeup
// (headers, code blocks, lists...) can't blow up a collapsed list row — only opening the full
// page shows the real, fully-rendered content.
export function previewText(md: string, maxLen = 140): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trimEnd()}…` : plain;
}
