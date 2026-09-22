type Paragraph = { width: number; words: string[] };
function parseInput(input: string): Paragraph[] {
  const lines = input.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  const result: Paragraph[] = []; let at = 0, total = 0, ended = false;
  while (at < lines.length) {
    const token = lines[at++];
    if (!/^\d+$/.test(token)) throw new Error("Invalid formatting width");
    const width = Number(token);
    if (width === 0) { ended = true; break; }
    if (width < 1 || width > 80) throw new Error("Invalid formatting width");
    const words: string[] = [];
    while (at < lines.length && lines[at] !== "") {
      const line = lines[at++];
      if (!/^[ -~]+$/.test(line) || !line.trim()) throw new Error("Invalid formatting words");
      words.push(...line.split(" ").filter(Boolean));
    }
    if (at === lines.length || !words.length) throw new Error("Missing formatting paragraph separator");
    at++;
    const size = words.reduce((sum, word) => sum + word.length, 0); total += size;
    if (size > 10000 || words.some(word => word.length > width)) throw new Error("Formatting paragraph too large");
    result.push({ width, words });
  }
  if (!ended || at !== lines.length || !result.length || total > 50000) throw new Error("Invalid formatting input end");
  return result;
}
function inspect(paragraph: Paragraph, block: string): { cost: number; gaps: number[] } | null {
  let cursor = 0, cost = 0; const gaps: number[] = [];
  for (const line of block.split("\n")) {
    if (!/^[!-~]+(?: +[!-~]+)*$/.test(line)) return null;
    const words = line.split(/ +/);
    for (const word of words) if (word !== paragraph.words[cursor++]) return null;
    if (words.length === 1) {
      if (line.length > paragraph.width) return null;
      cost += line.length === paragraph.width ? 0 : 500;
    } else {
      if (line.length !== paragraph.width) return null;
      for (const match of line.matchAll(/ +/g)) { const gap = match[0].length; gaps.push(gap); cost += (gap - 1) ** 2; }
    }
  }
  return cursor === paragraph.words.length ? { cost, gaps } : null;
}
/** Expected witnesses are independently audited minimum-cost layouts. Validate every
 * word/line and the global gap tie rule, rather than equating one arbitrary layout.
 * A common-prefix tie has no first differing gap and must not be rejected just for
 * having a different number of horizontal gaps. Spaces are semantically significant. */
export function checkFormattingText(input: string, expected: string, actual: string): boolean {
  const paragraphs = parseInput(input);
  const blocks = (text: string) => text.replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n\n");
  const target = blocks(expected), candidate = blocks(actual);
  if (target.length !== paragraphs.length) throw new Error("Invalid formatting expected paragraphs");
  if (candidate.length !== paragraphs.length) return false;
  return paragraphs.every((paragraph, index) => {
    const wanted = inspect(paragraph, target[index]);
    if (!wanted) throw new Error("Invalid formatting expected witness");
    const got = inspect(paragraph, candidate[index]);
    if (!got || got.cost !== wanted.cost) return false;
    for (let i = 0; i < Math.min(got.gaps.length, wanted.gaps.length); i++) if (got.gaps[i] !== wanted.gaps[i]) return false;
    return true;
  });
}
