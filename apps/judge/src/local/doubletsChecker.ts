/** UVa 10150 allows ANY shortest dictionary chain. Compare graph validity and shortest distance,
 * never one reference path's exact text. No student-supplied checker code is executed. */
export function checkDoublets(input: string, actual: string): boolean {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const separator = lines.findIndex((line) => !line.trim());
  if (separator < 0) throw new Error("Doublets test data has no dictionary separator");
  const words = [...new Set(lines.slice(0, separator).map((line) => line.trim()))];
  if (words.length > 25143 || words.some((word) => !/^[a-z]{1,16}$/.test(word))) throw new Error("Invalid Doublets dictionary");
  const ids = new Map(words.map((word, id) => [word, id]));
  const patterns = new Map<string, number[]>();
  for (const [id, word] of words.entries()) for (let k = 0; k < word.length; k++) {
    const key = word.slice(0, k) + "*" + word.slice(k + 1);
    const bucket = patterns.get(key); if (bucket) bucket.push(id); else patterns.set(key, [id]);
  }
  const queries = lines.slice(separator + 1).filter((line) => line.trim()).map((line) => line.trim().split(/\s+/));
  if (queries.some((pair) => pair.length !== 2)) throw new Error("Invalid Doublets query");
  const text = actual.replace(/\r\n/g, "\n").trim();
  const answers = text ? text.split(/\n[ \t]*\n(?:[ \t]*\n)*/).map((answer) => answer.split("\n").map((word) => word.trim())) : [];
  if (answers.length !== queries.length) return false;
  for (const [index, [start, end]] of queries.entries()) {
    const startId = ids.get(start), endId = ids.get(end);
    let shortest = -1;
    if (startId !== undefined && endId !== undefined && start.length === end.length) {
      const dist = new Int32Array(words.length).fill(-1), queue = [startId], used = new Set<string>(); dist[startId] = 0;
      for (let head = 0; head < queue.length; head++) {
        const id = queue[head]; if (id === endId) { shortest = dist[id]; break; }
        const word = words[id];
        for (let k = 0; k < word.length; k++) {
          const key = word.slice(0, k) + "*" + word.slice(k + 1); if (used.has(key)) continue; used.add(key);
          for (const next of patterns.get(key) ?? []) if (dist[next] === -1) { dist[next] = dist[id] + 1; queue.push(next); }
        }
      }
    }
    const answer = answers[index];
    if (shortest < 0) { if (answer.length !== 1 || answer[0] !== "No solution.") return false; continue; }
    if (answer.length !== shortest + 1 || answer[0] !== start || answer[answer.length - 1] !== end || answer.some((word) => !ids.has(word))) return false;
    for (let k = 1; k < answer.length; k++) {
      const a = answer[k - 1], b = answer[k];
      if (a.length !== b.length || [...a].filter((c, pos) => c !== b[pos]).length !== 1) return false;
    }
  }
  return true;
}
