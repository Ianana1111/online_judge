/** UVa 10226 prints percentages to four decimal places. Binary floating-point
 * arithmetic may round an exact halfway value in either direction. Derive the
 * exact rational percentage from the input and accept either nearest result;
 * do not compare against one pre-rounded expected-output string. */
export function checkHardwood(input: string, actual: string): boolean {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const header = lines.shift()?.trim() ?? "";
  if (!/^\d+$/.test(header)) return false;
  const tests = Number(header);
  if (!Number.isSafeInteger(tests) || tests < 1) return false;
  const groups: Map<string, number>[] = [];
  let group = new Map<string, number>();
  for (const line of lines) {
    if (line === "") {
      if (group.size) { groups.push(group); group = new Map(); }
    } else {
      group.set(line, (group.get(line) ?? 0) + 1);
    }
  }
  if (group.size) groups.push(group);
  if (groups.length !== tests) return false;
  const output = actual.replace(/\r\n/g, "\n").replace(/^\n+|\n+$/g, "").split("\n").map(line => line.replace(/[ \t]+$/, ""));
  let at = 0;
  for (let i = 0; i < groups.length; i++) {
    const counts = groups[i];
    const total = BigInt([...counts.values()].reduce((a, b) => a + b, 0));
    if (i > 0 && output[at++] !== "") return false;
    for (const name of [...counts.keys()].sort()) {
      const match = /^(.*) ([0-9]{1,3})\.([0-9]{4})$/.exec(output[at++] ?? "");
      if (!match || match[1] !== name) return false;
      const scaled = BigInt(match[2] + match[3]);
      if (scaled > 1_000_000n) return false;
      const difference = scaled * total - BigInt(counts.get(name)!) * 1_000_000n;
      if (2n * (difference < 0n ? -difference : difference) > total) return false;
    }
  }
  return at === output.length;
}

/** UVa 10056: normalize the finite geometric weights instead of subtracting
 * nearly equal numbers in 1-(1-p)^N. At most 1000 positive terms are added.
 * The 1e-11 margin only covers binary arithmetic at a four-decimal rounding
 * midpoint; it is far smaller than a unit in the required output precision. */
export function checkWinningProbability(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/);
  const tests = Number(tokens[0]);
  if (!Number.isInteger(tests) || tests < 1 || tests > 1000 || tokens.length !== 1 + tests * 3) return false;
  const output = actual.trim().split(/\r?\n/);
  if (output.length !== tests) return false;
  const decimal = /^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  for (let tc = 0; tc < tests; tc++) {
    const n = Number(tokens[1 + tc * 3]), pToken = tokens[2 + tc * 3], i = Number(tokens[3 + tc * 3]);
    const p = Number(pToken);
    if (!Number.isInteger(n) || n < 1 || n > 1000 || !Number.isInteger(i) || i < 1 || i > n || !decimal.test(pToken) || !Number.isFinite(p) || p < 0 || p > 1) return false;
    const text = output[tc].trim();
    if (!/^[01]\.\d{4}$/.test(text)) return false;
    const supplied = Number(text);
    if (supplied > 1) return false;
    // Do not confuse a positive decimal that underflows Number with exact zero.
    const positive = /[1-9]/.test(pToken.split(/[eE]/)[0]);
    let wanted = 0;
    if (positive) {
      const q = 1 - p;
      let sum = 0, weight = 1, target = 0;
      for (let player = 1; player <= n; player++) {
        sum += weight;
        if (player === i) target = weight;
        weight *= q;
      }
      wanted = target / sum;
    }
    if (Math.abs(supplied - wanted) > 0.00005 + 1e-11) return false;
  }
  return true;
}
