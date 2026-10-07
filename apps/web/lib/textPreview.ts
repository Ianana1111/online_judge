// Strips Markdown syntax down to a single-line plain-text teaser so a long lesson writeup
// (headers, code blocks, lists...) can't blow up a collapsed list row — only opening the full
// page shows the real, fully-rendered content.
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function previewText(md: string, maxLen = 140): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let displayed = 0;
  for (const { index } of graphemeSegmenter.segment(plain)) {
    if (displayed >= maxLen) {
      return `${plain.slice(0, index).trimEnd()}…`;
    }
    displayed += 1;
  }
  return plain;
}
