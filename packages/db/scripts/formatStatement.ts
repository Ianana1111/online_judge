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
