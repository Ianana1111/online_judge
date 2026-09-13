const prefix = "oj:recent-practice:";
export function rememberPractice(userId: string, slug: string) {
  localStorage.setItem(prefix + userId, JSON.stringify({ slug, updatedAt: Date.now() }));
}
export function readRecentPractice(userId: string): string | null {
  try {
    const value = JSON.parse(localStorage.getItem(prefix + userId) ?? "null");
    if (!value || typeof value.slug !== "string" || !/^[a-z0-9][a-z0-9-]{0,199}$/.test(value.slug) || typeof value.updatedAt !== "number" || Date.now() - value.updatedAt > 90 * 86400000 || value.updatedAt > Date.now() + 300000) return null;
    const draft = JSON.parse(localStorage.getItem(`oj:draft:${userId}:${value.slug}`) ?? "null");
    return typeof draft?.sourceCode === "string" && draft.sourceCode.trim() ? value.slug : null;
  } catch { return null; }
}
