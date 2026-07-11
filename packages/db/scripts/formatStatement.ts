/**
 * Cleans up raw PDF-extracted problem-statement text so it reads as normal prose instead of a
 * dumped code block. pdf-parse output has some predictable junk worth stripping:
 *   - a repeated "{uvaId} {title}" line at the very top (redundant with our own heading)
 *   - "Sample Input"/"Sample Output" sections (redundant with the separately-displayed Sample
 *     rows on the problem page — and since exact whitespace matters for that data, letting it
 *     flow as plain-paragraph text would just mangle it into a run-on blob of numbers anyway)
 *   - page-footer/running-header artifacts ("-- 1 of 2 --", "Universidad de Valladolid OJ: ...")
 * "Input"/"Output"-style section labels are kept but promoted to their own bold paragraph so
 * they read as clear section breaks instead of running into the surrounding sentence.
 */

const SECTION_HEADERS = ["Input and Output", "Input", "Output", "Explanation", "Note", "Constraints"];
const SAMPLE_HEADERS = ["Sample Input and Output", "Sample Input", "Sample Output"];
const LIST_ITEM_RE = /^\d+\.\s/;
const TERMINAL_PUNCTUATION_RE = /[.!?"'’”)]$/;

// PDF statements are plain prose, but they're rendered through a Markdown pipeline (see
// StatementRenderer.tsx). Characters that are syntactically meaningful in Markdown/HTML —
// backticks (inline code), backslashes (escapes), *_ (emphasis), [] (links), <tag>-like
// sequences (e.g. the literal "<EOF>"/"<CR>" many UVa problems use), $ (math), | ~ — get eaten
// or mangled even though they're really just literal text in the statement. Escape them so they
// render verbatim. The structural Markdown we add ourselves (### headings, "N." list markers) is
// applied outside this function and is never passed through it.
const INLINE_ESCAPE_RE = /[\\`*_{}[\]<>$~|]/g;
export function escapeInline(text: string): string {
  return text.replace(INLINE_ESCAPE_RE, (ch) => `\\${ch}`);
}

export function cleanPdfStatementText(raw: string, uvaId: number): string {
  const lines = raw.split("\n").map((l) => l.replace(/\s+$/, ""));

  // Drop a leading "{uvaId} {title}" line — it's just a restatement of our own heading above it.
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") start++;
  if (start < lines.length && new RegExp(`^\\s*${uvaId}\\b`).test(lines[start])) start++;

  const out: string[] = [];
  let inList = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();

    // Everything from a "Sample Input/Output" header onward is redundant with the Sample rows
    // shown separately on the problem page — stop here.
    if (SAMPLE_HEADERS.some((h) => h.toLowerCase() === line.toLowerCase())) break;

    if (/^--\s*\d+\s*of\s*\d+\s*--$/.test(line)) continue;
    if (/^Universidad de Valladolid OJ:/i.test(line)) continue;

    const headerMatch = SECTION_HEADERS.find((h) => h.toLowerCase() === line.toLowerCase());
    if (headerMatch) {
      out.push("", `### ${headerMatch}`, "");
      inList = false;
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      // A numbered list item always starts fresh, on its own line, with a blank line before it
      // so it can't get swallowed into whatever paragraph preceded it. The "N. " marker is
      // Markdown structure we want to keep, so escape only the text after it (escapeInline never
      // touches digits or ".", so escaping the whole line would leave the marker intact anyway —
      // but being explicit keeps the intent clear).
      if (!inList && out.length > 0 && out[out.length - 1] !== "") out.push("");
      out.push(lines[i].replace(/^(\s*\d+\.\s)(.*)$/, (_, marker, rest) => marker + escapeInline(rest)));
      inList = true;
      continue;
    }

    if (inList && out.length > 0 && !TERMINAL_PUNCTUATION_RE.test(out[out.length - 1])) {
      // pdf-parse wraps mid-sentence at the PDF's line width — if the last list item's line
      // doesn't end on a sentence boundary, this line is its wrapped continuation, not a new
      // paragraph. Re-join them so the whole item stays associated with its "N." marker instead
      // of falling out of the list.
      out[out.length - 1] = `${out[out.length - 1]} ${escapeInline(line)}`;
      continue;
    }

    if (inList) out.push(""); // list item's sentence completed - blank line closes the list
    inList = false;
    out.push(escapeInline(lines[i]));
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Best-effort extraction of the "Sample Input"/"Sample Output" section as structured data, for
 * problems with no other测资 source (see scrape-uva-extra.ts) — cleanPdfStatementText() above
 * drops this same section from the displayed statement since it'd otherwise be shown twice. */
const PDF_JUNK_LINE_RE = /^--\s*\d+\s*of\s*\d+\s*--$|^Universidad de Valladolid OJ:/i;

export function extractSampleFromPdfText(raw: string): { input: string; output: string } | null {
  const lines = raw.split("\n").map((l) => l.replace(/\s+$/, ""));
  const isInputHeader = (l: string) => /^sample input$/i.test(l.trim());
  const isOutputHeader = (l: string) => /^sample output$/i.test(l.trim());

  const inputStart = lines.findIndex(isInputHeader);
  // A page break can duplicate the "Sample Output" header (once where the real section starts,
  // again as part of a running page header) — take the last occurrence after the input section.
  let outputStart = -1;
  for (let i = lines.length - 1; i > inputStart; i--) {
    if (isOutputHeader(lines[i])) {
      outputStart = i;
      break;
    }
  }
  if (inputStart === -1 || outputStart === -1) return null;

  // Page-footer/running-header junk can land in the middle of a sample block on multi-page PDFs
  // (not just at the very end) — filter it out everywhere rather than just stopping at the first
  // occurrence.
  const input = lines
    .slice(inputStart + 1, outputStart)
    .filter((l) => !PDF_JUNK_LINE_RE.test(l.trim()))
    .join("\n")
    .trim();
  const output = lines
    .slice(outputStart + 1)
    .filter((l) => !PDF_JUNK_LINE_RE.test(l.trim()))
    .join("\n")
    .trim();
  if (!input || !output) return null;
  return { input: `${input}\n`, output: `${output}\n` };
}
