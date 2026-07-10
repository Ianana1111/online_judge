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

export function cleanPdfStatementText(raw: string, uvaId: number): string {
  const lines = raw.split("\n").map((l) => l.replace(/\s+$/, ""));

  // Drop a leading "{uvaId} {title}" line — it's just a restatement of our own heading above it.
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") start++;
  if (start < lines.length && new RegExp(`^\\s*${uvaId}\\b`).test(lines[start])) start++;

  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trim();

    // Everything from a "Sample Input/Output" header onward is redundant with the Sample rows
    // shown separately on the problem page — stop here.
    if (SAMPLE_HEADERS.some((h) => h.toLowerCase() === line.toLowerCase())) break;

    if (/^--\s*\d+\s*of\s*\d+\s*--$/.test(line)) continue;
    if (/^Universidad de Valladolid OJ:/i.test(line)) continue;

    const headerMatch = SECTION_HEADERS.find((h) => h.toLowerCase() === line.toLowerCase());
    if (headerMatch) {
      out.push("", `**${headerMatch}**`, "");
      continue;
    }
    out.push(lines[i]);
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
