export const TOPIC_COLLECTIONS = [
  ["math", "數學與數論", "從整除、質數到模運算，練出把數學性質轉成程式的直覺。"],
  ["array", "陣列與資料處理", "從索引與遍歷開始，熟悉資料整理與邊界處理。"],
  ["string", "字串處理", "拆解文字、解析輸入，在細節中建立穩定的解題能力。"],
  ["sorting-searching", "排序與搜尋", "掌握排序、二分搜尋與查找策略，找到更有效率的解法。"],
  ["datastructure", "資料結構", "用堆疊、佇列與集合，為問題選擇合適的資料組織方式。"],
  ["simulation", "模擬與實作", "把題目規則一步步轉成可靠的程式，練習精準實作。"],
  ["greedy", "貪心策略", "辨識局部選擇，練習證明每一步為什麼值得做。"],
  ["recursion-backtracking", "遞迴與回溯", "探索選擇、還原狀態，從搜尋樹中找出答案。"],
  ["dp", "動態規劃", "從狀態定義到轉移，建立拆解重複子問題的思考方式。"],
  ["graph", "圖論與路徑", "以節點和邊建模，探索遍歷、連通性與路徑問題。"],
  ["geometry", "計算幾何", "把座標、距離與相交關係，轉成可驗證的幾何解法。"],
  ["adhoc", "觀察與解題技巧", "跳出固定模板，從條件與規律中找出突破口。"],
] as const;

export function collectionCategory(category: string | null): string {
  return category === "考試歷屆" ? "考試專區" : category === "演算法主題" ? "主題專區" : category || "其他";
}

/** Deduplicate only after selecting each exam's first three slots. A hidden first problem must
 * never accidentally promote the fourth problem into this collection. */
export function examEssentialsIds(contests: { problems: { problemId: string; ord: number; problem: { visibility: boolean } }[] }[]): string[] {
  return [...new Set(contests.flatMap((c) => [...c.problems].sort((a, b) => a.ord - b.ord).slice(0, 3).filter((p) => p.problem.visibility).map((p) => p.problemId)))];
}
