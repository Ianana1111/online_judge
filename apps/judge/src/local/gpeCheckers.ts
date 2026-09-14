/** GPE CSV permits arbitrary ordering of ties but requires the original rows, including spaces.
 * Compare fields lexically (not numerically); shorter equal-prefix tuples sort first. */
function compareFields(a: string[], b: string[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

function csvGroups(text: string, maxRows = 100_000, maxGroups = 100): string[][] | null {
  // Normalize line endings only. Spaces in data rows are part of the required output.
  const normalized = text.replace(/\r\n/g, "\n");
  const groups: string[][] = [];
  let current: string[] = [];
  let offset = 0, rows = 0;
  while (offset <= normalized.length) {
    const newline = normalized.indexOf("\n", offset);
    const line = normalized.slice(offset, newline < 0 ? normalized.length : newline);
    if (line === "") {
      if (current.length) { groups.push(current); current = []; }
    } else {
      if (++rows > maxRows) return null;
      current.push(line);
    }
    if (groups.length > maxGroups) return null;
    if (newline < 0) break;
    offset = newline + 1;
  }
  if (current.length) groups.push(current);
  return groups;
}

export function checkCsvSort(input: string, actual: string): boolean {
  const normalized = input.replace(/\r\n/g, "\n");
  const firstNewline = normalized.indexOf("\n");
  const count = Number(normalized.slice(0, firstNewline).trim());
  if (firstNewline < 0 || !Number.isInteger(count) || count < 1 || count > 100) throw new Error("Invalid CSV judge input");
  const source = csvGroups(normalized.slice(firstNewline + 1));
  if (!source || source.length !== count) throw new Error("Invalid CSV judge datasets");
  const answer = csvGroups(actual, source.reduce((n, rows) => n + rows.length, 0), count);
  if (!answer || answer.length !== count) return false;
  return source.every((rows, index) => {
    if (rows.length !== answer[index].length) return false;
    const remaining = new Map<string, number>();
    for (const row of rows) remaining.set(row, (remaining.get(row) ?? 0) + 1);
    let previous: string[] | undefined;
    for (const row of answer[index]) {
      const copies = remaining.get(row) ?? 0;
      if (!copies) return false;
      remaining.set(row, copies - 1);
      const fields = row.split(",").map((field) => field.replace(/^ +| +$/g, ""));
      if (previous && compareFields(previous, fields) > 0) return false;
      previous = fields;
    }
    return true;
  });
}

/** LMIS asks for all maximal sequences without specifying their listing order. The reviewed
 * answer defines the complete multiset; preserve each sequence's order and multiplicity. */
export function checkLmis(expected: string, actual: string): boolean {
  const lines = (s: string, limit: number): string[] | null => {
    const result: string[] = [];
    for (const match of s.matchAll(/[^\r\n]+/g)) {
      const line = match[0].trim();
      if (!line) continue;
      if (result.length >= limit) return null;
      const cells = line.split(/\s+/, 10);
      if (cells.length > 9) return null;
      result.push(cells.join(" "));
    }
    return result;
  };
  const reference = lines(expected, Number.MAX_SAFE_INTEGER);
  if (!reference?.length) throw new Error("Invalid LMIS judge answer");
  const answer = lines(actual, reference.length);
  if (!answer) return false;
  let offset = 0;
  while (offset < reference.length) {
    const count = Number(reference[offset]);
    if (!/^[1-9]\d*$/.test(reference[offset]) || count > 512 || offset + count >= reference.length) throw new Error("Invalid LMIS judge answer");
    if (answer[offset] !== reference[offset]) return false;
    const expectedRows = reference.slice(offset + 1, offset + count + 1).sort();
    const actualRows = answer.slice(offset + 1, offset + count + 1).sort();
    if (actualRows.length !== count || expectedRows.some((row, i) => row !== actualRows[i])) return false;
    offset += count + 1;
  }
  return offset === answer.length;
}

/** The archived Sudoku sample contradicts its uniqueness claim. Validate any completion
 * against the clues. NO is accepted only for a corpus case independently proved unsatisfiable. */
export function checkSudoku(input: string, expected: string, actual: string): boolean {
  const tokens = (s: string) => s.trim().split(/\s+/).filter(Boolean);
  const source = tokens(input), reference = tokens(expected);
  const count = Number(source[0]);
  if (!Number.isInteger(count) || count < 1 || count > 10 || source.length !== 1 + count * 81 || source.slice(1).some((s) => !/^[0-9]$/.test(s))) throw new Error("Invalid Sudoku judge input");
  const answer = actual.trim().split(/\s+/, count * 81 + 1).filter(Boolean);
  let expectedOffset = 0, actualOffset = 0;
  for (let i = 0; i < count; i++) {
    const impossible = reference[expectedOffset] === "NO";
    if (impossible) expectedOffset++;
    else {
      const grid = reference.slice(expectedOffset, expectedOffset + 81);
      if (grid.length !== 81 || grid.some((s) => !/^[1-9]$/.test(s))) throw new Error("Invalid Sudoku judge answer");
      expectedOffset += 81;
    }
    if (answer[actualOffset] === "NO") {
      if (!impossible) return false;
      actualOffset++;
      continue;
    }
    const cells = answer.slice(actualOffset, actualOffset + 81);
    if (cells.length !== 81 || cells.some((s) => !/^[1-9]$/.test(s))) return false;
    const rows = Array<number>(9).fill(0), columns = Array<number>(9).fill(0), boxes = Array<number>(9).fill(0);
    for (let cell = 0; cell < 81; cell++) {
      const clue = source[1 + i * 81 + cell];
      if (clue !== "0" && clue !== cells[cell]) return false;
      const row = Math.floor(cell / 9), column = cell % 9, box = Math.floor(row / 3) * 3 + Math.floor(column / 3);
      const bit = 1 << (Number(cells[cell]) - 1);
      if ((rows[row] | columns[column] | boxes[box]) & bit) return false;
      rows[row] |= bit; columns[column] |= bit; boxes[box] |= bit;
    }
    actualOffset += 81;
  }
  if (expectedOffset !== reference.length) throw new Error("Extra Sudoku judge answer tokens");
  return actualOffset === answer.length;
}
