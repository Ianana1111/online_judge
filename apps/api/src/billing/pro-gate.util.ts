import { prisma } from "@oj/db";
import type { RequestUser } from "../common/decorators";
import { isProActive } from "./billing.service";

/** Whether this requester should see Pro-gated fields — ADMIN always does (mirrors isUnlimited),
 * everyone else depends on their live plan/expiry/student status. Shared by every endpoint that
 * decides whether to compute/return a Pro-only value (problem list/detail, collection detail) so
 * they can't drift out of sync with each other. */
export async function isRequesterPro(requester: RequestUser): Promise<boolean> {
  if (requester.role === "ADMIN") return true;
  const user = await prisma.user.findUnique({
    where: { id: requester.id },
    select: { plan: true, planExpiresAt: true, isStudent: true },
  });
  return !!user && isProActive(user);
}

/** How many distinct past CPE sittings (Contest rows with kind=CPE) each of these problems has
 * appeared in, via ContestProblem — the raw "歷屆出過幾次" count Pro users get to see. */
export async function cpeAppearancesFor(problemIds: string[]): Promise<Map<string, number>> {
  if (problemIds.length === 0) return new Map();
  const rows = await prisma.contestProblem.groupBy({
    by: ["problemId"],
    where: { problemId: { in: problemIds }, contest: { kind: "CPE" } },
    _count: true,
  });
  return new Map(rows.map((r) => [r.problemId, r._count]));
}
