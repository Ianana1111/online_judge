/** Rough reading-time estimate for a Markdown post. Content here is mostly Chinese prose (~400
 * characters/min is a commonly cited average adult reading speed) with the occasional English/code
 * aside, so a single characters-based heuristic is close enough without needing a real word
 * tokenizer — this only feeds a "N 分鐘閱讀" byline, not anything that needs to be precise. */
export function estimateReadMinutes(md: string): number {
  const plain = md.replace(/[#*_`>|[\]()!-]/g, "");
  const chars = plain.replace(/\s/g, "").length;
  return estimateReadMinutesFromLength(chars);
}

/** Same estimate, starting from a raw character count instead of the Markdown itself — for list
 * views that only have the post's length, not its full body (see PostListItem.bodyLength). */
export function estimateReadMinutesFromLength(chars: number): number {
  return Math.max(1, Math.round(chars / 400));
}
