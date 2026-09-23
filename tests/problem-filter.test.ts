import { describe, expect, it } from "vitest";
import { buildProblemNavHref, filterAndSortProblems } from "../apps/web/lib/problemFilter";
import type { ProblemRow } from "../apps/web/lib/types";

const row = (id: string, difficulty: number, tags: string[]): ProblemRow => ({
  id,
  slug: id,
  title: id,
  uvaId: Number(id.slice(1)),
  difficulty,
  tags,
  source: "UVA",
  solvedByMe: false,
  cpeAppearances: null,
  gpeAppearances: null,
});

describe("multi-value problem filters", () => {
  it("uses OR within difficulty and tag groups, and AND between the groups", () => {
    const problems = [row("p1", 1, ["DP"]), row("p2", 2, ["Graph"]), row("p3", 4, ["Math"]), row("p4", 4, ["DP"])];
    expect(filterAndSortProblems(problems, { difficulties: ["2", "4"], tags: ["DP", "Graph"] }).map((problem) => problem.id)).toEqual(["p2", "p4"]);
  });

  it("carries every selected value into problem navigation links", () => {
    const href = buildProblemNavHref("p2", "problems", null, { sort: null, difficulties: ["2", "4"], tags: ["DP", "Graph"] });
    const params = new URL(href, "https://judge.tw").searchParams;
    expect(params.getAll("difficulty")).toEqual(["2", "4"]);
    expect(params.getAll("tag")).toEqual(["DP", "Graph"]);
  });
});
